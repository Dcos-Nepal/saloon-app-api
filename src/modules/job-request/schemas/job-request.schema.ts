import * as mongoose from 'mongoose';
import { randomNumbers } from 'src/common/utils/random-string';
import { JobRequest } from '../interfaces/job-request.interface';

export const JobRequestSchema = new mongoose.Schema(
  {
    reqCode: String,
    name: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, required: true, default: false },
    type: { type: String },
    status: { type: String, default: 'PENDING' },
    client: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    property: { type: mongoose.Types.ObjectId, required: false, default: null, ref: 'Property' },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    workingDays: [{ type: String }],
    workingHours: {
      start: { type: String },
      end: { type: String }
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

/**
 * Before saving new Job Request
 */
JobRequestSchema.pre('save', function (this: JobRequest, next) {
  this.reqCode = `JREQ:${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomNumbers()}`;
  next();
});
