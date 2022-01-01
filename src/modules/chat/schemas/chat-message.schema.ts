import * as mongoose from 'mongoose';

export const ChatMessageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Types.ObjectId, ref: 'C_Room' },
    message: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => v.length >= 0,
        message: "Chat Message can't be empty"
      }
    },
    from: { type: mongoose.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: new Date() }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
