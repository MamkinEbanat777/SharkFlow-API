import { Router } from 'express';
import { authenticateMiddleware } from '../../../middlewares/http/authenticateMiddleware.js';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const router = Router();

router.get('/api/cloudinary-signature', authenticateMiddleware, async (req, res) => {
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
    .update(toSign + cloudinary.config().api_secret)
    .digest('hex');

  res.json({
    api_key: cloudinary.config().api_key,
    timestamp,
    signature,
  });
});

export default {
  path: '/',
  router,
};
