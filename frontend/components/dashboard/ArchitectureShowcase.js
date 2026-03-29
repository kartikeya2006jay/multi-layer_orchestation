'use client';
import React, { useState } from 'react';

// ─── Dynamic Architecture Visualization Sub-component ───
function DynamicArchitecture({ activeTab }) {
    const renderNode = (x, y, label, color, icon, sublabel, size = 26) => (
        <g key={label} style={{ animation: 'fadeIn 1s ease-out forwards' }}>
            {/* Multi-layered Glow System */}
            <circle cx={x} cy={y} r={size * 2} fill={`var(${color}-glow)`} opacity="0.06">
                <animate attributeName="opacity" values="0.03;0.1;0.03" dur="6000ms" repeatCount="indefinite" />
            </circle>
            <circle cx={x} cy={y} r={size * 1.5} fill={`var(${color}-glow)`} opacity="0.12">
                <animate attributeName="r" values={`${size * 1.4};${size * 1.6};${size * 1.4}`} dur="4500ms" repeatCount="indefinite" />
            </circle>

            {/* Primary Infrastructure Housing */}
            <circle cx={x} cy={y} r={size} fill="#0d0f17" stroke={`var(${color})`} strokeWidth="1.8" />

            {/* Tactical Decals */}
            <circle cx={x} cy={y} r={size - 5} fill="none" stroke={`var(${color})`} strokeWidth="0.5" strokeDasharray="3 4" opacity="0.4">
                <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`-360 ${x} ${y}`} dur="15s" repeatCount="indefinite" />
            </circle>

            {/* Core Symbol */}
            <text x={x} y={y + 7} textAnchor="middle" fill={`var(${color})`} fontSize={size * 0.75} style={{ userSelect: 'none', filter: 'brightness(1.8) drop-shadow(0 0 3px rgba(255,255,255,0.3))' }}>
                {icon}
            </text>

            {/* Metadata Labels */}
            <g transform={`translate(${x}, ${y + size + 16})`}>
                <text x="0" y="0" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="1000" letterSpacing="1.5px">
                    {label.toUpperCase()}
                </text>
                {sublabel && (
                    <text x="0" y="11" textAnchor="middle" fill="var(--text-muted)" fontSize="7" fontWeight="800" letterSpacing="1px" opacity="0.7">
                        {sublabel.toUpperCase()}
                    </text>
                )}
            </g>
        </g>
    );

    const renderLink = (x1, y1, x2, y2, color, dashed = false, animate = true, speed = "3000ms") => (
        <g>
            <path
                d={`M${x1},${y1} L${x2},${y2}`}
                stroke={`var(${color})`} strokeWidth="1.2"
                opacity="0.22"
                strokeDasharray={dashed ? "5 5" : "none"}
                fill="none"
            />
            {animate && (
                <circle r="2.2" fill="white" style={{ filter: `drop-shadow(0 0 6px var(${color}))` }}>
                    <animateMotion
                        dur={speed}
                        repeatCount="indefinite"
                        path={`M${x1},${y1} L${x2},${y2}`}
                    />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={speed} repeatCount="indefinite" />
                </circle>
            )}
        </g>
    );

    const renderHUD = () => (
        <g opacity="0.18">
            <rect width="800" height="500" fill="none" stroke="white" strokeWidth="0.2" opacity="0.2" />
            <path d="M20,20 L60,20 M20,20 L20,60" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M780,20 L740,20 M780,20 L780,60" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M20,480 L60,480 M20,480 L20,440" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M780,480 L740,480 M780,480 L780,440" stroke="white" strokeWidth="1.2" fill="none" />
            <text x="25" y="476" fill="white" fontSize="8" fontWeight="1000" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>CHAKRAVIEW v4.2 // NEURAL_INFRA_STABLE</text>
            <text x="775" y="476" textAnchor="end" fill="white" fontSize="8" fontWeight="1000" style={{ fontFamily: 'var(--font-mono)' }}>OP_MODE: HIGH_INTEL // SYNC_ACTIVE</text>
            <defs>
                <pattern id="hudGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#hudGrid)" />
        </g>
    );

    const renderPlatformView = () => (
        <svg viewBox="0 0 800 500" width="100%" height="100%">
            {renderHUD()}
            <g opacity="0.05">
                {[...Array(8)].map((_, i) => (
                    <circle key={i} cx="400" cy="250" r={80 + i * 40} fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2 10">
                        <animateTransform attributeName="transform" type="rotate" from="0 400 250" to={i % 2 === 0 ? "360 400 250" : "-360 400 250"} dur={`${20 + i * 5}s`} repeatCount="indefinite" />
                    </circle>
                ))}
            </g>
            <g>
                {renderLink(140, 110, 400, 250, '--accent-blue', false, true, "1800ms")}
                {renderLink(140, 250, 400, 250, '--accent-blue', false, true, "2400ms")}
                {renderLink(140, 390, 400, 250, '--accent-blue', false, true, "3200ms")}
                {renderNode(140, 110, 'Enterprise API', '--accent-blue', '📡', 'REST / GraphQL')}
                {renderNode(140, 250, 'Conversations', '--accent-blue', '💬', 'Slack / Teams / WhatsApp')}
                {renderNode(140, 390, 'Legacy bridge', '--accent-blue', '🌉', 'On-Prem data mesh')}
                {renderLink(400, 250, 400, 80, '--accent-red', true, true, "1200ms")}
                {renderNode(400, 80, 'Compliance Filter', '--accent-red', '🛡️', 'PII / Toxicity Safety')}
                {renderNode(400, 250, 'Neural Orchestrator', '--accent-blue', '💎', 'o1-based Reasoning Core', 48)}
                {renderLink(400, 250, 660, 100, '--accent-purple')}
                {renderLink(400, 250, 660, 190, '--accent-purple')}
                {renderLink(400, 250, 660, 280, '--accent-purple')}
                {renderLink(400, 250, 660, 400, '--accent-green')}
                {renderNode(660, 100, 'Semantic Vault', '--accent-purple', '💾', 'Elastic / Pinecone Context')}
                {renderNode(660, 190, 'Knowledge Graph', '--accent-purple', '🕸️', 'Entity Relationship Mesh')}
                {renderNode(660, 280, 'Expert Models', '--accent-purple', '🧠', 'Domain LLM Cluster')}
                {renderNode(660, 400, 'Action Engine', '--accent-green', '⚡', 'Third-party API Execution')}
            </g>
        </svg>
    );

    const renderSearchView = () => (
        <svg viewBox="0 0 800 500" width="100%" height="100%">
            {renderHUD()}
            <g>
                {renderLink(120, 250, 280, 250, '--accent-cyan', false, true, "1400ms")}
                {renderNode(120, 250, 'Natural Query', '--accent-cyan', '🔍', 'Intent Classification')}
                {renderLink(280, 250, 450, 150, '--accent-cyan')}
                {renderLink(280, 250, 450, 250, '--accent-cyan')}
                {renderLink(280, 250, 450, 350, '--accent-cyan')}
                {renderNode(280, 250, 'Neural Embedder', '--accent-cyan', '🧬', 'Dense Space projection', 34)}
                {renderNode(450, 150, 'Vector DB', '--accent-blue', '📁', 'HNSW Dense retrieval')}
                {renderNode(450, 250, 'Graph Ontology', '--accent-purple', '🕸️', 'Semantic context path')}
                {renderNode(450, 350, 'Lexical Index', '--accent-blue', '📄', 'Term-based precision')}
                {renderLink(450, 150, 620, 250, '--accent-green')}
                {renderLink(450, 250, 620, 250, '--accent-green')}
                {renderLink(450, 350, 620, 250, '--accent-green')}
                {renderNode(620, 250, 'Hybrid Fusion', '--accent-green', '🚦', 'Reranking & Selection', 36)}
                {renderLink(620, 250, 750, 250, '--accent-green', false, true, "900ms")}
                {renderNode(750, 250, 'Verified result', '--accent-green', '🎯', 'Grounded intelligence')}
            </g>
        </svg>
    );

    const renderEngineView = () => (
        <svg viewBox="0 0 800 500" width="100%" height="100%">
            {renderHUD()}
            <g>
                <circle cx="400" cy="250" r="145" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="2.5" strokeDasharray="10 6" />
                {renderLink(400, 250, 400, 85, '--accent-purple', false, true, "1800ms")}
                {renderLink(400, 85, 570, 250, '--accent-blue', false, true, "1800ms")}
                {renderLink(570, 250, 400, 415, '--accent-cyan', false, true, "1800ms")}
                {renderLink(400, 415, 230, 250, '--accent-amber', false, true, "1800ms")}
                {renderLink(230, 250, 400, 85, '--accent-red', false, true, "1800ms")}
                {renderNode(400, 85, 'Strategic Plan', '--accent-purple', '🧩', 'Decomposition')}
                {renderNode(570, 250, 'Execution', '--accent-blue', '🔧', 'Parallel Tool calls')}
                {renderNode(400, 415, 'Observe', '--accent-cyan', '👁️', 'Result Parsing')}
                {renderNode(230, 250, 'Self-Correction', '--accent-amber', '🌀', 'Logical Reflection')}
                {renderNode(400, 250, 'Chakra Reasoning Core', '--accent-purple', '⚛️', 'Multi-Layer Logic o1-v4', 52)}
            </g>
            <g opacity="0.5" style={{ fontFamily: 'var(--font-mono)' }}>
                {renderNode(80, 80, 'Memory buffer', '--accent-muted', '📟', 'In-flight context', 15)}
                {renderNode(720, 80, 'Policy Store', '--accent-muted', '📜', 'Enterprise Rules', 15)}
                {renderNode(80, 420, 'History log', '--accent-muted', '📜', 'Fast retrieval', 15)}
                {renderNode(720, 420, 'Critique log', '--accent-muted', '🔬', 'Audit trail', 15)}
            </g>
        </svg>
    );

    const renderStudioView = () => (
        <svg viewBox="0 0 800 500" width="100%" height="100%">
            {renderHUD()}
            <g>
                {renderLink(140, 90, 350, 250, '--accent-amber')}
                {renderLink(140, 190, 350, 250, '--accent-amber')}
                {renderLink(140, 310, 350, 250, '--accent-amber')}
                {renderLink(140, 410, 350, 250, '--accent-amber')}
                {renderNode(140, 90, 'Persona config', '--accent-amber', '🎭', 'Personality & Voice')}
                {renderNode(140, 190, 'Knowledge Pack', '--accent-amber', '📚', 'Dataset / RAG base')}
                {renderNode(140, 310, 'Tool Library', '--accent-amber', '🛠️', 'Function manifests')}
                {renderNode(140, 410, 'Policy Guard', '--accent-amber', '🛡️', 'Global guardrails')}
                {renderNode(350, 250, 'Neural Compiler', '--accent-blue', '🏗️', 'Construction Engine', 42)}
                {renderLink(350, 250, 550, 250, '--accent-blue')}
                {renderNode(550, 250, 'Evaluation Lab', '--accent-blue', '🔬', 'Test & Tuning Simulation', 34)}
                {renderLink(550, 250, 740, 140, '--accent-green')}
                {renderLink(550, 250, 740, 360, '--accent-green')}
                {renderNode(740, 140, 'Deploy Cloud', '--accent-green', '☁️', 'Enterprise Pipeline')}
                {renderNode(740, 360, 'Deploy Edge', '--accent-green', '📦', 'Local / Secure execution')}
            </g>
            <text x="550" y="445" textAnchor="middle" fill="var(--accent-green)" fontSize="9" fontWeight="1000" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>SYSTEM_STATUS: READY_TO_DEPLOY</text>
        </svg>
    );

    switch (activeTab) {
        case 'platform': return renderPlatformView();
        case 'search': return renderSearchView();
        case 'engine': return renderEngineView();
        case 'easy': return renderStudioView();
        default: return renderPlatformView();
    }
}

