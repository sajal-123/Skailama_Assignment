import type { Request, Response } from 'express';
import * as eventService from '../services/eventService.js';
import type { EventBody, ListEventsQuery } from '../schemas/index.js';

export async function listEvents(req: Request, res: Response): Promise<void> {
  const result = await eventService.listEvents(req.query as unknown as ListEventsQuery);
  res.json(result);
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const event = await eventService.createEvent(req.body as EventBody);
  res.status(201).json(event);
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const event = await eventService.updateEvent(req.params.id, req.body as EventBody);
  res.json(event);
}

export async function getEventLogs(req: Request, res: Response): Promise<void> {
  const logs = await eventService.getEventLogs(req.params.id);
  res.json(logs);
}
