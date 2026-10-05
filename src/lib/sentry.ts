export function logError(error: unknown, context?: Record<string, unknown>) {
  console.error('[Sentry / Error Logger]', error, context);
  // Sentry SDK can be plugged in when SENTRY_DSN is set
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[Sentry - ${level.toUpperCase()}]`, message);
}
