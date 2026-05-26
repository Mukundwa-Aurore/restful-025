import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { employeeService } from '../services/employeeService';
import { payrollService } from '../services/payrollService';
import { deductionService } from '../services/deductionService';

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', district: '', mobile: '', dob: '',
    employee_id_text: '', department: '', position: '', base_salary: '', joining_date: '',
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, formData);
      } else {
        await employeeService.create(formData);
      }
      setShowForm(false);
      setEditingEmployee(null);
      setFormData({ first_name: '', last_name: '', email: '', district: '', mobile: '', dob: '', employee_id_text: '', department: '', position: '', base_salary: '', joining_date: '' });
      fetchEmployees();
    } catch (err) {
      console.error('Failed to save employee:', err);
      alert('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({ first_name: employee.first_name, last_name: employee.last_name, email: employee.email, district: employee.district, mobile: employee.mobile, dob: employee.dob, employee_id_text: employee.employee_id_text, department: employee.department, position: employee.position, base_salary: employee.base_salary, joining_date: employee.joining_date });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeService.delete(id);
        fetchEmployees();
      } catch (err) {
        console.error('Failed to delete employee:', err);
        alert('Failed to delete employee');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
        <button onClick={() => { setShowForm(true); setEditingEmployee(null); setFormData({ first_name: '', last_name: '', email: '', district: '', mobile: '', dob: '', employee_id_text: '', department: '', position: '', base_salary: '', joining_date: '' }); }} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Add Employee</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name</label><input type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label><input type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label><input type="text" required value={formData.employee_id_text} onChange={(e) => setFormData({ ...formData, employee_id_text: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">District</label><input type="text" required value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label><input type="text" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label><input type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><select required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="">Select Department</option><option value="Finance">Finance</option><option value="Human Resources">Human Resources</option><option value="IT">IT</option><option value="Operations">Operations</option><option value="Administration">Administration</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Position</label><input type="text" required value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (FRW)</label><input type="number" required value={formData.base_salary} onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label><input type="date" required value={formData.joining_date} onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{editingEmployee ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</div><div className="text-sm text-gray-500">{employee.employee_id_text}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{Number(employee.base_salary).toLocaleString()} FRW</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{employee.status}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button onClick={() => handleEdit(employee)} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200">Edit</button>
                    <button onClick={() => handleDelete(employee.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PayrollGeneration() {
  const [employees, setEmployees] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empData, dedData] = await Promise.all([employeeService.getAll(), deductionService.getAll()]);
      setEmployees(empData);
      setDeductions(dedData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const calculatePreview = () => {
    const employee = employees.find(e => e.id === selectedEmployee);
    if (!employee) return;

    const baseSalary = Number(employee.base_salary);
    const deductionsMap = {};
    deductions.forEach(d => { deductionsMap[d.name] = d.percentage; });

    const houseAllowance = baseSalary * (deductionsMap['House Allowance'] / 100);
    const transportAllowance = baseSalary * (deductionsMap['Transport Allowance'] / 100);
    const grossSalary = baseSalary + houseAllowance + transportAllowance;

    const tax = baseSalary * (deductionsMap['Employee Tax'] / 100);
    const pension = baseSalary * (deductionsMap['Pension'] / 100);
    const medicalInsurance = baseSalary * (deductionsMap['Medical Insurance'] / 100);
    const others = baseSalary * (deductionsMap['Others'] / 100);
    const totalDeductions = tax + pension + medicalInsurance + others;
    const netSalary = baseSalary - totalDeductions;

    setPreview({ employee: `${employee.first_name} ${employee.last_name}`, baseSalary, houseAllowance, transportAllowance, grossSalary, tax, pension, medicalInsurance, others, totalDeductions, netSalary });
  };

  const handleGenerateSingle = async () => {
    if (!selectedEmployee) { alert('Please select an employee'); return; }
    try {
      await payrollService.generate({ employee_id: selectedEmployee, month, year });
      alert('Payroll generated successfully');
      setSelectedEmployee('');
      setPreview(null);
    } catch (err) {
      console.error('Failed to generate payroll:', err);
      alert(err.response?.data?.error || 'Failed to generate payroll');
    }
  };

  const handleGenerateBulk = async () => {
    try {
      const result = await payrollService.generateBulk({ month, year });
      alert(`Bulk payroll generated: ${result.results.filter(r => r.status === 'created').length} created`);
    } catch (err) {
      console.error('Failed to generate bulk payroll:', err);
      alert('Failed to generate bulk payroll');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payroll Generation</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Payroll</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <div className="flex space-x-3">
                <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">{monthNames.map((m, i) => (<option key={i} value={i + 1}>{m}</option>))}</select>
                <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">{[2024, 2025, 2026, 2027].map(y => (<option key={y} value={y}>{y}</option>))}</select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <select value={selectedEmployee} onChange={(e) => { setSelectedEmployee(e.target.value); setPreview(null); }} onBlur={calculatePreview} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                <option value="">Select Employee</option>
                {employees.map(emp => (<option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_id_text})</option>))}
              </select>
            </div>
            <button onClick={handleGenerateSingle} disabled={!selectedEmployee} className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">Generate Single Payroll</button>
            <div className="border-t border-gray-200 pt-4">
              <button onClick={handleGenerateBulk} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Generate for All Active Employees</button>
              <p className="text-xs text-gray-500 mt-1">Creates payroll for all active employees in the selected period</p>
            </div>
          </div>
        </div>

        {preview && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Preview - {preview.employee}</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Base Salary</span><span className="font-medium">{preview.baseSalary.toLocaleString()} FRW</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">House Allowance (14%)</span><span className="font-medium text-green-600">+{preview.houseAllowance.toLocaleString()} FRW</span></div>
              <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Transport Allowance (14%)</span><span className="font-medium text-green-600">+{preview.transportAllowance.toLocaleString()} FRW</span></div>
              <div className="flex justify-between py-2 border-b border-gray-200"><span className="font-semibold text-gray-900">Gross Salary</span><span className="font-bold text-gray-900">{preview.grossSalary.toLocaleString()} FRW</span></div>
              <div className="pt-3"><h4 className="text-sm font-medium text-gray-700 mb-2">Deductions:</h4>
                <div className="flex justify-between py-1"><span className="text-red-600">Employee Tax (30%)</span><span className="text-red-600">-{preview.tax.toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-1"><span className="text-red-600">Pension (6%)</span><span className="text-red-600">-{preview.pension.toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-1"><span className="text-red-600">Medical Insurance (5%)</span><span className="text-red-600">-{preview.medicalInsurance.toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-1"><span className="text-red-600">Others (5%)</span><span className="text-red-600">-{preview.others.toLocaleString()} FRW</span></div>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200"><span className="font-semibold text-gray-900">Total Deductions</span><span className="font-medium text-red-600">-{preview.totalDeductions.toLocaleString()} FRW</span></div>
              <div className="flex justify-between py-3 bg-primary-50 rounded-lg px-3"><span className="font-bold text-primary-800">Net Salary</span><span className="font-bold text-primary-800">{preview.netSalary.toLocaleString()} FRW</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeductionView() {
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDeductions(); }, []);

  const fetchDeductions = async () => {
    setLoading(true);
    try {
      const data = await deductionService.getAll();
      setDeductions(data);
    } catch (err) {
      console.error('Failed to fetch deductions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Deduction Rates</h2>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deductions.map((deduction) => (
            <div key={deduction.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">{deduction.percentage}%</div>
              <h3 className="font-semibold text-gray-900">{deduction.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{deduction.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<EmployeeManagement />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/payroll" element={<PayrollGeneration />} />
        <Route path="/deductions" element={<DeductionView />} />
      </Routes>
    </div>
  );
}
