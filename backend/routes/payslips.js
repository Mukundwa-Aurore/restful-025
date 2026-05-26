import express from 'express';
import { pool } from '../server.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, async (req, res) => {
  try {
    if (!req.user.employee_id) {
      return res.status(400).json({ error: 'No employee record associated' });
    }

    const payrollResult = await pool.query(
      'SELECT id FROM payrolls WHERE employee_id = $1',
      [req.user.employee_id]
    );

    const payrollIds = payrollResult.rows.map(p => p.id);

    if (payrollIds.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      'SELECT * FROM payslips WHERE payroll_id = ANY($1) ORDER BY created_at DESC',
      [payrollIds]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch payslips error:', error);
    res.status(500).json({ error: 'Failed to fetch payslips' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payslips WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payslip not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch payslip error:', error);
    res.status(500).json({ error: 'Failed to fetch payslip' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = 'SELECT * FROM payslips';
    const params = [];
    let paramIndex = 1;

    if (month || year) {
      query += ' WHERE';
      const conditions = [];
      if (month) {
        conditions.push(` month = $${paramIndex++}`);
        params.push(parseInt(month));
      }
      if (year) {
        conditions.push(` year = $${paramIndex++}`);
        params.push(parseInt(year));
      }
      query += conditions.join(' AND');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch payslips error:', error);
    res.status(500).json({ error: 'Failed to fetch payslips' });
  }
});

export default router;
