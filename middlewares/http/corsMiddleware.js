import cors from 'cors';
import { allowedHeaders } from '#config/allowedHeaders.js';
import { allowedMethods } from '#config/allowedMethods.js';
import { allowedOrigins } from '#config/allowedOrigins.js';
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin  || origin === 'null' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: allowedMethods,
  credentials: true,
  allowedHeaders: allowedHeaders,
};

export default cors(corsOptions);
