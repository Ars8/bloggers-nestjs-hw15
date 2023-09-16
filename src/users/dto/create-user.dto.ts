import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MaxLength(10)
  @MinLength(3)
  @IsString()
  login: string;
  @MaxLength(20)
  @MinLength(6)
  password: string;
  @IsEmail()
  email: string;
}
