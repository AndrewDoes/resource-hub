import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Sub-components
import { ReportGrid } from './components/ReportGrid';
import { UtilizationChart } from './components/UtilizationChart';
import { SkillsPieChart } from './components/SkillsPieChart';
import { ProjectCompletionChart } from './components/ProjectCompletionChart';


// Data
import { reportTypes, utilizationByDept, skillDistribution, projectCompletion } from './data';


export function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and download comprehensive reports
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <FileText className="w-4 h-4" />
          Generate Custom Report
        </button>
      </div>

      {/* Available Reports */}
      <ReportGrid reports={reportTypes} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Department */}
        <UtilizationChart data={utilizationByDept} />

        {/* Skills Distribution */}
        <SkillsPieChart data={skillDistribution} />

        {/* Project Completion Rate */}
        <ProjectCompletionChart data={projectCompletion} />
      </div>
    </div>
  );
}
