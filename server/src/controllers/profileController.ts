import type { Request, Response } from 'express';
import * as profileService from '../services/profileService.js';
import type { CreateProfileBody } from '../schemas/index.js';

export async function listProfiles(_req: Request, res: Response): Promise<void> {
  const profiles = await profileService.listProfiles();
  res.json(profiles);
}

export async function createProfile(req: Request, res: Response): Promise<void> {
  const profile = await profileService.createProfile(req.body as CreateProfileBody);
  res.status(201).json(profile);
}

export async function updateProfileTimezone(req: Request, res: Response): Promise<void> {
  const { timezone } = req.body as { timezone: string };
  const profile = await profileService.updateProfileTimezone(req.params.id, timezone);
  res.json(profile);
}
