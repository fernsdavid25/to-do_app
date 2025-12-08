
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Delete',
    cancelText = 'Cancel'
}) => {
    const dialogContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem'
                        }}
                    >
                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-panel"
                            style={{
                                maxWidth: '450px',
                                width: '100%',
                                padding: '2rem',
                                borderRadius: '1.25rem',
                                backgroundColor: 'rgba(30, 41, 59, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Icon */}
                            <div
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    margin: '0 auto 1.5rem',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '2px solid rgba(239, 68, 68, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
                            </div>

                            {/* Title */}
                            <h2
                                style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    marginBottom: '0.75rem',
                                    textAlign: 'center',
                                    color: 'var(--text-main)'
                                }}
                            >
                                {title}
                            </h2>

                            {/* Message */}
                            <p
                                style={{
                                    color: 'var(--text-muted)',
                                    textAlign: 'center',
                                    marginBottom: '2rem',
                                    lineHeight: '1.6'
                                }}
                            >
                                {message}
                            </p>

                            {/* Buttons */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    justifyContent: 'center'
                                }}
                            >
                                <button
                                    onClick={onCancel}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        color: 'var(--text-main)',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="btn-primary"
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1.5rem',
                                        background: 'linear-gradient(135deg, var(--danger), #dc2626)',
                                        fontWeight: 600
                                    }}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    return createPortal(dialogContent, document.body);
};
