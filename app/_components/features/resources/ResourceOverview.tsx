'use client';
import { useState } from 'react';
import {
  Users,
  Search,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Award,
  Lock,
  Info,
  CheckCircle,
} from 'lucide-react';

interface ResourceSummary {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  skills: string[];
  availability: number;
  workload: number;
  assignedHours: number;
  currentProjects: string[];
  status: 'available' | 'moderate' | 'busy' | 'overloaded';
}

const mockResources: ResourceSummary[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'SJ',
    role: 'Senior Developer',
    department: 'Engineering',
    skills: ['React', 'Node.js', 'Python', 'AWS'],
    availability: 100,
    workload: 0,
    assignedHours: 2,
    currentProjects: [],
    status: 'available',
  },
  {
    id: '2',
    name: 'David Lee',
    avatar: 'DL',
    role: 'Frontend Developer',
    department: 'Engineering',
    skills: ['React', 'TypeScript', 'CSS'],
    availability: 30,
    workload: 70,
    assignedHours: 5,
    currentProjects: ['Website Redesign', 'Mobile App'],
    status: 'busy',
  },
  {
    id: '3',
    name: 'Emily Chen',
    avatar: 'EC',
    role: 'Product Manager',
    department: 'Product',
    skills: ['Product Management', 'Agile', 'Scrum'],
    availability: 80,
    workload: 20,
    assignedHours: 3,
    currentProjects: ['Q2 Marketing Campaign'],
    status: 'available',
  },
  {
    id: '4',
    name: 'Michael Brown',
    avatar: 'MB',
    role: 'Backend Developer',
    department: 'Engineering',
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker'],
    availability: 0,
    workload: 110,
    assignedHours: 9,
    currentProjects: ['Mobile App', 'Database Migration', 'API Gateway'],
    status: 'overloaded',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    avatar: 'LA',
    role: 'UI/UX Designer',
    department: 'Design',
    skills: ['Figma', 'Design Systems', 'User Research'],
    availability: 50,
    workload: 50,
    assignedHours: 7,
    currentProjects: ['Website Redesign'],
    status: 'moderate',
  },
];

