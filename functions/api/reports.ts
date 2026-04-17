import { BackendApiUrl } from "../BackendApiUrl";
import { authorizedFetch } from "./authorizedFetch";

export async function getReportMetrics(departmentId?: string) {
  let url = BackendApiUrl.reportsMetrics;
  if (departmentId) {
    url += `?departmentId=${departmentId}`;
  }
  const response = await authorizedFetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch report metrics");
  }
  return response.json();
}

export async function exportReport(type: number, startDate?: string, endDate?: string, departmentId?: string) {
  let url = `${BackendApiUrl.reportsExport}?type=${type}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  if (departmentId) url += `&departmentId=${departmentId}`;

  const response = await authorizedFetch(url);
  if (!response.ok) {
    throw new Error("Failed to export report");
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  
  // Extract filename from header if possible
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName = `report_${new Date().toISOString().split('T')[0]}.csv`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename=(.+)/);
    if (match) fileName = match[1];
  }

  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
