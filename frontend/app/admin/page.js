'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/api';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const loadSummary = useCallback(async () => {
        if (!user || user.user_type !== 'admin') return;
        try {
            const data = await apiRequest('/api/admin/summary');
            setSummary(data);
        } catch (e) {
            console.error('Failed to load admin summary', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadSummary();
        const interval = setInterval(loadSummary, 15000);
        return () => clearInterval(interval);
    }, [loadSummary]);

    if (!user || user.user_type !== 'admin') return null;

    const actionColors = {
        LOGIN: 'var(--accent-green)',
        SIGNUP: 'var(--accent-blue)',
        TASK_CREATED: 'var(--accent-purple)',
        TASK_COMPLETED: 'var(--accent-green)',
        TASK_FAILED: 'var(--accent-red)',
        WORKFLOW_STARTED: 'var(--accent-cyan)',
        DEFAULT: 'var(--text-muted)',
    };
    const getColor = (action) => actionColors[action] || actionColors.DEFAULT;

    const formatTime = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts + (ts.includes('+') ? '' : '+05:30'));
        return d.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short', hour12: true });
    };

    return (
        <div style={{ padding: '40px 60px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header with Neural Pulse */}
            <header style={{
                marginBottom: '50px',
                position: 'relative',
                padding: '30px',
                borderRadius: '24px',
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(139, 92, 246, 0.1)',
                backdropFilter: 'blur(10px)',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50%', left: '-20%', width: '140%', height: '200%',
                    background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                        <span style={{
                            fontSize: '10px', fontWeight: 900, letterSpacing: '3px',
                            background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
                            padding: '4px 14px', borderRadius: '6px', color: 'var(--accent-purple)',
                            textTransform: 'uppercase'
                        }}>
                            SYSTEM OVERLORD • COMMAND CONTROL
                        </span>
                        <div style={{
                            flex: 1, height: '1px',
                            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.3), transparent)'
                        }} />
                    </div>

                    <h1 style={{
                        fontSize: '64px', fontWeight: 950, letterSpacing: '-3px',
                        background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.7))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 0.9, margin: 0, textTransform: 'uppercase'
                    }}>
                        NEURAL COMMAND<br />
                        <span style={{ fontSize: '32px', letterSpacing: '8px', color: 'var(--accent-purple)', WebkitTextFillColor: 'var(--accent-purple)', opacity: 0.8 }}>CENTER</span>
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: 0, maxWidth: '600px', lineHeight: '1.6' }}>
                            Orchestrating multi-layered neural workflows across your distributed team.
                            Real-time monitoring of agent execution and partner performance.
                        </p>
                        <div style={{
                            padding: '12px 20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)', animation: 'pulse-dot 2s infinite' }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Synchronized</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Metric Grid with Glassmorphic Floating Cards */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                            height: 160, borderRadius: '24px',
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            animation: 'pulse 1.5s infinite',
                        }} />
                    ))}
                </div>
            ) : summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                    {[
                        { label: 'Neural Partners', value: summary.overview.totalEmployees, color: '#3b82f6', sub: `${summary.overview.activeEmployees} active`, icon: '👥' },
                        { label: 'Active Domains', value: summary.overview.totalWorkspaces, color: '#8b5cf6', sub: 'isolated nodes', icon: '🌐' },
                        { label: 'Task Throughput', value: summary.overview.totalTasksAllUsers, color: '#06b6d4', sub: 'global execution', icon: '⚡' },
                        { label: 'Optimization Rate', value: summary.overview.completedTasksAllUsers, color: '#10b981', sub: 'successful cycles', icon: '🎯' },
                    ].map((m, i) => (
                        <div key={i} style={{
                            padding: '32px', borderRadius: '24px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            position: 'relative', overflow: 'hidden',
                            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            cursor: 'default',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ position: 'absolute', top: 20, right: 20, fontSize: '24px', opacity: 0.3 }}>{m.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '16px' }}>
                                {m.label}
                            </div>
                            <div style={{ fontSize: '48px', fontWeight: 950, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: '8px' }}>
                                {m.value}
                            </div>
                            <div style={{
                                fontSize: '12px', fontWeight: 600, color: m.color,
                                background: `${m.color}15`, padding: '4px 10px', borderRadius: '6px',
                                display: 'inline-block'
                            }}>
                                {m.sub}
                            </div>
                            <div style={{
                                position: 'absolute', bottom: '-40%', right: '-20%', width: '100%', height: '100%',
                                borderRadius: '50%', filter: 'blur(50px)', opacity: 0.15,
                                background: m.color,
                            }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <div style={{
                background: 'rgba(8, 10, 18, 0.4)',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '32px',
                minHeight: '600px',
                backdropFilter: 'blur(20px)'
            }}>
                {/* Tab Switcher */}
                <div style={{
                    display: 'flex', gap: '8px', marginBottom: '40px',
                    background: 'rgba(255,255,255,0.03)', padding: '6px',
                    borderRadius: '16px', width: 'fit-content',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {['overview', 'activity', 'employees'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                background: activeTab === tab ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                                border: '1px solid',
                                borderColor: activeTab === tab ? 'rgba(139, 92, 246, 0.4)' : 'transparent',
                                cursor: 'pointer',
                                padding: '12px 30px', borderRadius: '12px',
                                fontSize: '13px', fontWeight: 800,
                                letterSpacing: '1px', textTransform: 'uppercase',
                                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content with Transitions */}
                <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                    {activeTab === 'overview' && summary && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                            {/* Detailed Analytics cards ... keep existing logic but with better padding/borders */}
                            <div style={{
                                padding: '32px', borderRadius: '24px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: 4, height: 16, background: 'var(--accent-purple)', borderRadius: 2 }} />
                                    Elite Partners (Top Activity)
                                </h3>
                                {summary.topEmployees.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '60px' }}>No active partners logged.</div>
                                ) : summary.topEmployees.map((emp, i) => (
                                    <div key={emp.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '20px',
                                        padding: '20px', borderRadius: '16px',
                                        marginBottom: '12px',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid rgba(255,255,255,0.03)',
                                        transition: 'all 0.2s',
                                    }} className="hover-glass">
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 16, fontWeight: 900, color: '#fff', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                                        }}>
                                            {emp.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{emp.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 24, fontWeight: 950, color: '#3b82f6', lineHeight: 1 }}>{emp.activity_count}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Operations</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                padding: '32px', borderRadius: '24px',
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: 4, height: 16, background: 'var(--accent-cyan)', borderRadius: 2 }} />
                                    Dynamic Resource Load
                                </h3>
                                {summary.tasksByEmployee.length === 0 ? (
                                    <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '60px' }}>No operational load detected.</div>
                                ) : summary.tasksByEmployee.map((row, i) => (
                                    <div key={i} style={{
                                        padding: '20px', borderRadius: '16px',
                                        background: 'rgba(255,255,255,0.01)',
                                        marginBottom: '16px', border: '1px solid rgba(255,255,255,0.02)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{row.name}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent-purple)' }}>{row.total} Total Units</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4, height: 8, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                                            {row.completed > 0 && <div style={{ flex: row.completed, background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }} />}
                                            {row.running > 0 && <div style={{ flex: row.running, background: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }} />}
                                            {row.failed > 0 && <div style={{ flex: row.failed, background: 'var(--accent-red)', boxShadow: '0 0 10px var(--accent-red)' }} />}
                                        </div>
                                        <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)' }} />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{row.completed} SUCCESS</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{row.running} ACTIVE</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-red)' }} />
                                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>{row.failed} ERRORS</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* (Repeat structural improvements for activity and employees tabs...) */}
                    {activeTab === 'activity' && (
                        <div style={{
                            borderRadius: '24px', background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden'
                        }}>
                            {summary.recentActivity.map((log, i) => (
                                <div key={log.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '20px',
                                    padding: '20px 32px',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent'
                                }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(log.action), boxShadow: `0 0 12px ${getColor(log.action)}` }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{log.user_name}</span>
                                            <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 12px', borderRadius: '20px', background: `${getColor(log.action)}15`, color: getColor(log.action), border: `1px solid ${getColor(log.action)}20` }}>{log.action}</span>
                                        </div>
                                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{log.summary}</div>
                                    </div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{formatTime(log.created_at)}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'employees' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {summary.tasksByEmployee.map((emp, i) => (
                                <div key={i} style={{
                                    padding: '32px', borderRadius: '28px',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    transition: 'all 0.3s'
                                }} className="hover-glass">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{
                                            width: 52, height: 52, borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 20, fontWeight: 900, color: '#fff',
                                            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.2)'
                                        }}>{emp.name?.[0]?.toUpperCase()}</div>
                                        <div>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{emp.name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{emp.email}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
                                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: 24, fontWeight: 950, color: '#fff' }}>{emp.total}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>Total</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                            <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--accent-green)' }}>{emp.completed}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-green)', opacity: 0.7, textTransform: 'uppercase', marginTop: 4 }}>Done</div>
                                        </div>
                                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.04)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                                            <div style={{ fontSize: 24, fontWeight: 950, color: 'var(--accent-red)' }}>{emp.failed}</div>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--accent-red)', opacity: 0.7, textTransform: 'uppercase', marginTop: 4 }}>Failed</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ width: '100%', marginTop: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Inspect Node</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
