"use client";

import React, { useState } from "react";
import { Paperclip, Plus, Save, Send, XCircle } from "lucide-react";
import { useFeedbackToast } from "@/app/context/ToastContext";
import { WorkflowVisualizer } from "@/app/_components/system/WorkflowSystem";
import type { ProjectStatus } from "@/app/_components/system/WorkflowSystem";

// Types, Data
import {
  ResourceRequirement,
  RejectedProject,
  SuggestedEmployee,
} from "./types";
import { rejectedProjects } from "./data";

// Sub-components
import { ProjectBasicInfo } from "./components/ProjectBasicInfo";
import { SkillSelector } from "./components/SkillSelector";
import { ResourceRequirementItem } from "./components/ResourceRequirementItem";
import { SuggestedResources } from "./components/SuggestedResources";
import { RejectedProjectsModal } from "./components/RejectedProjectsModal";

export function ProjectEntry() {
  const { addToast } = useFeedbackToast();

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("draft");
  const [showRejectedProjects, setShowRejectedProjects] = useState(false);
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
    field: string | number | symbol,
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

  const handleSaveDraft = () => {
    setProjectStatus("draft");
    addToast({
      type: "success",
      title: "Draft Saved",
      message: "Your project proposal has been saved as draft",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    setProjectStatus("submitted");
    addToast({
      type: "success",
      title: "Project Submitted",
      message: "Your proposal has been sent to GM for approval",
    });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Basic Info */}
              <ProjectBasicInfo totalResources={totalResources} />

              {/* Required Skills */}
              <SkillSelector
                selectedSkills={selectedSkills}
                onAddSkill={(skill) =>
                  setSelectedSkills([...selectedSkills, skill])
                }
                onRemoveSkill={(skill) =>
                  setSelectedSkills(selectedSkills.filter((s) => s !== skill))
                }
              />

              {/* Resource Requirements Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Resource Requirements{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-600">
                      Define resource roles clearly to improve assignment
                      accuracy
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
                    <ResourceRequirementItem
                      key={resource.id}
                      resource={resource}
                      index={index}
                      onUpdate={updateResourceRequirement}
                      onRemove={removeResourceRequirement}
                      showRemove={resourceRequirements.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Suggested Resource Match */}
              <SuggestedResources suggestedEmployees={suggestedEmployees} />

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
        <RejectedProjectsModal
          rejectedProjects={rejectedProjects}
          onClose={() => setShowRejectedProjects(false)}
          onRevise={handleReviseRejected}
        />
      )}
    </div>
  );
}
