import express from 'express';
import { pool } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', authenticate, async (req, res) => {
  try {
    if (!req.user.employee_id) {
      return res.status(400).json({ error: 'No employee record associated' });
    }

    const result = await pool.query(
      'SELECT * FROM messages WHERE employee_id = $1 ORDER BY created_at DESC',
      [req.user.employee_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT m.*, e.first_name, e.last_name FROM messages m LEFT JOIN employees e ON m.employee_id = e.id ORDER BY m.created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE messages SET is_read = true WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM messages WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
