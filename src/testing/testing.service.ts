import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from 'src/blogs/entities/blog.entity';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/posts/entities/post.entity';
import { Comment, CommentDocument } from 'src/comments/entities/comment.entity';

@Injectable()
export class TestingService {
  constructor(
    @InjectModel(Blog.name) private blogsModel: Model<BlogDocument>,
    @InjectModel(User.name) private usersModel: Model<UserDocument>,
    @InjectModel(Post.name) private postsModel: Model<PostDocument>,
    @InjectModel(Comment.name) private commentsModel: Model<CommentDocument>,
  ) {}

  async removeAll() {
    await this.blogsModel.deleteMany({});
    await this.usersModel.deleteMany({});
    await this.postsModel.deleteMany({});
    await this.commentsModel.deleteMany({});
  }
}
