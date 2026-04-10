'use client';

import { useState } from 'react';
import { Users, Trash2, X } from 'lucide-react';
import { ResourceRequirement, SkillItem } from '../types';
import { roleOptions, experienceLevels } from '../data';
// import { allSkills } from '../data';

interface ResourceRequirementItemProps {
  resource: ResourceRequirement;
  index: number;
  onUpdate: (id: string, field: keyof ResourceRequirement, value: any) => void;
  onRemove: (id: string) => void;
  showRemove: boolean;
  allSkills: SkillItem[];
}

export function ResourceRequirementItem({
  resource,
  index,
  onUpdate,
  onRemove,
  showRemove,
  allSkills
}: ResourceRequirementItemProps) {
  const [skillInput, setSkillInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const addSkill = (skill: SkillItem) => {
    if (!resource.requiredSkills.some(s => s.id === skill.id)) {
      onUpdate(resource.id, 'requiredSkills', [...resource.requiredSkills, skill]);
      setSkillInput('');
      setShowDropdown(false);
    }
  };

  const removeSkill = (skillId: string) => {
    onUpdate(
      resource.id,
      'requiredSkills',
      resource.requiredSkills.filter((s) => s.id !== skillId)
    );
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">
            Resource #{index + 1}
          </h4>
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(resource.id)}
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
            onChange={(e) => onUpdate(resource.id, 'role', e.target.value)}
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
              onUpdate(resource.id, 'quantity', parseInt(e.target.value) || 1)
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
            onChange={(e) => onUpdate(resource.id, 'experienceLevel', e.target.value)}
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
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search skills for this role..."
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDropdown && skillInput && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {allSkills
                .filter(
                  (skill) =>
                    skill.name.toLowerCase().includes(skillInput.toLowerCase()) &&
                    !resource.requiredSkills.some(s => s.id === skill.id)
                )
                .map((skill) => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  >
                    {skill.name}
                  </button>
                ))}
            </div>
          )}
        </div>
        {resource.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {resource.requiredSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
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
          onChange={(e) => onUpdate(resource.id, 'notes', e.target.value)}
          placeholder="Additional requirements or preferences..."
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
