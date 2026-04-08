'use client';
import { useState } from 'react';
import { Calendar, Paperclip, X, Send, Save, XCircle, Plus, Trash2, Users, Lightbulb } from 'lucide-react';
import { useFeedbackToast } from '@/app/context/ToastContext';
import { WorkflowVisualizer } from '../system/WorkflowSystem';
import type { ProjectStatus } from '../system/WorkflowSystem';


// Structured skill categories
const skillCategories = {
  'Technical Skills': [
    'React',
    'Node.js',
    'Python',
    'JavaScript',
    'TypeScript',
    'Java',
    'C++',
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'AWS',
    'Docker',
    'Kubernetes',
    'DevOps',
    'CI/CD',
    'API Development',
    'Mobile Development',
    'iOS',
    'Android',
    'React Native',
    'UI/UX Design',
    'Figma',
    'Adobe Suite',
    'HTML/CSS',
  ],
  'Soft Skills': [
    'Project Management',
    'Communication',
    'Leadership',
    'Critical Thinking',
    'Problem Solving',
    'Collaboration',
    'Time Management',
    'Adaptability',
    'Creativity',
  ],
  'Business Skills': [
    'Marketing',
    'Content Writing',
    'SEO',
    'Data Analysis',
    'Strategy',
    'Sales',
    'Client Management',
    'Budget Planning',
  ],
};

const allSkills = Object.values(skillCategories).flat();

const roleOptions = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'UI/UX Designer',
  'QA Engineer',
  'Project Manager',
  'DevOps Engineer',
  'Data Analyst',
  'Marketing Specialist',
  'Content Writer',
];

const experienceLevels = ['Junior', 'Mid', 'Senior'];

interface ResourceRequirement {
  id: string;
  role: string;
  quantity: number;
  experienceLevel: string;
  requiredSkills: string[];
  notes: string;
}

