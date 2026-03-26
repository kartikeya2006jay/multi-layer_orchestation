'use client';
import { useState, useEffect, useCallback } from 'react';
import { getWorkflows, createWorkflow, deleteWorkflow, executeWorkflow, getAgents } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

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

    const addStep = () => {
        setForm({ ...form, steps: [...form.steps, { title: '', description: '', agentId: '' }] });
    };

    const removeStep = (index) => {
        setForm({ ...form, steps: form.steps.filter((_, i) => i !== index) });
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...form.steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
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
            <div style={{ color: 'var(--text-secondary)' }}>Loading workflows...</div>
        </div>
    );

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1>Workflows</h1>
                    <p>Create multi-agent pipelines for complex operations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Workflow</button>
            </div>

            {workflows.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-icon">🔄</div>
                    <h3>No Workflows Yet</h3>
                    <p>Create a workflow to chain multiple agent tasks together</p>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Create Workflow</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                    {workflows.map(wf => (
                        <div key={wf.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{wf.name}</h3>
                                    <span className={`status-badge status-${wf.status}`}>{wf.status}</span>
                                </div>
                                <span style={{
                                    padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                                    background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)',
                                }}>{wf.steps?.length || 0} steps</span>
                            </div>

                            {wf.description && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{wf.description}</p>
                            )}

                            {/* Steps Preview */}
                            <div style={{ marginBottom: '16px' }}>
                                {(wf.steps || []).map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
                                        borderBottom: i < wf.steps.length - 1 ? '1px solid var(--border-glass)' : 'none',
                                    }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            background: wf.status === 'running' && wf.current_step === i ? 'var(--accent-blue)' :
                                                wf.status === 'running' && wf.current_step > i ? 'var(--accent-green)' : 'var(--bg-glass)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)',
                                            border: '1px solid var(--border-glass)',
                                            flexShrink: 0,
                                        }}>{i + 1}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                            {step.title || step.description || `Step ${i + 1}`}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleExecute(wf.id)}
                                    disabled={wf.status === 'running'} style={{ flex: 1 }}>
                                    ▶ Execute
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(wf.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Workflow Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <h2>Create Workflow</h2>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Workflow Name *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                    placeholder="e.g. Content Pipeline" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="What does this workflow do?" />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Pipeline Steps</label>
                                    <button type="button" className="btn btn-ghost btn-sm" onClick={addStep}>+ Add Step</button>
                                </div>

                                {form.steps.map((step, i) => (
                                    <div key={i} style={{
                                        padding: '16px', borderRadius: 'var(--radius-sm)',
                                        background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
                                        marginBottom: '10px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-blue)' }}>Step {i + 1}</span>
                                            {form.steps.length > 1 && (
                                                <button type="button" onClick={() => removeStep(i)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                                            )}
                                        </div>
                                        <input className="form-input" value={step.title} onChange={e => updateStep(i, 'title', e.target.value)}
                                            placeholder="Step title" style={{ marginBottom: '8px', fontSize: '13px' }} />
                                        <textarea className="form-textarea" value={step.description} onChange={e => updateStep(i, 'description', e.target.value)}
                                            placeholder="Instructions for this step..." style={{ minHeight: '60px', fontSize: '13px', marginBottom: '8px' }} />
                                        <select className="form-select" value={step.agentId} onChange={e => updateStep(i, 'agentId', e.target.value)}
                                            style={{ fontSize: '13px' }}>
                                            <option value="">Auto-assign agent</option>
                                            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Workflow</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
