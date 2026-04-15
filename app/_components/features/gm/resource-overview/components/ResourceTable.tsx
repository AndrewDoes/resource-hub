"use client";

import {
  AlertTriangle,
  Award,
  Briefcase,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { ResourceSummary } from "../types";
import { getStatusColor } from "../utils";

interface ResourceTableProps {
  resources: ResourceSummary[];
}

export function ResourceTable({ resources }: ResourceTableProps) {
  const weeklyBaselineHours = 40;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Role & Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Allocated Hours (Week)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Workload (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Current Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resources.map((resource, index) => {
              const workload = Math.max(0, Math.round(resource.workload));
              const status = resource.status;
              const isOverloaded = workload > 100;

              return (
                <tr
                  key={`${resource.id}-${index}`}
                  className={`hover:bg-gray-50 transition-colors ${
                    isOverloaded
                      ? "bg-red-50/30 border-l-4 border-l-red-500"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-white font-medium text-sm">
                          {resource.avatar}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {resource.name}
                        </p>
                        {isOverloaded && (
                          <span className="text-xs text-red-600 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Over Capacity
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">
                      {resource.role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {resource.department}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          <Award className="w-3 h-3" />
                          {skill}
                        </span>
                      ))}
                      {resource.skills.length > 3 && (
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          +{resource.skills.length - 3}
                        </span>
                      )}
                      {resource.skills.length === 0 && (
                        <span className="text-xs text-gray-400 italic">
                          place holder skills
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          resource.assignedHours > weeklyBaselineHours
                            ? "text-red-600"
                            : resource.assignedHours > 28
                              ? "text-orange-600"
                              : resource.assignedHours > 16
                                ? "text-yellow-600"
                                : "text-green-600"
                        }`}
                      >
                        {resource.assignedHours}h / {weeklyBaselineHours}h
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Assigned / Weekly Capacity
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            resource.availability >= 80
                              ? "bg-green-500"
                              : resource.availability >= 50
                                ? "bg-yellow-500"
                                : resource.availability > 0
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${resource.availability}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12">
                        {resource.availability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              workload > 100
                                ? "bg-red-500"
                                : workload > 70
                                  ? "bg-orange-500"
                                  : workload > 40
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(workload, 100)}%` }}
                          ></div>
                        </div>
                        <span
                          className={`text-sm font-bold whitespace-nowrap min-w-[50px] text-right ${
                            workload > 100
                              ? "text-red-600"
                              : workload > 70
                                ? "text-orange-600"
                                : workload > 40
                                  ? "text-yellow-600"
                                  : "text-green-600"
                          }`}
                        >
                          {Math.round(workload)}%
                        </span>
                      </div>
                      <div className="absolute left-0 right-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg whitespace-nowrap">
                        workload: {Math.round(workload)}%
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {resource.currentProjects.length > 0 ? (
                      <div className="space-y-1">
                        {resource.currentProjects.map((project, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-sm"
                          >
                            <Briefcase className="w-3 h-3 text-blue-500" />
                            <span className="text-gray-900">{project}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No active assignments
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="group relative inline-block cursor-help">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(
                          status,
                        )}`}
                      >
                        {status === "available" && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                        {status === "moderate" && (
                          <TrendingUp className="w-3.5 h-3.5" />
                        )}
                        {status === "busy" && (
                          <Briefcase className="w-3.5 h-3.5" />
                        )}
                        {status === "overloaded" && (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            status === "available"
                              ? "bg-green-500"
                              : status === "moderate"
                                ? "bg-yellow-500"
                                : status === "busy"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                        ></span>
                        {status.toUpperCase()}
                      </span>
                      <div className="absolute left-0 top-full mt-1 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-lg">
                        {status === "available" &&
                          "Low workload (≤ 40%), resource has high availability"}
                        {status === "moderate" && "Balanced workload (41–70%)"}
                        {status === "busy" &&
                          "High workload (71–100%), near full capacity"}
                        {status === "overloaded" &&
                          "Work exceeds weekly capacity (>100% of baseline), needs attention"}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resources.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="p-4 bg-gray-100 rounded-full mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">
            No resources found
          </p>
          <p className="text-xs text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
