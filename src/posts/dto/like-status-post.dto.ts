import { IsEnum, IsNotEmpty } from 'class-validator';
import { LikeStatusVariants } from 'src/comments/dto/like-status-comment.dto';

export class LikeStatusPostDto {
  @IsNotEmpty()
  @IsEnum(LikeStatusVariants)
  likeStatus: LikeStatusVariants;
}
