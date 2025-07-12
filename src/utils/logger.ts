
/**
 * Logger utility for consistent logging across the application
 */

interface LogContext {
  [key: string]: unknown;
}

interface Logger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
}

class SimpleLogger implements Logger {
  private formatLog(level: string, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatLog('info', message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatLog('warn', message, context));
  }

  error(message: string, context?: LogContext) {
    console.error(this.formatLog('error', message, context));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, context));
    }
  }
}

export const logger = new SimpleLogger();

// Legacy logError function for backward compatibility
export const logError = (message: string, context?: LogContext, error?: Error) => {
  const fullContext = {
    ...context,
    ...(error && { 
      errorMessage: error.message,
      errorStack: error.stack 
    })
  };
  logger.error(message, fullContext);
};
