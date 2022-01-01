import { ObjectId } from 'mongoose';

export interface IChatRequest {
  _id?: string;
  inviter: string | ObjectId;
  invitee: string | ObjectId;
  message?: string;
  isAccepted: boolean;
}

export interface ChatRequest extends IChatRequest, Document {
  _id?: string;
}
