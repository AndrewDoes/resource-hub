import { Suspense } from 'react';
import { Planning } from "@/app/_components/features/gm/planning/Planning";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 animate-pulse">Loading planning data...</div>
      </div>
    }>
      <Planning />
    </Suspense>
  );
}
