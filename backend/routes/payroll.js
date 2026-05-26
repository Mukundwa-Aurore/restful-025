import express from 'express';
import { pool } from '../server.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { month, year, status } = req.query;
    let query = 'SELECT p.*, e.* FROM payrolls p JOIN employees e ON p.employee_id = e.id';
    const params = [];
    let paramIndex = 1;

    if (month || year || status) {
      query += ' WHERE';
      const conditions = [];
      if (month) {
        conditions.push(` p.month = $${paramIndex++}`);
        params.push(parseInt(month));
      }
      if (year) {
        conditions.push(` p.year = $${paramIndex++}`);
        params.push(parseInt(year));
      }
      if (status) {
        conditions.push(` p.status = $${paramIndex++}`);
        params.push(status);
      }
      query += conditions.join(' AND');
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Fetch payroll error:', error);
    res.status(500).json({ error: 'Failed to fetch payroll' });
  }
});

router.post('/generate', authenticate, authorize('MANAGER'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { employee_id, month, year } = req.body;

    const existingResult = await client.query(
      'SELECT * FROM payrolls WHERE employee_id = $1 AND month = $2 AND year = $3',
      [employee_id, month, year]
    );

    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Payroll already exists for this month' });
    }

    const empResult = await client.query(
      'SELECT * FROM employees WHERE id = $1',
      [employee_id]
    );

    if (empResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employee = empResult.rows[0];

    const deductionsResult = await client.query(
      'SELECT * FROM deductions WHERE is_active = true'
    );
    const deductions = deductionsResult.rows;

    const deductionsMap = {};
    deductions.forEach(d => {
      deductionsMap[d.name] = d.percentage;
    });

    const baseSalary = employee.base_salary;
    const houseAllowance = baseSalary * ((deductionsMap['House Allowance'] || 0) / 100);
    const transportAllowance = baseSalary * ((deductionsMap['Transport Allowance'] || 0) / 100);
    const grossSalary = baseSalary + houseAllowance + transportAllowance;

    const tax = baseSalary * ((deductionsMap['Employee Tax'] || 0) / 100);
    const pension = baseSalary * ((deductionsMap['Pension'] || 0) / 100);
    const medicalInsurance = baseSalary * ((deductionsMap['Medical Insurance'] || 0) / 100);
    const others = baseSalary * ((deductionsMap['Others'] || 0) / 100);
    const totalDeductions = tax + pension + medicalInsurance + others;
    const netSalary = baseSalary - totalDeductions;

    const payrollResult = await client.query(
      'INSERT INTO payrolls (employee_id, month, year, base_salary, house_allowance, transport_allowance, gross_salary, tax, pension, medical_insurance, others, total_deductions, net_salary, status, generated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
      [employee_id, month, year, baseSalary, houseAllowance, transportAllowance, grossSalary, tax, pension, medicalInsurance, others, totalDeductions, netSalary, 'PENDING', req.user.id]
    );

    const payroll = payrollResult.rows[0];

    await client.query(
      'INSERT INTO payslips (payroll_id, employee_name, employee_id_text, department, position, base_salary, house_allowance, transport_allowance, gross_salary, tax, pension, medical_insurance, others, total_deductions, net_salary, month, year, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
      [payroll.id, `${employee.first_name} ${employee.last_name}`, employee.employee_id_text, employee.department, employee.position, baseSalary, houseAllowance, transportAllowance, grossSalary, tax, pension, medicalInsurance, others, totalDeductions, netSalary, month, year, 'UNPAID']
    );

    await client.query('COMMIT');
    res.status(201).json(payroll);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Generate payroll error:', error);
    res.status(500).json({ error: 'Failed to generate payroll' });
  } finally {
    client.release();
  }
});

