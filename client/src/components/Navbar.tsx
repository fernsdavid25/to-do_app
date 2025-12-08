
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListTodo, Plus } from 'lucide-react';
import { useAuth } from '../AuthContext';

export const Navbar: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            padding: '2rem 0'
        }}>
            <Link to="/" style={{ opacity: location.pathname === '/' ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '1rem', display: 'flex' }}>
                    <ListTodo size={24} color="var(--primary)" />
                    <span style={{ marginLeft: '0.5rem' }}>Home</span>
                </div>
            </Link>
            <Link to="/add" style={{ opacity: location.pathname === '/add' ? 1 : 0.5, transition: 'opacity 0.3s' }}>
                <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '1rem', display: 'flex' }}>
                    <Plus size={24} color="var(--secondary)" />
                    <span style={{ marginLeft: '0.5rem' }}>Add Task</span>
                </div>
            </Link>
        </nav>
    );
};
