import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimValidatedString } from '../../helpers/validation-helpers';

export class LoginDto {
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  loginOrEmail: string;
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  password: string;
}
