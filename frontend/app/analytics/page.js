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

    const renderChakraTopology = () => {
        const center = 150;
        const rings = [60, 90, 120];

        return (
            <div className="chakra-topology">
                <svg viewBox="0 0 300 300" className="topology-svg">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Orbital Rings */}
                    {rings.map((r, i) => (
                        <circle
                            key={i}
                            cx={center}
                            cy={center}
                            r={r}
                            fill="none"
                            stroke="rgba(59, 130, 246, 0.15)"
                            strokeWidth="1"
                            strokeDasharray={i === 1 ? "5,5" : "none"}
                            className={i === 1 ? "rotate-slow" : "rotate-reverse-slow"}
                        />
                    ))}

                    {/* Dynamic Status Rings */}
                    <circle
                        cx={center}
                        cy={center}
                        r={rings[0]}
                        fill="none"
                        stroke="var(--accent-green)"
                        strokeWidth="2"
                        strokeDasharray="40 160"
                        className="rotate-fast"
                        filter="url(#glow)"
                        style={{ opacity: stats?.agents?.active > 0 ? 0.8 : 0.2 }}
                    />

                    <circle
                        cx={center}
                        cy={center}
                        r={rings[1]}
                        fill="none"
                        stroke="var(--accent-blue)"
                        strokeWidth="2"
                        strokeDasharray="80 120"
                        className="rotate-slow"
                        filter="url(#glow)"
                        style={{ opacity: 0.6 }}
                    />

                    {/* Central Core */}
                    <g className="core-rotation">
                        <polygon
                            points="150,130 167,140 167,160 150,170 133,160 133,140"
                            fill="var(--bg-glass)"
                            stroke="var(--accent-blue)"
                            strokeWidth="2"
                            filter="url(#glow)"
                        />
                        <circle cx={center} cy={center} r="6" fill="var(--accent-blue)">
                            <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </g>

                    {/* Neural Paths */}
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                        const rad = (angle * Math.PI) / 180;
                        const x1 = center + Math.cos(rad) * 20;
                        const y1 = center + Math.sin(rad) * 20;
                        const x2 = center + Math.cos(rad) * 110;
                        const y2 = center + Math.sin(rad) * 110;

                        return (
                            <g key={i}>
                                <line
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                    stroke="rgba(59, 130, 246, 0.1)"
                                    strokeWidth="1"
                                />
                                <circle
                                    cx={x2} cy={y2} r="3"
                                    fill={i % 3 === 0 ? "var(--accent-green)" : "var(--accent-blue)"}
                                    className="neural-node"
                                    style={{ animationDelay: `${i * 0.5}s` }}
                                />
                            </g>
                        );
                    })}
                </svg>

                <div className="topology-overlay">
                    <div className="status-bit">
                        <span className="label">ACTIVE NODES</span>
                        <span className="value">{stats?.agents?.active || 0}</span>
                    </div>
                    <div className="status-bit">
                        <span className="label">NEURAL SYNC</span>
                        <span className="value">98.2%</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderVelocityChart = () => {
        const trends = stats?.trends?.tasks || [];
        const max = Math.max(...trends.map(t => t.count), 5);
        const width = 1000;
        const height = 240;

        const points = trends.map((t, i) => ({
            x: (i / (trends.length - 1 || 1)) * width,
            y: height - ((t.count / max) * height * 0.7 + height * 0.15)
        }));

        const d = points.length > 1
            ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
            : '';

        const areaD = d ? `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z` : '';

        return (
            <div className="velocity-container">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {areaD && <path d={areaD} fill="url(#area-grad)" />}
                    {d && <path d={d} fill="none" stroke="var(--accent-blue)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 12px var(--accent-blue))' }} />}
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="6" fill="white" stroke="var(--accent-blue)" strokeWidth="3" />
                    ))}
                </svg>
            </div>
        );
    };

    if (loading) return (
        <div className="loading-container">
            <div className="chakra-loader">
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-core"></div>
            </div>
            <p className="loading-text">Synchronizing Chakraview Neural Core...</p>
        </div>
    );

    const successRate = stats?.tasks?.total > 0
        ? ((stats.tasks.completed / stats.tasks.total) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="analytics-container">
            <header className="page-header animate-in">
                <div className="header-meta">
                    <span className="intel-tag">ORCHESTRATION INTEL</span>
                    <div className="system-status-pill">
                        <span className="status-dot"></span>
                        SYSTEM NOMINAL
                    </div>
                </div>
                <h1 className="dashboard-title">Chakraview <span>Neural Core</span></h1>
            </header>

            {/* Top Row: Mini Stats */}
            <div className="stats-row">
                <div className="stat-card-mini animate-in" style={{ animationDelay: '0s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)' }}>📈</div>
                    <div className="stat-info">
                        <label>SYSTEM ACCURACY</label>
                        <div className="val-group">
                            <h3>{successRate}</h3>
                            <span className="unit">%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-mini animate-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-green)' }}>🤖</div>
                    <div className="stat-info">
                        <label>ACTIVE AGENTS</label>
                        <div className="val-group">
                            <h3>{stats?.agents?.active || 0}</h3>
                            <span className="unit">/ {stats?.agents?.total || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-mini animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>💎</div>
                    <div className="stat-info">
                        <label>RESOURCE INDEX</label>
                        <div className="val-group">
                            <h3>{(stats?.usage?.cost || 0).toFixed(3)}</h3>
                            <span className="unit">CTX</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card-mini animate-in" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>⚡</div>
                    <div className="stat-info">
                        <label>THROUGHPUT</label>
                        <div className="val-group">
                            <h3>{stats?.tasks?.total || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bento Grid */}
            <div className="bento-grid">
                <div className="glass-card bento-item throughput animate-in" style={{ animationDelay: '0.4s' }}>
                    <div className="card-header">
                        <h3>Workflow Velocity</h3>
                        <p>Total orchestrations across neural pathways</p>
                    </div>
                    {renderVelocityChart()}
                    <div className="chart-labels">
                        {stats?.trends?.tasks?.map((t, i) => (
                            <span key={i}>{t.date.split('-').slice(1).join('/')}</span>
                        ))}
                    </div>
                </div>

                <div className="glass-card bento-item topology animate-in" style={{ animationDelay: '0.5s' }}>
                    <div className="card-header">
                        <h3 style={{ whiteSpace: 'nowrap' }}>System Topology</h3>
                        <div className="radar-indicator">
                            <div className="radar-sweep"></div>
                            ACTIVE SCAN
                        </div>
                    </div>
                    {renderChakraTopology()}
                </div>
            </div>

            <style jsx>{`
                .analytics-container {
                    padding: 40px;
                    max-width: 1500px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 48px;
                }

                .header-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .intel-tag {
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 3px;
                    color: var(--accent-blue);
                    opacity: 0.8;
                }

                .dashboard-title {
                    font-size: 56px;
                    font-weight: 950;
                    letter-spacing: -3px;
                    line-height: 1;
                    margin: 0;
                }

                .dashboard-title span {
                    background: linear-gradient(135deg, white 0%, var(--accent-blue) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .system-status-pill {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    font-weight: 800;
                    color: var(--accent-green);
                    background: rgba(16, 185, 129, 0.08);
                    padding: 8px 16px;
                    border-radius: 30px;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    letter-spacing: 1px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    background: var(--accent-green);
                    border-radius: 50%;
                    box-shadow: 0 0 15px var(--accent-green);
                    animation: pulse-dot 2s infinite;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .stat-card-mini {
                    background: var(--bg-glass);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-lg);
                    padding: 28px;
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    backdrop-filter: blur(24px);
                    transition: all 0.3s ease;
                }

                .stat-card-mini:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    box-shadow: inset 0 0 20px rgba(255,255,255,0.05);
                }

                .stat-info label {
                    display: block;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                }

                .val-group {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;
                }

                .stat-info h3 {
                    font-size: 32px;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: -1px;
                }

                .stat-info .unit {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-muted);
                }

                .bento-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                }

                .bento-item {
                    min-height: 520px;
                    display: flex;
                    flex-direction: column;
                }

                .card-header {
                    padding: 32px;
                }

                .card-header h3 {
                    font-size: 24px;
                    font-weight: 850;
                    margin: 0;
                    letter-spacing: -0.5px;
                }

                .card-header p {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin-top: 6px;
                }

                .velocity-container {
                    flex: 1;
                    padding: 0 32px;
                    margin: 20px 0;
                }

                .chart-labels {
                    display: flex;
                    justify-content: space-between;
                    padding: 0 48px 32px;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 700;
                }

                /* Chakra Topology */
                .chakra-topology {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .topology-svg {
                    width: 100%;
                    max-width: 300px;
                    filter: drop-shadow(0 0 30px rgba(59, 130, 246, 0.2));
                }

                .radar-indicator {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 11px;
                    font-weight: 900;
                    color: var(--accent-blue);
                }

                .radar-sweep {
                    width: 14px;
                    height: 14px;
                    border: 2px solid var(--accent-blue);
                    border-radius: 50%;
                    border-top-color: transparent;
                    animation: spin 2s linear infinite;
                }

                .topology-overlay {
                    display: flex;
                    gap: 40px;
                    margin-top: 24px;
                    padding-bottom: 32px;
                }

                .status-bit {
                    text-align: center;
                }

                .status-bit .label {
                    display: block;
                    font-size: 9px;
                    font-weight: 900;
                    color: var(--text-muted);
                    letter-spacing: 2px;
                }

                .status-bit .value {
                    font-size: 20px;
                    font-weight: 900;
                    color: var(--text-primary);
                }

                /* Animations */
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .rotate-slow { animation: spin 25s linear infinite; transform-origin: center; }
                .rotate-fast { animation: spin 10s linear infinite; transform-origin: center; }
                .rotate-reverse-slow { animation: spin 30s linear reverse infinite; transform-origin: center; }
                
                .core-rotation {
                    transform-origin: 150px 150px;
                    animation: spin 15s linear infinite;
                }

                .neural-node {
                    animation: pulse-node 4s infinite;
                }

                @keyframes pulse-node {
                    0%, 100% { r: 3; opacity: 0.4; }
                    50% { r: 5; opacity: 1; }
                }

                @keyframes pulse-dot {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.3); opacity: 1; }
                }

                .loading-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-primary);
                }

                .chakra-loader {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    margin-bottom: 32px;
                }

                .loader-ring {
                    position: absolute;
                    inset: 0;
                    border: 3px solid transparent;
                    border-top-color: var(--accent-blue);
                    border-radius: 50%;
                    animation: spin 1.5s cubic-bezier(0.6, -0.2, 0.4, 1.2) infinite;
                }

                .loader-ring:nth-child(2) {
                    inset: 12px;
                    border-top-color: var(--accent-purple);
                    animation-duration: 2s;
                    animation-direction: reverse;
                }

                .loader-ring:nth-child(3) {
                    inset: 24px;
                    border-top-color: var(--accent-cyan);
                    animation-duration: 2.5s;
                }

                .loader-core {
                    position: absolute;
                    inset: 45px;
                    background: var(--accent-blue);
                    border-radius: 50%;
                    box-shadow: 0 0 30px var(--accent-blue);
                    animation: pulse-dot 2s infinite;
                }

                .loading-text {
                    font-weight: 800;
                    letter-spacing: 4px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    font-size: 11px;
                    animation: breathe 2s ease-in-out infinite;
                }

                @keyframes breathe { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }

                .animate-in {
                    animation: slideUp 1s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    opacity: 0;
                }

                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
