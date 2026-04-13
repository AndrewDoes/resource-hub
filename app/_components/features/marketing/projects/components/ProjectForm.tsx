"use client";

import React from "react";
import { Paperclip, Plus, Save, Send } from "lucide-react";
import { ProjectBasicInfo } from "./ProjectBasicInfo";
import { SkillSelector } from "./SkillSelector";
import { ResourceRequirementItem } from "./ResourceRequirementItem";
import { SuggestedResources } from "./SuggestedResources";

import {
  ProjectFormData,
  ResourceRequirement,
  SkillItem,
  SuggestedEmployee,
} from "../types";

export interface ProjectFormProps {
  formData: ProjectFormData;
  totalResources: number;
  selectedSkills: SkillItem[];
  skillCategories: Record<string, SkillItem[]>;
  allSkillItems: SkillItem[];
  resourceRequirements: ResourceRequirement[];
  suggestedEmployees: SuggestedEmployee[];
  isRevisionMode?: boolean;

  onFormDataChange: (field: keyof ProjectFormData, value: string) => void;
  onAddSkill: (skill: SkillItem) => void;
  onRemoveSkill: (skillId: string) => void;
  addResourceRequirement: () => void;
  removeResourceRequirement: (id: string) => void;
  updateResourceRequirement: (
    id: string,
    field: keyof ResourceRequirement,
    value: any
  ) => void;
  onSaveDraft: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProjectForm({
  formData,
  totalResources,
  selectedSkills,
  skillCategories,
  allSkillItems,
  resourceRequirements,
  suggestedEmployees,
  isRevisionMode,
  onFormDataChange,
  onAddSkill,
  onRemoveSkill,
  addResourceRequirement,
  removeResourceRequirement,
  updateResourceRequirement,
  onSaveDraft,
  onSubmit,
}: ProjectFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Project Basic Info */}
      <ProjectBasicInfo
        totalResources={totalResources}
        formData={formData}
        onFormDataChange={onFormDataChange}
        isRevisionMode={isRevisionMode}
      />

      {/* Required Skills */}
      <SkillSelector
        selectedSkills={selectedSkills}
        onAddSkill={onAddSkill}
        onRemoveSkill={onRemoveSkill}
        skillCategories={skillCategories}
      />

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
            <ResourceRequirementItem
              key={resource.id}
              resource={resource}
              index={index}
              onUpdate={updateResourceRequirement}
              onRemove={removeResourceRequirement}
              showRemove={resourceRequirements.length > 1}
              allSkills={allSkillItems}
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
          value={formData.notes}
          onChange={(e) => onFormDataChange("notes", e.target.value)}
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
          onClick={onSaveDraft}
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
  );
}
