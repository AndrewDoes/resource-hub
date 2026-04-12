'use client';

import { X, Plus, Calendar as CalendarIcon, Briefcase, Search, Clock, AlertTriangle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import { DepartmentLookup, ProjectLookup, SkillLookup } from '@/functions/api/humanResource';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  employee?: Employee | null;
  departments: DepartmentLookup[];
  projects: ProjectLookup[];
  availableSkills: SkillLookup[];
}

export function EmployeeFormModal({ isOpen, onClose, onSave, employee, departments, projects, availableSkills }: EmployeeFormModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    departmentId: '',
    employeeCode: '',
    phone: '',
    location: '',
    status: 'Active',
    hireDate: '',
    skills: [] as string[]
  });
  const [isEmailDirty, setIsEmailDirty] = useState(false);

  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = availableSkills.filter(s =>
    s.name.toLowerCase().includes(skillInput.toLowerCase()) &&
    !formData.skills.includes(s.name)
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSkillSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (employee) {
      // Try to find the local ID for a department name if we only have the name
      let deptId = employee.department;
      if (departments.length > 0 && employee.department && !employee.department.match(/^[0-9a-f-]{36}$/i)) {
        const found = departments.find(d => d.name === employee.department);
        if (found) deptId = found.id;
      }

      setFormData({
        fullName: employee.name,
        email: employee.email,
        jobTitle: employee.role,
        departmentId: deptId,
        employeeCode: employee.employeeCode || '',
        phone: employee.phone || '',
        location: employee.location || '',
        status: employee.status === 'active' ? 'Active' : employee.status === 'terminated' ? 'Terminated' : 'Inactive',
        hireDate: employee.hireDate ? employee.hireDate.split('T')[0] : '',
        skills: employee.skills || []
      });
    } else {
      emptyForm();
    }
  }, [employee]);

  const emptyForm = () => {
    setFormData({
      fullName: '',
      email: '',
      jobTitle: '',
      departmentId: '',
      employeeCode: '',
      phone: '',
      location: '',
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0],
      skills: []
    });
    setSkillInput('');
    setIsEmailDirty(false);
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleAddSkillWithName = (name: string) => {
    if (!formData.skills.includes(name)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, name]
      });
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure employeeCode is null if empty string to avoid unique constraint violations
    const payload = {
       ...formData,
       employeeCode: formData.employeeCode.trim() || null
    };
    onSave(payload);
    emptyForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            {employee?.id ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={(e) => {
                const newName = e.target.value;
                const updates: any = { fullName: newName };

                // Auto-generate email if not manually edited by user
                if (!isEmailDirty && !employee?.id) {
                  const emailSuggestion = newName.trim().toLowerCase().replace(/\s+/g, '.') + '@company.com';
                  updates.email = emailSuggestion;
                }

                setFormData({ ...formData, ...updates });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input
              required
              disabled={!!employee}
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setIsEmailDirty(true);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Job Title</label>
              <input
                required
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Software Engineer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">Select Dept</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Hire Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-10"
                />
                <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Terminated">Terminated</option>
            </select>
            
            {formData.status === 'Terminated' && employee && employee.currentProjects && employee.currentProjects.length > 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">Critical Warning: Active Assignments</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    This employee is still assigned to: <span className="font-semibold">{employee.currentProjects.join(', ')}</span>. 
                    Termination will leave these projects without this resource.
                  </p>
                </div>
              </div>
            )}
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Skills</label>
            <div className="relative" ref={suggestionRef}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      setShowSkillSuggestions(true);
                    }}
                    onFocus={() => setShowSkillSuggestions(true)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add a skill..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm pl-9"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {showSkillSuggestions && skillInput.trim() !== '' && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden border-t-0 ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <p className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 bg-gray-50/50">Suggestions</p>
                    {filteredSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleAddSkillWithName(s.name)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-gray-700 group-hover:text-blue-700">{s.name}</span>
                        <span className="text-[10px] text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                          {s.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
            >
              {employee ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
