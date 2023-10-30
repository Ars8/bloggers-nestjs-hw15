import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { OutputPostDto } from './dto/output-post.dto';
import { PaginationViewType } from '../helpers/transformToPaginationView';
import { queryHandler } from '../helpers/queryHandler';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { OutputCommentDto } from '../comments/dto/output-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LikeStatusPostDto } from './dto/like-status-post.dto';
import { ExtractUserFromToken } from 'src/auth/guards/extractUserFromToken.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @UseGuards(AuthGuard('basic'))
  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<OutputPostDto> {
    return this.postsService.create(createPostDto);
  }

  @UseGuards(ExtractUserFromToken)
  @Get()
  async findAll(
    @Request() req,
    @Query() query,
  ): Promise<PaginationViewType<OutputPostDto>> {
    return this.postsService.findAll(queryHandler(query), req.user);
  }

  @UseGuards(ExtractUserFromToken)
  @Get(':id')
  async findOne(
    @Request() req,
    @Param('id') id: string,
  ): Promise<OutputPostDto | null> {
    const post = await this.postsService.findOne(id, req.user);
    //console.log(req.user);
    if (!post) throw new NotFoundException();
    return post;
  }
  @UseGuards(AuthGuard('basic'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<HttpStatus.NO_CONTENT> {
    const updatedPost = await this.postsService.update(id, updatePostDto);
    if (!updatedPost) throw new NotFoundException();
    return HttpStatus.NO_CONTENT;
  }
  @UseGuards(AuthGuard('basic'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const deletedPost = await this.postsService.remove(id);
    if (!deletedPost) throw new NotFoundException();
    return deletedPost;
  }
  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Request() req,
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<OutputCommentDto> {
    const post = await this.postsService.findOne(id, null);
    if (!post) throw new NotFoundException();
    return this.postsService.addComment(id, req.user, createCommentDto);
  }
  @UseGuards(ExtractUserFromToken)
  @Get(':id/comments')
  async getComments(
    @Request() req,
    @Param('id') id: string,
    @Query() query,
  ): Promise<PaginationViewType<OutputCommentDto>> {
    const post = await this.postsService.findOne(id, null);
    if (!post) throw new NotFoundException();
    return this.postsService.getPostComments(id, queryHandler(query), req.user);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id/like-status')
  async likeStatusPostId(
    @Request() req,
    @Param('id') id: string,
    @Body() likeStatusPostDto: LikeStatusPostDto,
  ) {
    const post = await this.postsService.findOne(id, null);
    if (!post) throw new NotFoundException();
    const likePost = this.postsService.changeLikeStatusPost(
      id,
      req.user,
      likeStatusPostDto,
    );
    if (!likePost) throw new BadRequestException();
    return;
  }
}
