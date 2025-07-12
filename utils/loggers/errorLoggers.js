import { logError } from './baseLogger.js';

export const logRouteHandlerError = (action, details, error) => {
  logError('RouteHandler', action, details, error);
}; 