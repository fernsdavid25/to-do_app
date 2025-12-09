

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useTasks, useTask } from '../hooks/useTasks';

const MAX_TITLE_LENGTH = 200;

export const EditTask: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const { data: task, isLoading: initialLoading } = useTask(id || '');
    const { updateTask } = useTasks();

    useEffect(() => {
        if (task && !isInitialized) {
            setTitle(task.title);
            setDescription(task.description || '');
            setIsInitialized(true);
        } else if (!initialLoading && !task && id) {
            setError('Task not found');
            setTimeout(() => navigate('/'), 2000);
        }
    }, [task, initialLoading, id, navigate, isInitialized]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setTouched(true);

        if (!title.trim()) {
            setError('Task name is required');
            showToast('Task name is required', 'error');
            return;
        }

        if (title.length > MAX_TITLE_LENGTH) {
            setError(`Task name must be less than ${MAX_TITLE_LENGTH} characters`);
            showToast(`Task name must be less than ${MAX_TITLE_LENGTH} characters`, 'error');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (id) {
                await updateTask(id, { title: title.trim(), description: description.trim() || undefined });
            }
            showToast('Task updated successfully!', 'success');
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Failed to update task. Please check your connection and try again.');
            showToast('Failed to update task', 'error');
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (initialLoading) {
        return (
            <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                >
                    <Loader2
                        size={40}
                        style={{
                            color: 'var(--primary)',
                            animation: 'spin 1s linear infinite'
                        }}
                    />
                    <p style={{ color: 'var(--text-muted)' }}>Loading task...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="page-title">Edit Task</h1>

                {/* Error Message */}
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
                            <AlertCircle size={20} style={{ color: 'var(--danger)' }} />
                            <span style={{ color: 'var(--danger)' }}>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="title"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            Task Name
                            <span style={{
                                float: 'right',
                                fontSize: '0.8rem',
                                color: title.length > MAX_TITLE_LENGTH ? 'var(--danger)' :
                                    title.length >= MAX_TITLE_LENGTH * 0.9 ? 'var(--warning, #eab308)' : 'var(--text-muted)'
                            }}>
                                {title.length}/{MAX_TITLE_LENGTH}
                            </span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (touched && e.target.value.trim()) {
                                    setError(null);
                                }
                            }}
                            onBlur={() => setTouched(true)}
                            onKeyDown={handleKeyDown}
                            className="glass-input"
                            placeholder="What needs to be done?"
                            style={{
                                borderColor: (touched && !title.trim()) || title.length > MAX_TITLE_LENGTH ? 'var(--danger)' : undefined
                            }}
                        />
                        {(touched && !title.trim()) || title.length > MAX_TITLE_LENGTH ? (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{
                                    color: 'var(--danger)',
                                    fontSize: '0.85rem',
                                    marginTop: '0.5rem'
                                }}
                            >
                                {!title.trim() ? 'Task name cannot be empty' : `Task name exceeds ${MAX_TITLE_LENGTH} characters`}
                            </motion.p>
                        ) : null}
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="description"
                            style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                fontWeight: 500
                            }}
                        >
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={(e) => {
                                // Allow Shift+Enter for new lines
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            className="glass-input"
                            placeholder="Add more details..."
                            rows={3}
                            style={{ resize: 'vertical', minHeight: '80px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            style={{ padding: '0.75rem 1.5rem', color: 'var(--text-muted)', fontWeight: 600 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !title.trim() || title.length > MAX_TITLE_LENGTH}
                            style={{
                                opacity: (loading || !title.trim() || title.length > MAX_TITLE_LENGTH) ? 0.5 : 1,
                                cursor: (loading || !title.trim() || title.length > MAX_TITLE_LENGTH) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
