import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  HttpStatus,
  UseGuards,
  HttpCode,
  Request,
} from '@nestjs/common';
import { queryHandler } from 'src/helpers/queryHandler';
import { PaginationViewType } from 'src/helpers/transformToPaginationView';
import { CreatePostForBlogDto } from '../posts/dto/create-post-for-blog.dto';
import { OutputPostDto } from 'src/posts/dto/output-post.dto';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { OutputBlogDto } from './dto/output-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { ExtractUserFromToken } from 'src/auth/guards/extractUserFromToken.guard';

@Controller('blogs')
export class BlogsController {
  constructor(protected blogsService: BlogsService) {}
  @UseGuards(AuthGuard('basic'))
  @Post()
  async create(@Body() createBlogDto: CreateBlogDto): Promise<OutputBlogDto> {
    return this.blogsService.create(createBlogDto);
  }
  @UseGuards(AuthGuard('basic'))
  @Post(':id/posts')
  async createPostForBlog(
    @Param('id') id: string,
    @Body() createPostForBlogDto: CreatePostForBlogDto,
  ): Promise<OutputPostDto> {
    const blog = await this.blogsService.findOne(id);
    if (!blog) throw new NotFoundException();
    return this.blogsService.createPostForBlog({
      ...createPostForBlogDto,
      blogId: id,
    });
  }

  @Get()
  async findAll(@Query() query): Promise<PaginationViewType<OutputBlogDto>> {
    return this.blogsService.findAll(queryHandler(query));
  }

  @UseGuards(ExtractUserFromToken)
  @Get(':id/posts')
  async findAllPostsForBlog(
    @Request() req,
    @Query() query,
    @Param('id') id: string,
  ): Promise<PaginationViewType<OutputPostDto>> {
    const blog = await this.blogsService.findOne(id);
    if (!blog) throw new NotFoundException();
    return this.blogsService.findAllPostsForBlog(
      queryHandler(query),
      id,
      req.user,
    );
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OutputBlogDto | null> {
    const blog = await this.blogsService.findOne(id);
    if (!blog) throw new NotFoundException();
    return blog;
  }
  @UseGuards(AuthGuard('basic'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Promise<HttpStatus.NO_CONTENT> {
    const updatedBlog = await this.blogsService.update(id, updateBlogDto);
    if (!updatedBlog) throw new NotFoundException();
    return HttpStatus.NO_CONTENT;
  }
  @UseGuards(AuthGuard('basic'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<HttpStatus.NO_CONTENT> {
    const deletedBlog = await this.blogsService.remove(id);
    if (!deletedBlog) throw new NotFoundException();
    return HttpStatus.NO_CONTENT;
  }
}
