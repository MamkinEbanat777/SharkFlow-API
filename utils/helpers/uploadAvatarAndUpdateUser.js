/**
 * @module helpers/uploadAvatarAndUpdateUser
 * @description Вспомогательные функции для загрузки аватаров и обновления пользователей.
 */
import '../../config/cloudinaryConfig.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import prisma from '../prismaConfig/prismaClient.js';
import { logMailSendError } from '../loggers/mailLoggers.js';
import { logLocationError } from '../loggers/systemLoggers.js';

/**
 * Загрузка аватара в Cloudinary и обновление пользователя
 * @param {number} userId - ID пользователя
 * @param {string} avatarUrl - URL аватара для загрузки
 * @param {string} publicId - Public ID в Cloudinary
 * @returns {Promise<void>} Ничего не возвращает, обновляет пользователя в БД
 * @example
 * await uploadAvatarAndUpdateUser(123, 'https://example.com/avatar.jpg', 'user_123');
 */
export async function uploadAvatarAndUpdateUser(userId, avatarUrl, publicId) {
  try {
    const imageResp = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
      headers: {
        'User-Agent': 'SharkFlowBot/1.0',
      },
    });

    const buffer = Buffer.from(imageResp.data);

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'user_avatars',
          public_id: publicId,
          overwrite: true,
          format: 'webp',
          transformation: [
            {
              quality: 'auto',
            },
          ],
        },
        (error, result) => {
          if (error) {
            logMailSendError(error);
            return reject(error);
          }
          resolve(result);
        },
      );
      stream.on('error', (err) => {
        logLocationError('cloudinary', err);
        reject(err);
      });
      stream.end(buffer);
    });

    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      logMailSendError(new Error('Пользователь не найден или удалён'));
      return;
    }

    console.log(result);

    const secureUrl = result?.secure_url || null;
    if (secureUrl) {
      const update = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: secureUrl },
      });
      if (!update) {
        logMailSendError(
          new Error('Аватар не обновлён: пользователь не найден или удалён'),
        );
      }
    } else {
      logMailSendError(new Error('Cloudinary вернул пустой secure_url'));
    }
  } catch (err) {
    logMailSendError(err);
  }
}
