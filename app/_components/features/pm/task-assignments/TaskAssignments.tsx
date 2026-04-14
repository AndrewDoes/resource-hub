"use client";

import { useEffect, useState } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import {
  fetchAllTaskAssignments,
  fetchProjectManagerProjects,
  fetchProjectManagerProjectTeam,
  createTaskAssignment,
  updateTaskAssignment,
  WORKLOAD_CONFIG,
  type ProjectTaskAssignment,
  type TaskPriority,
  type ProjectManagerProjectSummary,
  type ProjectManagerProjectTeamMember,
} from "@/functions/api/projectManager";

const defaultPmUserId = process.env.NEXT_PUBLIC_PM_USER_ID ?? "11111111-1111-1111-1111-111111111111";

interface TaskAssignmentsProps {
  pmUserId?: string;
}

interface LocalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md";
}

function Button({ size = "md", className = "", type = "button", ...props }: LocalButtonProps) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${sizeClass} ${className}`.trim()}
      {...props}
    />
  );
}

function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`.trim()}>{children}</div>;
}

function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`.trim()}
      {...props}
    />
  );
}

function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  );
}

function Badge({ className = "", children }: { className?: string; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`.trim()}>{children}</span>;
}

export function TaskAssignments({ pmUserId = defaultPmUserId }: TaskAssignmentsProps) {
  const [tasks, setTasks] = useState<ProjectTaskAssignment[]>([]);
  const [projects, setProjects] = useState<ProjectManagerProjectSummary[]>([]);
  const [teamMembers, setTeamMembers] = useState<ProjectManagerProjectTeamMember[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<ProjectTaskAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "completed">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | TaskPriority>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    projectId: "",
    employeeId: "",
    taskName: "",
    description: "",
    priority: "medium" as TaskPriority,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tasksData, projectsData] = await Promise.all([
          fetchAllTaskAssignments(pmUserId),
          fetchProjectManagerProjects(pmUserId),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pmUserId]);

  // Filter tasks
  useEffect(() => {
    let filtered = tasks;

    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.projectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filterStatus, filterPriority, searchTerm]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!formData.projectId) {
        setTeamMembers([]);
        return;
      }

      try {
        setTeamMembersLoading(true);
        const members = await fetchProjectManagerProjectTeam(pmUserId, formData.projectId);
        setTeamMembers(members);

        // Reset selected member if it no longer exists in the selected project's team.
        if (formData.employeeId && !members.some((member) => member.employeeId === formData.employeeId)) {
          setFormData((prev) => ({ ...prev, employeeId: "" }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load team members");
        setTeamMembers([]);
      } finally {
        setTeamMembersLoading(false);
      }
    };

    loadTeamMembers();
  }, [formData.projectId, pmUserId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask = await createTaskAssignment({
        ...formData,
        assignedByUserId: pmUserId,
      });
      setTasks([...tasks, newTask]);
      setFormData({
        projectId: "",
        employeeId: "",
        taskName: "",
        description: "",
        priority: "medium",
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
      });
      setTeamMembers([]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: "pending" | "in-progress" | "completed") => {
    try {
      const updatedTask = await updateTaskAssignment({
        taskId,
        status: newStatus,
      });
      setTasks(tasks.map((t) => (t.taskId === taskId ? updatedTask : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    return WORKLOAD_CONFIG[priority]?.color || "bg-blue-100 text-blue-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Assignments</h1>
          <p className="text-gray-600 mt-1">Assign tasks to team members and track workload</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Create New Task</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <Select
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  required
                  className="w-full"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Member *
                </label>
                <Select
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  required
                  disabled={!formData.projectId || teamMembersLoading || teamMembers.length === 0}
                  className="w-full"
                >
                  {!formData.projectId && <option value="">Select project first</option>}
                  {formData.projectId && teamMembersLoading && <option value="">Loading team members...</option>}
                  {formData.projectId && !teamMembersLoading && teamMembers.length === 0 && (
                    <option value="">No team members found for this project</option>
                  )}
                  {teamMembers.map((member) => (
                    <option key={member.employeeId} value={member.employeeId}>
                      {member.fullName} ({member.jobTitle})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <Input
                  type="text"
                  placeholder="What needs to be done?"
                  value={formData.taskName}
                  onChange={(e) =>
                    setFormData({ ...formData, taskName: e.target.value })
                  }
                  required
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Task description and requirements"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  required
                  className="w-full"
                >
                  <option value="low">Low (20%)</option>
                  <option value="medium">Medium (30%)</option>
                  <option value="high">High (50%)</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Task
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Filter className="w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search tasks, employees, or projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64"
        />
        <Select
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(
              e.target.value as "all" | "pending" | "in-progress" | "completed"
            )
          }
          className="w-40"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </Select>
        <Select
          value={filterPriority}
          onChange={(e) =>
            setFilterPriority(e.target.value as "all" | TaskPriority)
          }
          className="w-40"
        >
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            {tasks.length === 0
              ? "No task assignments yet. Create one to get started!"
              : "No tasks match your filters"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <Card
              key={task.taskId}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                {/* Header with status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {task.taskName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.projectName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium text-gray-900">
                      {task.employeeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Workload</p>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.workloadHours}%
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm text-gray-900">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  {task.status !== "in-progress" && (
                    <Button
                      onClick={() =>
                        handleUpdateTaskStatus(task.taskId, "in-progress")
                      }
                      size="sm"
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs"
                    >
                      Start
                    </Button>
                  )}
                  {task.status !== "completed" && (
                    <Button
                      onClick={() =>
                        handleUpdateTaskStatus(task.taskId, "completed")
                      }
                      size="sm"
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs"
                    >
                      Complete
                    </Button>
                  )}
                  {task.status !== "pending" && (
                    <Button
                      onClick={() =>
                        handleUpdateTaskStatus(task.taskId, "pending")
                      }
                      size="sm"
                      className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs"
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredTasks.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTasks.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Workload</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTasks.reduce((sum, t) => sum + t.workloadHours, 0)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredTasks.filter((t) => t.status === "in-progress").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredTasks.filter((t) => t.status === "completed").length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
