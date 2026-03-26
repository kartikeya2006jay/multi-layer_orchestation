'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings, getHealth } from '@/lib/api';

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const loadSettings = useCallback(async () => {
        try {
            const [s, h] = await Promise.all([getSettings(), getHealth()]);
            setSettings(s);
            setHealth(h);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadSettings(); }, [loadSettings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { openai_configured, ...rest } = settings;
            await updateSettings(rest);
            setToast({ type: 'success', message: 'Settings saved successfully!' });
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            setToast({ type: 'error', message: e.message });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Loading settings...</div>
        </div>
    );

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1>Settings</h1>
                    <p>Configure your AI Agent Command Center</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : '💾 Save Settings'}
                </button>
            </div>

            {/* System Health */}
            <div className="glass-card-static section-card" style={{ marginBottom: '24px' }}>
                <div className="section-header">
                    <h3 className="section-title">System Health</h3>
                    <span className={`status-badge ${health?.status === 'ok' ? 'status-completed' : 'status-failed'}`}>
                        {health?.status || 'unknown'}
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-glass)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Backend</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-green)' }}>Online ✅</div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-glass)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>OpenAI API</div>
                        <div style={{
                            fontSize: '14px', fontWeight: 600,
                            color: settings.openai_configured ? 'var(--accent-green)' : 'var(--accent-red)',
                        }}>
                            {settings.openai_configured ? 'Configured ✅' : 'Not Configured ❌'}
                        </div>
                    </div>
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-glass)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Check</div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>
                            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Orchestration Settings */}
            <div className="glass-card-static section-card" style={{ marginBottom: '24px' }}>
                <div className="section-header">
                    <h3 className="section-title">🧠 Orchestration</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div className="form-group">
                        <label className="form-label">Max Concurrent Agents</label>
                        <input className="form-input" type="number" min="1" max="20"
                            value={settings.max_concurrent_agents || '5'}
                            onChange={e => updateField('max_concurrent_agents', e.target.value)}
                            placeholder="5" />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Maximum number of agents running simultaneously
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Oversight Confidence Threshold</label>
                        <input className="form-input" type="number" min="0" max="1" step="0.05"
                            value={settings.oversight_threshold || '0.7'}
                            onChange={e => updateField('oversight_threshold', e.target.value)}
                            placeholder="0.7" />
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Tasks below this confidence score require human approval (0–1)
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Model Settings */}
            <div className="glass-card-static section-card" style={{ marginBottom: '24px' }}>
                <div className="section-header">
                    <h3 className="section-title">🤖 AI Model</h3>
                </div>
                <div className="form-group">
                    <label className="form-label">Default Model</label>
                    <select className="form-select" value={settings.default_model || 'gpt-4o-mini'}
                        onChange={e => updateField('default_model', e.target.value)}>
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </select>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Default model used when creating new agents
                    </div>
                </div>
            </div>

            {/* API Configuration Info */}
            <div className="glass-card-static section-card">
                <div className="section-header">
                    <h3 className="section-title">🔑 API Configuration</h3>
                </div>
                <div style={{
                    padding: '16px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                    fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.8',
                }}>
                    <p>Your OpenAI API key is stored securely in the backend <code style={{ color: 'var(--accent-blue)', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px' }}>.env</code> file.</p>
                    <p style={{ marginTop: '8px' }}>To update your API key, edit <code style={{ color: 'var(--accent-blue)', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px' }}>backend/.env</code> and set <code style={{ color: 'var(--accent-amber)', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px' }}>OPENAI_API_KEY</code> to your key, then restart the backend server.</p>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="toast-container">
                    <div className={`toast toast-${toast.type}`}>{toast.message}</div>
                </div>
            )}
        </div>
    );
}
