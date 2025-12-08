
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    icon?: React.ReactNode;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(o => o.value === value) || options[0];

    return (
        <div style={{ position: 'relative', minWidth: '150px' }}>
            <div
                className="glass-input"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: '0.75rem 1rem',
                    userSelect: 'none'
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
                    <span style={{ fontSize: '0.9rem' }}>{selectedOption.label}</span>
                </div>
                <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            left: 0,
                            marginTop: '0.5rem',
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                            zIndex: 50,
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: value === option.value ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                    color: value === option.value ? 'var(--primary)' : 'var(--text-main)',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (value !== option.value) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    if (value !== option.value) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                {option.label}
                                {value === option.value && <Check size={14} />}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            {isOpen && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
