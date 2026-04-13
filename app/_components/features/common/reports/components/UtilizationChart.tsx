'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UtilizationChartProps {
  data: { dept: string; utilization: number }[];
}

export function UtilizationChart({ data }: UtilizationChartProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-tight">
        Resource Utilization by Department
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="dept" 
              stroke="#9CA3AF" 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '11px', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              stroke="#9CA3AF" 
              axisLine={false}
              tickLine={false}
              style={{ fontSize: '11px', fontWeight: 600 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ fill: '#F9FAFB' }}
              contentStyle={{
                backgroundColor: '#FFF',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              labelStyle={{ fontWeight: 700, color: '#111827', marginBottom: '4px' }}
            />
            <Bar 
              dataKey="utilization" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
              name="Utilization %" 
              barSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
