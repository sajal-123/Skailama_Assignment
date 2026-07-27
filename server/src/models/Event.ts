import mongoose, { Schema, type Document, type Types } from 'mongoose';
import type { UpdateLog } from '../types/index.js';

export interface IEvent extends Document {
  profiles: Types.ObjectId[];
  timezone: string;
  startAt: Date;
  endAt: Date;
  updateLogs: UpdateLog[];
  createdAt: Date;
  updatedAt: Date;
}

const updateLogSchema = new Schema<UpdateLog>(
  {
    field: { type: String, required: true },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const eventSchema = new Schema<IEvent>(
  {
    profiles: [{ type: Schema.Types.ObjectId, ref: 'Profile', required: true }],
    timezone: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    updateLogs: { type: [updateLogSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>('Event', eventSchema);
