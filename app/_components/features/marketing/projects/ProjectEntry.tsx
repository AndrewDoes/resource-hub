"use client";

import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import { useFeedbackToast } from "@/app/context/ToastContext";
import { WorkflowVisualizer } from "@/app/_components/system/WorkflowSystem";
import type { ProjectStatus } from "@/app/_components/system/WorkflowSystem";

// Types, Data
import {
  ResourceRequirement,
  RejectedProject,
  SuggestedEmployee,
  SkillItem,
  ProjectFormData,
} from "./types";
import { rejectedProjects } from "./data";

// Sub-components
import { RejectedProjectsModal } from "./components/RejectedProjectsModal";
import { ProjectForm } from "./components/ProjectForm";

export function ProjectEntry() {
  const { addToast } = useFeedbackToast();
  const marketingUserId =
    process.env.NEXT_PUBLIC_MARKETING_ID ??
    "58032228-86c3-4dce-b591-ca24c1f7a9e1";

  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    clientName: "",
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("draft");
  const [showRejectedProjects, setShowRejectedProjects] = useState(false);
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
        createdByUserId: marketingUserId,
        name: formData.name,
        clientName: formData.clientName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        skillIds: selectedSkills.map((s) => s.id),
        resourceRequirements: resourceRequirements.map((r, index) => ({
          roleName: r.role,
          quantity: r.quantity,
          experienceLevel: r.experienceLevel,
          notes: r.notes,
          sortOrder: index,
          skillIds: r.requiredSkills.map((s) => s.id),
        })),
      };

      const response = await fetch("/api/gateway/api/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Role": "marketing",
          "X-Debug-User": "marketing-user",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit project");
      }

      setProjectStatus("submitted");
      addToast({
        type: "success",
        title: "Project Submitted",
        message: "Your proposal has been sent to GM for approval",
      });
    } catch (error) {
      console.error(error);
      addToast({
        type: "error",
        title: "Submission Failed",
        message: "There was an error submitting your project.",
      });
    }
  };

  const handleReviseRejected = (project: RejectedProject) => {
    setShowRejectedProjects(false);
    // In a real app, would populate form with rejected project data
    addToast({
      type: "info",
      title: "Revising Project",
      message: `Revising ${project.name}. Update the details and resubmit for GM review.`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Create New Project
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Marketing Department - Project Request Form
          </p>
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
            <ProjectForm
              formData={formData}
              totalResources={totalResources}
              selectedSkills={selectedSkills}
              skillCategories={skillCategories}
              allSkillItems={allSkillItems}
              resourceRequirements={resourceRequirements}
              suggestedEmployees={suggestedEmployees}
              onFormDataChange={handleFormDataChange}
              onAddSkill={(skill) => setSelectedSkills([...selectedSkills, skill])}
              onRemoveSkill={(skillId) => setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId))}
              addResourceRequirement={addResourceRequirement}
              removeResourceRequirement={removeResourceRequirement}
              updateResourceRequirement={updateResourceRequirement}
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        {/* Workflow Sidebar - 1 column */}
        <div className="lg:col-span-1">
          <WorkflowVisualizer currentStatus={projectStatus} />
        </div>
      </div>

      {/* Rejected Projects Modal */}
      {showRejectedProjects && (
        <RejectedProjectsModal
          rejectedProjects={rejectedProjects}
          onClose={() => setShowRejectedProjects(false)}
          onRevise={handleReviseRejected}
        />
      )}
    </div>
  );
}
