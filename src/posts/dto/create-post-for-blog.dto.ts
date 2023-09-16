import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimValidatedString } from '../../helpers/validation-helpers';

export class CreatePostForBlogDto {
  @MaxLength(30)
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  title: string;
  @MaxLength(100)
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  shortDescription: string;
  @MaxLength(1000)
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  content: string;
}
