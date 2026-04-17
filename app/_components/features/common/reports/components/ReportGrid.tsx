'use client';

import { useState } from 'react';
import { FileText, Calendar, Download, Loader2 } from 'lucide-react';
import { exportReport } from '@/functions/api/reports';

const reportTypes = [
  {
    id: '0', // Utilization
    title: 'Resource Utilization Report',
    description: 'Detailed analysis of employee workloads and departmental efficiency.',
  },
  {
    id: '1', // Project Performance
    title: 'Project Performance Report',
    description: 'Comprehensive view of project timelines, progress, and resource health.',
  },
  {
    id: '2', // Hiring Forecast
    title: 'Hiring Demand Forecast',
    description: 'Projected headcount needs based on unfilled project requirements.',
  },
  {
    id: '3', // Skills Gap
    title: 'Skills Gap Analysis',
    description: 'Comparison of organizational skill supply vs. project demand.',
  },
];

export function ReportGrid() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    setDownloadingId(id);
    try {
      await exportReport(parseInt(id));
    } catch (err) {
      console.error(err);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {reportTypes.map((report) => (
        <div
          key={report.id}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />

          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-extrabold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors tracking-tight">
                {report.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {report.description}
              </p>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center justify-end pt-6 border-t border-gray-100/50 relative z-10">
            <button
              onClick={() => handleDownload(report.id)}
              disabled={downloadingId !== null}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-blue-600 bg-white border-2 border-blue-50 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
            >
              {downloadingId === report.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {downloadingId === report.id ? 'Generating...' : 'Download CSV'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
