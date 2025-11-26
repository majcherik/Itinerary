import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <header style={{
                padding: '1.5rem 0',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '2rem',
                backgroundColor: 'var(--bg-secondary)'
            }}>
                <div className="container flex justify-between items-center">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            TripPlanner
                        </h1>
                    </Link>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}></div>
                </div>
            </header>
            <main key={location.pathname} className="container animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default Layout;
