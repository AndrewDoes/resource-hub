"use client";

import React, { useState, useEffect } from "react";
import { Paperclip, Plus, Save, Send, XCircle, X } from "lucide-react";
import { useFeedbackToast } from "@/app/context/ToastContext";
import { WorkflowVisualizer } from "@/app/_components/system/WorkflowSystem";
import type { ProjectStatus } from "@/app/_components/system/WorkflowSystem";
import { RejectedProjectsModal } from "../projects/components/RejectedProjectsModal";
import { rejectedProjects } from "../projects/data";
import { SuggestedResources } from "../projects/components/SuggestedResources";
import { ResourceRequirementItem } from "../projects/components/ResourceRequirementItem";
import { SkillSelector } from "../projects/components/SkillSelector";
import { ProjectBasicInfo } from "../projects/components/ProjectBasicInfo";
import {
  ProjectFormData,
  RejectedProject,
  ResourceRequirement,
  SkillItem,
  SuggestedEmployee,
} from "../projects/types";
import { ProjectForm } from "../projects/components/ProjectForm";
import { ProjectList } from "./ProjectList";

export function ProjectRevision() {
  const { addToast } = useFeedbackToast();
  const marketingUserId =
    process.env.NEXT_PUBLIC_MARKETING_ID ??
    "58032228-86c3-4dce-b591-ca24c1f7a9e1";

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    clientName: "",
    startDate: "",
    endDate: "",
    description: "",
    notes: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("draft");
  const [showRejectedProjects, setShowRejectedProjects] = useState(false);
  const [allSkillItems, setAllSkillItems] = useState<SkillItem[]>([]);
  const [skillCategories, setSkillCategories] = useState<
    Record<string, SkillItem[]>
  >({});

  const [rejectedProjectsList, setRejectedProjectsList] = useState<any[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchRejectedProjects = async () => {
      setIsProjectsLoading(true);
      try {
        const response = await fetch(
          `/api/gateway/api/projects/list?status=Rejected&pageNumber=${currentPage}&pageSize=5`,
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
        const mappedProjects = (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status as ProjectStatus,
          lastModified: p.startDate ? `Started ${p.startDate}` : "Unknown",
          feedback: null,
        }));

        setRejectedProjectsList(mappedProjects);
        setTotalPages(data.totalPages || 1);
      } catch (err: any) {
        setProjectsError(err.message);
      } finally {
        setIsProjectsLoading(false);
      }
    };

    fetchRejectedProjects();
  }, [currentPage]);

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

  // Resource requirement functions
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

  // Calculate total resources automatically
  const totalResources = resourceRequirements.reduce(
    (sum, req) => sum + req.quantity,
    0,
  );

  // Mock suggested employees based on skills
  const suggestedEmployees: SuggestedEmployee[] =
    selectedSkills.length > 0
      ? [
          {
            name: "Agus Pratama",
            skills: ["Critical Thinking", "Leadership", "Project Management"],
            match: 85,
          },
          {
            name: "Budi Santoso",
            skills: ["Node.js", "API Development", "Backend"],
            match: 92,
          },
          {
            name: "Sarah Chen",
            skills: ["React", "UI/UX Design", "Frontend"],
            match: 88,
          },
        ]
      : [];

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
        addToast({
          type: "error",
          title: "Error Loading Skills",
          message: "Failed to load skills from the database.",
        });
      }
    };
    fetchSkills();
  }, [addToast]);

  const handleFormDataChange = (
    field: keyof ProjectFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    setProjectStatus("draft");
    addToast({
      type: "success",
      title: "Draft Saved",
      message: "Your project proposal has been saved as draft",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProjectId) {
      addToast({
        type: "error",
        title: "No Project Selected",
        message: "Please select a rejected project before submitting.",
      });
      return;
    }

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
        projectId: selectedProjectId,
        createdByUserId: marketingUserId,
        name: formData.name,
        clientName: formData.clientName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
        notes: formData.notes,
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
        `/api/gateway/api/projects/${selectedProjectId}`,
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
        throw new Error(errorText || "Failed to update project");
      }

      setProjectStatus("draft");
      addToast({
        type: "success",
        title: "Project Updated",
        message:
          "Your revised proposal has been saved as draft and sent to GM for approval",
      });
      setIsModalOpen(false);
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

  const handleProjectClick = async (project: any) => {
    setIsDetailLoading(true);
    setSelectedProjectId(project.id);

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
        throw new Error("Failed to fetch project revision details");
      }

      const revisionDetail = await response.json();

      setFormData({
        name: revisionDetail.name || "",
        clientName: revisionDetail.clientName || "",
        startDate: revisionDetail.startDate || "",
        endDate: revisionDetail.endDate || "",
        description: revisionDetail.description || "",
        notes: revisionDetail.notes || "",
        rejectionReason: revisionDetail.rejectionReason || "",
      });

      setSelectedSkills(
        (revisionDetail.projectSkills || []).map((skill: any) => ({
          id: skill.skillId,
          name: skill.skillName,
          category: "",
        })),
      );

      const loadedResourceRequirements = (
        revisionDetail.resourceRequirements || []
      ).map((req: any, index: number) => ({
        id: req.requirementId ? req.requirementId.toString() : `req-${index}`,
        role: req.roleName || "",
        quantity: req.quantity ?? 1,
        experienceLevel: req.experienceLevel || "Mid",
        requiredSkills: (req.requiredSkills || []).map((skill: any) => ({
          id: skill.skillId,
          name: skill.skillName,
          category: "",
        })),
        notes: req.notes || "",
      }));

      setResourceRequirements(
        loadedResourceRequirements.length > 0
          ? loadedResourceRequirements
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

      setIsModalOpen(true);
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Failed to Fetch Data",
        message: error.message,
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Revision
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Marketing Department - Revise and resubmit your project proposals
            based on GM feedback
          </p>
        </div>
      </div>

      <ProjectList
        projects={rejectedProjectsList}
        isLoading={isProjectsLoading}
        error={projectsError}
        title="Rejected Projects"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onProjectClick={handleProjectClick}
      />

      {isDetailLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-xl border border-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-blue-600 border-r-transparent" />
            <p className="text-base font-semibold text-gray-800 tracking-tight">
              Loading project details...
            </p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all duration-300 ease-out backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-gray-200">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-5 flex items-start justify-between z-10 transition-colors">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Revise Project
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">
                  Update your project proposal details and resubmit for GM
                  review.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
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
                isRevisionMode={true}
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
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
