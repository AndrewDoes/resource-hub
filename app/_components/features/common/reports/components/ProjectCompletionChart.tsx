'use client';

import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectCompletionChartProps {
  data: { month: string; completed: number; total: number }[];
}

export function ProjectCompletionChart({ data }: ProjectCompletionChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Completion Rate</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span>80% average completion rate</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
  );
}
