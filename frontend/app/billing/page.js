'use client';

export default function BillingPage() {
    return (
        <div>
            <div className="page-header">
                <h1>Billing & Usage</h1>
                <p>Manage your subscription and monitor real-time usage costs.</p>
            </div>

            <div className="data-grid data-grid-1">
                <div className="glass-card-static section-card">
                    <div className="section-header">
                        <h3 className="section-title">Current Plan</h3>
                        <span className="status-badge status-completed">PRO</span>
                    </div>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700 }}>$29.00 / month</div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Your next billing date is April 26, 2026.</p>
                    </div>
                    <button className="btn btn-primary">Manage Subscription</button>
                </div>

                <div className="glass-card-static section-card" style={{ marginTop: '24px' }}>
                    <div className="section-header">
                        <h3 className="section-title">Usage Limits</h3>
                    </div>
                    <div style={{ margin: '20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                            <span>Token Spend</span>
                            <span>$12.45 / $50.00</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '25%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
