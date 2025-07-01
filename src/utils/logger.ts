
/**
 * Centralized logging utility following industry standards
 * Based on structured logging principles and observability best practices
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: 'info',
  enableConsole: true,
  enableRemote: false,
};

/**
 * Log level hierarchy for filtering
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Production-ready logger class
 * Follows structured logging principles for better observability
 */
class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Checks if a log level should be processed
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * Creates a structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };
  }

  /**
   * Outputs log entry to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
    
    switch (level) {
      case 'debug':
        console.log(prefix, message, context);
        break;
      case 'info':
        console.info(prefix, message, context);
        break;
      case 'warn':
        console.warn(prefix, message, context);
        break;
      case 'error':
        console.error(prefix, message, context, error);
        break;
    }
  }

  /**
   * Sends log entry to remote logging service
   */
  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console if remote logging fails
      console.error('Failed to send log to remote endpoint:', error);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context, error);
    
    this.logToConsole(entry);
    
    // Don't await remote logging to avoid blocking
    if (this.config.enableRemote) {
      this.logToRemote(entry).catch(() => {
        // Silent failure for remote logging
      });
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Updates logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
});

/**
 * Factory function for creating custom logger instances
 */
export const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  return new Logger(config);
};

/**
 * Convenience functions for quick logging
 */
export const logDebug = (message: string, context?: LogContext): void => {
  logger.debug(message, context);
};

export const logInfo = (message: string, context?: LogContext): void => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: LogContext): void => {
  logger.warn(message, context);
};

export const logError = (message: string, context?: LogContext, error?: Error): void => {
  logger.error(message, context, error);
};
