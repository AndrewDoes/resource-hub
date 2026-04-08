'use client';
import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Download,
  Calendar,
  Briefcase,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useFeedbackToast } from '../../../context/ToastContext';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  skills: string[];
  status: 'active' | 'inactive' | 'resigned';
  availability: number;
  workload: number;
  currentProjects: string[];
  projectHistory: string[];
  joinedDate: string;
}

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    role: 'Senior Developer',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: 'Engineering',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    status: 'active',
    availability: 100,
    workload: 0,
    currentProjects: [],
    projectHistory: ['Customer Portal v2', 'API Integration'],
    joinedDate: '2024-01-15',
  },
  {
    id: '2',
    name: 'David Lee',
    avatar: 'DL',
    role: 'Frontend Developer',
    email: 'david.lee@company.com',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'CSS', 'Figma'],
    status: 'active',
    availability: 30,
    workload: 70,
    currentProjects: ['Website Redesign', 'Mobile App'],
    projectHistory: ['Dashboard Redesign'],
    joinedDate: '2023-06-20',
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'EC',
    role: 'Product Manager',
    email: 'emily.chen@company.com',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    department: 'Product',
    skills: ['Product Management', 'Agile', 'Scrum', 'Analytics'],
    status: 'active',
    availability: 80,
    workload: 20,
    currentProjects: ['Q2 Marketing Campaign'],
    projectHistory: ['Product Launch Q1'],
    joinedDate: '2023-03-10',
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatar: 'MB',
    role: 'Backend Developer',
    email: 'michael.brown@company.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    department: 'Engineering',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
    status: 'active',
    availability: 0,
    workload: 110,
    currentProjects: ['Mobile App', 'Database Migration', 'API Gateway'],
    projectHistory: ['Legacy System Upgrade'],
    joinedDate: '2022-11-05',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    avatar: 'LA',
    role: 'UI/UX Designer',
    email: 'lisa.anderson@company.com',
    phone: '+1 (555) 567-8901',
    location: 'Denver, CO',
    department: 'Design',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    status: 'inactive',
    availability: 0,
    workload: 0,
    currentProjects: [],
    projectHistory: ['Brand Refresh', 'Mobile App UI'],
    joinedDate: '2023-08-12',
  },
];

type TabType = 'all' | 'active' | 'available' | 'assigned' | 'overloaded';

