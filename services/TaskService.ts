import { API_CONFIG, withApiHeaders } from "@/services/ApiConfig";
import { Task } from "@/types/types";
import { getToken } from "@/services/auth";

export interface CreateTaskDTO {
  title: string;
  description?: string;
  dueDate?: string;
}

function authHeaders(token: string) {
  return withApiHeaders({
    Authorization: `Bearer ${token}`,
  });
}

export async function getAllTasks(): Promise<Task[]> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks`, {
    method: "GET",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
  return response.json();
}

export async function createTask(data: CreateTaskDTO): Promise<Task> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
  return response.json();
}

export async function updateTask(taskId: number, updateData: Partial<Task>): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
}

export async function deleteTask(taskId: number): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
}

export async function linkTaskToTimeBlock(taskId: number, timeblockId: string): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/${taskId}/link/${timeblockId}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
}

export async function unlinkTaskFromTimeBlock(taskId: number): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");
  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/${taskId}/unlink`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }
}

export async function getTaskById(taskId: number): Promise<Task> {
  const token = await getToken();
  if (!token) throw new Error("No auth token found.");

  const response = await fetch(`${API_CONFIG.BASE_URL}/api/tasks/${taskId}`, {
    method: "GET",
    headers: {
      ...API_CONFIG.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const err = await response.json();
      errorMsg = err.message || JSON.stringify(err);
    } catch {}
    throw new Error(`Status ${response.status}: ${errorMsg}`);
  }

  return response.json();
}
