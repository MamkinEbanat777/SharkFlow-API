import '../../config/cloudinaryConfig.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import prisma from '../prismaConfig/prismaClient.js';

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
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          console.info('Cloudinary upload success');
          resolve(result);
        },
      );
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
      stream.end(buffer);
    });

    const user = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      console.warn('Пользователь не найден или удалён');
      return;
    }

    const secureUrl = result?.secure_url || null;
    if (secureUrl) {
      const update = await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: secureUrl },
      });
      if (!update) {
        console.warn('Аватар не обновлён: пользователь не найден или удалён');
      }
    } else {
      console.warn('Cloudinary вернул пустой secure_url');
    }
  } catch (err) {
    console.error('Failed to upload avatar in background:', err);
  }
}
