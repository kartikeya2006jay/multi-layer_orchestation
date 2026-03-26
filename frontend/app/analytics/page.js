'use client';

export default function AnalyticsPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Analytics & Insights</h1>
                <p>Track system performance, agent usage, and cost efficiency.</p>
            </div>

            <div className="metrics-grid">
                <div className="glass-card metric-card metric-blue">
                    <div className="metric-label">Task Success Rate</div>
                    <div className="metric-value">94.2%</div>
                </div>
                <div className="glass-card metric-card metric-purple">
                    <div className="metric-label">Avg Completion Time</div>
                    <div className="metric-value">12.4s</div>
                </div>
                <div className="glass-card metric-card metric-green">
                    <div className="metric-label">Agent Utilization</div>
                    <div className="metric-value">68%</div>
                </div>
            </div>

            <div className="glass-card-static" style={{ padding: '40px', textAlign: 'center', marginTop: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3>Advanced Analytics Coming Soon</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '16px auto' }}>
                    We are building a comprehensive intelligence layer to provide structured reasoning logs and deep insights into your agent fleet.
                </p>
            </div>
        </div>
    );
}
