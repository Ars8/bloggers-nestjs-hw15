import { IsEnum, IsNotEmpty } from 'class-validator';

export enum LikeStatusVariants {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

export class LikeStatusCommentDto {
  @IsNotEmpty()
  @IsEnum(LikeStatusVariants)
  likeStatus: LikeStatusVariants;
}
