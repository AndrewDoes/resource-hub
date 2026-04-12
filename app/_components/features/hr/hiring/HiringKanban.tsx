'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  Briefcase, 
  UserPlus, 
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  fetchHiringRequests, 
  updateHiringStage, 
  HiringRequestItem as BaseHiringRequestItem, 
  HiringRequestStatus,
  fetchDepartmentsLookup,
  fetchProjectsLookup,
  fetchSkillsLookup,
  createEmployee,
  DepartmentLookup,
  ProjectLookup,
  SkillLookup
} from '@/functions/api/humanResource';
import { useFeedbackToast } from '@/app/context/ToastContext';
import { EmployeeFormModal } from '../employee-management/components/EmployeeFormModal';

export interface HiringRequestItem extends BaseHiringRequestItem {
  quantity?: number;
}

const STAGES: { id: HiringRequestStatus; label: string; color: string }[] = [
  { id: 'Sourcing', label: 'Sourcing', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'Interviewing', label: 'Interviewing', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'Offering', label: 'Offering', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

export function HiringKanban() {
  const [requests, setRequests] = useState<HiringRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToast } = useFeedbackToast();

  // Onboarding Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<HiringRequestItem | null>(null);
  const [lookups, setLookups] = useState({
    departments: [] as DepartmentLookup[],
    projects: [] as ProjectLookup[],
    skills: [] as SkillLookup[]
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchHiringRequests();
      // Filter out terminal states for the board
      setRequests(data.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled'));
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Fetch Error',
        message: 'Could not load hiring requests.'
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
      setLookups({ departments: depts, projects: projs, skills: skills });
    } catch (error) {
      console.error('Lookup load error:', error);
    }
  };

  useEffect(() => {
    loadData();
    loadLookups();
  }, []);

  const handleMoveStage = async (id: string, currentStatus: HiringRequestStatus) => {
    const nextStatusMap: Record<string, HiringRequestStatus> = {
      'Sourcing': 'Interviewing',
      'Interviewing': 'Offering',
      'Offering': 'Offering'
    };

    const nextStatus = nextStatusMap[currentStatus];
    if (!nextStatus) return;

    if (currentStatus === 'Offering') {
      const request = requests.find(r => r.id === id);
      if (request) {
        setSelectedRequest(request);
        setIsModalOpen(true);
      }
      return;
    }

    try {
      const result = await updateHiringStage(id, nextStatus);
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Stage Updated',
          message: `Request moved to ${nextStatus}`
        });
        loadData();
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: result.message || 'Could not update stage.'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Network error occurred.'
      });
    }
  };

  const filteredRequests = requests.filter(r => 
    r.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by role or project..."
            className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-hidden"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="px-2 py-0.5 bg-white border border-gray-200 text-gray-500 rounded-full text-xs font-medium">
                  {filteredRequests.filter(r => r.status === stage.id).length}
                </span>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-32 bg-white rounded-lg border border-gray-200 animate-pulse" />
                ))
              ) : (
                filteredRequests
                  .filter(r => r.status === stage.id)
                  .map((request) => (
                    <div 
                      key={request.id} 
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {request.jobTitle}
                        </h4>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${stage.color}`}>
                          {request.quantity && request.quantity > 1 ? `QTY: ${request.quantity}` : stage.id}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span className="truncate">{request.projectName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Started {new Date(request.startedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <button 
                          onClick={() => handleMoveStage(request.id, request.status)}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {stage.id === 'Offering' ? (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              ONBOARD CANDIDATE
                            </>
                          ) : (
                            <>
                              MOVE TO {STAGES[STAGES.findIndex(s => s.id === stage.id) + 1]?.label.toUpperCase()}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                        <div className="flex -space-x-2">
                           <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                             +
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Onboarding Modal */}
      {selectedRequest && (
        <EmployeeFormModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          employee={{
            id: '',
            name: '',
            avatar: '',
            role: selectedRequest.jobTitle,
            email: '',
            phone: '',
            location: '',
            department: '',
            skills: [],
            status: 'active',
            availability: 100,
            workload: 0,
            currentProjects: [selectedRequest.projectName],
            projectHistory: [],
            joinedDate: new Date().toISOString()
          } as any}
          departments={lookups.departments}
          projects={lookups.projects}
          availableSkills={lookups.skills}
          onSave={async (formData) => {
            try {
              const res = await createEmployee(formData);
              if (res.success) {
                // DON'T automatically complete the request, since there might be more quantities to hire
                addToast({
                  type: 'success',
                  title: 'Employee Registered',
                  message: `${formData.fullName} has been successfully registered.`
                });
                setIsModalOpen(false);
                setSelectedRequest(null);
                loadData();
              } else {
                addToast({
                  type: 'error',
                  title: 'Onboarding Failed',
                  message: res.message || 'Could not create employee record.'
                });
              }
            } catch (err) {
              addToast({
                type: 'error',
                title: 'Error',
                message: 'A network error occurred during onboarding.'
              });
            }
          }}
        />
      )}
    </div>
  );
}
