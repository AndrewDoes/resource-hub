"use client";

import React, { useRef, useState } from "react";
import { Paperclip, Plus, Save, Send, X } from "lucide-react";
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
  isDraftEditMode?: boolean;
  isSubmitting?: boolean;
  uploadErrors?: string[];

  onFormDataChange: (field: keyof ProjectFormData, value: any) => void;
  onAddSkill: (skill: SkillItem) => void;
  onRemoveSkill: (skillId: string) => void;
  addResourceRequirement: () => void;
  removeResourceRequirement: (id: string) => void;
  updateResourceRequirement: (
    id: string,
    field: keyof ResourceRequirement,
    value: any,
  ) => void;
  onSaveDraft: () => void;
  onCancel?: () => void;
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
  isDraftEditMode,
  isSubmitting,
  uploadErrors,
  onFormDataChange,
  onAddSkill,
  onRemoveSkill,
  addResourceRequirement,
  removeResourceRequirement,
  updateResourceRequirement,
  onSaveDraft,
  onCancel,
  onSubmit,
}: ProjectFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  ];

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} exceeds the 10MB limit.`;
    }
    if (!file.type.startsWith("image/") && !ALLOWED_TYPES.includes(file.type)) {
      return `File ${file.name} has an unsupported format.`;
    }
    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: File[]) => {
    let errorMsg = null;
    const validFiles: File[] = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errorMsg = error;
      } else {
        validFiles.push(file);
      }
    });

    setFileError(errorMsg);

    if (validFiles.length > 0) {
      const currentFiles = formData.attachments || [];
      onFormDataChange("attachments", [...currentFiles, ...validFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = (formData.attachments || []).filter(
      (_, index) => index !== indexToRemove,
    );
    onFormDataChange("attachments", newFiles);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {isRevisionMode && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
            {formData.rejectionReason || "No rejection reason was provided."}
          </p>
        </div>
      )}

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

      {/* Commented SuggestedResources since this is hardcoded */}
      {/* Suggested Resource Match */}
      {/* <SuggestedResources suggestedEmployees={suggestedEmployees} /> */}

      {/* Project Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) => onFormDataChange("description", e.target.value)}
          placeholder="Describe the project scope, objectives, and key deliverables..."
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
        ></textarea>
      </div>

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
      {!isRevisionMode && !isDraftEditMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachments
          </label>

          <input
            type="file"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <Paperclip
              className={`w-8 h-8 mx-auto mb-2 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
            />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, XLS, or images (max 10MB)
            </p>
          </div>

          {fileError && (
            <p className="mt-2 text-sm text-red-600 font-medium">{fileError}</p>
          )}

          {uploadErrors && uploadErrors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-red-600 font-medium">Upload Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {uploadErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* File Previews */}
          {formData.attachments && formData.attachments.length > 0 && (
            <ul className="mt-4 space-y-2">
              {formData.attachments.map((file, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Paperclip className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 shrink-0">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {!isRevisionMode && !isDraftEditMode && (
          <>
            <button
              type="button"
              onClick={() => onCancel?.()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
          </>
        )}
        {isDraftEditMode && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all"
          >
            <Save className="w-4 h-4" />
            Save as Draft
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-sm hover:shadow-md ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Submitting..." : "Submit to GM"}
        </button>
      </div>
    </form>
  );
}
