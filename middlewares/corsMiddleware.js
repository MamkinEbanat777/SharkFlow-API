import cors from 'cors';

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://taskflow-blyt.onrender.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

export default cors(corsOptions);
