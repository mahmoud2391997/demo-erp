import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Employee } from '../types';
import { Plus, Search, UserPlus, Mail, Briefcase, Calendar, DollarSign } from 'lucide-react';

export default function HRModule() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    role: '',
    salary: 0,
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const q = query(collection(db, 'employees'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'employees'), newEmployee);
      setShowAddModal(false);
      setNewEmployee({
        name: '',
        email: '',
        role: '',
        salary: 0,
        joiningDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Human Resources</h2>
          <p className="text-slate-500">Manage your workforce and payroll.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
        >
          <UserPlus size={20} />
          Add Employee
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Employees</div>
          <div className="text-3xl font-bold text-slate-900">{employees.length}</div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Monthly Payroll</div>
          <div className="text-3xl font-bold text-slate-900">
            ${employees.reduce((acc, emp) => acc + (emp.salary || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Average Tenure</div>
          <div className="text-3xl font-bold text-slate-900">2.4 yrs</div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search employees by name, role, or email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Salary</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Loading employees...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No employees found.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{emp.name}</span>
                          <span className="text-xs text-slate-500">{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{emp.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-600">${emp.salary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">{emp.joiningDate}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View Profile</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Add New Employee</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="John Doe"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="john@example.com"
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Engineer"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salary</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="number"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="5000"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Joining Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="date"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                >
                  Create Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const X = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);
