'use client';
import { useState, useEffect, useCallback } from 'react';
import { getOversightQueue, approveOversight, rejectOversight } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';

export default function OversightPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [expandedId, setExpandedId] = useState(null);
    const [notes, setNotes] = useState('');
    const { subscribe } = useWebSocket();

    const loadQueue = useCallback(async () => {
        try {
            const data = await getOversightQueue(filter);
            setItems(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { loadQueue(); }, [loadQueue]);
    useEffect(() => {
        const unsubs = [
            subscribe('oversight:new', loadQueue),
            subscribe('oversight:resolved', loadQueue),
        ];
        return () => unsubs.forEach(u => u());
    }, [subscribe, loadQueue]);

    const handleApprove = async (id) => {
        try {
            await approveOversight(id, notes);
            setNotes('');
            setExpandedId(null);
            loadQueue();
        } catch (e) { alert(e.message); }
    };

    const handleReject = async (id) => {
        try {
            await rejectOversight(id, notes);
            setNotes('');
            setExpandedId(null);
            loadQueue();
        } catch (e) { alert(e.message); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ color: 'var(--text-secondary)' }}>Loading oversight queue...</div>
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1>Human Oversight</h1>
                <p>Review and approve AI agent decisions that require human judgment</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {['pending', 'approved', 'rejected'].map(s => (
                    <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilter(s)}>
                        {s === 'pending' ? '⏳ ' : s === 'approved' ? '✅ ' : '❌ '}{s}
                    </button>
                ))}
            </div>

            {items.length === 0 ? (
                <div className="glass-card-static empty-state">
                    <div className="empty-icon">👁️</div>
                    <h3>No {filter} Items</h3>
                    <p>{filter === 'pending' ? 'All clear! No decisions need your attention right now.' : `No ${filter} items found.`}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map(item => (
                        <div key={item.id} className="glass-card-static" style={{ padding: '24px', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <span className={`status-badge status-${item.status}`}>{item.status}</span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                                            background: 'var(--accent-purple-glow)', color: 'var(--accent-purple)', fontWeight: 500,
                                        }}>{item.type}</span>
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{item.task_title || 'Untitled Task'}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                        Agent: {item.agent_name || 'Default'} · {new Date(item.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div style={{
                                padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                                background: 'var(--accent-amber-glow)', border: '1px solid rgba(251, 191, 36, 0.2)',
                                fontSize: '13px', color: 'var(--accent-amber)', marginBottom: '16px',
                            }}>
                                ⚠️ {item.reason}
                            </div>

                            {/* Task Output Preview */}
                            {item.task_output && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>
                                        AI OUTPUT
                                    </label>
                                    <div style={{
                                        padding: '16px', borderRadius: 'var(--radius-sm)',
                                        background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)',
                                        fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7',
                                        maxHeight: expandedId === item.id ? 'none' : '150px', overflow: 'hidden',
                                        position: 'relative',
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                        {item.task_output}
                                        {expandedId !== item.id && item.task_output.length > 300 && (
                                            <div style={{
                                                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
                                                background: 'linear-gradient(transparent, rgba(18,20,30,0.95))',
                                            }} />
                                        )}
                                    </div>
                                    {item.task_output.length > 300 && (
                                        <button className="btn btn-ghost btn-sm" style={{ marginTop: '8px' }}
                                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                            {expandedId === item.id ? 'Collapse' : 'Expand'}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {item.status === 'pending' && (
                                <div>
                                    <div className="form-group" style={{ marginBottom: '12px' }}>
                                        <textarea className="form-textarea" value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder="Optional reviewer notes..." style={{ minHeight: '60px' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn btn-success" onClick={() => handleApprove(item.id)}>
                                            ✅ Approve
                                        </button>
                                        <button className="btn btn-danger" onClick={() => handleReject(item.id)}>
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Resolved Info */}
                            {item.status !== 'pending' && item.reviewer_notes && (
                                <div style={{
                                    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                                    background: 'var(--bg-glass)', fontSize: '13px', color: 'var(--text-secondary)',
                                }}>
                                    <strong>Reviewer Notes:</strong> {item.reviewer_notes}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
