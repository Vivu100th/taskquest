const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken(): string | null {
        if (this.token) return this.token;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
        return this.token;
    }

    async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || 'Request failed');
        }

        return response.json();
    }

    // Auth
    async register(data: { email: string; username: string; password: string }) {
        const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
            method: 'POST',
            body: data,
        });
        this.setToken(res.access_token);
        return res;
    }

    async login(data: { email: string; password: string }) {
        const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: data,
        });
        this.setToken(res.access_token);
        return res;
    }

    logout() {
        this.setToken(null);
    }

    // Tasks
    async getTasks() {
        return this.request<Task[]>('/tasks');
    }

    async getTask(id: string) {
        return this.request<Task>(`/tasks/${id}`);
    }

    async createTask(data: CreateTaskDto) {
        return this.request<Task>('/tasks', { method: 'POST', body: data });
    }

    async updateTask(id: string, data: Partial<CreateTaskDto>) {
        return this.request<Task>(`/tasks/${id}`, { method: 'PATCH', body: data });
    }

    async deleteTask(id: string) {
        return this.request<{ success: boolean }>(`/tasks/${id}`, { method: 'DELETE' });
    }

    // Submissions
    async submitTask(taskId: string, data: { proofUrl: string; proofMeta?: object }) {
        return this.request<UserTask>(`/submissions/task/${taskId}`, { method: 'POST', body: data });
    }

    async getMySubmissions() {
        return this.request<UserTask[]>('/submissions/my');
    }

    async getPendingSubmissions() {
        return this.request<UserTask[]>('/submissions/pending');
    }

    async reviewSubmission(id: string, status: 'APPROVED' | 'REJECTED') {
        return this.request<UserTask>(`/submissions/${id}/review`, { method: 'POST', body: { status } });
    }

    // Gamification
    async getLeaderboard(limit = 10) {
        return this.request<LeaderboardEntry[]>(`/gamification/leaderboard?limit=${limit}`);
    }

    async getMyStats() {
        return this.request<UserStats>('/gamification/stats');
    }

    // ===== Timer Control =====
    async getActiveTask() {
        return this.request<UserTask | null>('/tasks/active');
    }

    async startTask(taskId: string, durationSeconds: number) {
        return this.request<UserTask>(`/tasks/${taskId}/start`, {
            method: 'POST',
            body: { durationSeconds },
        });
    }

    async pauseTask(taskId: string) {
        return this.request<UserTask>(`/tasks/${taskId}/pause`, { method: 'POST' });
    }

    async resumeTask(taskId: string) {
        return this.request<UserTask>(`/tasks/${taskId}/resume`, { method: 'POST' });
    }

    async completeTask(taskId: string) {
        return this.request<{ success: boolean }>(`/tasks/${taskId}/complete`, { method: 'POST' });
    }
}

// Types
export interface User {
    id: string;
    email: string;
    username: string;
    role: 'USER' | 'ADMIN' | 'MODERATOR';
    avatarUrl?: string;
    totalPoints?: number;
    currentRank?: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    categoryId: string;
    category?: { id: string; name: string };
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
    basePoints: number;
    requiresPhoto: boolean;
    requiresGps: boolean;
    creatorId?: string | null;
    creator?: User;
    active: boolean;

    // Scheduling
    startTime?: string;
    endTime?: string;
    duration?: number;
    isAllDay?: boolean;
    icon?: string;
    points?: number; // legacy support if needed
}

export interface CreateTaskDto {
    title: string;
    description?: string;
    categoryId: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EPIC';
    basePoints: number;
    requiresPhoto?: boolean;
    requiresGps?: boolean;

    // Scheduling
    startTime?: string;
    endTime?: string;
    duration?: number;
    isAllDay?: boolean;
    icon?: string;
}

export interface UserTask {
    id: string;
    userId: string;
    taskId: string;
    task?: Task;
    user?: User;
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
    proofUrl?: string;
    proofMeta?: object;
    submittedAt?: string;
    reviewedAt?: string;
    // Timer tracking
    timerStartedAt?: string;
    timerDuration?: number;
    timerPausedAt?: string;
    timerRemainingSeconds?: number;
}

export interface LeaderboardEntry {
    id: string;
    username: string;
    avatarUrl?: string;
    totalPoints: number;
    currentRank: string;
}

export interface UserStats {
    totalPoints: number;
    currentRank: string;
    completedTasks: number;
    globalRank: number;
}

export const api = new ApiClient();
