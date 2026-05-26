import express from 'express';
import { pool } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM employees WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Fetch employee error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

router.post('/', authenticate, authorize('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const {
      first_name, last_name, email, district, mobile, dob,
      employee_id_text, department, position, base_salary, joining_date
    } = req.body;

    const result = await pool.query(
      'INSERT INTO employees (first_name, last_name, email, district, mobile, dob, employee_id_text, department, position, base_salary, joining_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [first_name, last_name, email, district, mobile, dob, employee_id_text, department, position, base_salary, joining_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

router.put('/:id', authenticate, authorize('MANAGER', 'ADMIN'), async (req, res) => {
  try {
    const fields = Object.keys(req.body);
    const values = Object.values(req.body);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

    const result = await pool.query(
      `UPDATE employees SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM employees WHERE id = $1',
      [req.params.id]
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default router;
