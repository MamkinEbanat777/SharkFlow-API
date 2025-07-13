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

const injectReadableMessage = winston.format((info) => {
  if (
    typeof info.message === 'object' &&
    info.message !== null &&
    (info.message.entity || info.message.action || info.message.details)
  ) {
    const { entity, action, details } = info.message;
    const parts = [];
    if (entity) parts.push(`[${entity}]`);
    if (action) parts.push(action);
    if (details) parts.push(details);
    info._formattedMessage = parts.join(': ');
  } else if (typeof info.message === 'string') {
    info._formattedMessage = info.message;
  }
  return info;
});

const consoleFormat = winston.format.printf(
  ({ timestamp, level, _formattedMessage }) => {
    if (!_formattedMessage) return `${timestamp} ${level} -`;

    let coloredMsg = _formattedMessage.replace(
      /\[([^\]]+)\]/g,
      `${entityColor}[$1]${levelColors.RESET}`,
    );

    coloredMsg = coloredMsg.replace(/] ([^:]+):/, (match, p1) => {
      return `] ${actionColor}${p1}${levelColors.RESET}:`;
    });

    return `${timestamp} ${level} ${coloredMsg}`;
  },
);

const getLogLevel = () => {
  const env = process.env.NODE_ENV || 'development';
  const envLevel = process.env.LOG_LEVEL;
  return envLevel || (env === 'production' ? 'info' : 'debug');
};

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      timeFormat(),
      colorizeLevel(),
      injectReadableMessage(),
      consoleFormat,
    ),
  }),
];

if (
  process.env.LOKI_URL &&
  process.env.LOKI_USER_ID &&
  process.env.LOKI_API_KEY
) {
  transports.push(
    new LokiTransport({
      host: process.env.LOKI_URL,
      basicAuth: `${process.env.LOKI_USER_ID}:${process.env.LOKI_API_KEY}`,
      labels: { app: 'SharkFlow-API', env: `${process.env.NODE_ENV}` },
      json: true,
      format: winston.format.json(),
      replaceTimestamp: true,
      clearOnError: true,
      onConnectionError: (err) => console.error('LokiTransport: ', err),
    }),
  );
}

const winstonLogger = winston.createLogger({
  level: getLogLevel(),
  transports,
});

export const logInfo = (entity, action, details) => {
  winstonLogger.info({ entity, action, details });
};

export const logWarn = (entity, action, details) => {
  winstonLogger.warn({ entity, action, details });
};

export const logError = (entity, action, details, error) => {
  const errorMsg = error?.stack || error?.message || error || '';
  winstonLogger.error({
    entity,
    action,
    details: `${details} ${errorMsg}`.trim(),
  });
};

export const logSuspicious = (entity, action, userUuid, ip, extra = '') => {
  const details = `Suspicious: ${action} by ${userUuid} from IP: ${ip} ${extra}`;
  winstonLogger.warn({ entity, action: 'security', details });
};

const logger = {
  logInfo,
  logWarn,
  logError,
  logSuspicious,
};

export default logger;
