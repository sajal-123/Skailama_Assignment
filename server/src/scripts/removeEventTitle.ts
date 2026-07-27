import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// One-off migration: physically remove the deprecated `title` field from every
// existing event document. Dropping `title` from the Mongoose schema stops it
// being read/written, but data already stored in MongoDB keeps the field until
// it is explicitly unset. We go through the native driver collection because
// Mongoose's strict mode would strip a $unset on a path no longer in the schema.
async function run(): Promise<void> {
  await mongoose.connect(env.MONGO_URI);
  logger.info('Connected — removing `title` from event documents');

  const result = await mongoose.connection
    .collection('events')
    .updateMany({ title: { $exists: true } }, { $unset: { title: '' } });

  logger.info('Migration complete', {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });

  await mongoose.connection.close();
}

run().catch(async (err) => {
  logger.error('Migration failed', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
