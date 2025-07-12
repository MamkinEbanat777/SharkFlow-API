import prisma from '../prismaConfig/prismaClient.js';
import { parseDeviceInfo } from './authHelpers.js';
import axios from 'axios';
import { logLocationError } from '../loggers/systemLoggers.js';

/**
 * Получение геолокации по IP адресу
 * @param {string} ipAddress - IP адрес
 * @returns {Promise<Object|null>} Объект с геолокацией или null
 * @example
 * const geoLocation = await getGeoLocation('192.168.1.1');
 */
export const getGeoLocation = async (ipAddress) => {
  try {
    const { data } = await axios.get(`https://ipwho.is/${ipAddress}`);
    return data;
  } catch (error) {
    logLocationError(ipAddress, error);
    return null;
  }
};

/**
 * Создание или обновление сессии устройства пользователя
 * @param {Object} params - Параметры для создания/обновления сессии
 * @param {number} params.userId - ID пользователя
 * @param {string} params.deviceId - ID устройства
 * @param {string} params.userAgent - User-Agent строка
 * @param {string} params.ipAddress - IP адрес
 * @param {string|null} params.referrer - Referrer заголовок
 * @param {Object|null} params.geoLocation - Геолокация
 * @returns {Promise<Object>} Объект сессии устройства
 * @example
 * const deviceSession = await createOrUpdateDeviceSession({
 *   userId: 1,
 *   deviceId: 'device123',
 *   userAgent: 'Mozilla/5.0...',
 *   ipAddress: '192.168.1.1',
 *   referrer: 'https://example.com',
 *   geoLocation: { country: 'Russia' }
 * });
 */
export const createOrUpdateDeviceSession = async ({
  userId,
  deviceId,
  userAgent,
  ipAddress,
  referrer = null,
  geoLocation = null,
}) => {
  const deviceinfo = parseDeviceInfo(userAgent);

  let deviceSession = await prisma.userDeviceSession.findFirst({
    where: { userId, deviceId },
  });

  const sessionData = {
    userAgent,
    ipAddress,
    referrer,
    lastLoginAt: new Date(),
    isActive: true,
    deviceType: deviceinfo.deviceType,
    deviceBrand: deviceinfo.deviceBrand,
    deviceModel: deviceinfo.deviceModel,
    osName: deviceinfo.osName,
    osVersion: deviceinfo.osVersion,
    clientName: deviceinfo.clientName,
    clientVersion: deviceinfo.clientVersion,
    clientType: deviceinfo.clientType,
    geoLocation,
  };

  if (deviceSession) {
    deviceSession = await prisma.userDeviceSession.update({
      where: { id: deviceSession.id },
      data: sessionData,
    });
  } else {
    deviceSession = await prisma.userDeviceSession.create({
      data: {
        userId,
        deviceId,
        ...sessionData,
      },
    });
  }

  return deviceSession;
};

/**
 * Проверка наличия deviceId в заголовках запроса
 * @param {Object} req - Express request объект
 * @returns {string|null} deviceId или null если не найден
 * @example
 * const deviceId = getDeviceId(req);
 * if (!deviceId) {
 *   return res.status(401).json({ error: 'Устройство не найдено' });
 * }
 */
export const getDeviceId = (req) => {
  const header = req.headers['x-device-id'];
  if (Array.isArray(header)) {
    return header[0] || null;
  }
  return header || null;
};

/**
 * Валидация deviceId
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @returns {string|null} deviceId или null если валидация не прошла
 * @example
 * const deviceId = validateDeviceId(req, res);
 * if (!deviceId) return; // res уже отправлен
 */
export const validateDeviceId = (req, res) => {
  const deviceId = getDeviceId(req);
  
  if (!deviceId) {
    res.status(401).json({ error: 'Устройство не найдено' });
    return null;
  }
  
  return deviceId;
}; 