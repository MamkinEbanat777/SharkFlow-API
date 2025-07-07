import express from 'express';
import { Router } from 'express';
import { deleteOldGuests } from '../../utils/jobs/deleteOldGuests.js';
import { Receiver } from '@upstash/qstash';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
});

const router = Router();

router.post(
  '/api/cron/delete-old-guests',
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  async (req, res) => {
    const signature = req.headers['upstash-signature'];
    const body = req.rawBody;
    const url = 'https://sharkflow-api.onrender.com/api/cron/delete-old-guests';
    if (!receiver.verify({ body, signature, url })) {
      return res.status(403).send('Invalid signature');
    }
    try {
      console.info('Process...');
      await deleteOldGuests();
      console.info('Done!');
      return res.status(200).send('Old guests deleted');
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error deleting old guests');
    }
  },
);

export default {
  path: '/',
  router,
};
