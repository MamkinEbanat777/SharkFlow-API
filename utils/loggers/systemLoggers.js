import { logInfo, logWarn, logError } from './baseLogger.js';

const validateParams = (ip) => {
  if (!ip) throw new Error('ip is required');
};

export const logCronJobStart = (jobName, ip) => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logInfo('System', 'cronStart', `${jobName} started from IP: ${ip}`);
};

export const logCronJobComplete = (jobName, ip, result = '') => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logInfo('System', 'cronComplete', `${jobName} completed from IP: ${ip}${result ? ` - ${result}` : ''}`);
};

export const logCronJobError = (jobName, error, ip) => {
  if (!jobName) throw new Error('jobName is required');
  validateParams(ip);
  logError('System', 'cronError', `${jobName} failed from IP: ${ip}`, error);
};

export const logLocationError = (ip, error) => {
  validateParams(ip);
  logError('System', 'locationError', `Failed to get location for IP: ${ip}`, error);
};

export const logServerStart = (port) => {
  if (!port) throw new Error('port is required');
  logInfo('System', 'serverStart', `Server started on port ${port}`);
};

export const logServerStop = () => {
  logInfo('System', 'serverStop', 'Server stopped gracefully');
};

export const logDatabaseError = (operation, error) => {
  if (!operation) throw new Error('operation is required');
  logError('System', 'databaseError', `Database operation failed: ${operation}`, error);
};

export const logExternalServiceError = (service, operation, error) => {
  if (!service) throw new Error('service is required');
  if (!operation) throw new Error('operation is required');
  logError('System', 'externalServiceError', `${service} ${operation} failed`, error);
}; 