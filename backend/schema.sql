-- Create database schema for ERP Payroll System

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  district VARCHAR(100),
  mobile VARCHAR(20),
  dob DATE,
  employee_id_text VARCHAR(50) UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  base_salary NUMERIC(15,2) NOT NULL,
  joining_date DATE,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deductions table
CREATE TABLE IF NOT EXISTS deductions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payrolls table
CREATE TABLE IF NOT EXISTS payrolls (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  base_salary NUMERIC(15,2) NOT NULL,
  house_allowance NUMERIC(15,2) DEFAULT 0,
  transport_allowance NUMERIC(15,2) DEFAULT 0,
  gross_salary NUMERIC(15,2) NOT NULL,
  tax NUMERIC(15,2) DEFAULT 0,
  pension NUMERIC(15,2) DEFAULT 0,
  medical_insurance NUMERIC(15,2) DEFAULT 0,
  others NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) NOT NULL,
  net_salary NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID')),
  generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payslips table
CREATE TABLE IF NOT EXISTS payslips (
  id SERIAL PRIMARY KEY,
  payroll_id INTEGER REFERENCES payrolls(id) ON DELETE CASCADE,
  employee_name VARCHAR(255) NOT NULL,
  employee_id_text VARCHAR(50),
  department VARCHAR(100),
  position VARCHAR(100),
  base_salary NUMERIC(15,2) NOT NULL,
  house_allowance NUMERIC(15,2) DEFAULT 0,
  transport_allowance NUMERIC(15,2) DEFAULT 0,
  gross_salary NUMERIC(15,2) NOT NULL,
  tax NUMERIC(15,2) DEFAULT 0,
  pension NUMERIC(15,2) DEFAULT 0,
  medical_insurance NUMERIC(15,2) DEFAULT 0,
  others NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) NOT NULL,
  net_salary NUMERIC(15,2) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'UNPAID' CHECK (payment_status IN ('UNPAID', 'PAID')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  month INTEGER,
  year INTEGER,
  amount NUMERIC(15,2),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default deductions
INSERT INTO deductions (name, percentage, description, is_active) VALUES 
('House Allowance', 15.0, 'House rent allowance', true),
('Transport Allowance', 10.0, 'Transportation allowance', true),
('Employee Tax', 20.0, 'Income tax deduction', true),
('Pension', 7.5, 'Pension contribution', true),
('Medical Insurance', 2.5, 'Health insurance', true),
('Others', 0.0, 'Other deductions', true)
ON CONFLICT DO NOTHING;

-- Insert demo employees
INSERT INTO employees (first_name, last_name, email, district, mobile, employee_id_text, department, position, base_salary, joining_date, status) VALUES
('Admin', 'User', 'employee@erp.gov.rw', 'Kigali', '0780000001', 'EMP001', 'IT', 'Software Engineer', 500000.00, '2024-01-01', 'ACTIVE')
ON CONFLICT DO NOTHING;

-- Insert demo users (password: password123)
INSERT INTO users (email, password, role, status, employee_id) VALUES
('admin@erp.gov.rw', '$2a$10$QUI.6i63fi7KVcPwMCgzZOQoyxLlppcldKvnnUASLhqTuqFJQCJYC', 'ADMIN', 'ACTIVE', NULL),
('manager@erp.gov.rw', '$2a$10$QUI.6i63fi7KVcPwMCgzZOQoyxLlppcldKvnnUASLhqTuqFJQCJYC', 'MANAGER', 'ACTIVE', NULL),
('employee@erp.gov.rw', '$2a$10$QUI.6i63fi7KVcPwMCgzZOQoyxLlppcldKvnnUASLhqTuqFJQCJYC', 'EMPLOYEE', 'ACTIVE', 1)
ON CONFLICT DO NOTHING;
