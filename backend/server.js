import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import payrollRoutes from './routes/payroll.js';
import payslipRoutes from './routes/payslips.js';
import deductionRoutes from './routes/deductions.js';
import messageRoutes from './routes/messages.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'erp_db',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => {
    console.log('PostgreSQL connected');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/deductions', deductionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
