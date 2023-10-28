import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentType } from 'src/comments/dto/comments-type.dto';
import {
  LikeComment,
  LikeCommentDocument,
} from 'src/comments/entities/like-comment.entity';

@Injectable()
export class PreparationComments {
  constructor(
    @InjectModel(LikeComment.name)
    private likeCommentModel: Model<LikeCommentDocument>,
  ) {}

  async preparationCommentsForReturn(
    commentsArray: CommentType[],
    currentUser: { userId: string; userName: string } | null,
  ) {
    const filledComments = [];
    for (const i in commentsArray) {
      const commentId = commentsArray[i].id;
      const comment: CommentType = commentsArray[i];
      let ownLikeStatus = 'None';

      if (currentUser) {
        const currentComment = await this.likeCommentModel.findOne(
          {
            $and: [{ userId: currentUser.userId }, { commentId: commentId }],
          },
          {
            _id: false,
            __v: false,
          },
        );
        if (currentComment) {
          ownLikeStatus = currentComment.likeStatus;
        }
      }
      comment.likesInfo.myStatus = ownLikeStatus;

      comment.likesInfo.likesCount = await this.likeCommentModel.countDocuments(
        {
          $and: [{ commentId: commentId }, { likeStatus: 'Like' }],
        },
      );

      comment.likesInfo.dislikesCount =
        await this.likeCommentModel.countDocuments({
          $and: [{ commentId: commentId }, { likeStatus: 'Dislike' }],
        });

      filledComments.push(comment);
    }
    return filledComments;
  }
}
