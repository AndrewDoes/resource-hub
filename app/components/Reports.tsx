'use client';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const reportTypes = [
  {
    id: '1',
    title: 'Resource Utilization Report',
    description: 'Monthly breakdown of resource allocation and availability',
    lastGenerated: '2026-04-01',
    type: 'Monthly',
  },
  {
    id: '2',
    title: 'Project Performance Report',
    description: 'Analysis of project timelines and completion rates',
    lastGenerated: '2026-04-01',
    type: 'Quarterly',
  },
  {
    id: '3',
    title: 'Hiring Demand Forecast',
    description: 'Predicted hiring needs based on upcoming projects',
    lastGenerated: '2026-03-28',
    type: 'Weekly',
  },
  {
    id: '4',
    title: 'Skills Gap Analysis',
    description: 'Identified skill shortages and training recommendations',
    lastGenerated: '2026-03-25',
    type: 'Monthly',
  },
];

const utilizationByDept = [
  { dept: 'Engineering', utilization: 92 },
  { dept: 'Design', utilization: 78 },
  { dept: 'Marketing', utilization: 65 },
  { dept: 'Sales', utilization: 88 },
  { dept: 'Support', utilization: 70 },
];

const projectCompletion = [
  { month: 'Jan', completed: 8, total: 10 },
  { month: 'Feb', completed: 12, total: 14 },
  { month: 'Mar', completed: 10, total: 12 },
  { month: 'Apr', completed: 6, total: 15 },
];

const skillDistribution = [
  { name: 'Development', value: 35, color: '#3B82F6' },
  { name: 'Design', value: 20, color: '#10B981' },
  { name: 'Marketing', value: 15, color: '#F59E0B' },
  { name: 'Management', value: 18, color: '#8B5CF6' },
  { name: 'Other', value: 12, color: '#6B7280' },
];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilization by Department */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resource Utilization by Department
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={utilizationByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="dept" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="utilization" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Skills Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={skillDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {skillDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Project Completion Rate */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Completion Rate</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>80% average completion rate</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={projectCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={2}
                name="Completed"
                dot={{ fill: '#10B981', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Total"
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
