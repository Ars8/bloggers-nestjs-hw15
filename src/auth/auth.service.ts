import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from './dto/login-dto';
import { HashManager } from '../managers/hashManager';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailManager } from '../managers/mailManager';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

type RefreshToken = {
  sub: string;
  userName: string;
  sessionId: string;
  iat: number;
  exp: number;
};
@Injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService,
    protected hashManager: HashManager,
    private jwtService: JwtService,
    protected mailManager: MailManager,
    protected configService: ConfigService,
  ) {}
  async makeAccessAndRefreshTokens(
    userId: string,
    userLogin: string,
  ): Promise<[{ accessToken: string }, { refreshToken: string }]> {
    const sessionId = uuidv4();
    const accessPayload = { sub: userId, userName: userLogin };
    const refreshPayload2 = { sub: userId, userName: userLogin, sessionId };
    await this.usersRepository.addUserSession(userId, sessionId);
    return [
      {
        accessToken: this.jwtService.sign(accessPayload),
      },
      {
        refreshToken: this.jwtService.sign(refreshPayload2, {
          expiresIn: this.configService.get<string>('jwtRefreshExpirationTime'),
        }),
      },
    ];
  }
  async login(
    loginDto: LoginDto,
  ): Promise<[{ accessToken: string }, { refreshToken: string }] | false> {
    const user = await this.usersRepository.findByLoginOrEmail(
      loginDto.loginOrEmail,
    );
    if (!user) return false;
    if (!user.emailConfirmation.isConfirmed) return false;
    const passwordMatched = await this.hashManager.checkPassword(
      loginDto.password,
      user.password,
    );
    if (!passwordMatched) return false;
    return this.makeAccessAndRefreshTokens(user.id, user.login);
  }

  async me(
    id: string,
  ): Promise<{ email: string; login: string; userId: string } | null> {
    const user = await this.usersRepository.findById(id);
    const { email, login, id: userId } = user;
    return { email, login, userId };
  }

  async registration(createUserDto: CreateUserDto) {
    const confirmationCode = uuidv4();
    const newUser = await this.usersService.create(
      createUserDto,
      null,
      confirmationCode,
    );
    try {
      await this.mailManager.sendRegistrationEmail(
        createUserDto.email,
        confirmationCode,
      );
    } catch (e) {
      await this.usersRepository.remove(newUser.id);
      throw new HttpException(
        { message: 'Error while sending email. Please try to register again' },
        HttpStatus.BAD_REQUEST,
      );
    }

    return newUser;
  }

  async confirmRegistration(code: string) {
    await this.usersRepository.confirmRegistration(code);
  }

  async resendRegistrationConfirmationEmail(email: string) {
    const user = await this.usersRepository.findByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException([
        { message: 'Email is not registered', field: 'email' },
      ]);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        { message: 'User is already confirmed', field: 'email' },
      ]);
    }
    const newConfirmationCode = uuidv4();
    await this.usersRepository.changeConfirmationCode(
      email,
      newConfirmationCode,
    );
    await this.mailManager.sendRegistrationEmail(email, newConfirmationCode);
  }

  async handleRefreshToken(
    refreshToken: string,
  ): Promise<[{ accessToken: string }, { refreshToken: string }] | false> {
    if (!refreshToken) return false;
    const decodedToken = <RefreshToken>this.jwtService.decode(refreshToken);
    const { sessionId, sub: userId, userName } = decodedToken;
    if (!sessionId) return false;
    const sessionRemoved = await this.usersRepository.removeUserSession(
      userId,
      sessionId,
    );
    if (!sessionRemoved) return false;
    try {
      await this.jwtService.verifyAsync(refreshToken);
      return this.makeAccessAndRefreshTokens(userId, userName);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async logout(refreshToken: string) {
    if (!refreshToken) return false;
    const decodedToken = <RefreshToken>this.jwtService.decode(refreshToken);
    const { sessionId, sub: userId } = decodedToken;
    if (!sessionId) return false;
    try {
      await this.jwtService.verifyAsync(refreshToken);
      const sessionRemoved = await this.usersRepository.removeUserSession(
        userId,
        sessionId,
      );
      return sessionRemoved;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
