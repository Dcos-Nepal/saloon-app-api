import * as mongoose from 'mongoose';

export const ChatRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    isPublic: { type: Boolean, required: false, default: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
