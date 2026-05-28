const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS'
};

const LOG_COLORS = {
  ERROR: '\x1b[31m',      // Rojo
  WARN: '\x1b[33m',       // Amarillo
  INFO: '\x1b[36m',       // Cian
  DEBUG: '\x1b[35m',      // Magenta
  SUCCESS: '\x1b[32m',    // Verde
  RESET: '\x1b[0m'        // Reset
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'debug';
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const color = LOG_COLORS[level] || '';
    const reset = LOG_COLORS.RESET;
    
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = ` | ${JSON.stringify(meta)}`;
    }

    const consoleMsg = `${color}[${timestamp}] [${level}]${reset} ${message}${metaStr}`;
    const fileMsg = `[${timestamp}] [${level}] ${message}${metaStr}`;

    return { consoleMsg, fileMsg };
  }

  writeToFile(message, level) {
    const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
    const allLogsFile = path.join(logsDir, 'all.log');

    fs.appendFileSync(logFile, message + '\n', 'utf8');
    fs.appendFileSync(allLogsFile, message + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    const { consoleMsg, fileMsg } = this.formatMessage(level, message, meta);
    
    console.log(consoleMsg);
    this.writeToFile(fileMsg, level);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = { ...meta };
    if (error) {
      errorMeta.error = error.message;
      errorMeta.stack = error.stack;
    }
    this.log(LOG_LEVELS.ERROR, message, errorMeta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  success(message, meta = {}) {
    this.log(LOG_LEVELS.SUCCESS, message, meta);
  }

  // Express middleware para logging de requests
  middleware() {
    return (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;
      const logger = this;

      res.json = function(data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const level = statusCode >= 400 ? LOG_LEVELS.WARN : LOG_LEVELS.INFO;

        logger.log(level, `${req.method} ${req.path}`, {
          statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get('user-agent')
        });

        return originalJson.call(this, data);
      };

      next();
    };
  }
}

module.exports = new Logger();
