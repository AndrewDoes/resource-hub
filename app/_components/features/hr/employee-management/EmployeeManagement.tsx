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
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { Employee, TabType } from './types';
import { mockEmployees } from './data';
import { useEffect, useState } from 'react';
import {
  fetchHREmployeeList,
  mapToUIEmployee,
  deleteEmployee,
  createEmployee,
  updateEmployee,
  fetchDepartmentsLookup,
  DepartmentLookup,
  fetchProjectsLookup,
  ProjectLookup,
  fetchSkillsLookup,
  SkillLookup,
  rehireEmployee
} from '@/functions/api/humanResource';
import { recalculateEmployeeWorkloads } from '@/functions/api/generalManager';
import { RehireModal } from './components/RehireModal';


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
  const [dbDepartments, setDbDepartments] = useState<DepartmentLookup[]>([]);
  const [dbProjects, setDbProjects] = useState<ProjectLookup[]>([]);
  const [dbSkills, setDbSkills] = useState<SkillLookup[]>([]);

  const [isRehireModalOpen, setIsRehireModalOpen] = useState(false);
  const [employeeToRehire, setEmployeeToRehire] = useState<Employee | null>(null);

  const { addToast } = useFeedbackToast();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Refresh workload rules backend-wide on load
        await recalculateEmployeeWorkloads().catch(() => undefined);
        
        const apiEmployees = await fetchHREmployeeList();
        const uiEmployees = apiEmployees.map(mapToUIEmployee);
        setEmployees(uiEmployees);
        setError(null);
      } catch (err) {
        console.error('Error loading employees:', err);
        setError('Failed to load employees. Please try again later.');
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

    const loadLookups = async () => {
      try {
        const [depts, projs, skills] = await Promise.all([
          fetchDepartmentsLookup(),
          fetchProjectsLookup(),
          fetchSkillsLookup()
        ]);
        setDbDepartments(depts);
        setDbProjects(projs);
        setDbSkills(skills);
      } catch (err) {
        console.error('Error loading lookups:', err);
      }
    };

    loadInitialData();
    loadLookups();
  }, [addToast]);

  // Filter employees based on active tab and search/filter criteria
  const getFilteredEmployees = () => {
    let filtered = employees;

    // Tab filtering (Availability-based)
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter((e) => e.status === 'active');
        break;
      case 'available':
        filtered = filtered.filter((e) => e.workloadStatus === 'available' && e.status === 'active');
        break;
      case 'moderate':
        filtered = filtered.filter((e) => e.workloadStatus === 'moderate' && e.status === 'active');
        break;
      case 'busy':
        filtered = filtered.filter((e) => e.workloadStatus === 'busy' && e.status === 'active');
        break;
      case 'assigned':
        filtered = filtered.filter(
          (e) => e.currentProjects.length > 0 && e.status === 'active'
        );
        break;
      case 'overloaded':
        filtered = filtered.filter((e) => e.workloadStatus === 'overloaded' && e.status === 'active');
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

  // Get department list for filtering (derived from employees)
  const filterDepartments = Array.from(new Set(employees.map((e) => e.department)));

  // Calculate stats using unified GM thresholds
  const stats = {
    total: employees.length,
    available: employees.filter((e) => e.workloadStatus === 'available' && e.status === 'active').length,
    moderate: employees.filter((e) => e.workloadStatus === 'moderate' && e.status === 'active').length,
    busy: employees.filter((e) => e.workloadStatus === 'busy' && e.status === 'active').length,
    overloaded: employees.filter((e) => e.workloadStatus === 'overloaded' && e.status === 'active').length,
    avgUtilization: Math.round(
      employees.length === 0 
        ? 0 
        : employees.reduce((acc, e) => acc + e.workload, 0) / employees.length
    ),
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
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

    try {
      const result = await deleteEmployee(employeeToDelete.id);
      if (result.success) {
        setEmployees((prev) => prev.filter((e) => e.id !== employeeToDelete.id));
        addToast({
          type: 'success',
          title: 'Employee Removed',
          message: `${employeeToDelete.name} has been removed from the system.`,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: result.message || 'Could not delete the employee.',
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to connect to the server.',
      });
    } finally {
      setIsDeleteModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleSaveEmployee = async (formData: any) => {
    // Sanitize data (GUIDs cannot be empty strings)
    const sanitizedData = {
      ...formData,
      departmentId: formData.departmentId === '' ? null : formData.departmentId,
      employeeCode: formData.employeeCode === '' ? null : formData.employeeCode,
      location: formData.location === '' ? null : formData.location,
      phone: formData.phone === '' ? null : formData.phone,
      hireDate: formData.hireDate === '' ? null : formData.hireDate,
      skills: formData.skills
    };

    try {
      if (isEditModalOpen && selectedEmployee) {
        const result = await updateEmployee(selectedEmployee.id, sanitizedData);
        if (result.success) {
          addToast({ type: 'success', title: 'Employee Updated', message: 'Profile changes saved.' });
          // Refresh list
          const apiEmployees = await fetchHREmployeeList();
          setEmployees(apiEmployees.map(mapToUIEmployee));
          setIsEditModalOpen(false);
        } else {
          addToast({ type: 'error', title: 'Update Failed', message: result.message || 'Please check the form for errors.' });
        }
      } else {
        const result = await createEmployee(sanitizedData);
        if (result.success) {
          addToast({ type: 'success', title: 'Employee Created', message: 'New employee and user account added.' });
          // Refresh list
          const apiEmployees = await fetchHREmployeeList();
          setEmployees(apiEmployees.map(mapToUIEmployee));
          setIsAddModalOpen(false);
        } else {
          addToast({ type: 'error', title: 'Creation Failed', message: result.message || 'Please check the form for errors.' });
        }
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'An unexpected error occurred.' });
    }
  };

  const handleRehireClick = (employee: Employee) => {
    setEmployeeToRehire(employee);
    setIsRehireModalOpen(true);
  };

  const confirmRehire = async (rehireData: any) => {
    try {
      const result = await rehireEmployee(rehireData);
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Employee Rehired',
          message: result.message || 'The employee has been successfully reactivated.'
        });
        // Refresh list
        const apiEmployees = await fetchHREmployeeList();
        setEmployees(apiEmployees.map(mapToUIEmployee));
        setIsRehireModalOpen(false);
        setEmployeeToRehire(null);
        setSelectedEmployee(null); // Close sidebar
      } else {
        addToast({
          type: 'error',
          title: 'Rehire Failed',
          message: result.message || 'Could not complete the rehiring process.'
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Network error occurred.' });
    }
  };

  const handleExportCSV = () => {
    if (employees.length === 0) return;

    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Hire Date', 'Skills', 'Availability', 'Workload'];
    const rows = employees.map(e => [
      e.name,
      e.email,
      e.role,
      e.department,
      e.status,
      e.hireDate || e.joinedDate.split('T')[0],
      `"${e.skills.join(', ')}"`,
      `${e.availability}%`,
      `${e.workload}%`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Export Successful',
      message: `Exported ${employees.length} employees to CSV.`
    });
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
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
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
        departments={filterDepartments}
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
        onRehire={handleRehireClick}
      />

      {/* Delete Confirmation Modal */}
      <EmployeeDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        employee={employeeToDelete}
      />

      {/* Add/Edit Modal */}
      <EmployeeFormModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSave={handleSaveEmployee}
        employee={isEditModalOpen ? selectedEmployee : null}
        departments={dbDepartments}
        projects={dbProjects}
        availableSkills={dbSkills}
      />

      {/* Rehire Modal */}
      <RehireModal
        isOpen={isRehireModalOpen}
        onClose={() => {
          setIsRehireModalOpen(false);
          setEmployeeToRehire(null);
        }}
        onConfirm={confirmRehire}
        employee={employeeToRehire}
      />
    </div>
  );
}
