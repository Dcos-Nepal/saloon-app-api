import * as mongoose from 'mongoose';

export const ChatRequestSchema = new mongoose.Schema(
  {
    inviter: { type: mongoose.Types.ObjectId, ref: 'User' },
    invitee: { type: mongoose.Types.ObjectId, ref: 'User' },
    message: { type: String, required: false, default: "Hi! 👋 Let's have a chat!" },
    isAccepted: { type: Boolean, required: true, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
