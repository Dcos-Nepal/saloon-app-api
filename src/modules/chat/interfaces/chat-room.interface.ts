import { ObjectId } from 'mongoose';

export interface IChatRoom {
  _id?: string;
  name: string;
  owner: string | ObjectId;
  members: [string | ObjectId];
  isPublic?: boolean;
}

export interface ChatRoom extends IChatRoom, Document {
  _id?: string;
}
