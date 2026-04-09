'use client';

import { Calendar, Send, X, XCircle } from 'lucide-react';
import { RejectedProject } from '../types';

interface RejectedProjectsModalProps {
  rejectedProjects: RejectedProject[];
  onClose: () => void;
  onRevise: (project: RejectedProject) => void;
}

export function RejectedProjectsModal({
  rejectedProjects,
  onClose,
  onRevise,
}: RejectedProjectsModalProps) {
  return (
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
            onClick={onClose}
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
                onClick={() => onRevise(project)}
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
  );
}
