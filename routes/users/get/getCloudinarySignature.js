import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import '../../../config/cloudinaryConfig.js';

const router = Router();

router.get(
  '/api/cloudinary-signature',
  authenticateMiddleware,
  async (req, res) => {
    const { api_key, api_secret } = cloudinary.config();

    if (!api_key || !api_secret) {
      return res.status(500).json({ error: 'Конфигурация отсутствует' });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const upload_preset = 'Precet-SharkFlow';
    const paramsToSign = {
      timestamp,
      upload_preset,
    };

    const toSign = Object.keys(paramsToSign)
      .sort()
      .map((key) => `${key}=${paramsToSign[key]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(toSign + api_secret)
      .digest('hex');

    res.json({
      api_key,
      timestamp,
      signature,
    });
  },
);

export default {
  path: '/',
  router,
};
