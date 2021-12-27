import * as mongoose from 'mongoose';

export const SettingsSchema = new mongoose.Schema(
  {
    id: String,
    key: String,
    value: String
  },
  { _id: false }
);

export const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: (v) => v.length === 10,
        message: 'Phone number must be exactly of 10 digits.'
      }
    },
    password: {
      type: String,
      required: function () {
        return this.email;
      }
    },
    roles: [{ type: String, required: true }],
    auth: {
      email: {
        valid: { type: Boolean, default: false }
      }
    },
    settings: { type: SettingsSchema, required: false }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);
