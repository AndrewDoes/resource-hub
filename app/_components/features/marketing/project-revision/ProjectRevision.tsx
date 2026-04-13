"use client";

import React, { useState, useEffect } from "react";
import { Paperclip, Plus, Save, Send, XCircle } from "lucide-react";
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

  useEffect(() => {
    const fetchRejectedProjects = async () => {
      setIsProjectsLoading(true);
      try {
        const response = await fetch(`/api/gateway/api/projects/list?status=Rejected&pageNumber=${currentPage}&pageSize=5`, {
          headers: {
            'X-Debug-Role': 'marketing',
            'X-Debug-User': 'marketing-user'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        const mappedProjects = (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          status: p.status as ProjectStatus,
          lastModified: p.startDate ? `Started ${p.startDate}` : 'Unknown',
          feedback: null 
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
      />
    </div>
  );
}
