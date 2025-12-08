import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback, useRef } from 'react';
import { type Task, getTasks, updateTask, deleteTask, createTask } from '../api';
import { supabase } from '../supabase';
import { useAuth } from '../AuthContext';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseTasksOptions {
    search?: string;
    sort?: string;
    status?: string;
}

interface TaskPayload {
    id: string;
    title: string;
    description?: string;
    is_complete: boolean;
    created_at: string;
    user_id: string;
}

export const useTasks = (options: UseTasksOptions = {}) => {
    const { search = '', sort = 'created_at', status = 'all' } = options;
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const channelRef = useRef<RealtimeChannel | null>(null);

    const queryKey = ['tasks', search, sort, status];

    const {
        data: tasks = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey,
        queryFn: () => getTasks(search, sort, status),
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: true,
    });

    const handleRealtimeChange = useCallback((
        payload: RealtimePostgresChangesPayload<TaskPayload>
    ) => {
        if (payload.new && 'user_id' in payload.new && payload.new.user_id !== user?.id) {
            return;
        }
        if (payload.old && 'user_id' in payload.old && payload.old.user_id !== user?.id) {
            return;
        }

        queryClient.setQueryData<Task[]>(queryKey, (oldTasks = []) => {
            switch (payload.eventType) {
                case 'INSERT': {
                    const newTask = payload.new as TaskPayload;
                    if (oldTasks.some(t => t.id === newTask.id)) {
                        return oldTasks;
                    }
                    const taskToAdd: Task = {
                        id: newTask.id,
                        title: newTask.title,
                        description: newTask.description,
                        is_complete: newTask.is_complete,
                        created_at: newTask.created_at
                    };
                    return [taskToAdd, ...oldTasks];
                }
                case 'UPDATE': {
                    const updatedTask = payload.new as TaskPayload;
                    return oldTasks.map(task =>
                        task.id === updatedTask.id
                            ? {
                                ...task,
                                title: updatedTask.title,
                                description: updatedTask.description,
                                is_complete: updatedTask.is_complete
                            }
                            : task
                    );
                }
                case 'DELETE': {
                    const deletedTask = payload.old as TaskPayload;
                    return oldTasks.filter(task => task.id !== deletedTask.id);
                }
                default:
                    return oldTasks;
            }
        });

        queryClient.invalidateQueries({
            queryKey: ['tasks'],
            refetchType: 'none'
        });
    }, [queryClient, queryKey, user?.id]);

    useEffect(() => {
        if (!user) return;

        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        const channel = supabase
            .channel(`tasks-realtime-${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${user.id}`
                },
                handleRealtimeChange
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tasks',
                    filter: `user_id=eq.${user.id}`
                },
                handleRealtimeChange
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'tasks'
                },
                handleRealtimeChange
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Realtime subscription active');
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [user, handleRealtimeChange]);

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
            updateTask(id, updates),
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey });

            const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

            queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
                old.map(task => (task.id === id ? { ...task, ...updates } : task))
            );

            return { previousTasks };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: (id: string) => deleteTask(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey });

            const previousTasks = queryClient.getQueryData<Task[]>(queryKey);

            queryClient.setQueryData<Task[]>(queryKey, (old = []) =>
                old.filter(task => task.id !== id)
            );

            return { previousTasks };
        },
        onError: (_err, _id, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(queryKey, context.previousTasks);
            }
        },
    });

    const createTaskMutation = useMutation({
        mutationFn: ({ title, description }: { title: string; description?: string }) =>
            createTask(title, description),
        onSuccess: (newTask) => {
            queryClient.setQueryData<Task[]>(queryKey, (old = []) => {
                if (old.some(t => t.id === newTask.id)) {
                    return old;
                }
                return [newTask, ...old];
            });
        },
    });

    return {
        tasks,
        isLoading,
        error: error ? String(error) : null,
        refetch,
        updateTask: (id: string, updates: Partial<Task>) =>
            updateTaskMutation.mutateAsync({ id, updates }),
        deleteTask: (id: string) => deleteTaskMutation.mutateAsync(id),
        createTask: (title: string, description?: string) =>
            createTaskMutation.mutateAsync({ title, description }),
        isUpdating: updateTaskMutation.isPending,
        isDeleting: deleteTaskMutation.isPending,
        isCreating: createTaskMutation.isPending,
    };
};

export const useTask = (id: string) => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['task', id],
        queryFn: async () => {
            const tasks = await getTasks();
            return tasks.find(t => t.id === id) || null;
        },
        enabled: !!user && !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
};
