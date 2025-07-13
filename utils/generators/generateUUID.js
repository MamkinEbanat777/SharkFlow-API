/**
 * @module generators/uuid
 * @description Генераторы UUID.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Генерирует уникальный UUID v4
 * @returns {string} UUID в формате xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID() {
  return uuidv4();
}
