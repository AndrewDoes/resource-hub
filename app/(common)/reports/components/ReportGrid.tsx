'use client';

import { FileText, Calendar, Download } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  lastGenerated: string;
  type: string;
}

interface ReportGridProps {
  reports: Report[];
}

export function ReportGrid({ reports }: ReportGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {report.lastGenerated}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {report.type}
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
