import { ObjectId } from 'mongoose';

export interface IChatMessage {
  _id?: string;
  from: string | ObjectId;
  to: string | ObjectId;
  room: string | ObjectId;
  message: string;
  date: Date;
}

export interface ChatMessage extends IChatMessage, Document {
  _id?: string;
}
