'use client';
import { useState, useEffect, useCallback } from 'react';
import { getWorkflows, createWorkflow, deleteWorkflow, executeWorkflow, getAgents } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import WorkflowBuilder from '@/components/WorkflowBuilder';

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', steps: [{ title: '', description: '', agentId: '' }] });
    const { subscribe } = useWebSocket();

    const loadWorkflows = useCallback(async () => {
        try {
            const data = await getWorkflows();
            setWorkflows(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    const loadAgents = useCallback(async () => {
        try { setAgents(await getAgents()); } catch { }
    }, []);

    useEffect(() => { loadWorkflows(); loadAgents(); }, [loadWorkflows, loadAgents]);
    useEffect(() => {
        const unsub = subscribe('workflow:update', loadWorkflows);
        return unsub;
    }, [subscribe, loadWorkflows]);

    const handleStepsChange = (newSteps) => {
        setForm({ ...form, steps: newSteps });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createWorkflow(form);
            setShowModal(false);
            setForm({ name: '', description: '', steps: [{ title: '', description: '', agentId: '' }] });
            loadWorkflows();
        } catch (e) { alert(e.message); }
    };

    const handleExecute = async (id) => {
        if (!confirm('Execute this workflow?')) return;
        try { await executeWorkflow(id); loadWorkflows(); } catch (e) { alert(e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this workflow?')) return;
        try { await deleteWorkflow(id); loadWorkflows(); } catch (e) { alert(e.message); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="pulse" style={{ color: 'var(--text-secondary)' }}>Syncing workflow architectures...</div>
        </div>
    );

    return (
        <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px' }}>Workflows</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Design and orchestrate multi-agent autonomous pipelines.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '12px 24px', fontWeight: 700 }}>
                    + System Architect
                </button>
            </div>

            {workflows.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No Architectures Yet</h3>
                    <p>Create a workflow to chain multiple agent tasks together</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Workflow</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                    {workflows.map(wf => (
                        <div key={wf.id} className="glass-card" style={{ padding: '24px', transition: 'all 0.3s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{wf.name}</h3>
                                    <span className={`status-badge status-${wf.status}`}>{wf.status}</span>
                                </div>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800,
                                    background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)',
                                }}>{wf.steps?.length || 0} STEPS</span>
                            </div>

                            {wf.description && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>{wf.description}</p>
                            )}

                            <div style={{ marginBottom: '24px' }}>
                                {(wf.steps || []).map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0',
                                        borderBottom: i < wf.steps.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '8px',
                                            background: wf.status === 'running' && wf.current_step === i ? 'var(--accent-blue)' :
                                                wf.status === 'running' && wf.current_step > i ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '12px', fontWeight: 900, color: 'white',
                                            border: '1px solid var(--border-glass)',
                                            boxShadow: wf.status === 'running' && wf.current_step === i ? '0 0 15px var(--accent-blue-glow)' : 'none',
                                            flexShrink: 0,
                                        }} className={wf.status === 'running' && wf.current_step === i ? 'pulse-active' : ''}>
                                            {i + 1}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: wf.status === 'running' && wf.current_step === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                                            fontWeight: wf.status === 'running' && wf.current_step === i ? 700 : 500
                                        }}>
                                            {step.title || step.description || `Step ${i + 1}`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn btn-success" onClick={() => handleExecute(wf.id)}
                                    disabled={wf.status === 'running'} style={{ flex: 1, fontWeight: 800, padding: '10px' }}>
                                    {wf.status === 'running' ? '🚀 Orchestrating...' : '▶ Deploy Pipeline'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(wf.id)} style={{ padding: '0 15px' }}>
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Workflow Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '95vh', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-1px' }}>System Architect</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Design a multi-stage autonomous pipeline for complex agentic targets.</p>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                <div className="form-group">
                                    <label className="form-label">Architecture Name *</label>
                                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                        placeholder="e.g. Market Intel Pipeline" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Mission Brief</label>
                                    <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                        placeholder="Goal of this workflow..." />
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Step Orchestration</label>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleStepsChange([...form.steps, { title: '', description: '', agentId: '' }])}>
                                        + Manual Step
                                    </button>
                                </div>

                                <WorkflowBuilder
                                    steps={form.steps}
                                    onChange={handleStepsChange}
                                    agents={agents}
                                />
                            </div>

                            <div className="modal-actions" style={{ marginTop: '32px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, fontWeight: 700 }}>Deploy Workflow Architecture</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style jsx>{`
                .pulse-active {
                    animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-ring {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
