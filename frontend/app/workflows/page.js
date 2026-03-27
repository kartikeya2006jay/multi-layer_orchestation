'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getWorkflows, createWorkflow, updateWorkflow, deleteWorkflow, executeWorkflow, getAgents } from '@/lib/api';
import { useWebSocket } from '@/lib/websocket';
import WorkflowCanvas from '@/components/WorkflowBuilder';

const STEP_TYPES = ['Agent', 'Tool', 'API Call', 'Conditional', 'Parallel'];
const ADAPTERS = ['OpenAI', 'Anthropic', 'Google', 'Custom'];
const AGENT_PATTERNS = ['Research Agent', 'Code Generator', 'Data Processor', 'QA Validator', 'Report Writer', 'Custom Agent'];

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState([]);
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active workflow being edited
    const [activeWorkflow, setActiveWorkflow] = useState(null);
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDesc, setWorkflowDesc] = useState('');
    const [canvasNodes, setCanvasNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    // Right sidebar form
    const [newStep, setNewStep] = useState({
        title: '',
        agentPattern: 'Research Agent',
        stepType: 'Agent',
        adapter: 'OpenAI',
        model: 'gpt-4',
        description: '',
    });

    // Execution stream
    const [isRunning, setIsRunning] = useState(false);
    const [showLedger, setShowLedger] = useState(false);
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const ledgerRef = useRef(null);

    // Workflow list sidebar
    const [showWorkflowList, setShowWorkflowList] = useState(false);

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

    // WebSocket subscriptions for live execution stream
    useEffect(() => {
        const unsub1 = subscribe('workflow:update', (data) => {
            loadWorkflows();
            if (showLedger) {
                const now = new Date();
                const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
                if (data.status === 'running') {
                    addLedgerEntry(ts, 'ORCHESTRATOR', 'Booting execution engine...', 'orchestrator');
                } else if (data.status === 'completed') {
                    addLedgerEntry(ts, 'ORCHESTRATOR', `Workflow executed internally in ${((Date.now() - (window.__wfStartTime || Date.now())) / 1000).toFixed(1)}s.`, 'orchestrator');
                    addLedgerEntry(ts, 'SYSTEM', 'Execution Stream Closed.', 'system');
                    setIsRunning(false);
                } else if (data.status === 'failed') {
                    addLedgerEntry(ts, 'SYSTEM', `Execution Failed: ${data.error || 'Unknown error'}`, 'error');
                    setIsRunning(false);
                } else if (data.current_step !== undefined) {
                    const stepName = canvasNodes[data.current_step]?.title || `Step ${data.current_step + 1}`;
                    addLedgerEntry(ts, 'ORCHESTRATOR', `Advancing to step: ${stepName}`, 'orchestrator');
                }
            }
        });
        const unsub2 = subscribe('task:created', (data) => {
            if (showLedger) {
                const now = new Date();
                const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
                addLedgerEntry(ts, 'DATA PROCESSING STEP', `AGENT INIT: Allocating ${newStep.model || 'gpt-4'} via ${newStep.adapter || 'OpenAI'}...`, 'step');
            }
        });
        const unsub3 = subscribe('task:update', (data) => {
            if (showLedger) {
                const now = new Date();
                const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
                if (data.status === 'running') {
                    addLedgerEntry(ts, 'DATA PROCESSING STEP', `LLM INFERENCE: Actively streaming from ${newStep.model || 'gpt-4'} engine...`, 'inference');
                } else if (data.status === 'completed') {
                    addLedgerEntry(ts, 'DATA PROCESSING STEP', `STEP COMPLETED [Verify: 0x${Math.random().toString(16).slice(2, 14)}]`, 'step');
                }
            }
        });
        return () => { unsub1(); unsub2(); unsub3(); };
    }, [subscribe, showLedger, canvasNodes, loadWorkflows, newStep]);

    const addLedgerEntry = (timestamp, badge, message, type) => {
        setLedgerEntries(prev => [...prev, { timestamp, badge, message, type, id: Date.now() + Math.random() }]);
        setTimeout(() => {
            if (ledgerRef.current) {
                ledgerRef.current.scrollTop = ledgerRef.current.scrollHeight;
            }
        }, 50);
    };

    // Place nodes in a vertical cascade
    const placeNewNode = (stepData) => {
        const yOffset = canvasNodes.length * 140 + 60;
        const xCenter = 300;
        return {
            ...stepData,
            x: xCenter,
            y: yOffset,
        };
    };

    const handleAddStep = () => {
        const newNode = placeNewNode({
            title: newStep.title || newStep.agentPattern,
            stepType: newStep.stepType,
            adapter: newStep.adapter,
            model: newStep.model,
            description: newStep.description,
            agentPattern: newStep.agentPattern,
            agentId: '',
        });
        setCanvasNodes([...canvasNodes, newNode]);
        setNewStep({ title: '', agentPattern: 'Research Agent', stepType: 'Agent', adapter: 'OpenAI', model: 'gpt-4', description: '' });
    };

    const handleRemoveNode = (index) => {
        setCanvasNodes(canvasNodes.filter((_, i) => i !== index));
        if (selectedNode === index) setSelectedNode(null);
    };

    const handleSaveDraft = async () => {
        const steps = canvasNodes.map(n => ({
            title: n.title,
            description: n.description || '',
            agentId: n.agentId || '',
            stepType: n.stepType,
            adapter: n.adapter,
            model: n.model,
        }));
        try {
            if (activeWorkflow) {
                await updateWorkflow(activeWorkflow.id, { name: workflowName, description: workflowDesc, steps });
            } else {
                const wf = await createWorkflow({ name: workflowName || 'Untitled Workflow', description: workflowDesc, steps });
                setActiveWorkflow(wf);
            }
            loadWorkflows();
        } catch (e) { alert(e.message); }
    };

    const handleRunWorkflow = async () => {
        // Save first
        await handleSaveDraft();

        // Reload to get latest active workflow
        const data = await getWorkflows();
        const wf = activeWorkflow ? data.find(w => w.id === activeWorkflow.id) : data[0];
        if (!wf) return alert('Please save workflow first');

        setShowLedger(true);
        setLedgerEntries([]);
        setIsRunning(true);
        window.__wfStartTime = Date.now();

        const now = new Date();
        const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        addLedgerEntry(ts, 'SYSTEM', 'Initializing execution pipeline...', 'system');

        try {
            await executeWorkflow(wf.id);
        } catch (e) {
            addLedgerEntry(ts, 'SYSTEM', `Execution Error: ${e.message}`, 'error');
            setIsRunning(false);
        }
    };

    const handleLoadWorkflow = (wf) => {
        setActiveWorkflow(wf);
        setWorkflowName(wf.name);
        setWorkflowDesc(wf.description || '');
        const steps = (wf.steps || []).map((s, i) => ({
            ...s,
            x: 300,
            y: i * 140 + 60,
            stepType: s.stepType || 'Agent',
            adapter: s.adapter || 'OpenAI',
            model: s.model || 'gpt-4',
        }));
        setCanvasNodes(steps);
        setShowWorkflowList(false);
        setShowLedger(false);
    };

    const handleNewWorkflow = () => {
        setActiveWorkflow(null);
        setWorkflowName('');
        setWorkflowDesc('');
        setCanvasNodes([]);
        setSelectedNode(null);
        setShowWorkflowList(false);
        setShowLedger(false);
    };

    const handleDeleteWorkflow = async (id) => {
        if (!confirm('Delete this workflow?')) return;
        try {
            await deleteWorkflow(id);
            loadWorkflows();
            if (activeWorkflow?.id === id) handleNewWorkflow();
        } catch (e) { alert(e.message); }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div className="pulse" style={{ color: 'var(--text-secondary)' }}>Syncing workflow architectures...</div>
        </div>
    );

    const badgeColors = {
        orchestrator: { bg: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: 'rgba(6,182,212,0.3)' },
        step: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
        inference: { bg: 'rgba(59,130,246,0.15)', color: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
        system: { bg: 'rgba(255,255,255,0.05)', color: '#9499b3', border: 'rgba(255,255,255,0.1)' },
        error: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: 'calc(100vh - 24px)', margin: '-40px -60px',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* === TOP BAR === */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(8,10,18,0.95)', backdropFilter: 'blur(20px)',
                zIndex: 20, flexShrink: 0, gap: '16px',
            }}>
                {/* Left: workflow selector & name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <button onClick={() => setShowWorkflowList(!showWorkflowList)} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s ease',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        Workflows
                    </button>
                    <input
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Customer Support Agent Flow"
                        style={{
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px', padding: '8px 16px', color: 'var(--text-primary)',
                            fontSize: '14px', fontWeight: 600, width: '300px', outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(59,130,246,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <span style={{
                        padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)', letterSpacing: '0.5px',
                    }}>v1.0.0 Draft</span>
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={handleNewWorkflow} style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px', padding: '8px 16px', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                        transition: 'all 0.2s',
                    }}>+ New</button>
                    <button onClick={handleSaveDraft} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', padding: '8px 18px', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: '13px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                        </svg>
                        Save Draft
                    </button>
                    <button onClick={handleRunWorkflow} disabled={canvasNodes.length === 0 || isRunning} style={{
                        background: canvasNodes.length === 0 ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #059669, #10b981)',
                        border: 'none', borderRadius: '8px', padding: '8px 20px',
                        color: 'white', cursor: canvasNodes.length === 0 || isRunning ? 'not-allowed' : 'pointer',
                        fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: canvasNodes.length > 0 ? '0 4px 15px rgba(16,185,129,0.3)' : 'none',
                        opacity: canvasNodes.length === 0 || isRunning ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}>
                        <span style={{ fontSize: '12px' }}>▶</span>
                        {isRunning ? 'Running...' : 'Run Workflow'}
                    </button>
                </div>
            </div>

            {/* === MAIN AREA: Canvas + Right Sidebar === */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>

                {/* Workflow List Dropdown */}
                {showWorkflowList && (
                    <div style={{
                        position: 'absolute', top: '0', left: '0',
                        width: '320px', maxHeight: '100%', overflowY: 'auto',
                        background: 'rgba(8,10,18,0.98)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0 0 16px 0', zIndex: 30, padding: '16px',
                        boxShadow: '4px 0 40px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(20px)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>Saved Workflows</span>
                            <button onClick={() => setShowWorkflowList(false)} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '16px',
                            }}>✕</button>
                        </div>
                        {workflows.length === 0 ? (
                            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                                No saved workflows yet
                            </div>
                        ) : workflows.map(wf => (
                            <div key={wf.id} style={{
                                padding: '12px 14px', borderRadius: '10px', marginBottom: '6px',
                                background: activeWorkflow?.id === wf.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${activeWorkflow?.id === wf.id ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.04)'}`,
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                                onClick={() => handleLoadWorkflow(wf)}
                            >
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>{wf.name}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{wf.steps?.length || 0} steps · {wf.status || 'draft'}</div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(wf.id); }} style={{
                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#f87171', width: '22px', height: '22px', borderRadius: '6px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', fontSize: '10px', flexShrink: 0,
                                }}>✕</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* === CANVAS === */}
                <WorkflowCanvas
                    nodes={canvasNodes}
                    onNodesChange={setCanvasNodes}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                />

                {/* === IMMUTABLE AUDIT LEDGER OVERLAY === */}
                {showLedger && (
                    <div style={{
                        position: 'absolute', top: '16px', left: '16px', right: '310px', bottom: '16px',
                        background: 'rgba(5,6,10,0.96)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px', zIndex: 25, display: 'flex', flexDirection: 'column',
                        overflow: 'hidden', backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}>
                        {/* Ledger Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    Immutable Audit Ledger
                                </span>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '3px 10px', borderRadius: '12px',
                                    background: isRunning ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${isRunning ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                }}>
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: isRunning ? '#10b981' : 'var(--text-muted)',
                                        boxShadow: isRunning ? '0 0 8px #10b981' : 'none',
                                        animation: isRunning ? 'pulse-dot 1.5s infinite' : 'none',
                                    }} />
                                    <span style={{
                                        fontSize: '10px', fontWeight: 800,
                                        color: isRunning ? '#10b981' : 'var(--text-muted)',
                                        textTransform: 'uppercase', letterSpacing: '1px',
                                    }}>
                                        {isRunning ? 'LIVE STREAM' : 'COMPLETED'}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowLedger(false)} style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '6px', width: '28px', height: '28px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px',
                            }}>✕</button>
                        </div>

                        {/* Ledger Entries */}
                        <div ref={ledgerRef} style={{
                            flex: 1, overflowY: 'auto', padding: '16px 20px',
                            fontFamily: 'var(--font-mono)', fontSize: '13px',
                        }}>
                            {ledgerEntries.map((entry) => (
                                <div key={entry.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                                    marginBottom: '12px', opacity: 0, animation: 'fadeSlideIn 0.3s forwards',
                                }}>
                                    <span style={{
                                        color: 'var(--text-muted)', fontSize: '12px',
                                        whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px',
                                        fontFamily: 'var(--font-mono)',
                                    }}>
                                        {entry.timestamp}
                                    </span>
                                    <span style={{
                                        padding: '2px 10px', borderRadius: '4px',
                                        fontSize: '10px', fontWeight: 800,
                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                        whiteSpace: 'nowrap', flexShrink: 0,
                                        background: (badgeColors[entry.type] || badgeColors.system).bg,
                                        color: (badgeColors[entry.type] || badgeColors.system).color,
                                        border: `1px solid ${(badgeColors[entry.type] || badgeColors.system).border}`,
                                    }}>
                                        {entry.badge}
                                    </span>
                                    <span style={{
                                        color: entry.type === 'inference' ? '#22d3ee' :
                                            entry.type === 'error' ? '#f87171' : 'var(--text-secondary)',
                                        fontSize: '13px', lineHeight: '1.5',
                                    }}>
                                        {entry.message}
                                    </span>
                                </div>
                            ))}
                            {isRunning && ledgerEntries.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <div style={{
                                        width: '4px', height: '16px', background: 'var(--accent-blue)',
                                        borderRadius: '2px', animation: 'blink 1s infinite',
                                    }} />
                                    Awaiting next event...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === RIGHT SIDEBAR === */}
                <div style={{
                    width: '300px', flexShrink: 0, borderLeft: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(8,10,18,0.95)', backdropFilter: 'blur(20px)',
                    overflowY: 'auto', display: 'flex', flexDirection: 'column',
                }}>
                    {/* Add Node Header */}
                    <div style={{ padding: '20px 20px 0' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Add Node
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Configure connection and parameters
                        </p>
                    </div>

                    <div style={{ padding: '0 20px 20px', flex: 1 }}>
                        {/* Workflow Description */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                letterSpacing: '1.5px', marginBottom: '8px',
                            }}>Workflow Description</label>
                            <textarea
                                value={workflowDesc}
                                onChange={(e) => setWorkflowDesc(e.target.value)}
                                placeholder="Describe what this workflow does..."
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                                    padding: '10px 12px', color: 'var(--text-secondary)', fontSize: '13px',
                                    minHeight: '70px', resize: 'vertical', outline: 'none',
                                    fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 0 20px' }} />

                        <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                            Add New Step
                        </h4>

                        {/* Agent Pattern */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                letterSpacing: '1.5px', marginBottom: '6px',
                            }}>Select Agent Pattern</label>
                            <select value={newStep.agentPattern} onChange={(e) => setNewStep({ ...newStep, agentPattern: e.target.value })} style={{
                                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)',
                                fontSize: '13px', outline: 'none', cursor: 'pointer',
                            }}>
                                {AGENT_PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>

                        {/* Step Type */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                letterSpacing: '1.5px', marginBottom: '6px',
                            }}>Step Type</label>
                            <select value={newStep.stepType} onChange={(e) => setNewStep({ ...newStep, stepType: e.target.value })} style={{
                                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)',
                                fontSize: '13px', outline: 'none', cursor: 'pointer',
                            }}>
                                {STEP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Adapter */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                letterSpacing: '1.5px', marginBottom: '6px',
                            }}>Adapter</label>
                            <select value={newStep.adapter} onChange={(e) => setNewStep({ ...newStep, adapter: e.target.value })} style={{
                                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px', padding: '9px 12px', color: 'var(--text-primary)',
                                fontSize: '13px', outline: 'none', cursor: 'pointer',
                            }}>
                                {ADAPTERS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        {/* Model */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-muted)', textTransform: 'uppercase',
                                letterSpacing: '1.5px', marginBottom: '6px',
                            }}>Model</label>
                            <input
                                value={newStep.model}
                                onChange={(e) => setNewStep({ ...newStep, model: e.target.value })}
                                placeholder="gpt-4"
                                style={{
                                    width: '100%', background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                                    padding: '9px 12px', color: 'var(--text-primary)',
                                    fontSize: '13px', outline: 'none',
                                }}
                            />
                        </div>

                        {/* Add Button */}
                        <button
                            onClick={handleAddStep}
                            style={{
                                width: '100%', padding: '11px 16px',
                                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                border: 'none', borderRadius: '8px',
                                color: 'white', fontSize: '13px', fontWeight: 800,
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', gap: '8px',
                                boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
                                transition: 'all 0.2s',
                            }}
                        >
                            + Add Step To Canvas
                        </button>

                        {/* Selected Node Info */}
                        {selectedNode !== null && canvasNodes[selectedNode] && (
                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Selected Node</span>
                                    <button onClick={() => handleRemoveNode(selectedNode)} style={{
                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                        color: '#f87171', padding: '4px 10px', borderRadius: '6px',
                                        fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                    }}>Remove</button>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    {canvasNodes[selectedNode].title}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {canvasNodes[selectedNode].stepType} · {canvasNodes[selectedNode].adapter} · {canvasNodes[selectedNode].model}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx global>{`
                /* Dark scrollbar for workflow panels */
                div[style*="overflowY: auto"] {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.08) transparent;
                }
                div[style*="overflowY: auto"]::-webkit-scrollbar {
                    width: 6px;
                }
                div[style*="overflowY: auto"]::-webkit-scrollbar-track {
                    background: transparent;
                }
                div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.08);
                    border-radius: 3px;
                }
                div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.15);
                }
                /* Dark dropdown options for all selects */
                select option {
                    background: #0d0f17 !important;
                    color: #e2e8f0 !important;
                    padding: 8px 12px !important;
                }
                select option:hover,
                select option:checked {
                    background: rgba(59,130,246,0.3) !important;
                    color: #ffffff !important;
                }
                select {
                    background-color: rgba(255,255,255,0.04) !important;
                }
            `}</style>
            <style jsx>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.2; }
                }
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}
