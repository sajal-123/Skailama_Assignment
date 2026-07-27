// Request/response shapes are now derived from Zod schemas in src/schemas.
// This file holds persistence-facing types shared across models and services.

export interface UpdateLog {
  field: 'profiles' | 'timezone' | 'startAt' | 'endAt';
  previousValue: string;
  newValue: string;
  changedAt: Date;
}
