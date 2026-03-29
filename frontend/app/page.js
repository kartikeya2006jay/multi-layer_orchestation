'use client';
import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/lib/auth';
import { formatIST, formatISTDate } from '@/lib/time';

// ─── Modular Components ──────────────────────────────────────
import { MetricIcons } from '@/components/dashboard/Icons';
import MetricCards from '@/components/dashboard/MetricCards';
import TaskQueue from '@/components/dashboard/TaskQueue';
import AgentFleet from '@/components/dashboard/AgentFleet';
import ArchitectureShowcase from '@/components/dashboard/ArchitectureShowcase';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { connected, subscribe } = useWebSocket();
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());

    const loadStats = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getDashboardStats();
            setStats(data);
            setError(null);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadStats(); }, [loadStats]);

    useEffect(() => {
        if (!user) return;
        const unsubs = [
            subscribe('task:update', loadStats),
            subscribe('task:created', loadStats),
            subscribe('agent:update', loadStats),
            subscribe('oversight:new', loadStats),
            subscribe('oversight:resolved', loadStats),
        ];
        return () => unsubs.forEach(u => u());
    }, [subscribe, loadStats, user]);

    useEffect(() => {
        if (!user) return;
        const interval = setInterval(() => {
            loadStats();
            setCurrentTime(new Date());
        }, 10000);

        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, [loadStats, user]);

    if (!user) return null;

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
                <div className="loading-spinner"></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Initializing Command Center...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card-static" style={{ padding: '48px', textAlign: 'center', marginTop: '40px', maxWidth: '480px', margin: '60px auto' }}>
                <div style={{ color: 'var(--accent-red)', marginBottom: '16px' }}>
                    {MetricIcons.failed}
                </div>
                <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 700 }}>Connection Error</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px', lineHeight: '1.7' }}>{error}</p>
                <button className="btn btn-primary" onClick={loadStats}>Retry Connection</button>
            </div>
        );
    }

    return (
        <div className="stagger-in">
            {/* ─── Header ─── */}
            <div style={{ marginBottom: '44px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{
                        fontSize: '11px', fontWeight: 800,
                        color: 'var(--accent-blue)',
                        textTransform: 'uppercase', letterSpacing: '2.5px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        padding: '5px 14px', borderRadius: '20px',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                    }}>
                        Control Plane
                    </span>
                    <div className={`ws-indicator ${connected ? 'ws-connected' : 'ws-disconnected'}`} style={{ padding: '4px 10px', fontSize: '10px' }}>
                        <span style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: connected ? 'var(--accent-green)' : 'var(--accent-red)',
                            display: 'inline-block',
                        }} />
                        {connected ? 'Live' : 'Offline'}
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <div className="system-status-pill" style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '10px', fontWeight: 900, color: 'var(--accent-blue)',
                            background: 'rgba(59, 130, 246, 0.05)', padding: '6px 14px',
                            borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.1)'
                        }}>
                            <div className="status-dot" style={{ width: '6px', height: '6px', background: 'var(--accent-blue)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-blue)' }}></div>
                            <span>IST {formatIST(currentTime)}</span>
                        </div>
                        <div className="system-status-pill" style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '10px', fontWeight: 900, color: 'var(--text-muted)',
                            background: 'rgba(255, 255, 255, 0.02)', padding: '6px 14px',
                            borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <span>{formatISTDate(currentTime)}</span>
                        </div>
                    </div>
                </div>
                <h1 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '6px', lineHeight: 1.1 }}>
                    Welcome back, <span style={{
                        background: 'linear-gradient(135deg, var(--text-primary), var(--accent-blue))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{user?.name?.split(' ')[0] || 'User'}</span>
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Managing <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.workspace_name || 'Standard Workspace'}</strong> · Connected to neural orchestrator
                </p>
            </div>

            {/* ─── OpenAI Warning ─── */}
            {!stats.system.openaiConfigured && (
                <div className="glass-card-static" style={{
                    padding: '16px 22px', marginBottom: '28px',
                    borderColor: 'rgba(251, 191, 36, 0.25)',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent)',
                }}>
                    <div style={{ color: 'var(--accent-amber)', flexShrink: 0 }}>
                        {MetricIcons.warning}
                    </div>
                    <div style={{ flex: 1 }}>
                        <strong style={{ color: 'var(--accent-amber)', fontSize: '13px' }}>OpenAI API Key Not Configured</strong>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                            Go to Settings to configure your API key before launching tasks.
                        </p>
                    </div>
                </div>
            )}

            {/* ─── Metrics Grid ─── */}
            <MetricCards stats={stats} />

            {/* ─── Content Grid ─── */}
            <div className="data-grid data-grid-2" style={{ marginBottom: '28px' }}>
                <TaskQueue tasks={stats.recentTasks} runningCount={stats.tasks.running} />
                <AgentFleet agents={stats.recentAgents} activeCount={stats.agents.active} />
            </div>

            {/* ─── Platform Architecture Showcase ─── */}
            <ArchitectureShowcase />

            {/* ─── System Info Bar ─── */}
            <div className="glass-card-static" style={{
                padding: '14px 22px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
                borderColor: 'rgba(255,255,255,0.04)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 500 }}>
                        {MetricIcons.chart}
                        <strong style={{ color: 'var(--text-primary)' }}>{stats.tasks.total}</strong> total tasks
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 500 }}>
                        {MetricIcons.workflow}
                        <strong style={{ color: 'var(--text-primary)' }}>{stats.workflows.total}</strong> workflows
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 500 }}>
                        {MetricIcons.target}
                        Avg confidence: <strong style={{ color: 'var(--accent-blue)' }}>{(stats.system.avgConfidence * 100).toFixed(0)}%</strong>
                    </span>
                </div>
                <div className={`ws-indicator ${connected ? 'ws-connected' : 'ws-disconnected'}`}>
                    <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: connected ? 'var(--accent-green)' : 'var(--accent-red)',
                        display: 'inline-block',
                    }} />
                    {connected ? 'Live Updates Active' : 'Reconnecting...'}
                </div>
            </div>
        </div>
    );
}
