import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ versionKey: false, _id: false })
export class EmailConfirmation {
  @Prop()
  confirmationCode: string;
  @Prop({ required: true })
  expirationDate: string;
  @Prop({ required: true, default: false })
  isConfirmed: boolean;
}
@Schema({ versionKey: false, _id: false })
export class UserSessions {
  @Prop()
  id: string;
}

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  login: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  emailConfirmation: EmailConfirmation;
  @Prop({ required: true, default: [] })
  userSessions: UserSessions[];
}
export const UserSchema = SchemaFactory.createForClass(User);
