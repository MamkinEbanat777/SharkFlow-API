import cors from 'cors';
import { allowedOrigins } from '../../config/allowedOrigins.js';
import { allowedMethods } from '../../config/allowedMethods.js';

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: allowedMethods,
  credentials: true,
};

export default cors(corsOptions);
