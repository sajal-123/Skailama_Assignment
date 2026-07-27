import Profile from '../models/Profile.js';
import { AppError } from '../utils/AppError.js';
import type { CreateProfileBody } from '../schemas/index.js';

export async function listProfiles() {
  return Profile.find().sort({ createdAt: 1 });
}

export async function createProfile(body: CreateProfileBody) {
  return Profile.create({ name: body.name, timezone: body.timezone });
}

export async function updateProfileTimezone(id: string, timezone: string) {
  const profile = await Profile.findByIdAndUpdate(
    id,
    { timezone },
    { new: true, runValidators: true }
  );
  if (!profile) throw new AppError('profile not found', 404);
  return profile;
}
