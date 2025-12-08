
import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Task {
    id: string;
    title: string;
    description?: string;
    is_complete: boolean;
    created_at: string;
}

export const api = axios.create({
    baseURL: API_URL,
});

// Add a request interceptor to include the Auth Token
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export const getTasks = async (search?: string, sort?: string, status?: string) => {
    const params: any = {};
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (status) params.status = status;

    const response = await api.get<Task[]>('/tasks', { params });
    return response.data;
};

export const createTask = async (title: string, description?: string) => {
    const response = await api.post<Task>('/tasks', { title, description });
    return response.data;
};

export const updateTask = async (id: string, updates: Partial<Task>) => {
    const response = await api.put<Task>(`/tasks/${id}`, updates);
    return response.data;
};

export const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
};