router.post('/generate-bulk', authenticate, authorize('MANAGER'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { month, year } = req.body;

    const employeesResult = await client.query(
      'SELECT * FROM employees WHERE status = $1',
      ['ACTIVE']
    );
    const employees = employeesResult.rows;

    const deductionsResult = await client.query(
      'SELECT * FROM deductions WHERE is_active = true'
    );
    const deductions = deductionsResult.rows;

    const deductionsMap = {};
    deductions.forEach(d => {
      deductionsMap[d.name] = d.percentage;
    });

    const results = [];
    for (const employee of employees) {
      const existingResult = await client.query(
        'SELECT * FROM payrolls WHERE employee_id = $1 AND month = $2 AND year = $3',
        [employee.id, month, year]
      );

      if (existingResult.rows.length === 0) {
        const baseSalary = employee.base_salary;
        const houseAllowance = baseSalary * ((deductionsMap['House Allowance'] || 0) / 100);
        const transportAllowance = baseSalary * ((deductionsMap['Transport Allowance'] || 0) / 100);
        const grossSalary = baseSalary + houseAllowance + transportAllowance;

        const tax = baseSalary * ((deductionsMap['Employee Tax'] || 0) / 100);
        const pension = baseSalary * ((deductionsMap['Pension'] || 0) / 100);
        const medicalInsurance = baseSalary * ((deductionsMap['Medical Insurance'] || 0) / 100);
        const others = baseSalary * ((deductionsMap['Others'] || 0) / 100);
        const totalDeductions = tax + pension + medicalInsurance + others;
        const netSalary = baseSalary - totalDeductions;

        const payrollResult = await client.query(
          'INSERT INTO payrolls (employee_id, month, year, base_salary, house_allowance, transport_allowance, gross_salary, tax, pension, medical_insurance, others, total_deductions, net_salary, status, generated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *',
          [employee.id, month, year, baseSalary, houseAllowance, transportAllowance, grossSalary, tax, pension, medicalInsurance, others, totalDeductions, netSalary, 'PENDING', req.user.id]
        );

        if (payrollResult.rows.length > 0) {
          const payroll = payrollResult.rows[0];
          await client.query(
            'INSERT INTO payslips (payroll_id, employee_name, employee_id_text, department, position, base_salary, house_allowance, transport_allowance, gross_salary, tax, pension, medical_insurance, others, total_deductions, net_salary, month, year, payment_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
            [payroll.id, `${employee.first_name} ${employee.last_name}`, employee.employee_id_text, employee.department, employee.position, baseSalary, houseAllowance, transportAllowance, grossSalary, tax, pension, medicalInsurance, others, totalDeductions, netSalary, month, year, 'UNPAID']
          );
          results.push({ employee_id: employee.id, status: 'created' });
        }
      } else {
        results.push({ employee_id: employee.id, status: 'already_exists' });
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Bulk payroll generation complete', results });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Bulk payroll error:', error);
    res.status(500).json({ error: 'Failed to generate bulk payroll' });
  } finally {
    client.release();
  }
});

router.put('/approve/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const payrollResult = await client.query(
      'SELECT p.*, e.* FROM payrolls p JOIN employees e ON p.employee_id = e.id WHERE p.id = $1',
      [req.params.id]
    );

    if (payrollResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payroll not found' });
    }

    const payroll = payrollResult.rows[0];

    const updatedPayrollResult = await client.query(
      'UPDATE payrolls SET status = $1, approved_by = $2 WHERE id = $3 RETURNING *',
      ['PAID', req.user.id, req.params.id]
    );

    await client.query(
      'UPDATE payslips SET payment_status = $1 WHERE payroll_id = $2',
      ['PAID', req.params.id]
    );

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const message = `Dear ${payroll.first_name},

Your salary of ${monthNames[payroll.month - 1]}/${payroll.year} from RCA amounting to ${Number(payroll.net_salary).toLocaleString()} FRW
has been credited successfully to your account.

Thank you.`;

    await client.query(
      'INSERT INTO messages (employee_id, message, month, year, amount) VALUES ($1, $2, $3, $4, $5)',
      [payroll.employee_id, message, payroll.month, payroll.year, payroll.net_salary]
    );

    await client.query('COMMIT');
    res.json(updatedPayrollResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve payroll error:', error);
    res.status(500).json({ error: 'Failed to approve payroll' });
  } finally {
    client.release();
  }
});

export default router;
