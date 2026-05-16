import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './config/database';
import authRoutes from './routes/auth.routes';
import borrowerRoutes from './routes/borrower.routes';
import loanRoutes from './routes/loan.routes';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/borrower', borrowerRoutes);
app.use('/api/loans', loanRoutes);

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LMS API' })
);

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LMS Backend → http://localhost:${PORT}`);
  console.log(`📋 Health check → http://localhost:${PORT}/health\n`);
});

export default app;
