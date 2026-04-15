"use client";

import { FileText, Clock, XCircle, X } from "lucide-react";
import Link from "next/link";
// import { marketingProjects } from '@/app/_components/features/common/dashboard/data';
import { ProjectStatus } from "@/app/types";
import React, { useState, useEffect } from "react";
import { StatusBadge } from "@/app/_components/system/components/StatusBadge";
import { ProjectList } from "@/app/_components/features/marketing/project-revision/ProjectList";
import { WorkflowVisualizer } from "@/app/_components/system/components/WorkflowVisualizer";
import { ProjectForm } from "@/app/_components/features/marketing/projects/components/ProjectForm";
import { useFeedbackToast } from "@/app/context/ToastContext";
import {
  ProjectFormData,
  ResourceRequirement,
  SkillItem,
  SuggestedEmployee,
} from "@/app/_components/features/marketing/projects/types";

export function MarketingDashboard() {
  const { addToast } = useFeedbackToast();
  const marketingUserId =
    process.env.NEXT_PUBLIC_MARKETING_ID ??
    "58032228-86c3-4dce-b591-ca24c1f7a9e1";

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Draft edit modal state
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    clientName: "",
    startDate: "",
    endDate: "",
    description: "",
    notes: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [allSkillItems, setAllSkillItems] = useState<SkillItem[]>([]);
  const [skillCategories, setSkillCategories] = useState<
    Record<string, SkillItem[]>
  >({});

  const [resourceRequirements, setResourceRequirements] = useState<
    ResourceRequirement[]
  >([
    {
      id: "1",
      role: "",
      quantity: 1,
      experienceLevel: "Mid",
      requiredSkills: [],
      notes: "",
    },
  ]);

  // Mock suggested employees
  const suggestedEmployees: SuggestedEmployee[] = [];

  // Fetch projects list
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/gateway/api/projects/list?pageNumber=${currentPage}&pageSize=5`,
        {
          headers: {
            "X-Debug-Role": "marketing",
            "X-Debug-User": "marketing-user",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      // Fallback for mapping the API fields to the fields expected by the UI.
      const mappedProjects = (data.projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status as ProjectStatus,
        lastModified: p.startDate ? `Started ${p.startDate}` : "Unknown", // Fallback since API lacks lastModified
        feedback: null, // Fallback since API lacks feedback field for now
      }));

      setProjects(mappedProjects);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [currentPage]);

  // Fetch skills for the draft edit form
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/gateway/api/lookups/skills/list", {
          headers: {
            "X-Debug-Role": "marketing",
            "X-Debug-User": "marketing-user",
          },
        });
        if (response.ok) {
          const data = await response.json();
          const skills: SkillItem[] = data.skills;
          setAllSkillItems(skills);

          // Group by category
          const grouped = skills.reduce(
            (acc, skill) => {
              if (!acc[skill.category]) {
                acc[skill.category] = [];
              }
              acc[skill.category].push(skill);
              return acc;
            },
            {} as Record<string, SkillItem[]>,
          );
          setSkillCategories(grouped);
        }
      } catch (error) {
        console.error("Failed to fetch skills", error);
      }
    };
    fetchSkills();
  }, []);

  // Resource requirement helpers
  const addResourceRequirement = () => {
    setResourceRequirements([
      ...resourceRequirements,
      {
        id: Date.now().toString(),
        role: "",
        quantity: 1,
        experienceLevel: "Mid",
        requiredSkills: [],
        notes: "",
      },
    ]);
  };

  const removeResourceRequirement = (id: string) => {
    if (resourceRequirements.length > 1) {
      setResourceRequirements(resourceRequirements.filter((r) => r.id !== id));
    }
  };

  const updateResourceRequirement = (
    id: string,
    field: keyof ResourceRequirement,
    value: any,
  ) => {
    setResourceRequirements(
      resourceRequirements.map((r) =>
        r.id === id ? ({ ...r, [field]: value } as ResourceRequirement) : r,
      ),
    );
  };

  // Calculate total resources
  const totalResources = resourceRequirements.reduce(
    (sum, req) => sum + req.quantity,
    0,
  );

  const handleFormDataChange = (
    field: keyof ProjectFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle project click — conditional based on status
  const handleProjectClick = async (project: any) => {
    if (project.status.toLowerCase() === "draft") {
      // Draft project — open the edit form modal
      setIsDraftLoading(true);
      setSelectedDraftId(project.id);

      try {
        const response = await fetch(
          `/api/gateway/api/projects/${project.id}/revision`,
          {
            headers: {
              "X-Debug-Role": "marketing",
              "X-Debug-User": "marketing-user",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }

        const detail = await response.json();

        setFormData({
          name: detail.name || "",
          clientName: detail.clientName || "",
          startDate: detail.startDate || "",
          endDate: detail.endDate || "",
          description: detail.description || "",
          notes: detail.notes || "",
        });

        setSelectedSkills(
          (detail.projectSkills || []).map((skill: any) => ({
            id: skill.skillId,
            name: skill.skillName,
            category: "",
          })),
        );

        const loadedRequirements = (detail.resourceRequirements || []).map(
          (req: any, index: number) => ({
            id: req.requirementId
              ? req.requirementId.toString()
              : `req-${index}`,
            role: req.roleName || "",
            quantity: req.quantity ?? 1,
            experienceLevel: req.experienceLevel || "Mid",
            requiredSkills: (req.requiredSkills || []).map((skill: any) => ({
              id: skill.skillId,
              name: skill.skillName,
              category: "",
            })),
            notes: req.notes || "",
          }),
        );

        setResourceRequirements(
          loadedRequirements.length > 0
            ? loadedRequirements
            : [
                {
                  id: "1",
                  role: "",
                  quantity: 1,
                  experienceLevel: "Mid",
                  requiredSkills: [],
                  notes: "",
                },
              ],
        );

        setIsDraftModalOpen(true);
      } catch (error: any) {
        addToast({
          type: "error",
          title: "Failed to Load Draft",
          message: error.message,
        });
      } finally {
        setIsDraftLoading(false);
      }
    } else {
      // Non-draft project — show workflow visualizer
      setSelectedProject(project);
    }
  };

  // Save as Draft handler
  const handleSaveDraft = async () => {
    if (!selectedDraftId) return;

    try {
      const payload = {
        projectId: selectedDraftId,
        createdByUserId: marketingUserId,
        name: formData.name,
        clientName: formData.clientName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        notes: formData.notes,
        status: "Draft",
        skillIds: selectedSkills.map((s) => s.id),
        resourceRequirements: resourceRequirements.map((r, index) => ({
          requirementId:
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              r.id,
            )
              ? r.id
              : undefined,
          roleName: r.role,
          quantity: r.quantity,
          experienceLevel: r.experienceLevel,
          notes: r.notes,
          sortOrder: index,
          skillIds: r.requiredSkills.map((s) => s.id),
        })),
      };

      const response = await fetch(
        `/api/gateway/api/projects/${selectedDraftId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Role": "marketing",
            "X-Debug-User": "marketing-user",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to save draft");
      }

      addToast({
        type: "success",
        title: "Draft Saved",
        message: "Your project changes have been saved as draft.",
      });
      setIsDraftModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      addToast({
        type: "error",
        title: "Save Failed",
        message: error?.message || "There was an error saving your draft.",
      });
    }
  };

  // Submit to GM handler
  const handleSubmitToGM = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDraftId) return;

    // Validation
    const hasEmptyRole = resourceRequirements.some((r) => !r.role);
    if (hasEmptyRole) {
      addToast({
        type: "error",
        title: "Incomplete Resource Requirements",
        message: "Please specify a role for all resource requirements",
      });
      return;
    }

    if (selectedSkills.length === 0) {
      addToast({
        type: "error",
        title: "Skills Required",
        message: "Please select at least one required skill",
      });
      return;
    }

    try {
      const payload = {
        projectId: selectedDraftId,
        createdByUserId: marketingUserId,
        name: formData.name,
        clientName: formData.clientName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        notes: formData.notes,
        status: "Submitted",
        skillIds: selectedSkills.map((s) => s.id),
        resourceRequirements: resourceRequirements.map((r, index) => ({
          requirementId:
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
              r.id,
            )
              ? r.id
              : undefined,
          roleName: r.role,
          quantity: r.quantity,
          experienceLevel: r.experienceLevel,
          notes: r.notes,
          sortOrder: index,
          skillIds: r.requiredSkills.map((s) => s.id),
        })),
      };

      const response = await fetch(
        `/api/gateway/api/projects/${selectedDraftId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Role": "marketing",
            "X-Debug-User": "marketing-user",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit project");
      }

      addToast({
        type: "success",
        title: "Project Submitted",
        message: "Your project has been submitted to GM for approval.",
      });
      setIsDraftModalOpen(false);
      fetchProjects();
    } catch (error: any) {
      console.error(error);
      addToast({
        type: "error",
        title: "Submission Failed",
        message:
          error?.message || "There was an error submitting your project.",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Marketing Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your project proposals
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          Error loading projects: {error}
        </div>
      )}

      {isLoading && !error && (
        <div className="p-4 text-center text-gray-500 text-sm">
          Loading dashboard data...
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/marketing/projects"
          className="bg-linear-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Create New Project</h3>
          </div>
          <p className="text-sm text-purple-50">
            Submit a new project proposal
          </p>
        </Link>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Pending Review</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {
              projects.filter((p) => p.status.toLowerCase() === "submitted")
                .length
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Awaiting GM approval</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900">Needs Revision</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900">
            {
              projects.filter((p) => p.status.toLowerCase() === "rejected")
                .length
            }
          </p>
          <p className="text-sm text-gray-500 mt-1">Requires updates</p>
        </div>
      </div>

      {/* My Projects */}
      <ProjectList
        projects={projects}
        isLoading={isLoading}
        error={error}
        title="My Projects"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onProjectClick={handleProjectClick}
      />

      {/* Draft Loading Overlay */}
      {isDraftLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-xl border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-blue-600 border-r-transparent" />
            <p className="text-base font-semibold text-gray-800 tracking-tight">
              Loading project details...
            </p>
          </div>
        </div>
      )}

      {/* Draft Edit Modal */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-5 flex items-start justify-between z-10 transition-colors">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Edit Draft Project
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">
                  Update your draft project details and submit for GM review.
                </p>
              </div>
              <button
                onClick={() => setIsDraftModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              <ProjectForm
                formData={formData}
                totalResources={totalResources}
                selectedSkills={selectedSkills}
                skillCategories={skillCategories}
                allSkillItems={allSkillItems}
                resourceRequirements={resourceRequirements}
                suggestedEmployees={suggestedEmployees}
                isDraftEditMode={true}
                onFormDataChange={handleFormDataChange}
                onAddSkill={(skill) =>
                  setSelectedSkills([...selectedSkills, skill])
                }
                onRemoveSkill={(id) =>
                  setSelectedSkills(selectedSkills.filter((s) => s.id !== id))
                }
                addResourceRequirement={addResourceRequirement}
                removeResourceRequirement={removeResourceRequirement}
                updateResourceRequirement={updateResourceRequirement}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmitToGM}
              />
            </div>
          </div>
        </div>
      )}

      {/* Workflow Visualizer Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Project Workflow
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedProject.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <WorkflowVisualizer
                currentStatus={selectedProject.status as ProjectStatus}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