// ─── Main Component ───
export default function ArchitectureShowcase() {
    const tabs = [
        {
            id: 'platform',
            title: 'Neural Core Platform',
            description: 'A unified intelligence layer that orchestrates across your entire enterprise ecosystem.',
            analysis: {
                summary: 'The Neural Core serves as the central intelligence operative of your enterprise. It acts as a high-speed orchestrator that autonomously routes intent, verifies security protocols, and executes multi-agent missions with sub-millisecond precision.',
                metrics: { latency: '14ms', confidence: '99.9%', nodes: '256+' },
                flow: [
                    { step: 'INTENT CAPTURE', label: 'Semantic Ingestion', icon: 'M12 2v20M2 12h20', desc: 'Real-time ingestion of intent from global enterprise endpoints (Slack, Teams, API).' },
                    { step: 'STRATEGIC HUB', label: 'Mission Synthesis', icon: 'M12 2L2 7l10 5 10-5-10-5z', desc: 'The core brain autonomously decomposes instructions into a multi-step roadmap.' },
                    { step: 'NEURAL ROUTING', label: 'Autonomous Allocation', icon: 'M12 22s8-4.5 8-11.8A8 8 0 0012 2a8 8 0 00-8 8.2c0 7.3 8 11.8 8 11.8z', desc: 'Distributing specialized sub-tasks to the most qualified expert agents in the fleet.' },
                    { step: 'COLLECTIVE FUSION', label: 'High-Integrity Output', icon: 'M12 22V12M2 12h20', desc: 'Aggregating diverse agent outputs into a unified, verified, and actionable solution.' }
                ],
                files: [
                    { path: 'backend/src/routes/tasks.js', description: 'Core mission controller.' },
                    { path: 'backend/src/index.js', description: 'System entry gateway.' }
                ]
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            )
        },
        {
            id: 'search',
            title: 'Intelligent Search Fusion',
            description: 'Combining semantic search with agentic execution to solve problems, not just find answers.',
            analysis: {
                summary: 'Search Fusion redefines information retrieval by merging semantic depth with keyword precision. It doesn\'t just "find" files; it projects your query into a multi-dimensional knowledge space to extract the exact insights you need.',
                metrics: { recall: '98.4%', depth: 'Neural', velocity: 'Fast' },
                flow: [
                    { step: 'DENSE PROJECTION', label: 'Space Mapping', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', desc: 'Transforming natural language queries into high-dimensional semantic vectors.' },
                    { step: 'KNOWLEDGE MESH', label: 'Semantic Exploration', icon: 'M12 2v20M2 12h20', desc: 'Navigating millions of data points across your entire knowledge ecosystem simultaneously.' },
                    { step: 'FUSION ENGINE', label: 'Neural Reranking', icon: 'M3 6h18M3 12h18M3 18h18', desc: 'Dynamically re-evaluating results based on context, relevance, and historical accuracy.' },
                    { step: 'GROUNDED DATA', label: 'Fact Verification', icon: 'M22 11.08V12a10 10 0 11-5.93-9.14', desc: 'Delivering a verified, fact-checked response grounded directly in your secure data.' }
                ],
                files: [
                    { path: 'backend/src/routes/ai.js', description: 'Neural parsing engine.' },
                    { path: 'backend/src/db/schema.js', description: 'Knowledge mesh structure.' }
                ]
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M9 11h4" /><path d="M11 9v4" />
                </svg>
            )
        },
        {
            id: 'engine',
            title: 'o1 Reasoning Engine',
            description: 'Advanced NLP and reasoning that understands complex multihop queries and intent.',
            analysis: {
                summary: 'The o1 Reasoning Engine is the logical summit of the platform. It utilizes recursive thinking loops—allowing the system to "pause and ponder" complex problems before delivering a calculated, self-vetted response.',
                metrics: { thoughts: 'Recursive', accuracy: 'Elite', steps: 'Multi' },
                flow: [
                    { step: 'PREMISE ANALYSIS', label: 'Logic Deconstruction', icon: 'M12 2v4M12 18v4', desc: 'Breaking down complex, multi-hop queries into fundamental logical primitives.' },
                    { step: 'EXECUTION SIM', label: 'Path Simulation', icon: 'M23 4v6h-6M1 20v-6h6', desc: 'Virtually "testing" multiple solution paths before committing any system action.' },
                    { step: 'NEURAL REFLECTOR', label: 'Self-Critique Audit', icon: 'M12 22s8-4.5 8-11.8A8 8 0 0012 2a8 8 0 00-8 8.2c0 7.3 8 11.8 8 11.8z', desc: 'Autonomous cross-validation where the core audits its own reasoning for accuracy.' },
                    { step: 'SUCCESS SYNTHESIS', label: 'Optimal Solution', icon: 'M22 11.08V12a10 10 0 11-5.93-9.14', desc: 'Finalizing the highest-confidence, most computationally optimal solution path.' }
                ],
                files: [
                    { path: 'backend/src/routes/ai.js', description: 'Deep reasoning portal.' },
                    { path: 'backend/src/routes/tasks.js', description: 'Thinking execution loops.' }
                ]
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4" /><path d="m16.2 4.2-2.8 2.8" /><path d="M18 12h4" /><circle cx="12" cy="12" r="3" />
                </svg>
            )
        },
        {
            id: 'easy',
            title: 'Agent Studio',
            description: 'Extensible framework with Agent Studio for rapid deployment of specialized autonomous workers.',
            analysis: {
                summary: 'Agent Studio is the ultimate workspace for neural construction. It allows you to design, equip, and deploy elite AI specialists tailored to the unique operational goals of your business.',
                metrics: { types: 'Custom', build: 'Low-Code', live: 'Fleet' },
                flow: [
                    { step: 'PROFILING', label: 'Persona Architect', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z', desc: 'Defining the cognitive archetype, voice, and behavioral goals of your agent.' },
                    { step: 'INJECTION', label: 'Knowledge Injection', icon: 'M12 2v20M2 12h20', desc: 'Grounding the agent with exclusive knowledge packs, docs, and secure data syncs.' },
                    { step: 'SKILLSET', label: 'Skillset Acquisition', icon: 'M14.7 6.3a1 1 0 000 1.4', desc: 'Connecting the agent to your mission-critical APIs, databases, and workspace tools.' },
                    { step: 'ACTIVATION', label: 'Fleet Deployment', icon: 'M22 2l-7 20-4-9-9-4 20-7z', desc: 'Final neural compilation and deployment into the production fleet ecosystem.' }
                ],
                files: [
                    { path: 'frontend/app/agents/page.js', description: 'Visual architect studio.' },
                    { path: 'backend/src/routes/agents.js', description: 'Neural profile factory.' }
                ]
            },
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="M12 5v14" /><rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
            )
        }
    ];

    const [activeTab, setActiveTab] = useState('platform');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const runAnalysis = () => {
        setIsAnalyzing(true);
        setShowAnalysis(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowAnalysis(true);
        }, 1500);
    };

    const currentTab = tabs.find(t => t.id === activeTab);

    return (
        <div style={{ marginBottom: '48px', marginTop: '20px' }} className="animate-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-1px', marginBottom: '12px' }}>
                    Neural Core Architecture
                </h2>
                <div style={{ width: '60px', height: '4px', background: 'var(--accent-blue)', margin: '0 auto', borderRadius: '2px' }}></div>
            </div>

            <div className="glass-card-static" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                {/* Tabs Header */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)'
                }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => { setActiveTab(tab.id); setShowAnalysis(false); }}
                            style={{
                                padding: '24px 20px', background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                                border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', outline: 'none'
                            }}>
                            <div style={{ color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)' }}>{tab.icon}</div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{tab.title}</div>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ padding: '40px', position: 'relative', minHeight: '620px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ maxWidth: '800px', textAlign: 'center', marginBottom: '32px' }} key={activeTab}>
                        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', fontWeight: 500, marginBottom: '20px' }}>
                            {currentTab.description}
                        </p>
                        <button onClick={runAnalysis} disabled={isAnalyzing}
                            className={`btn btn-primary ${isAnalyzing ? 'btn-loading' : ''}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', opacity: isAnalyzing ? 0.6 : 1 }}>
                            {isAnalyzing ? (
                                <>
                                    <div className="mini-spinner"></div>
                                    Running Neural Analysis...
                                </>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                    Run Neural Analysis
                                </>
                            )}
                        </button>
                    </div>

                    <div style={{
                        width: '100%', maxWidth: '1000px', minHeight: '560px',
                        borderRadius: '16px', overflow: 'hidden',
                        border: '1px solid var(--border-glass-hover)',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                        position: 'relative', background: '#040508',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <DynamicArchitecture activeTab={activeTab} />

                        {/* Analysis Overlay */}
                        {showAnalysis && (
                            <div className="analysis-panel animate-in" style={{
                                position: 'absolute', top: '20px', right: '20px',
                                width: '380px', maxHeight: 'calc(100% - 40px)',
                                overflowY: 'auto', background: 'rgba(4, 5, 8, 0.99)',
                                backdropFilter: 'blur(25px)', border: '1px solid var(--accent-blue)',
                                borderRadius: '16px', padding: '32px', zIndex: 10,
                                boxShadow: '0 30px 100px rgba(0,0,0,1)',
                                display: 'flex', flexDirection: 'column', gap: '24px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '12px', height: '12px', background: 'var(--accent-blue)', borderRadius: '3px' }}></div>
                                        <h4 style={{ fontSize: '14px', fontWeight: 1000, color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase' }}>Neural Process Flow</h4>
                                    </div>
                                    <button onClick={() => setShowAnalysis(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(59, 130, 246, 0.03)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                    {Object.entries(currentTab.analysis.metrics || {}).map(([key, value], idx) => (
                                        <div key={idx} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 900 }}>{key}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--accent-blue)', fontWeight: 1000, fontFamily: 'var(--font-mono)' }}>{value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <p style={{ fontSize: '13px', color: 'white', lineHeight: '1.7', fontWeight: 500 }}>
                                        {currentTab.analysis.summary}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <h5 style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>Operational Trace</h5>
                                    {currentTab.analysis.flow.map((f, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-blue)',
                                                    color: 'var(--accent-blue)', fontSize: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
                                                }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d={f.icon} />
                                                    </svg>
                                                </div>
                                                {i < currentTab.analysis.flow.length - 1 && (
                                                    <div style={{ flex: 1, width: '1px', background: 'var(--accent-blue)', margin: '4px 0', opacity: 0.3 }}></div>
                                                )}
                                            </div>
                                            <div style={{ paddingBottom: '12px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 1000, color: 'var(--text-primary)', marginBottom: '2px' }}>{f.label}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase' }}>{f.step}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{f.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tactical HUD Overlays */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(circle at center, transparent 35%, rgba(4, 5, 8, 0.6) 100%)'
                        }}></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .mini-spinner {
                    width: 14px;
                    height: 14px;
                    border: 2px solid white;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .analysis-panel {
                    animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
