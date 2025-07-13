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

const parseHttpLogDetails = (details) => {
  const regex =
    /^(\S+) - - \[([^\]]+)\] "(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) ([^"]+) (HTTP\/[0-9.]*)" (\d{3}) (\d+) "([^"]*)" "([^"]*)"/;

  const match = details.match(regex);
  if (!match) return {};

  const [
    ,
    ip,
    rawDate,
    method,
    path,
    protocol,
    status,
    responseSize,
    referer,
    userAgent,
  ] = match;

  const timestamp = new Date(rawDate.replace(':', ' ', 1)).toISOString();

  return {
    ip,
    timestamp,
    method,
    path,
    protocol,
    status: parseInt(status),
    response_size: parseInt(responseSize),
    referer,
    user_agent: userAgent,
  };
};

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

const prepareLogData = (entity, action, details, error = null) => {
  const base = { entity, action };

  if (entity === 'HTTP' && typeof details === 'string') {
    const parsed = parseHttpLogDetails(details);
    return { ...base, ...parsed };
  }

  let combinedDetails = details;
  if (error) {
    const errorMsg = error?.stack || error?.message || error || '';
    combinedDetails = `${details} ${errorMsg}`.trim();
  }

  return { ...base, details: combinedDetails };
};

const winstonLogger = winston.createLogger({
  level: getLogLevel(),
  transports,
});

export const logInfo = (entity, action, details) => {
  winstonLogger.info(prepareLogData(entity, action, details));
};

export const logWarn = (entity, action, details) => {
  winstonLogger.warn(prepareLogData(entity, action, details));
};

export const logError = (entity, action, details, error) => {
  winstonLogger.error(prepareLogData(entity, action, details, error));
};

export const logSuspicious = (entity, action, userUuid, ip, extra = '') => {
  const details = `Suspicious activity by ${userUuid} from IP ${ip}. ${extra}`;
  const meta = {
    user_uuid: userUuid,
    ip,
    severity: 'suspicious',
  };
  winstonLogger.warn({ entity, action: 'security', details, ...meta });
};

const logger = {
  logInfo,
  logWarn,
  logError,
  logSuspicious,
};

export default logger;
