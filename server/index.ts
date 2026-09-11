import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import assessmentRoutes from './routes/assessments.js';
import interviewRoutes from './routes/interviews.js';
import discoveryRoutes from './routes/discovery.js';
import jobRoutes from './routes/jobs.js';
import referralRoutes from './routes/referrals.js';
import feedRoutes from './routes/feed.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Hire Me Out API', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Hire Me Out API Server running on port ${PORT}`);
});
