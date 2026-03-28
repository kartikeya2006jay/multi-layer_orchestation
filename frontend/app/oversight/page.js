'use client';
import { useState, useEffect, useCallback } from 'react';
import { getOversightQueue, approveOversight, rejectOversight } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import { formatISTDateTime } from '@/lib/time';

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
        <div className="loading-container">
            <div className="chakra-loader">
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-ring"></div>
                <div className="loader-core"></div>
            </div>
            <p className="loading-text">Synchronizing Strategic Queue...</p>
        </div>
    );

    return (
        <div className="oversight-container">
            <header className="page-header animate-in">
                <div className="header-meta">
                    <div className="intel-segment">
                        <span className="intel-tag">STRATEGIC_OVERSIGHT_v4.2</span>
                        <div className="pulse-line"></div>
                    </div>
                    <div className="system-status-pill">
                        <div className="status-dot"></div>
                        <span>DECISION_CENTER_ACTIVE</span>
                    </div>
                </div>
                <div className="header-main-group">
                    <h1 className="dashboard-title">
                        <span className="title-alt">CHAKRAVIEW</span>
                        <span className="title-main">DECISION CENTER</span>
                    </h1>
                    <p className="header-subtitle">Strategic review of autonomous agent operations requiring human confirmation</p>
                </div>
                <div className="header-decoration"></div>
            </header>

            {/* Premium Filters */}
            <div className="filter-shelf animate-in" style={{ animationDelay: '0.1s' }}>
                <div className="filter-group-pill">
                    {['pending', 'approved', 'rejected'].map(s => (
                        <button key={s}
                            className={`filter-pill ${filter === s ? 'active' : ''}`}
                            onClick={() => setFilter(s)}>
                            <span className="pill-dot"></span>
                            {s.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div className="queue-count">
                    <span className="count-label">QUEUE_LOAD:</span>
                    <span className="count-val">{items.length} ENTITIES</span>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="glass-card empty-state animate-in" style={{ animationDelay: '0.2s' }}>
                    <div className="empty-icon-wrapper">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        <div className="icon-pulse"></div>
                    </div>
                    <h3>OVERSIGHT_CLEAR</h3>
                    <p>
                        {filter === 'pending'
                            ? 'No operational decisions currently require manual intervention. System running autonomous.'
                            : `Archive terminal clear for ${filter} records.`}
                    </p>
                    <div className="empty-decoration"></div>
                </div>
            ) : (
                <div className="oversight-grid">
                    {items.map((item, idx) => (
                        <div key={item.id} className="oversight-card animate-in" style={{ animationDelay: `${0.2 + idx * 0.1}s` }}>
                            <div className="card-top">
                                <div className="id-badge">
                                    <span className="id-prefix">OP_IDX:</span>
                                    <span className="id-val">{item.id.slice(0, 8)}</span>
                                </div>
                                <div className={`status-badge-elite ${item.status}`}>
                                    <span className="dot"></span>
                                    {item.status.toUpperCase()}
                                </div>
                            </div>

                            <div className="card-content">
                                <div className="task-info">
                                    <div className="type-tag">{item.type}</div>
                                    <h3 className="task-title">{item.task_title || 'UNTITLED_OPERATION'}</h3>
                                    <div className="meta-row">
                                        <span className="agent-name">ENTITY: {item.agent_name || 'DEFAULT_NODE'}</span>
                                        <span className="timestamp">{formatISTDateTime(item.created_at)}</span>
                                    </div>
                                </div>

                                <div className="reason-container">
                                    <div className="reason-header">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                        TRIGGER_REASON
                                    </div>
                                    <p className="reason-text">{item.reason}</p>
                                </div>

                                {item.task_output && (
                                    <div className="output-section">
                                        <div className="output-header">
                                            <span>NEURAL_OUTPUT_STREAM</span>
                                            <div className="stream-line"></div>
                                        </div>
                                        <div className={`output-terminal ${expandedId === item.id ? 'expanded' : ''}`}>
                                            <code>{item.task_output}</code>
                                            {expandedId !== item.id && item.task_output.length > 300 && (
                                                <div className="terminal-fade"></div>
                                            )}
                                        </div>
                                        {item.task_output.length > 300 && (
                                            <button className="btn-expand"
                                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}>
                                                {expandedId === item.id ? 'COLLAPSE_STREAM' : 'EXPAND_FULL_STREAM'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {item.status === 'pending' && (
                                <div className="card-actions">
                                    <div className="notes-area">
                                        <textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder="Insert strategic directives (optional)..."
                                        />
                                    </div>
                                    <div className="btn-group-elite">
                                        <button className="btn-elite approve" onClick={() => handleApprove(item.id)}>
                                            <div className="btn-content">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                CONFIRM_STRATEGY
                                            </div>
                                        </button>
                                        <button className="btn-elite reject" onClick={() => handleReject(item.id)}>
                                            <div className="btn-content">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                INTERCEPT_OPERATION
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {item.status !== 'pending' && item.reviewer_notes && (
                                <div className="resolution-info">
                                    <label>DIRECTIVE_LOG:</label>
                                    <p>{item.reviewer_notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .oversight-container {
                    padding: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 48px;
                    position: relative;
                }

                .header-meta {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-bottom: 24px;
                }

                .intel-segment {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .intel-tag {
                    font-size: 10px;
                    font-weight: 950;
                    letter-spacing: 4px;
                    color: var(--accent-purple);
                    background: rgba(168, 85, 247, 0.1);
                    padding: 4px 12px;
                    border-radius: 4px;
                    border-left: 3px solid var(--accent-purple);
                }

                .pulse-line {
                    width: 60px;
                    height: 1px;
                    background: linear-gradient(90deg, var(--accent-purple), transparent);
                    position: relative;
                }

                .pulse-line::after {
                    content: '';
                    position: absolute;
                    left: 0; top: -1px;
                    width: 4px; height: 3px;
                    background: white;
                    box-shadow: 0 0 10px white;
                    animation: pulse-move 3s infinite linear;
                }

                @keyframes pulse-move {
                    0% { left: 0; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { left: 100%; opacity: 0; }
                }

                .dashboard-title {
                    font-size: 64px;
                    font-weight: 950;
                    letter-spacing: -3px;
                    line-height: 0.9;
                    margin: 0 0 16px;
                    display: flex;
                    flex-direction: column;
                }

                .title-alt {
                    font-size: 14px;
                    letter-spacing: 12px;
                    color: var(--text-muted);
                    font-weight: 800;
                    margin-bottom: 8px;
                }

                .title-main {
                    background: linear-gradient(to bottom, #fff 30%, var(--accent-purple) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-subtitle {
                    font-size: 18px;
                    color: var(--text-muted);
                    font-weight: 500;
                    max-width: 600px;
                    line-height: 1.6;
                }

                .system-status-pill {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--accent-blue);
                    background: rgba(59, 130, 246, 0.05);
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    letter-spacing: 1.5px;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--accent-blue);
                    border-radius: 50%;
                    box-shadow: 0 0 15px var(--accent-blue);
                    animation: pulse-dot 2s infinite;
                }

                /* Filters */
                .filter-shelf {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    padding: 4px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.04);
                }

                .filter-group-pill {
                    display: flex;
                    gap: 4px;
                    padding: 4px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                }

                .filter-pill {
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    padding: 10px 24px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1.5px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .filter-pill.active {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .pill-dot {
                    width: 4px; height: 4px;
                    background: var(--text-muted);
                    border-radius: 50%;
                    transition: all 0.3s;
                }

                .filter-pill.active .pill-dot {
                    background: var(--accent-purple);
                    box-shadow: 0 0 8px var(--accent-purple);
                }

                .queue-count {
                    padding-right: 24px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }

                .count-label { color: var(--text-muted); margin-right: 8px; }
                .count-val { color: var(--accent-blue); }

                /* Cards */
                .oversight-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .oversight-card {
                    background: rgba(255, 255, 255, 0.01);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    overflow: hidden;
                    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .oversight-card:hover {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.1);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                .card-top {
                    padding: 20px 32px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(to right, rgba(255,255,255,0.01), transparent);
                }

                .id-badge {
                    font-family: var(--font-mono);
                    font-size: 10px;
                    font-weight: 700;
                }

                .id-prefix { color: var(--text-muted); margin-right: 6px; }
                .id-val { color: var(--accent-blue); opacity: 0.8; }

                .status-badge-elite {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 1px;
                    padding: 6px 14px;
                    border-radius: 20px;
                }

                .status-badge-elite.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .status-badge-elite.approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .status-badge-elite.rejected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

                .status-badge-elite .dot {
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: currentColor;
                    box-shadow: 0 0 8px currentColor;
                }

                .card-content {
                    padding: 32px;
                }

                .task-info {
                    margin-bottom: 24px;
                }

                .type-tag {
                    font-size: 10px;
                    font-weight: 950;
                    color: var(--accent-purple);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 12px;
                }

                .task-title {
                    font-size: 24px;
                    font-weight: 850;
                    margin: 0 0 8px;
                    letter-spacing: -0.5px;
                }

                .meta-row {
                    display: flex;
                    gap: 20px;
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .agent-name { color: var(--accent-blue); opacity: 0.8; }

                .reason-container {
                    background: rgba(245, 158, 11, 0.03);
                    border: 1px solid rgba(245, 158, 11, 0.1);
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                }

                .reason-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 10px;
                    font-weight: 900;
                    color: #f59e0b;
                    letter-spacing: 1.5px;
                    margin-bottom: 8px;
                }

                .reason-text {
                    font-size: 14px;
                    color: #fff;
                    margin: 0;
                    line-height: 1.5;
                    opacity: 0.9;
                }

                .output-section {
                    margin-top: 32px;
                }

                .output-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    font-size: 10px;
                    font-weight: 900;
                    color: var(--text-muted);
                    letter-spacing: 2px;
                    margin-bottom: 12px;
                }

                .stream-line {
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
                }

                .output-terminal {
                    background: #090a0f;
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 20px;
                    font-family: var(--font-mono);
                    font-size: 13px;
                    color: var(--text-secondary);
                    line-height: 1.8;
                    position: relative;
                    max-height: 200px;
                    overflow: hidden;
                    white-space: pre-wrap;
                    transition: max-height 0.5s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .output-terminal.expanded {
                    max-height: 2000px;
                }

                .terminal-fade {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 80px;
                    background: linear-gradient(transparent, #090a0f);
                }

                .btn-expand {
                    background: transparent;
                    border: none;
                    color: var(--accent-blue);
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    padding: 12px 0;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s;
                }

                .btn-expand:hover { opacity: 1; }

                .card-actions {
                    padding: 0 32px 32px;
                }

                .notes-area textarea {
                    width: 100%;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 16px;
                    color: #fff;
                    font-size: 14px;
                    resize: vertical;
                    min-height: 80px;
                    margin-bottom: 20px;
                    transition: all 0.3s;
                }

                .notes-area textarea:focus {
                    outline: none;
                    border-color: rgba(168, 85, 247, 0.3);
                    background: rgba(0,0,0,0.3);
                }

                .btn-group-elite {
                    display: grid;
                    grid-template-columns: 1.5fr 1fr;
                    gap: 16px;
                }

                .btn-elite {
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s;
                }

                .btn-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 14px 24px;
                    font-size: 12px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    position: relative;
                    z-index: 2;
                }

                .btn-elite.approve {
                    background: var(--accent-purple);
                    color: #fff;
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
                }

                .btn-elite.approve:hover {
                    box-shadow: 0 0 30px rgba(168, 85, 247, 0.6);
                    transform: scale(1.02);
                }

                .btn-elite.reject {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .btn-elite.reject:hover {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: rgba(239, 68, 68, 0.4);
                }

                .resolution-info {
                    margin: 0 32px 32px;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 12px;
                    border-left: 3px solid var(--accent-blue);
                }

                .resolution-info label {
                    display: block;
                    font-size: 9px;
                    font-weight: 900;
                    color: var(--text-muted);
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }

                .resolution-info p {
                    font-size: 13px;
                    color: #fff;
                    margin: 0;
                    opacity: 0.8;
                }

                /* Empty State Decor */
                .empty-state {
                    padding: 80px 40px;
                    text-align: center;
                    position: relative;
                }

                .empty-icon-wrapper {
                    position: relative;
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 32px;
                }

                .icon-pulse {
                    position: absolute;
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px; height: 100px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
                    animation: breathe 4s infinite;
                }

                .empty-state h3 {
                    font-size: 24px;
                    font-weight: 950;
                    letter-spacing: 4px;
                    margin-bottom: 16px;
                }

                .empty-state p {
                    font-size: 14px;
                    color: var(--text-muted);
                    max-width: 400px;
                    margin: 0 auto;
                    line-height: 1.6;
                }

                /* Loading State */
                .loading-container {
                    height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .chakra-loader {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin-bottom: 24px;
                }

                .loader-ring {
                    position: absolute;
                    inset: 0;
                    border: 2px solid transparent;
                    border-top-color: var(--accent-purple);
                    border-radius: 50%;
                    animation: spin 1.5s linear infinite;
                }
                .loader-ring:nth-child(2) { inset: 8px; border-top-color: var(--accent-blue); animation-duration: 2s; animation-direction: reverse; }
                .loader-ring:nth-child(3) { inset: 16px; border-top-color: var(--accent-cyan); animation-duration: 2.5s; }

                .loader-core {
                    position: absolute;
                    inset: 30px;
                    background: var(--accent-purple);
                    border-radius: 50%;
                    box-shadow: 0 0 20px var(--accent-purple);
                    animation: pulse-dot 2s infinite;
                }

                .loading-text {
                    font-size: 10px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                @keyframes breathe {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
                    50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.6; }
                }

                @keyframes pulse-dot {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.3); opacity: 1; }
                }

                .animate-in {
                    animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    opacity: 0;
                }

                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
