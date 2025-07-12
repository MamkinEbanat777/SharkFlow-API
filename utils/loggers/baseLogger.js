import winston from 'winston';
import LokiTransport from 'winston-loki';

const levelColors = {
  INFO: '\x1b[34m', 
  WARN: '\x1b[33m', 
  ERROR: '\x1b[31m', 
  RESET: '\x1b[0m',
};

const entityColor = '\x1b[36m'; 
const actionColor = '\x1b[35m'; 

const timeFormat = winston.format((info) => {
  const date = new Date(info.timestamp);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  info.timestamp = `${hh}:${mm}:${ss}`;
  return info;
});

const colorizeLevel = winston.format((info) => {
  const level = info.level.toUpperCase();
  const color = levelColors[level] || '';
  const reset = levelColors.RESET;
  info.level = `${color}[${level}]${reset}`;
  return info;
});

const consoleFormat = winston.format.printf(({ timestamp, level, message }) => {
  let coloredMsg = message.replace(
    /\[([^\]]+)\]/g,
    `${entityColor}[$1]${levelColors.RESET}`,
  );

  coloredMsg = coloredMsg.replace(/] ([^:]+):/, (match, p1) => {
    return `] ${actionColor}${p1}${levelColors.RESET}:`;
  });

  return `${timestamp} ${level} ${coloredMsg}`;
});

const lokiFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
});

const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const envLevel = process.env.LOG_LEVEL;
  
  if (envLevel) return envLevel;
  
  return env === 'production' ? 'info' : 'debug';
};

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      timeFormat(),
      colorizeLevel(),
      consoleFormat,
    ),
  }),
];

if (process.env.LOKI_URL && process.env.LOKI_API_KEY) {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_URL,
      labels: { app: 'SharkFlow-API' },
      json: true,
      headers: {
        Authorization: `Bearer ${process.env.LOKI_API_KEY}`,
      },
      format: winston.format.combine(
        winston.format.timestamp(),
        timeFormat(),
        lokiFormat,
      ),
    })
  );
}

const winstonLogger = winston.createLogger({
  level: getLogLevel(),
  transports,
});

function formatMessage(entity, action, details) {
  const parts = [];
  if (entity) parts.push(`[${entity}]`);
  if (action) parts.push(action);
  if (details) parts.push(details);
  return parts.join(': ');
}

export const logInfo = (entity, action, details) => {
  winstonLogger.info(formatMessage(entity, action, details));
};

export const logWarn = (entity, action, details) => {
  winstonLogger.warn(formatMessage(entity, action, details));
};

export const logError = (entity, action, details, error) => {
  const errorMsg = error?.stack || error?.message || error || '';
  const baseMsg = formatMessage(entity, action, details);
  winstonLogger.error(`${baseMsg} ${errorMsg}`.trim());
};

export const logSuspicious = (entity, action, userUuid, ip, extra = '') => {
  const suspiciousMsg = `Suspicious: ${action} by ${userUuid} from IP: ${ip} ${extra}`;
  winstonLogger.warn(formatMessage(entity, suspiciousMsg));
};

const logger = {
  logInfo,
  logWarn,
  logError,
  logSuspicious,
};

export default logger;
