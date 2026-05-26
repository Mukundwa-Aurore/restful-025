import express from 'express';
import { pool } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM deductions WHERE is_active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch deductions error:', error);
    res.status(500).json({ error: 'Failed to fetch deductions' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { percentage, description, is_active } = req.body;
    const result = await pool.query(
      'UPDATE deductions SET percentage = $1, description = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [percentage, description, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deduction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update deduction error:', error);
    res.status(500).json({ error: 'Failed to update deduction' });
  }
});

export default router;
