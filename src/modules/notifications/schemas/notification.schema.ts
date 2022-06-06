import * as mongoose from 'mongoose';

export const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: { type: String },
    path: { type: String },
    type: { type: String, default: 'NORMAL' },
    isRead: { type: Boolean, required: true, default: false },
    receiver: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
