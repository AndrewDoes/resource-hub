"use client";

import { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Save } from "lucide-react";
import { authorizedFetch } from "@/functions/api/authorizedFetch";
import { BackendApiUrl } from "@/functions/BackendApiUrl";

export function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validatePassword = (password: string) => {
    if (password.length < 6) return "Password must be at least 6 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one capital letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    return null;
  };

  const handleUpdatePassword = async () => {
    // Reset status
    setStatus("idle");
    setErrorMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All fields are required.");
      setStatus("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      setStatus("error");
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authorizedFetch(BackendApiUrl.userUpdatePassword, {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || errorData?.title || "Failed to update password");
      }

      setStatus("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Clear success message after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: any) {
      console.error("Failed to update password:", err);
      setErrorMessage(err.message || "An unexpected error occurred.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
          <Lock className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Password Settings
        </h2>
      </div>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Confirm your new password"
          />
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleUpdatePassword}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Updating..." : "Update Password"}
          </button>
          
          {status === "success" && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              Password updated successfully
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1.5 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {errorMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