export function ProjectCreation() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('draft');
  const [showRejectedProjects, setShowRejectedProjects] = useState(false);
  const [selectedRejected, setSelectedRejected] = useState<any>(null);
  const [resourceRequirements, setResourceRequirements] = useState<ResourceRequirement[]>([
    {
      id: '1',
      role: '',
      quantity: 1,
      experienceLevel: 'Mid',
      requiredSkills: [],
      notes: '',
    },
  ]);
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [activeResourceId, setActiveResourceId] = useState<string | null>(null);
  const [resourceSkillInput, setResourceSkillInput] = useState('');
  const { addToast } = useFeedbackToast();

  // Mock rejected projects with GM feedback
  const rejectedProjects = [
    {
      id: 'rejected-1',
      name: 'Marketing Automation Platform',
      clientName: 'Global Retail Co',
      rejectionReason: 'Timeline is too aggressive given current resource availability. Please extend to Q3 or reduce scope.',
      rejectedDate: '2026-04-03',
      gmFeedback: 'The proposed 2-month timeline conflicts with existing Website Redesign project. Consider Q3 start date instead.',
    },
  ];

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const filteredSkills = allSkills.filter(
    (skill) =>
      skill.toLowerCase().includes(skillInput.toLowerCase()) && !selectedSkills.includes(skill)
  );

  // Resource requirement functions
  const addResourceRequirement = () => {
    setResourceRequirements([
      ...resourceRequirements,
      {
        id: Date.now().toString(),
        role: '',
        quantity: 1,
        experienceLevel: 'Mid',
        requiredSkills: [],
        notes: '',
      },
    ]);
  };

  const removeResourceRequirement = (id: string) => {
    if (resourceRequirements.length > 1) {
      setResourceRequirements(resourceRequirements.filter((r) => r.id !== id));
    }
  };

  const updateResourceRequirement = (id: string, field: keyof ResourceRequirement, value: any) => {
    setResourceRequirements(
      resourceRequirements.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const addSkillToResource = (resourceId: string, skill: string) => {
    const resource = resourceRequirements.find((r) => r.id === resourceId);
    if (resource && !resource.requiredSkills.includes(skill)) {
      updateResourceRequirement(resourceId, 'requiredSkills', [
        ...resource.requiredSkills,
        skill,
      ]);
      setResourceSkillInput('');
    }
  };

  const removeSkillFromResource = (resourceId: string, skill: string) => {
    const resource = resourceRequirements.find((r) => r.id === resourceId);
    if (resource) {
      updateResourceRequirement(
        resourceId,
        'requiredSkills',
        resource.requiredSkills.filter((s) => s !== skill)
      );
    }
  };

  // Calculate total resources automatically
  const totalResources = resourceRequirements.reduce((sum, req) => sum + req.quantity, 0);

  // Mock suggested employees based on skills
  const suggestedEmployees = selectedSkills.length > 0 ? [
    { name: 'Agus Pratama', skills: ['Critical Thinking', 'Leadership', 'Project Management'], match: 85 },
    { name: 'Budi Santoso', skills: ['Node.js', 'API Development', 'Backend'], match: 92 },
    { name: 'Sarah Chen', skills: ['React', 'UI/UX Design', 'Frontend'], match: 88 },
  ] : [];

  const handleSaveDraft = () => {
    setProjectStatus('draft');
    addToast({
      type: 'success',
      title: 'Draft Saved',
      message: 'Your project proposal has been saved as draft',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const hasEmptyRole = resourceRequirements.some((r) => !r.role);
    if (hasEmptyRole) {
      addToast({
        type: 'error',
        title: 'Incomplete Resource Requirements',
        message: 'Please specify a role for all resource requirements',
      });
      return;
    }

    if (selectedSkills.length === 0) {
      addToast({
        type: 'error',
        title: 'Skills Required',
        message: 'Please select at least one required skill',
      });
      return;
    }

    setProjectStatus('submitted');
    addToast({
      type: 'success',
      title: 'Project Submitted',
      message: 'Your proposal has been sent to GM for approval',
    });
  };

  const handleReviseRejected = (project: any) => {
    setSelectedRejected(project);
    setShowRejectedProjects(false);
    // In a real app, would populate form with rejected project data
    addToast({
      type: 'info',
      title: 'Revising Project',
      message: 'Update the project details and resubmit for GM review',
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
          <p className="text-sm text-gray-500 mt-1">Marketing Department - Project Request Form</p>
        </div>
        {rejectedProjects.length > 0 && (
          <button
            onClick={() => setShowRejectedProjects(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            <XCircle className="w-4 h-4" />
            View Rejected Projects ({rejectedProjects.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Q2 Marketing Campaign"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corporation"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Estimated Resources - Auto-calculated */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Resources Required
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={totalResources}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm cursor-not-allowed"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      Auto-calculated
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically calculated from resource requirements below
                  </p>
                </div>

                {/* Timeline - Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Timeline - End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Required Skills - Enhanced with Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Select structured skills to improve assignment accuracy
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onFocus={() => setShowSkillDropdown(true)}
                    placeholder="Search skills by category..."
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {showSkillDropdown && (skillInput || true) && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-auto">
                      {Object.entries(skillCategories).map(([category, skills]) => {
                        const filteredCategorySkills = skills.filter(
                          (skill) =>
                            skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                            !selectedSkills.includes(skill)
                        );

                        if (filteredCategorySkills.length === 0) return null;

                        return (
                          <div key={category}>
                            <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
                              <p className="text-xs font-semibold text-gray-700">{category}</p>
                            </div>
                            {filteredCategorySkills.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  addSkill(skill);
                                  setShowSkillDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Resource Requirements Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Resource Requirements <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600">
                      Define resource roles clearly to improve assignment accuracy
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addResourceRequirement}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Resource
                  </button>
                </div>

                <div className="space-y-4">
                  {resourceRequirements.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-gray-600" />
                          <h4 className="text-sm font-semibold text-gray-900">
                            Resource #{index + 1}
                          </h4>
                        </div>
                        {resourceRequirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeResourceRequirement(resource.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        {/* Role */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Role <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={resource.role}
                            onChange={(e) =>
                              updateResourceRequirement(resource.id, 'role', e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select role...</option>
                            {roleOptions.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={resource.quantity}
                            onChange={(e) =>
                              updateResourceRequirement(
                                resource.id,
                                'quantity',
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Experience Level */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Experience Level
                          </label>
                          <select
                            value={resource.experienceLevel}
                            onChange={(e) =>
                              updateResourceRequirement(
                                resource.id,
                                'experienceLevel',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {experienceLevels.map((level) => (
                              <option key={level} value={level}>
                                {level}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Assigned Skills for this Resource */}
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Assigned Skill Requirements
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={
                              activeResourceId === resource.id ? resourceSkillInput : ''
                            }
                            onChange={(e) => setResourceSkillInput(e.target.value)}
                            onFocus={() => setActiveResourceId(resource.id)}
                            placeholder="Search skills for this role..."
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {activeResourceId === resource.id && resourceSkillInput && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                              {allSkills
                                .filter(
                                  (skill) =>
                                    skill
                                      .toLowerCase()
                                      .includes(resourceSkillInput.toLowerCase()) &&
                                    !resource.requiredSkills.includes(skill)
                                )
                                .map((skill) => (
                                  <button
                                    key={skill}
                                    type="button"
                                    onClick={() => {
                                      addSkillToResource(resource.id, skill);
                                      setActiveResourceId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                  >
                                    {skill}
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                        {resource.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {resource.requiredSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkillFromResource(resource.id, skill)}
                                  className="hover:bg-gray-100 rounded p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Notes (Optional)
                        </label>
                        <input
                          type="text"
                          value={resource.notes}
                          onChange={(e) =>
                            updateResourceRequirement(resource.id, 'notes', e.target.value)
                          }
                          placeholder="Additional requirements or preferences..."
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Resource Match */}
              {suggestedEmployees.length > 0 && (
                <div className="bg-linear-to-br from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Recommended Employees Based on Skills
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    These employees match your required skills (for reference only)
                  </p>
                  <div className="space-y-2">
                    {suggestedEmployees.map((employee) => (
                      <div
                        key={employee.name}
                        className="bg-white border border-blue-200 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{employee.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {employee.skills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          <span className="text-sm font-semibold text-green-600">
                            {employee.match}% match
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Additional information about the project..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, XLS, or images (max 10MB)
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Submit to GM
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Workflow Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <WorkflowVisualizer currentStatus={projectStatus} />
        </div>
      </div>

      {/* Rejected Projects Modal */}
      {showRejectedProjects && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Rejected Projects</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Review GM feedback and revise to resubmit
                </p>
              </div>
              <button
                onClick={() => setShowRejectedProjects(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {rejectedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-red-50 border-2 border-red-200 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{project.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>Client: {project.clientName}</span>
                        <span className="text-gray-400">•</span>
                        <span>
                          Rejected: {new Date(project.rejectedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <p className="text-sm font-semibold text-red-900">GM Feedback:</p>
                    </div>
                    <p className="text-sm text-gray-700">{project.gmFeedback}</p>
                  </div>

                  <div className="bg-white border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Rejection Reason:</p>
                    <p className="text-sm text-gray-600">{project.rejectionReason}</p>
                  </div>

                  <button
                    onClick={() => handleReviseRejected(project)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    Revise & Resubmit Project
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
