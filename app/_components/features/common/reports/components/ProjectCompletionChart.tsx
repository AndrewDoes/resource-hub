'use client';

import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProjectCompletionChartProps {
  data: { month: string; completed: number; total: number }[];
}

export function ProjectCompletionChart({ data }: ProjectCompletionChartProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Project Completion Rate</h3>
        <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
          <TrendingUp className="w-4 h-4" />
          <span className="uppercase tracking-wide">80% average completion rate</span>
        </div>
      </div>
      <div className="h-[300px] w-full">
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="month" 
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFF',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                formatter={(value) => <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCompleted)"
                name="Completed"
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                name="Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">
            Loading chart...
          </div>
        )}
      </div>
    </div>
  );
}