export function UnifiedEmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const { addToast } = useFeedbackToast();

  // Filter employees based on active tab
  const getFilteredEmployees = () => {
    let filtered = employees;

    // Tab filtering
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((e) => e.status === 'active');
        break;
      case 'available':
        filtered = filtered.filter((e) => e.availability >= 50 && e.status === 'active');
        break;
      case 'assigned':
        filtered = filtered.filter(
          (e) => e.currentProjects.length > 0 && e.status === 'active'
        );
        break;
      case 'overloaded':
        filtered = filtered.filter((e) => e.workload > 100 && e.status === 'active');
        break;
    }

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.role.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query) ||
          e.skills.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Department filtering
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((e) => e.department === departmentFilter);
    }

    // Skill filtering
    if (skillFilter) {
      filtered = filtered.filter((e) =>
        e.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredEmployees = getFilteredEmployees();

  // Get department list
  const departments = Array.from(new Set(employees.map((e) => e.department)));

  // Calculate stats
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    available: employees.filter((e) => e.availability >= 50 && e.status === 'active').length,
    assigned: employees.filter((e) => e.currentProjects.length > 0).length,
    overloaded: employees.filter((e) => e.workload > 100).length,
  };

  const getAvailabilityStatus = (availability: number, workload: number) => {
    if (workload > 100) return { label: 'Overloaded', color: 'red' };
    if (availability >= 80) return { label: 'Available', color: 'green' };
    if (availability >= 50) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Busy', color: 'orange' };
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;

    // Check if employee has active projects
    if (employeeToDelete.currentProjects.length > 0) {
      addToast({
        type: 'error',
        title: 'Cannot Delete Employee',
        message: `${employeeToDelete.name} is assigned to ${employeeToDelete.currentProjects.length} active project(s). Reassign projects first.`,
      });
      setIsDeleteModalOpen(false);
      return;
    }

    setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
    addToast({
      type: 'success',
      title: 'Employee Removed',
      message: `${employeeToDelete.name} has been removed from the system.`,
    });
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-450 mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized system for managing employees, skills, and resource allocation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Employees</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active</h3>
            <UserCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
        </div>

        <div className="rounded-xl p-5 border border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Available</h3>
            <UserCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-900">{stats.available}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Assigned</h3>
            <Briefcase className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.assigned}</p>
        </div>

        <div
          className={`rounded-xl p-5 border shadow-sm ${stats.overloaded > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-white border-gray-200'
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`text-sm font-medium ${stats.overloaded > 0 ? 'text-red-700' : 'text-gray-600'
                }`}
            >
              Overloaded
            </h3>
            <AlertTriangle
              className={`w-5 h-5 ${stats.overloaded > 0 ? 'text-red-600' : 'text-gray-400'
                }`}
            />
          </div>
          <p
            className={`text-2xl font-semibold ${stats.overloaded > 0 ? 'text-red-900' : 'text-gray-900'
              }`}
          >
            {stats.overloaded}
          </p>
        </div>
      </div>

      {/* Overload Alert */}
      {stats.overloaded > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Resource Overload Warning
              </h3>
              <p className="text-sm text-red-700">
                {stats.overloaded} employee(s) are over-allocated (workload &gt; 100%). Review
                assignments to prevent burnout.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {[
              { key: 'all', label: 'All Employees', count: stats.total },
              { key: 'active', label: 'Active', count: stats.active },
              { key: 'available', label: 'Available', count: stats.available },
              { key: 'assigned', label: 'Assigned', count: stats.assigned },
              { key: 'overloaded', label: 'Overloaded', count: stats.overloaded },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, department, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by skill..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Employee Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Workload
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => {
                const availStatus = getAvailabilityStatus(
                  employee.availability,
                  employee.workload
                );
                const isOverloaded = employee.workload > 100;

                return (
                  <tr
                    key={employee.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${isOverloaded ? 'bg-red-50/30' : ''
                      }`}
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-medium text-sm">
                            {employee.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employee.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{employee.role}</p>
                      <p className="text-xs text-gray-500">{employee.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {employee.skills.length > 3 && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            +{employee.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.availability}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${employee.workload <= 80
                              ? 'bg-green-500'
                              : employee.workload <= 100
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(employee.workload, 100)}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-medium w-12 ${isOverloaded ? 'text-red-600' : 'text-gray-900'
                            }`}
                        >
                          {employee.workload}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {employee.currentProjects.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-900">
                            {employee.currentProjects.length} active
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No assignments</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${availStatus.color === 'green'
                            ? 'bg-green-100 text-green-700'
                            : availStatus.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-700'
                              : availStatus.color === 'orange'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${availStatus.color === 'green'
                              ? 'bg-green-500'
                              : availStatus.color === 'yellow'
                                ? 'bg-yellow-500'
                                : availStatus.color === 'orange'
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                          ></span>
                          {availStatus.label}
                        </span>
                        {employee.status !== 'active' && (
                          <div>
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {employee.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEmployee(employee);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(employee);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployee(employee);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No employees found</p>
            <p className="text-xs text-gray-500">
              {searchQuery || departmentFilter !== 'all' || skillFilter
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first employee'}
            </p>
          </div>
        )}
      </div>

      {/* Employee Detail Sidebar */}
      {selectedEmployee && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedEmployee(null)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-125 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Employee Details</h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="text-center">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-semibold text-2xl">
                    {selectedEmployee.avatar}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedEmployee.role}</p>
                <p className="text-xs text-gray-500">{selectedEmployee.department}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase">Contact</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedEmployee.email}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedEmployee.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedEmployee.location}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Joined {new Date(selectedEmployee.joinedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      <Award className="w-3 h-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Availability & Workload */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Availability</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {selectedEmployee.availability}%
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${selectedEmployee.workload > 100 ? 'bg-red-50' : 'bg-gray-50'
                    }`}
                >
                  <p className="text-xs text-gray-600 mb-1">Workload</p>
                  <p
                    className={`text-2xl font-semibold ${selectedEmployee.workload > 100 ? 'text-red-600' : 'text-gray-900'
                      }`}
                  >
                    {selectedEmployee.workload}%
                  </p>
                </div>
              </div>

              {/* Current Projects */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase">
                  Current Projects ({selectedEmployee.currentProjects.length})
                </h4>
                {selectedEmployee.currentProjects.length > 0 ? (
                  <div className="space-y-2">
                    {selectedEmployee.currentProjects.map((project, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">{project}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No active assignments</p>
                )}
              </div>

              {/* Project History */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase">
                  Project History
                </h4>
                <div className="space-y-2">
                  {selectedEmployee.projectHistory.map((project, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-700">{project}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleEditEmployee(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Employee
                </button>
                <button
                  onClick={() => {
                    handleDeleteEmployee(selectedEmployee);
                    setSelectedEmployee(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && employeeToDelete && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Employee</h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to remove <strong>{employeeToDelete.name}</strong> from the
                  system? This action cannot be undone.
                </p>
                {employeeToDelete.currentProjects.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-900">
                      Warning: This employee is assigned to {employeeToDelete.currentProjects.length} active project(s)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
