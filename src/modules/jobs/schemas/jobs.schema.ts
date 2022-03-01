import * as mongoose from 'mongoose';
import { randomNumbers } from 'src/common/utils/random-string';
import { Job, JobType } from '../interfaces/job.interface';

export const JobSchema = new mongoose.Schema(
  {
    refCode: { type: String },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    jobFor: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    property: { type: mongoose.Types.ObjectId, required: true, ref: 'Property' },
    team: [{ type: mongoose.Types.ObjectId, required: true, ref: 'User' }],
    remindInvoicing: { type: Boolean, required: true, default: false },
    startDate: { type: Date },
    isCompleted: { type: Boolean, default: false },
    primaryVisit: { type: mongoose.Types.ObjectId, ref: 'Visits' },
    lineItems: [
      {
        ref: { type: String, required: false },
        name: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 }
      }
    ],
    completion: {
      note: { type: String },
      docs: [
        {
          url: { type: String },
          key: { type: String }
        }
      ],
      date: { type: Date },
      completedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
    },
    feedback: {
      note: { type: String },
      rating: { type: Number },
      date: { type: Date }
    },
    type: { type: String, enum: Object.keys(JobType), required: true, default: JobType['ONE-OFF'] },
    createdBy: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

/**
 * Before saving new Job
 */
JobSchema.pre('save', function (this: Job, next) {
  this.refCode = `JOB:${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}-${randomNumbers()}`;
  next();
});
