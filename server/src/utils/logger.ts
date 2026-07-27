import { isProd } from '../config/env.js';

type Level = 'debug' | 'info' | 'warn' | 'error';

function emit(level: Level, message: string, meta?: unknown): void {
  const sink = level === 'error' || level === 'warn' ? console.error : console.log;
  if (isProd) {
    sink(JSON.stringify({ time: new Date().toISOString(), level, message, ...(meta ? { meta } : {}) }));
  } else {
    sink(`[${level}] ${message}`, meta ?? '');
  }
}

export const logger = {
  debug: (message: string, meta?: unknown): void => {
    if (!isProd) emit('debug', message, meta);
  },
  info: (message: string, meta?: unknown): void => emit('info', message, meta),
  warn: (message: string, meta?: unknown): void => emit('warn', message, meta),
  error: (message: string, meta?: unknown): void => emit('error', message, meta),
};
