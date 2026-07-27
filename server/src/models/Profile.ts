import mongoose, { Schema, type Document } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true, trim: true },
    timezone: { type: String, default: 'UTC' },
  },
  { timestamps: true }
);

export default mongoose.model<IProfile>('Profile', profileSchema);
