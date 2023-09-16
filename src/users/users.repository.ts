import { InjectModel } from '@nestjs/mongoose';
import { EmailConfirmation, User, UserDocument } from './entities/user.entity';
import { isValidObjectId, Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { idMapper } from '../helpers/id-mapper';
import { OutputUserDto } from './dto/output-user.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { QueryType } from '../helpers/queryHandler';
import {
  PaginationViewType,
  transformToPaginationView,
} from '../helpers/transformToPaginationView';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async create(
    createUserDto: CreateUserDto,
    confirmed?: true,
    confirmationCode?: string,
  ): Promise<OutputUserDto> {
    const emailIsTaken = await this.findByLoginOrEmail(createUserDto.email);
    const loginIsTaken = await this.findByLoginOrEmail(createUserDto.login);
    const errors = [];
    if (emailIsTaken) {
      errors.push({ message: 'Email is already taken', field: 'email' });
    }
    if (loginIsTaken) {
      errors.push({ message: 'Login is already taken', field: 'login' });
    }
    if (errors.length) throw new BadRequestException(errors);
    const createdUser = new this.userModel({
      ...createUserDto,
      emailConfirmation: {
        confirmationCode: confirmationCode || '',
        expirationDate: new Date(
          new Date().setHours(new Date().getHours() + 1),
        ).toISOString(),
        isConfirmed: confirmed || false,
      },
      userSessions: [],
      createdAt: new Date().toISOString(),
    });
    try {
      await createdUser.save();
      const { password, emailConfirmation, userSessions, ...resultUser } =
        idMapper(createdUser.toObject());
      return resultUser;
    } catch (e) {
      console.log(e);
    }
  }
  async findAll(query: QueryType): Promise<PaginationViewType<OutputUserDto>> {
    const filter = {
      $or: [
        { login: { $regex: query.searchLoginTerm, $options: 'i' } },
        { email: { $regex: query.searchEmailTerm, $options: 'i' } },
      ],
    };
    const totalCount = await this.userModel.count(filter);
    const users = await this.userModel
      .find(filter, { password: 0, emailConfirmation: 0, userSessions: 0 })
      .sort([[query.sortBy, query.sortDirection === 'asc' ? 1 : -1]])
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .lean();
    return transformToPaginationView<OutputUserDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      idMapper(users),
    );
  }
  async findByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<
    | (CreateUserDto & { id: string; emailConfirmation: EmailConfirmation })
    | null
  > {
    const user = await this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
      .lean();
    return idMapper(user);
  }
  async findById(id: string): Promise<OutputUserDto | null> {
    if (!isValidObjectId(id)) return null;
    const user = await this.userModel.findById(id).lean();
    return idMapper(user);
  }
  async remove(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) return false;
    return true;
  }
  async confirmRegistration(code: string) {
    const user = await this.userModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    const errors = [];
    if (!user) {
      errors.push({ message: 'Code not found', field: 'code' });
    } else if (user.emailConfirmation.isConfirmed === true) {
      errors.push({
        message: 'Registration is already confirmed',
        field: 'code',
      });
    } else if (new Date() > new Date(user.emailConfirmation.expirationDate)) {
      errors.push({
        message: 'Code is expired. Please, request another one',
        field: 'code',
      });
    }
    if (errors.length) throw new BadRequestException(errors);
    user.emailConfirmation.isConfirmed = true;
    await user.save();
  }
  async changeConfirmationCode(email: string, code: string) {
    const user = await this.userModel.findOne({ email: email });
    user.emailConfirmation.confirmationCode = code;
    await user.save();
  }
  async addUserSession(userId: string, sessionId: string) {
    const user = await this.userModel.findById(userId);
    user.userSessions.push({ id: sessionId });
    await user.save();
  }
  async removeUserSession(
    userId: string,
    sessionId: string,
  ): Promise<true | false> {
    const user = await this.userModel.findById(userId);
    if (!user.userSessions.find((el) => el.id === sessionId)) return false;
    user.userSessions = user.userSessions.filter((s) => s.id !== sessionId);
    // console.log(sessionId);
    await user.save();
    return true;
  }
}
