import { Module, Post } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { CommentsRepository } from './comments.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './entities/comment.entity';
import { LikeComment, LikeCommentSchema } from './entities/like-comment.entity';
import { PreparationComments } from './preparation.comments';
import { JwtService } from '@nestjs/jwt';
import { PostSchema } from 'src/posts/entities/post.entity';
import { Blog, BlogSchema } from 'src/blogs/entities/blog.entity';
import { LikePost, LikePostSchema } from 'src/posts/entities/like-post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikePost.name, schema: LikePostSchema },
      { name: LikeComment.name, schema: LikeCommentSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    PreparationComments,
    JwtService,
  ],
})
export class CommentsModule {}
