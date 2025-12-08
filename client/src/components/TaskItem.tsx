
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Circle, ChevronDown, ChevronUp, SquarePen } from 'lucide-react';
import type { Task } from '../api';
import { ConfirmDialog } from './ConfirmDialog';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string, is_complete: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        onDelete(task.id);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-panel"
            style={{
                borderRadius: '1rem',
                marginBottom: '0.75rem',
                overflow: 'hidden',
                cursor: 'pointer'
            }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div
                style={{
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div
                    className="flex items-center gap-3"
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}
                >
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle(task.id, !task.is_complete);
                        }}
                        style={{
                            color: task.is_complete ? 'var(--success)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {task.is_complete ? <Check size={24} /> : <Circle size={24} />}
                    </div>

                    <span
                        style={{
                            textDecoration: task.is_complete ? 'line-through' : 'none',
                            color: task.is_complete ? 'var(--text-muted)' : 'var(--text-main)',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease',
                            marginRight: 'auto'
                        }}
                    >
                        {task.title}
                    </span>

                    <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: task.is_complete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                        color: task.is_complete ? 'var(--success)' : 'var(--text-muted)',
                        marginRight: '1rem',
                        border: '1px solid',
                        borderColor: task.is_complete ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.3)'
                    }}>
                        {task.is_complete ? 'Complete' : 'Incomplete'}
                    </span>

                    <div
                        style={{
                            color: 'var(--text-muted)',
                            display: 'flex'
                        }}
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        {task.description && (
                            <div style={{
                                padding: '0 1rem 1rem 3.5rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.95rem',
                                lineHeight: '1.5'
                            }}>
                                {task.description}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '0.75rem',
                            padding: '0 1rem 1rem 3.5rem'
                        }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(task.id);
                                }}
                                className="btn-icon"
                                style={{
                                    color: 'var(--primary)',
                                    fontSize: '0.85rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(56, 189, 248, 0.2)',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <SquarePen size={16} />
                                Edit
                            </button>
                            <button
                                onClick={handleDeleteClick}
                                className="btn-icon"
                                style={{
                                    color: 'var(--danger)',
                                    fontSize: '0.85rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    borderRadius: '0.5rem',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Trash2 size={16} />
                                Delete
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Task?"
                message="Are you sure you want to delete this task? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </motion.div>
    );
};
