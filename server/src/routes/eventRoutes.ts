import { Router } from 'express';
import { listEvents, createEvent, updateEvent, getEventLogs } from '../controllers/eventController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { eventBodySchema, eventIdParamsSchema, listEventsQuerySchema } from '../schemas/index.js';

const router = Router();

router.get('/', validate(listEventsQuerySchema, 'query'), asyncHandler(listEvents));
router.post('/', validate(eventBodySchema), asyncHandler(createEvent));
router.put(
  '/:id',
  validate(eventIdParamsSchema, 'params'),
  validate(eventBodySchema),
  asyncHandler(updateEvent)
);
router.get('/:id/logs', validate(eventIdParamsSchema, 'params'), asyncHandler(getEventLogs));

export default router;
