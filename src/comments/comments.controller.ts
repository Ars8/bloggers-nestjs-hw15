import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { OutputCommentDto } from './dto/output-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LikeStatusCommentDto } from './dto/like-status-comment.dto';
import { ExtractUserFromToken } from 'src/auth/guards/extractUserFromToken.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  findAll() {
    return this.commentsService.findAll();
  }

  @UseGuards(ExtractUserFromToken)
  @Get(':id')
  async findById(
    @Request() req,
    @Param('id') id: string,
  ): Promise<OutputCommentDto | null> {
    const comment = await this.commentsService.findById(id, req.user);
    if (!comment) throw new NotFoundException();
    return comment;
  }
  @UseGuards(JwtAuthGuard, ExtractUserFromToken)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    const comment = await this.commentsService.findById(id, null);
    if (!comment) throw new NotFoundException();
    //console.log(req.user.userId),

    if (comment.commentatorInfo.userId !== req.user.userId) {
      throw new ForbiddenException();
    }
    await this.commentsService.update(id, updateCommentDto);
    return HttpStatus.NO_CONTENT;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, ExtractUserFromToken)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const comment = await this.commentsService.findById(id, null);
    if (!comment) throw new NotFoundException();
    if (comment.commentatorInfo.userId !== req.user.userId) {
      throw new ForbiddenException();
    }
    await this.commentsService.remove(id);
    return HttpStatus.NO_CONTENT;
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  async likeStatusCommentId(
    @Request() req,
    @Param('id') id: string,
    @Body() likeStatusCommentDto: LikeStatusCommentDto,
  ) {
    const comment = await this.commentsService.findById(id, null);
    //console.log(comment);
    if (!comment) throw new NotFoundException();
    const likeComment = this.commentsService.changeLikeStatusComment(
      id,
      req.user,
      likeStatusCommentDto,
    );
    if (!likeComment) throw new BadRequestException();
    return HttpStatus.NO_CONTENT;
  }
}
