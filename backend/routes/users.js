import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.email, u.role, u.status, u.created_at, e.id as employee_id, e.first_name, e.last_name, e.employee_id_text FROM users u LEFT JOIN employees e ON u.employee_id = e.id ORDER BY u.created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { role, status } = req.body;
    const result = await pool.query(
      'UPDATE users SET role = $1, status = $2 WHERE id = $3 RETURNING *',
      [role, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
