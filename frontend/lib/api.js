const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

// Dashboard
export const getDashboardStats = () => request('/api/dashboard/stats');

// Agents
export const getAgents = () => request('/api/agents');
export const getAgent = (id) => request(`/api/agents/${id}`);
export const createAgent = (data) => request('/api/agents', { method: 'POST', body: data });
export const updateAgent = (id, data) => request(`/api/agents/${id}`, { method: 'PUT', body: data });
export const deleteAgent = (id) => request(`/api/agents/${id}`, { method: 'DELETE' });

// Tasks
export const getTasks = (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/tasks${qs ? '?' + qs : ''}`);
};
export const getTask = (id) => request(`/api/tasks/${id}`);
export const launchTask = (data) => request('/api/tasks/launch', { method: 'POST', body: data });
export const cancelTask = (id) => request(`/api/tasks/${id}/cancel`, { method: 'POST' });
export const getTaskLogs = (id) => request(`/api/tasks/${id}/logs`);

// Workflows
export const getWorkflows = () => request('/api/workflows');
export const getWorkflow = (id) => request(`/api/workflows/${id}`);
export const createWorkflow = (data) => request('/api/workflows', { method: 'POST', body: data });
export const updateWorkflow = (id, data) => request(`/api/workflows/${id}`, { method: 'PUT', body: data });
export const deleteWorkflow = (id) => request(`/api/workflows/${id}`, { method: 'DELETE' });
export const executeWorkflow = (id) => request(`/api/workflows/${id}/execute`, { method: 'POST' });

// Oversight
export const getOversightQueue = (status = 'pending') => request(`/api/oversight/queue?status=${status}`);
export const approveOversight = (id, notes) => request(`/api/oversight/${id}/approve`, { method: 'POST', body: { notes } });
export const rejectOversight = (id, notes) => request(`/api/oversight/${id}/reject`, { method: 'POST', body: { notes } });

// Settings
export const getSettings = () => request('/api/settings');
export const updateSettings = (data) => request('/api/settings', { method: 'PUT', body: data });
export const getHealth = () => request('/api/health');