export function ResourceOverview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Helper function to calculate workload percentage from assigned hours
  const calculateWorkloadFromHours = (assignedHours: number): number => {
    return (assignedHours / 8) * 100;
  };

  // Helper function to calculate status from workload percentage
  const calculateStatusFromWorkload = (workloadPercent: number): 'available' | 'moderate' | 'busy' | 'overloaded' => {
    if (workloadPercent <= 40) return 'available';
    if (workloadPercent <= 70) return 'moderate';
    if (workloadPercent <= 100) return 'busy';
    return 'overloaded';
  };

  // Filter resources
  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      searchQuery === '' ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      departmentFilter === 'all' || resource.department === departmentFilter;

    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: mockResources.length,
    available: mockResources.filter((r) => r.availability >= 80).length,
    moderate: mockResources.filter((r) => r.availability >= 50 && r.availability < 80)
      .length,
    busy: mockResources.filter((r) => r.availability > 0 && r.availability < 50).length,
    overloaded: mockResources.filter((r) => r.workload > 100).length,
    avgUtilization: Math.round(
      mockResources.reduce((acc, r) => acc + r.workload, 0) / mockResources.length
    ),
  };

  const departments = Array.from(new Set(mockResources.map((r) => r.department)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'busy':
        return 'bg-orange-100 text-orange-700';
      case 'overloaded':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-semibold text-gray-900">Resource Overview</h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Lock className="w-3 h-3" />
            Read-Only
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Monitor resource allocation and availability across all projects
        </p>
        <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700">
            <strong>Note:</strong> This is a read-only view. To manage employees (add, edit, or
            remove), please contact HR.
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Resources</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-700">Available</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-semibold text-green-900">{stats.available}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200 bg-yellow-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-700">Moderate</h3>
            <Users className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-semibold text-yellow-900">{stats.moderate}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200 bg-orange-50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-orange-700">Busy</h3>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-semibold text-orange-900">{stats.busy}</p>
        </div>

        <div
          className={`rounded-xl p-5 border shadow-sm ${stats.overloaded > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'
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

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Utilization</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-gray-900">{stats.avgUtilization}%</p>
        </div>
      </div>

      {/* Overload Alert */}
      {stats.overloaded > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-1">
                Resource Overload Warning
              </h3>
              <p className="text-sm text-red-700">
                {stats.overloaded} resource(s) are over-allocated (workload &gt; 100%). Consider
                adjusting project timelines or reallocating resources. Contact HR for resource
                reallocation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="moderate">Moderate</option>
            <option value="busy">Busy</option>
            <option value="overloaded">Overloaded</option>
          </select>
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role & Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider group cursor-help relative">
                  Working Hours
                  <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                    Shows assigned working hours compared to daily capacity (8 hours)
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider group cursor-help relative">
                  Workload (%)
                  <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                    Calculated from assigned working hours divided by daily capacity (8 hours). Formula: (Assigned Hours / 8) × 100
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Current Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider group cursor-help relative">
                  Status
                  <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg normal-case font-normal">
                    Auto-calculated from workload percentage. Available (0-40%), Moderate (41-70%), Busy (71-100%), Overloaded (&gt;100%)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResources.map((resource) => {
                const calculatedWorkload = calculateWorkloadFromHours(resource.assignedHours);
                const calculatedStatus = calculateStatusFromWorkload(calculatedWorkload);
                const isOverloaded = calculatedWorkload > 100;

                return (
                  <tr
                    key={resource.id}
                    className={`hover:bg-gray-50 transition-colors ${isOverloaded ? 'bg-red-50/30 border-l-4 border-l-red-500' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-medium text-sm">
                            {resource.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{resource.name}</p>
                          {isOverloaded && (
                            <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Over Capacity
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{resource.role}</p>
                      <p className="text-xs text-gray-500">{resource.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {resource.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            <Award className="w-3 h-3" />
                            {skill}
                          </span>
                        ))}
                        {resource.skills.length > 3 && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                            +{resource.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className={`text-sm font-semibold ${resource.assignedHours > 8
                          ? 'text-red-600'
                          : resource.assignedHours > 5.6
                            ? 'text-orange-600'
                            : resource.assignedHours > 3.2
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}>
                          {resource.assignedHours}h / 8h
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Assigned / Capacity
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${resource.availability >= 80
                              ? 'bg-green-500'
                              : resource.availability >= 50
                                ? 'bg-yellow-500'
                                : resource.availability > 0
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                            style={{ width: `${resource.availability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12">
                          {resource.availability}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="group relative">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 w-32 bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${calculatedWorkload > 100
                                ? 'bg-red-500'
                                : calculatedWorkload > 70
                                  ? 'bg-orange-500'
                                  : calculatedWorkload > 40
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                              style={{ width: `${Math.min(calculatedWorkload, 100)}%` }}
                            ></div>
                          </div>
                          <span
                            className={`text-sm font-bold whitespace-nowrap min-w-[50px] text-right ${calculatedWorkload > 100
                              ? 'text-red-600'
                              : calculatedWorkload > 70
                                ? 'text-orange-600'
                                : calculatedWorkload > 40
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                          >
                            {Math.round(calculatedWorkload)}%
                          </span>
                        </div>
                        <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                          Workload: {Math.round(calculatedWorkload)}% = ({resource.assignedHours}h / 8h) × 100
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {resource.currentProjects.length > 0 ? (
                        <div className="space-y-1">
                          {resource.currentProjects.map((project, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-sm">
                              <Briefcase className="w-3 h-3 text-blue-500" />
                              <span className="text-gray-900">{project}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">No assignments</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="group relative inline-block cursor-help">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                            calculatedStatus
                          )}`}
                        >
                          {calculatedStatus === 'available' && <CheckCircle className="w-3.5 h-3.5" />}
                          {calculatedStatus === 'moderate' && <TrendingUp className="w-3.5 h-3.5" />}
                          {calculatedStatus === 'busy' && <Briefcase className="w-3.5 h-3.5" />}
                          {calculatedStatus === 'overloaded' && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${calculatedStatus === 'available'
                              ? 'bg-green-500'
                              : calculatedStatus === 'moderate'
                                ? 'bg-yellow-500'
                                : calculatedStatus === 'busy'
                                  ? 'bg-orange-500'
                                  : 'bg-red-500'
                              }`}
                          ></span>
                          {calculatedStatus.toUpperCase()}
                        </span>
                        <div className="absolute left-0 top-full mt-1 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                          {calculatedStatus === 'available' && 'Low workload (≤ 40%), resource has high availability'}
                          {calculatedStatus === 'moderate' && 'Balanced workload (41–70%)'}
                          {calculatedStatus === 'busy' && 'High workload (71–100%), near full capacity'}
                          {calculatedStatus === 'overloaded' && 'Work exceeds 8 hours/day (>100%), needs attention'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No resources found</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
