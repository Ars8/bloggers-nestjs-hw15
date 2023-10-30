import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsRepository } from './posts.repository';
import { OutputPostDto } from './dto/output-post.dto';
import { PaginationViewType } from '../helpers/transformToPaginationView';
import { QueryType } from '../helpers/queryHandler';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { CommentsRepository } from '../comments/comments.repository';
import { OutputCommentDto } from '../comments/dto/output-comment.dto';
import { LikeStatusPostDto } from './dto/like-status-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}
  async create(createPostDto: CreatePostDto): Promise<OutputPostDto> {
    return this.postsRepository.create(createPostDto);
  }

  async findAll(
    query: QueryType,
    user: { userId: string; userName: string } | null,
  ): Promise<PaginationViewType<OutputPostDto>> {
    return this.postsRepository.findAll(query, user);
  }

  async findOne(
    id: string,
    user: { userId: string; userName: string } | null,
  ): Promise<OutputPostDto | null> {
    return this.postsRepository.findOne(id, user);
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<boolean> {
    return this.postsRepository.update(id, updatePostDto);
  }

  async remove(id: string): Promise<boolean> {
    return this.postsRepository.remove(id);
  }
  async addComment(
    postId: string,
    user: {
      userId: string;
      userName: string;
    },
    createCommentDto: CreateCommentDto,
  ) {
    return this.commentsRepository.create(postId, user, createCommentDto);
  }
  async getPostComments(
    postId: string,
    query: QueryType,
    user: {
      userId: string;
      userName: string;
    },
  ): Promise<PaginationViewType<OutputCommentDto>> {
    return this.commentsRepository.getPostComments(postId, query, user);
  }
  async changeLikeStatusPost(
    postId: string,
    user: {
      userId: string;
      userName: string;
    },
    likeStatus: LikeStatusPostDto,
  ): Promise<boolean> {
    return this.postsRepository.changeLikeStatusPost(postId, user, likeStatus);
  }
}
