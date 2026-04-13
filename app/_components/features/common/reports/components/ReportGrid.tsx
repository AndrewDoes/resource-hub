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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-white rounded-xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{report.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">{report.description}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-gray-50">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                <Calendar className="w-3.5 h-3.5" />
                {report.lastGenerated}
              </span>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md font-bold uppercase tracking-wider">
                {report.type}
              </span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm cursor-pointer">
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
