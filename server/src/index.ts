import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import questionRoutes from './routes/questionRoutes';
import attemptRoutes from './routes/attemptRoutes';
import stripeRoutes from './routes/stripeRoutes';

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Webhook needs raw body
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Medical Question Bank API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
