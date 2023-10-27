import { Module } from '@nestjs/common';
import { TestingService } from './testing.service';
import { TestingController } from './testing.controller';
import { Connection } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from 'src/blogs/entities/blog.entity';
import { Post, PostSchema } from 'src/posts/entities/post.entity';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { Comment, CommentSchema } from 'src/comments/entities/comment.entity';
import { LikePost, LikePostSchema } from 'src/posts/entities/like-post.entity';
import {
  LikeComment,
  LikeCommentSchema,
} from 'src/comments/entities/like-comment.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikePost.name, schema: LikePostSchema },
      { name: LikeComment.name, schema: LikeCommentSchema },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingService, Connection],
})
export class TestingModule {}
