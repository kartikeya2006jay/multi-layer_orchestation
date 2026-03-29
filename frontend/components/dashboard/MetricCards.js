import React from 'react';
import { MetricIcons } from './Icons';

const MetricCard = ({ label, value, icon, color, gradient, borderAccent, delay }) => (
    <div className="glass-card metric-card animate-in" style={{
        animationDelay: `${delay}ms`,
        background: gradient,
        borderLeft: `3px solid ${borderAccent}`,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        position: 'relative',
        overflow: 'hidden',
    }}>
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '80px', height: '80px', borderRadius: '50%',
            background: `var(--accent-${color})`,
            opacity: 0.04, filter: 'blur(20px)',
            pointerEvents: 'none',
        }} />

        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '18px',
        }}>
            <div style={{
                width: '50px', height: '50px',
                borderRadius: 'var(--radius-md)',
                background: `var(--accent-${color}-glow)`,
                border: `1px solid rgba(255,255,255,0.06)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: `var(--accent-${color})`,
            }}>
                {icon}
            </div>
        </div>
        <div style={{
            fontSize: '32px', fontWeight: 900,
            letterSpacing: '-1.5px',
            lineHeight: 1,
            marginBottom: '6px',
            color: 'var(--text-primary)',
        }}>
            {value}
        </div>
        <div style={{
            fontSize: '12px', fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
        }}>
            {label}
        </div>
    </div>
);

export default function MetricCards({ stats }) {
    const cards = [
        {
            label: 'Total Agents', value: stats.agents.total, icon: MetricIcons.agents, color: 'blue',
            gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(37, 99, 235, 0.06) 100%)',
            borderAccent: 'rgba(59, 130, 246, 0.5)',
        },
        {
            label: 'Active Now', value: stats.agents.active, icon: MetricIcons.active, color: 'green',
            gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.06) 100%)',
            borderAccent: 'rgba(16, 185, 129, 0.5)',
        },
        {
            label: 'Completed', value: stats.tasks.completed, icon: MetricIcons.completed, color: 'purple',
            gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.18) 0%, rgba(124, 58, 237, 0.06) 100%)',
            borderAccent: 'rgba(139, 92, 246, 0.5)',
        },
        {
            label: 'Token Cost', value: `$${stats.system.totalCost || '0.00'}`, icon: MetricIcons.cost, color: 'cyan',
            gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(8, 145, 178, 0.06) 100%)',
            borderAccent: 'rgba(6, 182, 212, 0.5)',
        },
        {
            label: 'Pending Reviews', value: stats.oversight.pending, icon: MetricIcons.oversight, color: 'amber',
            gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.06) 100%)',
            borderAccent: 'rgba(245, 158, 11, 0.5)',
        },
        {
            label: 'Failed Tasks', value: stats.tasks.failed, icon: MetricIcons.failed, color: 'red',
            gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(220, 38, 38, 0.06) 100%)',
            borderAccent: 'rgba(239, 68, 68, 0.5)',
        },
    ];

    return (
        <div className="metrics-grid" style={{ marginBottom: '36px' }}>
            {cards.map((card, i) => (
                <MetricCard key={card.label} {...card} delay={i * 80} />
            ))}
        </div>
    );
}
