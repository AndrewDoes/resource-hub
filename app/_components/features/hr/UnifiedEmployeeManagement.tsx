'use client';

import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useFeedbackToast } from '../../../context/ToastContext';

// Types, Data and Utils
import { Employee, TabType } from './types';
import { mockEmployees } from './data';

// Sub-components
import { EmployeeStats } from './components/EmployeeStats';
import { EmployeeFilterBar } from './components/EmployeeFilterBar';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeDetailSidebar } from './components/EmployeeDetailSidebar';
import { EmployeeDeleteModal } from './components/EmployeeDeleteModal';

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

  // Filter employees based on active tab and search/filter criteria
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
      <EmployeeTable 
        employees={filteredEmployees}
        onSelect={setSelectedEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />

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
