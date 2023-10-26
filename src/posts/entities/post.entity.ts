import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Blog } from 'src/blogs/entities/blog.entity';

export type PostDocument = HydratedDocument<Post>;

@Schema({ versionKey: false, _id: false })
export class NewestLikes {
  @Prop()
  addedAt: string;
  @Prop()
  userId: string;
  @Prop()
  login: string;
}
@Schema({ versionKey: false, _id: false })
export class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;
  @Prop({ required: true })
  dislikesCount: number;
  @Prop({ required: true })
  myStatus: string;
  @Prop({ required: true, default: [] })
  newestLikes: NewestLikes[];
}
@Schema({ versionKey: false })
export class Post {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  extendedLikesInfo: ExtendedLikesInfo;
}
export const PostSchema = SchemaFactory.createForClass(Post);
