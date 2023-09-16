import { TransformFnParams } from 'class-transformer';
import mongoose from 'mongoose';

export const trimValidatedString = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;
