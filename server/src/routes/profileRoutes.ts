import { Router } from 'express';
import { listProfiles, createProfile, updateProfileTimezone } from '../controllers/profileController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import {
  createProfileSchema,
  profileIdParamsSchema,
  updateProfileTimezoneSchema,
} from '../schemas/index.js';

const router = Router();

router.get('/', asyncHandler(listProfiles));
router.post('/', validate(createProfileSchema), asyncHandler(createProfile));
router.patch(
  '/:id/timezone',
  validate(profileIdParamsSchema, 'params'),
  validate(updateProfileTimezoneSchema),
  asyncHandler(updateProfileTimezone)
);

export default router;
