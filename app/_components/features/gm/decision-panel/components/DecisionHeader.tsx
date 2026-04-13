'use client';

import { Zap } from 'lucide-react';

export function DecisionHeader() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-xl p-6 text-white shadow-lg mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
          <Zap className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold mb-1">Decision Panel</h1>
        </div>
      </div>
    </div>
  );
}
