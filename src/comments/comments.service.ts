import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentsRepository } from './comments.repository';
import { OutputCommentDto } from './dto/output-comment.dto';
import { LikeStatusCommentDto } from './dto/like-status-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private commentsRepository: CommentsRepository) {}
  create(createCommentDto: CreateCommentDto) {
    return 'This action adds a new comment';
  }

  findAll() {
    return `This action returns all comments`;
  }

  async findById(
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<OutputCommentDto | null> {
    return this.commentsRepository.findById(id, user);
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<boolean> {
    return this.commentsRepository.update(id, updateCommentDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.commentsRepository.deleteById(id);
  }
  async changeLikeStatusComment(
    commentId: string,
    user: {
      userId: string;
      userName: string;
    },
    likeStatus: LikeStatusCommentDto,
  ): Promise<boolean> {
    return this.commentsRepository.changeLikeStatusComment(
      commentId,
      user,
      likeStatus,
    );
  }
}
