import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LikeCommentDocument = HydratedDocument<LikeComment>;

@Schema({ versionKey: false, _id: false })
export class LikeComment {
  @Prop()
  addedAt: string;
  @Prop()
  commentId: string;
  @Prop()
  userId: string;
  @Prop()
  login: string;
  @Prop()
  likeStatus: string;
}

export const LikeCommentSchema = SchemaFactory.createForClass(LikeComment);
