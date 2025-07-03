import '../../config/cloudinaryConfig.js';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import prisma from '../prismaConfig/prismaClient.js';

export async function uploadAvatarAndUpdateUser(userId, avatarUrl, publicId) {
  try {
    const imageResp = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    console.info('Image data length:', imageResp.data.length);

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

    const secureUrl = result?.secure_url || null;
    if (secureUrl) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: secureUrl },
      });
    }
  } catch (err) {
    console.error('Failed to upload avatar in background:', err);
  }
}
