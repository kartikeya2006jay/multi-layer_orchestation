'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAgents, createAgent, updateAgent, deleteAgent } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

export default function AgentsPage() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editAgent, setEditAgent] = useState(null);
    const [form, setForm] = useState({
        name: '', description: '', system_prompt: 'You are a helpful AI assistant.',
        model: 'gpt-4o-mini', capabilities: '', max_tokens: 4096, temperature: 0.7,
    });
    const { subscribe } = useWebSocket();

    const loadAgents = useCallback(async () => {
        try {
            const data = await getAgents();
            setAgents(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadAgents(); }, [loadAgents]);
    useEffect(() => {
        const unsub = subscribe('agent:update', loadAgents);
        return unsub;
    }, [subscribe, loadAgents]);

    const openCreate = () => {
        setEditAgent(null);
        setForm({
            name: '', description: '', system_prompt: 'You are a helpful AI assistant.',
            model: 'gpt-4o-mini', capabilities: '', max_tokens: 4096, temperature: 0.7,
        });
        setShowModal(true);
    };

    const openEdit = (agent) => {
        setEditAgent(agent);
        setForm({
            name: agent.name,
            description: agent.description || '',
            system_prompt: agent.system_prompt || '',
            model: agent.model || 'gpt-4o-mini',
            capabilities: Array.isArray(agent.capabilities) ? agent.capabilities.join(', ') : '',
            max_tokens: agent.max_tokens || 4096,
            temperature: agent.temperature ?? 0.7,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            capabilities: form.capabilities.split(',').map(s => s.trim()).filter(Boolean),
            max_tokens: parseInt(form.max_tokens),
            temperature: parseFloat(form.temperature),
        };
        try {
            if (editAgent) {
                await updateAgent(editAgent.id, payload);
            } else {
                await createAgent(payload);
            }
            setShowModal(false);
            loadAgents();
        } catch (e) { alert(e.message); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this agent?')) return;
        try {
            await deleteAgent(id);
            loadAgents();
        } catch (e) { alert(e.message); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Loading agents...</div>
        </div>
    );

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1>AI Agents</h1>
                    <p>Configure and manage your AI agent fleet</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ New Agent</button>
            </div>

            {agents.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-icon">🤖</div>
                    <h3>No Agents Yet</h3>
                    <p>Create your first AI agent to get started</p>
                    <button className="btn btn-primary" onClick={openCreate}>Create Agent</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {agents.map(agent => (
                        <div key={agent.id} className="glass-card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--accent-blue-glow)', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: '22px',
                                    }}>🤖</div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{agent.name}</h3>
                                        <span className={`status-badge status-${agent.status}`}>{agent.status}</span>
                                    </div>
                                </div>
                            </div>

                            {agent.description && (
                                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                                    {agent.description}
                                </p>
                            )}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                    background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', fontWeight: 500,
                                }}>{agent.model}</span>
                                <span style={{
                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                    background: 'var(--bg-glass)', color: 'var(--text-muted)', fontWeight: 500,
                                }}>T: {agent.temperature}</span>
                                {(Array.isArray(agent.capabilities) ? agent.capabilities : []).map(cap => (
                                    <span key={cap} style={{
                                        padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                        background: 'var(--accent-green-glow)', color: 'var(--accent-green)', fontWeight: 500,
                                    }}>{cap}</span>
                                ))}
                            </div>

                            <div style={{
                                padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)',
                                fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace',
                                maxHeight: '60px', overflow: 'hidden', marginBottom: '16px',
                            }}>
                                {agent.system_prompt}
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(agent)} style={{ flex: 1 }}>Edit</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(agent.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h2>{editAgent ? 'Edit Agent' : 'Create New Agent'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Agent Name *</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Content Writer" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of what this agent does" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">System Prompt</label>
                                <textarea className="form-textarea" value={form.system_prompt} onChange={e => setForm({ ...form, system_prompt: e.target.value })} placeholder="Instructions for the AI agent" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Model</label>
                                    <select className="form-select" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })}>
                                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Temperature ({form.temperature})</label>
                                    <input type="range" min="0" max="2" step="0.1" value={form.temperature}
                                        onChange={e => setForm({ ...form, temperature: e.target.value })}
                                        style={{ width: '100%', marginTop: '8px' }} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Capabilities (comma separated)</label>
                                <input className="form-input" value={form.capabilities} onChange={e => setForm({ ...form, capabilities: e.target.value })}
                                    placeholder="e.g. writing, analysis, coding" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editAgent ? 'Save Changes' : 'Create Agent'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
