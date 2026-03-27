'use client';
import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { subscribe } = useWebSocket();

    const loadStats = useCallback(async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (e) {
            console.error('Failed to load stats:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStats();
        const unsub = subscribe('task:update', loadStats);
        return unsub;
    }, [loadStats, subscribe]);

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="pulse" style={{ color: 'var(--text-secondary)' }}>Gathering intelligence tokens...</div>
        </div>
    );

    const successRate = stats?.tasks?.total > 0
        ? ((stats.tasks.completed / stats.tasks.total) * 100).toFixed(1)
        : '0.0';

    // SVG Chart Helper
    const renderTaskChart = () => {
        const trends = stats?.trends?.tasks || [];
        const max = Math.max(...trends.map(t => t.count), 5);
        const width = 800;
        const height = 150;
        const padding = 20;

        const points = trends.map((t, i) => ({
            x: (i / (trends.length - 1 || 1)) * (width - padding * 2) + padding,
            y: height - ((t.count / max) * (height - padding * 2) + padding)
        }));

        const d = points.length > 1
            ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
            : '';

        return (
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {d && (
                    <>
                        <path d={`${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`} fill="url(#line-grad)" opacity="0.2" />
                        <path d={d} fill="none" stroke="var(--accent-blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--bg-main)" stroke="var(--accent-blue)" strokeWidth="2" />
                        ))}
                    </>
                )}
            </svg>
        );
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1.5px' }}>Analytics <span style={{ color: 'var(--accent-purple)' }}>Overdrive</span></h1>
                <p style={{ color: 'var(--text-secondary)' }}>High-fidelity performance metrics and neural throughput analysis.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="glass-card-static stat-card">
                    <span className="stat-label">Neural Throughput</span>
                    <div className="stat-value">{stats?.tasks?.total || 0}</div>
                    <div className="stat-delta positive">Total Orchestrations</div>
                </div>
                <div className="glass-card-static stat-card">
                    <span className="stat-label">Success Precision</span>
                    <div className="stat-value">{successRate}%</div>
                    <div className="stat-delta positive">Task Accuracy</div>
                </div>
                <div className="glass-card-static stat-card">
                    <span className="stat-label">Active Agents</span>
                    <div className="stat-value">{stats?.agents?.active || 0}</div>
                    <div className="stat-delta">of {stats?.agents?.total || 0} available</div>
                </div>
                <div className="glass-card-static stat-card">
                    <span className="stat-label">Resource Index</span>
                    <div className="stat-value">{(stats?.usage?.cost || 0).toFixed(4)}</div>
                    <div className="stat-delta">Estimated Credits</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                {/* Workflow Velocity */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Neural Velocity (Last 7 Days)</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="legend-item"><span className="dot" style={{ background: 'var(--accent-blue)' }}></span> Tasks</div>
                        </div>
                    </div>
                    {renderTaskChart()}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                        {stats?.trends?.tasks?.map((t, i) => (
                            <span key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>{t.date}</span>
                        ))}
                    </div>
                </div>

                {/* --- ENHANCED: Status Topology Radar --- */}
                <div className="glass-card-static" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>System Topology Deep Scan</h3>
                        <div className="live-pill">LIVE TOPOLOGY</div>
                    </div>
                    <div className="chart-container" style={{ position: 'relative' }}>
                        {/* --- UPGRADED: Task Flow Topology --- */}
                        <div className="glass-card-static" style={{ padding: '24px', gridColumn: 'span 1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '4px', letterSpacing: '-0.5px' }}>System Health Topology</h3>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>LIVE TASK ORCHESTRATION FLOW</p>
                                </div>
                                <div className="live-indicator-container">
                                    <span className="live-dot"></span>
                                    <span style={{ fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 800 }}>SYNCED</span>
                                </div>
                            </div>

                            <div style={{ height: '240px', background: 'rgba(0,0,0,0.25)', borderRadius: '20px', border: '1px solid var(--border-glass)', position: 'relative', overflow: 'hidden' }}>
                                <svg viewBox="0 0 400 240" style={{ width: '100%', height: '100%' }}>
                                    <defs>
                                        <filter id="nodeGlow">
                                            <feGaussianBlur stdDeviation="4" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orientation="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.1)" />
                                        </marker>
                                    </defs>

                                    {/* Connection Lines (Flow) */}
                                    <path d="M 60 120 Q 130 120 200 120" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />
                                    <path d="M 200 120 Q 270 95 340 70" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />
                                    <path d="M 200 120 Q 270 145 340 170" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" fill="none" markerEnd="url(#arrowhead)" />

                                    {/* Data Streams (Pulsing segments) */}
                                    {stats?.tasks?.running > 0 && (
                                        <g>
                                            <circle r="2.5" fill="var(--accent-blue)" filter="url(#nodeGlow)">
                                                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 60 120 Q 130 120 200 120" />
                                            </circle>
                                            <circle r="2" fill="var(--accent-blue)" opacity="0.5">
                                                <animateMotion dur="2.5s" begin="1.25s" repeatCount="indefinite" path="M 60 120 Q 130 120 200 120" />
                                            </circle>
                                        </g>
                                    )}

                                    {/* Nodes */}
                                    {[
                                        { id: 'pending', x: 60, y: 120, color: 'var(--accent-amber)', label: 'QUEUE', val: stats?.tasks?.pending || 0 },
                                        { id: 'running', x: 200, y: 120, color: 'var(--accent-blue)', label: 'ACTIVE', val: stats?.tasks?.running || 0 },
                                        { id: 'success', x: 340, y: 70, color: 'var(--accent-green)', label: 'SUCCESS', val: stats?.tasks?.completed || 0 },
                                        { id: 'failed', x: 340, y: 170, color: 'var(--accent-red)', label: 'FAILED', val: stats?.tasks?.failed || 0 }
                                    ].map(node => (
                                        <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                            {/* Outer Ring */}
                                            <circle r="22" fill={node.color} opacity={node.val > 0 ? 0.15 : 0.03} />
                                            {/* Inner Node */}
                                            <circle r="7" fill={node.color} filter={node.val > 0 ? 'url(#nodeGlow)' : ''} />
                                            {/* Label & Value */}
                                            <text y="-32" textAnchor="middle" fill="var(--text-muted)" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px' }}>{node.label}</text>
                                            <text y="7" x="0" textAnchor="middle" style={{ fill: 'white', fontSize: '18px', fontWeight: 900, pointerEvents: 'none', dominantBaseline: 'middle', transform: 'translateY(30px)' }}>{node.val}</text>
                                        </g>
                                    ))}
                                </svg>

                                {/* Overlay Stats */}
                                <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div className="mini-stat">
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>THROUGHPUT</label>
                                        <span style={{ fontSize: '16px', fontWeight: 900 }}>{((stats?.tasks?.completed || 0) / (stats?.tasks?.total || 1) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="mini-stat" style={{ textAlign: 'right' }}>
                                        <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>RESOURCE LOAD</label>
                                        <span style={{ fontSize: '16px', fontWeight: 900, color: stats?.tasks?.running > 5 ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                                            {stats?.tasks?.running > 0 ? 'NOMINAL' : 'IDLE'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <style jsx>{`
                .stat-card {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                }
                .stat-label {
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .stat-value {
                    font-size: 28px;
                    font-weight: 900;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                    letter-spacing: -1px;
                }
                .stat-delta {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                .positive { color: var(--accent-green); }
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }
                .live-pill {
                    background: var(--accent-purple-glow);
                    color: var(--accent-purple);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 0.5px;
                }
                .chart-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                }
                .chart-svg {
                    width: 100%;
                    height: 100%;
                }
            `}</style>
                </div>
                );
}
