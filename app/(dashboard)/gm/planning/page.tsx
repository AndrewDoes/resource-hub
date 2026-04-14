import { Suspense } from "react";
import { Planning } from "@/app/_components/features/gm/planning/Planning";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading planning...</div>}>
      <Planning />
    </Suspense>
  );
}
