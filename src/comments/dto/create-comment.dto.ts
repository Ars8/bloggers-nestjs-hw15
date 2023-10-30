import { MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @MinLength(20)
  @MaxLength(300)
  content: string;
}
