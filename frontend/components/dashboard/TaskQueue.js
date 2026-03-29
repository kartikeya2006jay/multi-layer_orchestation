import React from 'react';
import { MetricIcons } from './Icons';
import { formatIST } from '@/lib/time';

const StatusIcon = ({ status }) => {
    const colors = {
        running: 'var(--accent-blue)',
        completed: 'var(--accent-green)',
        failed: 'var(--accent-red)',
        pending: 'var(--accent-amber)',
        idle: 'var(--text-muted)',
    };
    return (
        <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: colors[status] || 'var(--text-muted)',
            boxShadow: `0 0 8px ${colors[status] || 'transparent'}`,
            display: 'inline-block', flexShrink: 0,
        }} />
    );
};

export default function TaskQueue({ tasks, runningCount }) {
    return (
        <div className="glass-card-static section-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header">
                <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-blue)', display: 'flex' }}>{MetricIcons.tasks}</span>
                    System Operations
                </h3>
                <span style={{
                    fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '20px',
                    background: 'var(--accent-green-glow)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                }}>
                    {runningCount} active
                </span>
            </div>
            {tasks.length === 0 ? (
                <div className="empty-state" style={{ padding: '60px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.4 }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
                        </svg>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>Operational queue is empty.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tasks.map(task => (
                        <div key={task.id} className="hover-glass" style={{
                            padding: '16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border-glass)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', gap: '14px',
                            transition: 'all var(--transition-base)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '8px',
                                    background: task.status === 'running' ? 'var(--accent-blue-glow)' : 'var(--bg-glass)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: task.status === 'running' ? 'var(--accent-blue)' : 'var(--text-muted)',
                                }}>
                                    <StatusIcon status={task.status} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '14px', fontWeight: 600,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        color: 'var(--text-primary)',
                                    }}>
                                        {task.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        <span style={{ fontWeight: 600 }}>{task.agent_name || 'Autonomous'}</span>
                                        <span style={{ opacity: 0.3 }}>|</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {MetricIcons.clock}
                                            {formatIST(task.created_at)}
                                        </span>
                                    </div>
                                    {task.status === 'running' && (
                                        <div className="progress-bar" style={{ marginTop: '10px', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                            <div className="progress-fill" style={{ width: `${task.progress || 0}%`, boxShadow: '0 0 10px var(--accent-blue)' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span style={{
                                fontSize: '10px', fontWeight: 800, textTransform: 'uppercase',
                                letterSpacing: '0.5px', color: `var(--accent-${task.status === 'running' ? 'blue' : task.status === 'completed' ? 'green' : task.status === 'failed' ? 'red' : 'muted'})`
                            }}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
