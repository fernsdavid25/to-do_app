
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'info':
                return <AlertCircle size={20} />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'rgba(16, 185, 129, 0.15)',
                    border: 'rgba(16, 185, 129, 0.4)',
                    color: 'var(--success)'
                };
            case 'error':
                return {
                    bg: 'rgba(239, 68, 68, 0.15)',
                    border: 'rgba(239, 68, 68, 0.4)',
                    color: 'var(--danger)'
                };
            case 'info':
                return {
                    bg: 'rgba(56, 189, 248, 0.15)',
                    border: 'rgba(56, 189, 248, 0.4)',
                    color: 'var(--primary)'
                };
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxWidth: '400px'
                }}
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => {
                        const styles = getStyles(toast.type);
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="glass-panel"
                                style={{
                                    padding: '1rem 1.25rem',
                                    backgroundColor: styles.bg,
                                    border: `1px solid ${styles.border}`,
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <div style={{ color: styles.color, flexShrink: 0 }}>
                                    {getIcon(toast.type)}
                                </div>
                                <span
                                    style={{
                                        color: 'var(--text-main)',
                                        flex: 1,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {toast.message}
                                </span>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--text-main)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-muted)';
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
