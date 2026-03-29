import React from 'react';

export default function AgentFleet({ agents, activeCount }) {
    return (
        <div className="glass-card-static section-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-purple)', display: 'flex' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /><circle cx="15" cy="14" r="1.5" fill="currentColor" />
                        </svg>
                    </span>
                    Neural Fleet
                </h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{
                        fontSize: '10px', color: 'var(--accent-purple)', fontWeight: 800,
                        padding: '3px 8px', borderRadius: '6px',
                        background: 'var(--accent-purple-glow)', border: '1px solid rgba(139, 92, 246, 0.2)',
                        textTransform: 'uppercase'
                    }}>
                        {activeCount} ACTIVE
                    </span>
                </div>
            </div>
            {agents.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.4 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /><circle cx="15" cy="14" r="1.5" fill="currentColor" />
                        </svg>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>No active neural profiles found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {agents.map(agent => (
                        <div key={agent.id} className="hover-glass" style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', flexDirection: 'column',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '8px',
                                        background: agent.status === 'active' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${agent.status === 'active' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.05)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: agent.status === 'active' ? 'var(--accent-purple)' : 'var(--text-muted)'
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                                            <path d="M12 12L2.1 12.1" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{agent.name}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{agent.model || 'Standard'}</div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '3px 8px', borderRadius: '4px',
                                    fontSize: '9px', fontWeight: 950,
                                    background: agent.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)',
                                    color: agent.status === 'active' ? 'var(--accent-green)' : 'var(--text-muted)',
                                    border: `1px solid ${agent.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                                    letterSpacing: '1px'
                                }}>
                                    {agent.status === 'active' ? 'ENGAGED' : 'STANDBY'}
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.05), transparent)' }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="sync-bar" style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '10px' }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{
                                                width: '2px',
                                                height: `${25 * i}%`,
                                                background: i <= 3 ? 'var(--accent-purple)' : 'rgba(255,255,255,0.1)',
                                                borderRadius: '1px',
                                                opacity: i <= 3 ? 0.8 : 0.3
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>NEURAL_SYNC</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                                        {Math.floor(Math.random() * 200) + 100}ms
                                    </span>
                                    <small style={{ fontSize: '8px', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 900 }}>LAT</small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
