'use client';
import { useState } from 'react';
import Link from 'next/link';
import { login as apiLogin } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiLogin({ email, password });
            login(data.user, data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="glass-card auth-card animate-in" style={{
                backdropFilter: 'blur(32px)',
                background: 'rgba(13, 15, 23, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), var(--shadow-glow-blue)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        boxShadow: '0 0 40px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)',
                    }}>
                        <svg width="38" height="38" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="url(#login-grad)" strokeWidth="2" opacity="0.3" />
                            <circle cx="16" cy="16" r="9" stroke="url(#login-grad)" strokeWidth="2" />
                            <circle cx="16" cy="16" r="4" fill="url(#login-grad)" />
                            <line x1="16" y1="2" x2="16" y2="8" stroke="url(#login-grad)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="16" y1="24" x2="16" y2="30" stroke="url(#login-grad)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="2" y1="16" x2="8" y2="16" stroke="url(#login-grad)" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="24" y1="16" x2="30" y2="16" stroke="url(#login-grad)" strokeWidth="1.5" strokeLinecap="round" />
                            <defs>
                                <linearGradient id="login-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        background: 'linear-gradient(135deg, #fff 30%, #8b5cf6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '14px', letterSpacing: '0.2px' }}>Access your neural orchestration command center</p>
                </div>


                {error && (
                    <div style={{
                        padding: '14px 18px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        color: '#ff6b6b',
                        fontSize: '14px',
                        marginBottom: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="name@company.com"
                            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                            Password
                            <a href="#" style={{ fontSize: '12px', color: 'var(--accent-blue)', textTransform: 'none', fontWeight: 500 }}>Forgot?</a>
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ background: 'rgba(0, 0, 0, 0.2)' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{
                        padding: '16px',
                        fontSize: '15px',
                        marginTop: '8px'
                    }}>
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                Authenticating...
                            </span>
                        ) : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>New to the platform?</span>{' '}
                    <Link href="/signup" style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
                </div>

                <style jsx>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );

}
