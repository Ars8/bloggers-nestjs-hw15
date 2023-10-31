import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from './entities/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { idMapper } from '../helpers/id-mapper';
import { OutputCommentDto } from './dto/output-comment.dto';
import { QueryType } from '../helpers/queryHandler';
import {
  PaginationViewType,
  transformToPaginationView,
} from '../helpers/transformToPaginationView';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { LikeStatusCommentDto } from './dto/like-status-comment.dto';
import {
  LikeComment,
  LikeCommentDocument,
} from './entities/like-comment.entity';
import { PreparationComments } from './preparation.comments';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(LikeComment.name)
    private likeCommentModel: Model<LikeCommentDocument>,
    private preparationCommentForReturn: PreparationComments,
  ) {}
  async create(
    postId: string,
    user: {
      userId: string;
      userName: string;
    },
    createCommentDto: CreateCommentDto,
  ): Promise<OutputCommentDto> {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      postId,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        userId: user.userId,
        userLogin: user.userName,
      },
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
      },
    });
    await createdComment.save();
    const { postId: postID, ...rest } = createdComment.toObject();
    return idMapper(rest);
  }
  async findById(
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<OutputCommentDto | null> {
    if (!isValidObjectId(id)) return null;
    const comment = await this.commentModel.findById(id).lean();

    if (!comment) return null;

    const filledComment =
      await this.preparationCommentForReturn.preparationCommentsForReturn(
        [idMapper(comment)],
        user,
      );
    //console.log(filledComment);

    const { postId: postID, ...rest } = filledComment[0];
    return rest;
  }
  async getPostComments(
    postId: string,
    query: QueryType,
    user: {
      userId: string;
      userName: string;
    },
  ): Promise<PaginationViewType<OutputCommentDto>> {
    const totalCount = await this.commentModel.count({ postId });
    const comments = await this.commentModel
      .find({ postId }, { postId: 0 })
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.pageSize * (query.pageNumber - 1))
      .limit(query.pageSize)
      .lean();

    const filledComment =
      await this.preparationCommentForReturn.preparationCommentsForReturn(
        idMapper(comments),
        user,
      );
    //console.log(filledComment);

    //const { postId: postID, ...rest } = filledComment[0];

    return transformToPaginationView<OutputCommentDto>(
      totalCount,
      query.pageSize,
      query.pageNumber,
      filledComment,
    );
  }
  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const comment = await this.commentModel.findById(id);
    comment.content = updateCommentDto.content;
    await comment.save();
    return true;
  }
  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    const deletedComment = await this.commentModel.findByIdAndDelete(id);
    if (!deletedComment) return false;
    return true;
  }
  async changeLikeStatusComment(
    commentId: string,
    user: {
      userId: string;
      userName: string;
    },
    likeStatus: LikeStatusCommentDto,
  ): Promise<boolean> {
    if (!isValidObjectId(commentId)) return false;
    const comment = await this.commentModel.findById(commentId);
    if (!comment) return false;
    const userId = user.userId;
    const addedAt = new Date().toISOString();
    const likeComment = await this.likeCommentModel.findOneAndUpdate(
      {
        $and: [{ commentId: commentId }, { userId: userId }],
      },
      {
        commentId: commentId,
        userId: userId,
        login: user.userName,
        likeStatus: likeStatus.likeStatus,
        addedAt: addedAt,
      },
      { upsert: true },
    );
    if (!likeComment) return false;
    //console.log(likeComment);
    await likeComment.save();
    return true;
  }
}
