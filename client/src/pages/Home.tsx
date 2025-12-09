import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { TaskItem } from '../components/TaskItem';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, LogOut, ArrowUpDown, Plus, CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { supabase } from '../supabase';
import { CustomDropdown } from '../components/CustomDropdown';
import { useToast } from '../components/Toast';
import { useTasks } from '../hooks/useTasks';

export const Home: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('created_at');
    const [status, setStatus] = useState('all');
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [debouncedSearch, setDebouncedSearch] = useState(search);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(handler);
    }, [search]);

    const {
        tasks,
        isLoading,
        error,
        updateTask,
        deleteTask,
    } = useTasks({
        search: debouncedSearch,
        sort,
        status,
    });

    const filteredTasks = useMemo(() => {
        return tasks;
    }, [tasks]);

    const handleToggle = async (id: string, is_complete: boolean) => {
        try {
            await updateTask(id, { is_complete });
            showToast(
                is_complete ? 'Task marked as complete!' : 'Task marked as incomplete',
                'success'
            );
        } catch (err) {
            console.error(err);
            showToast('Failed to update task', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteTask(id);
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete task', 'error');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        queryClient.removeQueries();
        navigate('/login', { replace: true });
    };

    if (authLoading) return <div>Loading...</div>;

    const sortOptions = [
        { label: 'Newest First', value: 'created_at' },
        { label: 'Name (A-Z)', value: 'name' },
        { label: 'Status', value: 'status' },
    ];

    const filterOptions = [
        { label: 'All Tasks', value: 'all' },
        { label: 'Completed', value: 'complete' },
        { label: 'Incomplete', value: 'incomplete' },
    ];

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
            >
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>My Tasks</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome, {user?.user_metadata?.full_name || user?.email}</p>
                </div>
                <button onClick={handleLogout} className="btn-icon" title="Logout">
                    <LogOut size={24} />
                </button>
            </motion.div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="glass-input"
                        style={{ paddingLeft: '3rem' }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <CustomDropdown
                    options={sortOptions}
                    value={sort}
                    onChange={setSort}
                    icon={<ArrowUpDown size={16} />}
                />

                <CustomDropdown
                    options={filterOptions}
                    value={status}
                    onChange={setStatus}
                    icon={<Filter size={16} />}
                />
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-panel"
                        style={{
                            padding: '1rem 1.5rem',
                            marginBottom: '1rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}
                    >
                        <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--danger)', flex: 1 }}>{error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {isLoading ? (
                <div className="task-list">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="glass-panel"
                            style={{
                                padding: '1rem',
                                marginBottom: '0.75rem',
                                borderRadius: '1rem',
                                height: '70px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--glass-light)',
                                        animation: 'pulse 1.5s ease-in-out infinite'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            height: '16px',
                                            width: '60%',
                                            backgroundColor: 'var(--glass-light)',
                                            borderRadius: '4px',
                                            animation: 'pulse 1.5s ease-in-out infinite'
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="task-list">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-panel"
                                style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    borderRadius: '1.5rem',
                                    marginTop: '2rem'
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto 1.5rem',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.2))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px solid rgba(56, 189, 248, 0.3)'
                                    }}
                                >
                                    {debouncedSearch || status !== 'all' ? (
                                        <Inbox size={40} style={{ color: 'var(--primary)' }} />
                                    ) : (
                                        <CheckCircle2 size={40} style={{ color: 'var(--primary)' }} />
                                    )}
                                </motion.div>
                                <h2 style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-main)'
                                }}>
                                    {debouncedSearch
                                        ? 'No tasks match your search'
                                        : status === 'complete'
                                            ? 'No completed tasks yet'
                                            : status === 'incomplete'
                                                ? 'No pending tasks'
                                                : 'No tasks yet'}
                                </h2>
                                <p style={{
                                    color: 'var(--text-muted)',
                                    marginBottom: '2rem',
                                    fontSize: '1rem'
                                }}>
                                    {debouncedSearch
                                        ? 'Try adjusting your search or filters'
                                        : status !== 'all'
                                            ? 'Change your filter to see other tasks'
                                            : 'Start by creating your first task to get organized!'}
                                </p>
                                {!debouncedSearch && status === 'all' && (
                                    <Link
                                        to="/add"
                                        className="btn-primary"
                                        style={{
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <Plus size={20} />
                                        Create Your First Task
                                    </Link>
                                )}
                            </motion.div>
                        ) : (
                            filteredTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggle}
                                    onDelete={handleDelete}
                                    onEdit={(id) => navigate(`/edit/${id}`)}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};
