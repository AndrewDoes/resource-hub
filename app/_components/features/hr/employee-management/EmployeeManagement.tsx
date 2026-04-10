'use client';

import { Briefcase, Download, Plus } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';


// Types, Data and Utils


// Sub-components
import { EmployeeStats } from './components/EmployeeStats';
import { EmployeeFilterBar } from './components/EmployeeFilterBar';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeDetailSidebar } from './components/EmployeeDetailSidebar';
import { EmployeeDeleteModal } from './components/EmployeeDeleteModal';
import { Employee, TabType } from './types';
import { mockEmployees } from './data';
import { useEffect, useState } from 'react';
import { fetchHREmployeeList, mapToUIEmployee } from '@/functions/api/humanResource';


export function EmployeeManagement() {

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setIsLoading(true);
        const apiEmployees = await fetchHREmployeeList();
        const uiEmployees = apiEmployees.map(mapToUIEmployee);
        setEmployees(uiEmployees);
        setError(null);
      } catch (err) {
        console.error('Error loading employees:', err);
        setError('Failed to load employees. Please try again later.');
        // Fallback to mock data if API fails during development
        setEmployees(mockEmployees);
        addToast({
          type: 'error',
          title: 'Connection Error',
          message: 'Could not connect to the server. Using offline data.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadEmployees();
  }, [addToast]);

  // Filter employees based on active tab and search/filter criteria
  const getFilteredEmployees = () => {
    let filtered = employees;

    // Tab filtering
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((e) => e.status === 'active');
        break;
      case 'available':
        filtered = filtered.filter((e) => e.assignedHours <= ((70 / 100) * 8) && e.status === 'active');
        break;
      case 'assigned':
        filtered = filtered.filter(
          (e) => e.currentProjects.length > 0 && e.status === 'active'
        );
        break;
      case 'overloaded':
        filtered = filtered.filter((e) => e.assignedHours > 8 && e.status === 'active');
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
    available: employees.filter((e) => (e.workload <= 70) && e.status === 'active').length,
    assigned: employees.filter((e) => e.currentProjects.length > 0 && e.status === 'active').length,
    overloaded: employees.filter((e) => e.workload > 100 && e.status === 'active').length,
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
      <EmployeeStats stats={stats} />

      {/* Filter Bar with Tabs */}
      <EmployeeFilterBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        skillFilter={skillFilter}
        setSkillFilter={setSkillFilter}
        departments={departments}
        counts={stats}
      />

      {/* Employee Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading employee data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="p-4 bg-red-50 rounded-full mb-4">
            <Briefcase className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-sm font-medium text-red-900 mb-1">Error Loading Data</p>
          <p className="text-xs text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          onSelect={setSelectedEmployee}
          onEdit={handleEditEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}

      {/* Employee Detail Sidebar */}
      <EmployeeDetailSidebar
        employee={selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

      {/* Delete Confirmation Modal */}
      <EmployeeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        employee={employeeToDelete}
      />
    </div>
  );
}
