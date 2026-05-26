import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payslipService } from '../services/payslipService';
import { messageService } from '../services/messageService';

function MyProfile() {
  const { user } = useAuth();
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">{user?.employee?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-4 mb-2">
              <h3 className="text-xl font-bold text-gray-900">{user?.employee?.first_name} {user?.employee?.last_name}</h3>
              <p className="text-gray-500">{user?.employee?.position || 'Employee'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Personal Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Employee ID</span><span className="font-medium">{user?.employee?.employee_id_text || '-'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Email</span><span className="font-medium">{user?.email}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Mobile</span><span className="font-medium">{user?.employee?.mobile || '-'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">District</span><span className="font-medium">{user?.employee?.district || '-'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Date of Birth</span><span className="font-medium">{user?.employee?.dob || '-'}</span></div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Employment Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Department</span><span className="font-medium">{user?.employee?.department || '-'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Position</span><span className="font-medium">{user?.employee?.position || '-'}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Base Salary</span><span className="font-medium text-green-600">{user?.employee?.base_salary ? Number(user.employee.base_salary).toLocaleString() : 0} FRW</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Joining Date</span><span className="font-medium">{user?.employee?.joining_date || '-'}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-600">Status</span><span className={`px-2 py-1 text-xs font-medium rounded-full ${user?.employee?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user?.employee?.status || 'ACTIVE'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyPayslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => { fetchPayslips(); }, []);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const data = await payslipService.getMy();
      setPayslips(data);
    } catch (err) {
      console.error('Failed to fetch payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const downloadPDF = (payslip) => {
    const content = `
========================================
         RUTHERM PAYSLIP
========================================

Employee: ${payslip.employee_name}
ID: ${payslip.employee_id_text}
Department: ${payslip.department}
Position: ${payslip.position}

----------------------------------------
Pay Period: ${monthNames[payslip.month - 1]} ${payslip.year}
----------------------------------------

EARNINGS:
  Base Salary:        ${Number(payslip.base_salary).toLocaleString()} FRW
  House Allowance:    +${Number(payslip.house_allowance).toLocaleString()} FRW
  Transport Allowance: +${Number(payslip.transport_allowance).toLocaleString()} FRW
  ------------------------------------
  Gross Salary:       ${Number(payslip.gross_salary).toLocaleString()} FRW

DEDUCTIONS:
  Employee Tax (30%): -${Number(payslip.tax).toLocaleString()} FRW
  Pension (6%):       -${Number(payslip.pension).toLocaleString()} FRW
  Medical Insurance:  -${Number(payslip.medical_insurance).toLocaleString()} FRW
  Others (5%):        -${Number(payslip.others).toLocaleString()} FRW
  ------------------------------------
  Total Deductions:   ${Number(payslip.total_deductions).toLocaleString()} FRW

========================================
NET SALARY:           ${Number(payslip.net_salary).toLocaleString()} FRW
========================================

Payment Status: ${payslip.payment_status}

========================================
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payslip_${payslip.month}_${payslip.year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Payslips</h2>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
      ) : payslips.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200"><p className="text-gray-500">No payslips available yet</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payslips.map((payslip) => (
            <div key={payslip.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-4 py-3 text-white">
                <div className="text-sm opacity-90">{payslip.year}</div>
                <div className="text-lg font-semibold">{monthNames[payslip.month - 1]}</div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Net Salary</div>
                    <div className="text-xl font-bold text-green-600">{Number(payslip.net_salary).toLocaleString()} FRW</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${payslip.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{payslip.payment_status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <div>Gross: {Number(payslip.gross_salary).toLocaleString()} FRW</div>
                  <div className="text-red-500">Deductions: -{Number(payslip.total_deductions).toLocaleString()} FRW</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setSelectedPayslip(payslip)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button>
                  <button onClick={() => downloadPDF(payslip)} className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm">Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Payslip - {monthNames[selectedPayslip.month - 1]} {selectedPayslip.year}</h3>
              <button onClick={() => setSelectedPayslip(null)} className="text-gray-400 hover:text-gray-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Base Salary</span><span className="font-medium">{Number(selectedPayslip.base_salary).toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">House Allowance</span><span className="font-medium text-green-600">+{Number(selectedPayslip.house_allowance).toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Transport Allowance</span><span className="font-medium text-green-600">+{Number(selectedPayslip.transport_allowance).toLocaleString()} FRW</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200"><span className="font-semibold text-gray-900">Gross Salary</span><span className="font-bold text-gray-900">{Number(selectedPayslip.gross_salary).toLocaleString()} FRW</span></div>
                <div className="pt-2 text-red-600">
                  <div className="flex justify-between py-1"><span>Employee Tax</span><span>-{Number(selectedPayslip.tax).toLocaleString()} FRW</span></div>
                  <div className="flex justify-between py-1"><span>Pension</span><span>-{Number(selectedPayslip.pension).toLocaleString()} FRW</span></div>
                  <div className="flex justify-between py-1"><span>Medical Insurance</span><span>-{Number(selectedPayslip.medical_insurance).toLocaleString()} FRW</span></div>
                  <div className="flex justify-between py-1"><span>Others</span><span>-{Number(selectedPayslip.others).toLocaleString()} FRW</span></div>
                </div>
                <div className="flex justify-between py-3 bg-primary-50 rounded-lg px-3 -mx-1"><span className="font-bold text-primary-800">Net Salary</span><span className="font-bold text-primary-800">{Number(selectedPayslip.net_salary).toLocaleString()} FRW</span></div>
              </div>
            </div>
            <button onClick={() => setSelectedPayslip(null)} className="w-full mt-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MyMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await messageService.getMy();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await messageService.markAsRead(id);
      fetchMessages();
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Messages</h2>
      {loading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div></div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200"><p className="text-gray-500">No messages yet</p></div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`bg-white rounded-lg border ${message.is_read ? 'border-gray-200' : 'border-primary-300 ring-2 ring-primary-100'} overflow-hidden`}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {!message.is_read && <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">New</span>}
                    <span className="text-sm text-gray-500">{new Date(message.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{Number(message.amount).toLocaleString()} FRW</span>
                </div>
                <div className="whitespace-pre-line text-gray-700 mb-2">{message.message}</div>
                {!message.is_read && <button onClick={() => markAsRead(message.id)} className="text-sm text-primary-600 hover:text-primary-700">Mark as read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeDashboard() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MyProfile />} />
        <Route path="/profile" element={<MyProfile />} />
        <Route path="/payslips" element={<MyPayslips />} />
        <Route path="/messages" element={<MyMessages />} />
      </Routes>
    </div>
  );
}
