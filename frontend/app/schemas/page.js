'use client';
import { useState } from 'react';
import { createPortal } from 'react-dom';

const SYSTEM_SCHEMAS = [
    {
        id: 'agent',
        title: 'AGENT_MODEL_v2',
        description: 'Autonomous neural node definition and capability manifest.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /><circle cx="15" cy="14" r="1.5" fill="currentColor" />
            </svg>
        ),
        schema: {
            id: "uuid",
            name: "string",
            status: "enum ['idle', 'running', 'offline']",
            capabilities: "string[]",
            model: "string",
            last_ping: "timestamp",
            cognitive_load: "integer (0-100)",
            metadata: {
                version: "string",
                region: "string",
                kernel_hash: "sha256"
            }
        }
    },
    {
        id: 'task',
        title: 'TASK_STRATEGY_v4',
        description: 'Mission directive structure and execution state tracking.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
        ),
        schema: {
            id: "uuid",
            title: "string",
            description: "text",
            input: "text",
            output: "text",
            status: "enum ['pending', 'running', 'completed', 'failed', 'cancelled']",
            priority: "enum ['low', 'medium', 'high', 'critical']",
            agent_id: "uuid (ref: Agent)",
            progress: "integer (0-100)",
            created_at: "timestamp",
            completed_at: "timestamp",
            execution_path: "uuid[] (ref: Node)"
        }
    },
    {
        id: 'oversight',
        title: 'OVERSIGHT_PROTOCOL',
        description: 'Strategic review queue and human-in-the-loop intercept data.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
        ),
        schema: {
            id: "uuid",
            type: "string",
            status: "enum ['pending', 'approved', 'rejected']",
            reason: "text",
            task_id: "uuid (ref: Task)",
            agent_id: "uuid (ref: Agent)",
            task_output: "text (preview)",
            reviewer_id: "uuid (ref: User)",
            reviewer_notes: "text",
            resolved_at: "timestamp",
            security_clearance: "integer"
        }
    },
    {
        id: 'workflow',
        title: 'WORKFLOW_BLUEPRINT',
        description: 'Multi-agent orchestration sequence and dependency graph.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
            </svg>
        ),
        schema: {
            id: "uuid",
            name: "string",
            nodes: "Node[]",
            edges: "Edge[]",
            trigger: "enum ['manual', 'webhook', 'schedule']",
            active: "boolean",
            owner_id: "uuid (ref: User)",
            last_run: "timestamp",
            success_rate: "float"
        }
    },
    {
        id: 'user',
        title: 'AUTHENTICATION_CORE',
        description: 'User identity, workspace roles, and security signatures.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
        ),
        schema: {
            id: "uuid",
            email: "string (unique)",
            name: "string",
            role: "enum ['admin', 'operative', 'observer']",
            workspace_id: "uuid",
            two_factor_enabled: "boolean",
            api_keys: "string[] (hashes)",
            last_login: "timestamp",
            preferences: "json"
        }
    },
    {
        id: 'billing',
        title: 'FISCAL_TELEMETRY',
        description: 'Resource consumption, subscription state, and credit ledger.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
            </svg>
        ),
        schema: {
            id: "uuid",
            plan: "enum ['free', 'pro', 'enterprise']",
            credits_remaining: "decimal",
            usage_stats: {
                total_tasks: "integer",
                agent_hours: "float",
                data_egress: "bytes"
            },
            stripe_customer_id: "string",
            billing_cycle_anchor: "timestamp"
        }
    }
];

