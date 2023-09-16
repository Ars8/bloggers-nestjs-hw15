import { IsNotEmpty, IsString, MaxLength, Validate } from 'class-validator';
import { Transform } from 'class-transformer';
import { trimValidatedString } from '../../helpers/validation-helpers';
import { BlogExistsValidator } from '../../validators/blog-exists-validator';

export class CreatePostDto {
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
  @IsNotEmpty()
  @Transform(trimValidatedString)
  @IsString()
  @Validate(BlogExistsValidator)
  blogId: string;
}
