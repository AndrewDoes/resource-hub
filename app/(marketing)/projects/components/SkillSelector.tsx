'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { skillCategories } from '../data';

interface SkillSelectorProps {
  selectedSkills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
}

export function SkillSelector({
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
}: SkillSelectorProps) {
  const [skillInput, setSkillInput] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  return (
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
        {showSkillDropdown && (
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
                        onAddSkill(skill);
                        setSkillInput('');
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
                onClick={() => onRemoveSkill(skill)}
                className="hover:bg-blue-100 rounded p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