export default function SchemasPage() {
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [activeTab, setActiveTab] = useState('JSON'); // JSON, TS, GQL

    const convertToTS = (schema, name) => {
        const interfaceName = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        let output = `interface ${interfaceName} {\n`;

        Object.entries(schema).forEach(([key, val]) => {
            let type = typeof val;
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                type = 'object';
            } else if (typeof val === 'string') {
                if (val.startsWith('enum')) type = val.replace('enum ', '').replace(/\[|\]/g, '').split(',').join(' | ');
                else if (val.includes('timestamp')) type = 'Date';
                else if (val.includes('uuid')) type = 'string';
                else type = val;
            }
            output += `    ${key}: ${type};\n`;
        });

        output += `}`;
        return output;
    };

    const convertToGQL = (schema, name) => {
        const typeName = name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        let output = `type ${typeName} {\n`;

        Object.entries(schema).forEach(([key, val]) => {
            let type = 'String';
            if (typeof val === 'string') {
                if (val.includes('integer')) type = 'Int';
                else if (val.includes('float') || val.includes('decimal')) type = 'Float';
                else if (val.includes('boolean')) type = 'Boolean';
                else if (val.includes('uuid')) type = 'ID';
            }
            output += `    ${key}: ${type}\n`;
        });

        output += `}`;
        return output;
    };

    const getFormattedContent = () => {
        if (!selectedSchema) return '';
        if (activeTab === 'JSON') return JSON.stringify(selectedSchema.schema, null, 4);
        if (activeTab === 'TS') return convertToTS(selectedSchema.schema, selectedSchema.id);
        if (activeTab === 'GQL') return convertToGQL(selectedSchema.schema, selectedSchema.id);
        return '';
    };

    return (
        <div className="schemas-container">
            <header className="page-header animate-in">
                <div className="header-meta">
                    <div className="intel-segment">
                        <span className="intel-tag">BLUEPRINT_ARCHIVE_v0.1</span>
                        <div className="pulse-line"></div>
                    </div>
                </div>
                <h1 className="dashboard-title">
                    <span className="title-alt">CHAKRAVIEW</span>
                    <span className="title-main">SYSTEM SCHEMAS</span>
                </h1>
                <p className="header-subtitle">High-fidelity data model architecture for autonomous orchestration nodes.</p>
                <div className="header-decoration"></div>
            </header>

            <div className="schemas-grid animate-in" style={{ animationDelay: '0.1s' }}>
                {SYSTEM_SCHEMAS.map((item, idx) => (
                    <div
                        key={item.id}
                        className="schema-card"
                        onClick={() => { setSelectedSchema(item); setActiveTab('JSON'); }}
                        style={{ animationDelay: `${0.1 + idx * 0.05}s` }}
                    >
                        <div className="schema-icon-bg">
                            {item.icon}
                        </div>
                        <div className="schema-info">
                            <label className="m-tag">{item.title}</label>
                            <h3>{item.id.toUpperCase()}_MODEL</h3>
                            <p>{item.description}</p>
                        </div>
                        <div className="schema-action">
                            <span>INSPECT_BLUEPRINT</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                        <div className="card-glitch"></div>
                    </div>
                ))}
            </div>

            {selectedSchema && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedSchema(null)}>
                    <div className="modal schema-modal animate-in" onClick={e => e.stopPropagation()}>
                        <div className="modal-technical-header">
                            <div className="title-group">
                                <span className="m-tag">ARCHIVE_ENTITY_{selectedSchema.id.toUpperCase()}</span>
                                <h2>{selectedSchema.title} Blueprint</h2>
                            </div>
                            <button className="close-x" onClick={() => setSelectedSchema(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="schema-viewer">
                                <div className="viewer-header">
                                    <div className="viewer-tabs">
                                        <button className={activeTab === 'JSON' ? 'active' : ''} onClick={() => setActiveTab('JSON')}>JSON_SCHEMA</button>
                                        <button className={activeTab === 'TS' ? 'active' : ''} onClick={() => setActiveTab('TS')}>TS_INTERFACES</button>
                                        <button className={activeTab === 'GQL' ? 'active' : ''} onClick={() => setActiveTab('GQL')}>GRAPHQL_TYPE</button>
                                    </div>
                                    <div className="viewer-actions">
                                        <button onClick={() => navigator.clipboard.writeText(getFormattedContent())}>COPY_TO_MEMORY</button>
                                    </div>
                                </div>
                                <div className="json-container">
                                    <pre>
                                        <code>{getFormattedContent()}</code>
                                    </pre>
                                </div>
                            </div>
                        </div>
                        <div className="modal-technical-actions">
                            <button className="btn-cancel" onClick={() => setSelectedSchema(null)}>DISMISS_ARCHIVE</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style jsx>{`
                .schemas-container {
                    padding: 40px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header { margin-bottom: 48px; }
                .header-meta { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
                .intel-tag { font-size: 10px; font-weight: 950; letter-spacing: 4px; color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); padding: 4px 12px; border-radius: 4px; border-left: 3px solid var(--accent-blue); }
                .pulse-line { width: 60px; height: 1px; background: linear-gradient(90deg, var(--accent-blue), transparent); position: relative; }
                .pulse-line::after { content: ''; position: absolute; left: 0; top: -1px; width: 4px; height: 3px; background: white; box-shadow: 0 0 10px white; animation: pulse-move 3s infinite linear; }
                @keyframes pulse-move { 0% { left: 0; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { left: 100%; opacity: 0; } }

                .dashboard-title { font-size: 64px; font-weight: 950; letter-spacing: -3px; line-height: 0.9; margin: 0 0 16px; display: flex; flex-direction: column; }
                .title-alt { font-size: 14px; letter-spacing: 12px; color: var(--text-muted); font-weight: 800; margin-bottom: 8px; }
                .title-main { background: linear-gradient(to bottom, #fff 30%, var(--accent-blue) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .header-subtitle { font-size: 18px; color: var(--text-muted); font-weight: 500; max-width: 600px; line-height: 1.6; }

                .schemas-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                .schema-card {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    animation: slideUp 0.6s ease-out forwards;
                    opacity: 0;
                }

                .schema-card:hover {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(59, 130, 246, 0.3);
                    transform: translateY(-8px);
                    box-shadow: 0 30px 60px rgba(0,0,0,0.5);
                }

                .schema-icon-bg {
                    width: 52px;
                    height: 52px;
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(59, 130, 246, 0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-blue);
                }

                .m-tag { font-size: 8px; font-weight: 950; letter-spacing: 3px; color: var(--accent-blue); opacity: 0.6; }
                .schema-info h3 { font-size: 20px; font-weight: 900; margin: 4px 0 12px; letter-spacing: -0.5px; }
                .schema-info p { font-size: 14px; color: var(--text-muted); line-height: 1.5; margin: 0; }

                .schema-action {
                    margin-top: auto;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 10px;
                    font-weight: 950;
                    letter-spacing: 2px;
                    color: var(--text-muted);
                    transition: all 0.3s;
                }

                .schema-card:hover .schema-action { color: var(--accent-blue); }

                /* Modal styling */
                .modal-overlay { position: fixed; inset: 0; background: rgba(5,6,10,0.9); backdrop-filter: blur(20px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px; }
                .schema-modal { max-width: 900px; width: 100%; height: auto; max-height: 80vh; background: #0d0f17; border: 1px solid rgba(59,130,246,0.3); border-radius: 24px; box-shadow: 0 50px 100px rgba(0,0,0,0.8); overflow: hidden; display: flex; flex-direction: column; }

                .modal-technical-header { padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
                .modal-technical-header h2 { font-size: 20px; font-weight: 950; color: #fff; margin: 0; letter-spacing: -0.5px; }
                .close-x { background: transparent; border: none; color: var(--text-muted); font-size: 24px; cursor: pointer; }

                .modal-body { padding: 0; flex: 1; overflow-y: auto; }
                .schema-viewer { background: #07080c; min-height: 400px; display: flex; flex-direction: column; }
                .viewer-header { padding: 12px 24px; background: rgba(255,255,255,0.02); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .viewer-tabs { display: flex; gap: 8px; }
                .viewer-tabs button { background: transparent; border: none; padding: 6px 16px; border-radius: 4px; font-size: 10px; font-weight: 800; color: var(--text-muted); cursor: pointer; letter-spacing: 1px; }
                .viewer-tabs button.active { background: var(--accent-blue); color: #000; }
                .viewer-actions button { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); color: var(--accent-blue); padding: 4px 12px; border-radius: 4px; font-size: 9px; font-weight: 900; cursor: pointer; }

                .json-container { padding: 32px; }
                .json-container pre { margin: 0; font-family: var(--font-mono); font-size: 14px; color: #60a5fa; line-height: 1.6; }

                .modal-technical-actions { padding: 24px 32px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; }
                .btn-cancel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: var(--text-muted); padding: 12px 24px; border-radius: 8px; font-size: 11px; font-weight: 950; letter-spacing: 2px; cursor: pointer; transition: 0.3s; }
                .btn-cancel:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.2); }

                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-in { animation: slideUp 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; opacity: 0; }
            `}</style>
        </div>
    );
}
