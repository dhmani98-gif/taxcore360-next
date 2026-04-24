'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Plus, Search, Filter, Users, User, MapPin, Briefcase, DollarSign, Calendar, ChevronDown } from 'lucide-react';
import { StatsCardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { withCache } from '@/lib/cache';

const AddEmployeeModal = dynamic(() => import('@/components/employees/AddEmployeeModal'), {
  loading: () => null
});

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  ssn: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  department: string;
  jobTitle: string;
  grossPay: number;
  hireDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Fetch employees with caching
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await withCache('employees', async () => {
          const res = await fetch('/api/employees');
          if (!res.ok) throw new Error('Failed to fetch employees');
          return res.json();
        }, 60000); // Cache for 1 minute
        
        setEmployees(data.employees || []);
      } catch (error) {
        console.error('Error fetching employees:', error);
        // Fallback to mock data for now
        const mockEmployees: Employee[] = [
          {
            id: '1',
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            ssn: 'XXX-XX-1234',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            department: 'Engineering',
            jobTitle: 'Senior Developer',
            grossPay: 85000,
            hireDate: '2022-01-15',
            status: 'ACTIVE'
          },
          {
            id: '2',
            employeeId: 'EMP002',
            firstName: 'Jane',
            lastName: 'Smith',
            fullName: 'Jane Smith',
            ssn: 'XXX-XX-5678',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            department: 'Sales',
            jobTitle: 'Sales Manager',
            grossPay: 75000,
            hireDate: '2021-06-20',
            status: 'ACTIVE'
          },
          {
            id: '3',
            employeeId: 'EMP003',
            firstName: 'Mike',
            lastName: 'Johnson',
            fullName: 'Mike Johnson',
            ssn: 'XXX-XX-9012',
            address: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            department: 'Marketing',
            jobTitle: 'Marketing Director',
            grossPay: 90000,
            hireDate: '2020-09-10',
            status: 'ACTIVE'
          },
          {
            id: '4',
            employeeId: 'EMP004',
            firstName: 'Sarah',
            lastName: 'Williams',
            fullName: 'Sarah Williams',
            ssn: 'XXX-XX-3456',
            address: '321 Elm St',
            city: 'Houston',
            state: 'TX',
            zipCode: '77001',
            department: 'Finance',
            jobTitle: 'Financial Analyst',
            grossPay: 70000,
            hireDate: '2022-03-25',
            status: 'ACTIVE'
          },
          {
            id: '5',
            employeeId: 'EMP005',
            firstName: 'David',
            lastName: 'Brown',
            fullName: 'David Brown',
            ssn: 'XXX-XX-7890',
            address: '654 Maple Ave',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
            department: 'Operations',
            jobTitle: 'Operations Manager',
            grossPay: 80000,
            hireDate: '2021-12-01',
            status: 'ACTIVE'
          }
        ];
        setEmployees(mockEmployees);
        setFilteredEmployees(mockEmployees);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((emp: Employee) => 
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((emp: Employee) => emp.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter((emp: Employee) => emp.department === departmentFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, statusFilter, departmentFilter]);

  const departments = ['ALL', ...Array.from(new Set(employees.map(emp => emp.department)))];

  const handleStatusChange = (employeeId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, status: newStatus } : emp
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'ACTIVE' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
        Inactive
      </span>
    );
  };

  return (
    <DashboardLayout 
      title="Employees"
      description="Manage your workforce and payroll information"
    >
      {/* Header with Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-64"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field px-3 py-2 w-40"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-field px-3 py-2 w-40"
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-slate-500 text-sm font-medium">
            {filteredEmployees.length} records
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Gross Pay</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="font-mono">{employee.employeeId}</td>
                  <td className="font-medium">{employee.fullName}</td>
                  <td>
                    <span className="badge badge-info">
                      {employee.department}
                    </span>
                  </td>
                  <td>{employee.jobTitle}</td>
                  <td className="font-mono text-right">{formatCurrency(employee.grossPay)}</td>
                  <td>{formatDate(employee.hireDate)}</td>
                  <td>
                    <select
                      value={employee.status}
                      onChange={(e) => handleStatusChange(employee.id, e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className={`badge cursor-pointer ${
                        employee.status === 'ACTIVE' 
                          ? 'badge-success' 
                          : 'badge-error'
                      }`}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn-secondary mr-2 text-xs">Edit</button>
                    <button className="btn-secondary text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSave={(newEmployee: any) => {
            setEmployees(prev => [...prev, { ...newEmployee, id: Date.now().toString() }]);
            setShowAddModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}
