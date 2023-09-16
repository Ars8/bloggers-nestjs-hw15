import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikePostDocument = HydratedDocument<LikePost>;

@Schema({ versionKey: false, _id: false })
export class LikePost {
  @Prop()
  addedAt: string;
  @Prop()
  postId: string;
  @Prop()
  userId: string;
  @Prop()
  login: string;
  @Prop()
  likeStatus: string;
}

export const LikePostSchema = SchemaFactory.createForClass(LikePost);
