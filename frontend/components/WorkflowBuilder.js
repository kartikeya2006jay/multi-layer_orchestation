'use client';
import { useState } from 'react';

const STEP_TEMPLATES = [
    { title: 'Research & Analysis', description: 'Investigate current data, search the web, and synthesize findings for the user objective.', agentId: '' },
    { title: 'Code Generation', description: 'Write or modify code to implement the requested feature or fix based on established requirements.', agentId: '' },
    { title: 'Quality Assurance', description: 'Test the implementation for bugs, edge cases, and performance regressions. Verify output accuracy.', agentId: '' },
    { title: 'Final Report', description: 'Summarize the actions taken and provide a clear overview of the results and status.', agentId: '' }
];

export default function WorkflowBuilder({ steps, onChange, agents }) {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [overIndex, setOverIndex] = useState(null);
    const [expandedStep, setExpandedStep] = useState(null);

    const onDragStart = (e, index) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or some styling
        e.currentTarget.classList.add('is-dragging');
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        if (overIndex !== index) {
            setOverIndex(index);
        }
    };

    const onDrop = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) {
            setDraggedIndex(null);
            setOverIndex(null);
            return;
        }

        const newSteps = [...steps];
        const draggedItem = newSteps[draggedIndex];
        newSteps.splice(draggedIndex, 1);
        newSteps.splice(index, 0, draggedItem);

        onChange(newSteps);
        setDraggedIndex(null);
        setOverIndex(null);
    };

    const onDragEnd = (e) => {
        setDraggedIndex(null);
        setOverIndex(null);
        e.currentTarget.classList.remove('is-dragging');
    };

    const updateStep = (index, field, value) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        onChange(newSteps);
    };

    const removeStep = (index) => {
        onChange(steps.filter((_, i) => i !== index));
    };

    const addTemplate = (template) => {
        onChange([...steps, { ...template }]);
    };

    return (
        <div className="workflow-builder">
            <div className="builder-templates">
                <span className="label">Quick Architect Templates:</span>
                <div className="template-chips">
                    {STEP_TEMPLATES.map((tmpl, i) => (
                        <button key={i} type="button" className="chip" onClick={() => addTemplate(tmpl)}>
                            + {tmpl.title.split(' ')[0]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="steps-container">
                {steps.map((step, i) => (
                    <div
                        key={i}
                        className={`builder-step-card ${draggedIndex === i ? 'dragging' : ''} ${overIndex === i ? 'drop-target' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, i)}
                        onDragOver={(e) => onDragOver(e, i)}
                        onDrop={(e) => onDrop(e, i)}
                        onDragEnd={onDragEnd}
                    >
                        <div className="step-handle">
                            <span className="step-num">{i + 1}</span>
                            <div className="dragger">⠿</div>
                        </div>

                        <div className="step-main">
                            <div className="step-header">
                                <div className="step-info" onClick={() => setExpandedStep(expandedStep === i ? null : i)}>
                                    <input
                                        className="step-title-input"
                                        value={step.title}
                                        onChange={(e) => updateStep(i, 'title', e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        placeholder="Enter Step Title..."
                                    />
                                    <span className="expand-icon">{expandedStep === i ? '▲' : '▼'}</span>
                                </div>
                                <button type="button" className="btn-remove" onClick={() => removeStep(i)}>✕</button>
                            </div>

                            {(expandedStep === i || !step.title) && (
                                <div className="step-details-expanded">
                                    <textarea
                                        className="step-desc-input"
                                        value={step.description}
                                        onChange={(e) => updateStep(i, 'description', e.target.value)}
                                        placeholder="Describe the agent instructions for this step..."
                                    />

                                    <div className="step-meta">
                                        <div className="meta-field">
                                            <label>Agent Assignment</label>
                                            <select
                                                className="step-agent-select"
                                                value={step.agentId}
                                                onChange={(e) => updateStep(i, 'agentId', e.target.value)}
                                            >
                                                <option value="">Auto-assign Agent</option>
                                                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!expandedStep === i && step.description && (
                                <p className="step-preview">{step.description.slice(0, 100)}{step.description.length > 100 ? '...' : ''}</p>
                            )}
                        </div>

                        {i < steps.length - 1 && (
                            <div className="step-connector-v2">
                                <div className="connector-line"></div>
                                <div className="connector-arrow"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style jsx>{`
                .workflow-builder {
                    margin-top: 10px;
                }
                .builder-templates {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                }
                .template-chips {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }
                .chip {
                    padding: 6px 14px;
                    background: rgba(59, 130, 246, 0.1);
                    color: #60a5fa;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .chip:hover {
                    background: #3b82f6;
                    color: white;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                }
                .steps-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    padding: 10px 0;
                }
                .builder-step-card {
                    display: flex;
                    gap: 20px;
                    background: var(--bg-glass);
                    border: 1px solid var(--border-glass);
                    border-radius: 16px;
                    padding: 20px;
                    position: relative;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .builder-step-card.dragging {
                    opacity: 0.4;
                    transform: scale(0.95);
                    border-style: dashed;
                }
                .builder-step-card.drop-target {
                    border-color: var(--accent-blue);
                    background: rgba(59, 130, 246, 0.05);
                    transform: translateY(-4px);
                }
                .step-handle {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }
                .step-num {
                    width: 28px;
                    height: 28px;
                    background: var(--accent-blue);
                    color: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 900;
                    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
                }
                .dragger {
                    color: var(--text-muted);
                    cursor: grab;
                    font-size: 20px;
                    opacity: 0.5;
                }
                .dragger:hover { opacity: 1; }
                .step-main {
                    flex: 1;
                }
                .step-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }
                .step-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                    cursor: pointer;
                }
                .step-title-input {
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-weight: 800;
                    font-size: 16px;
                    width: 100%;
                    outline: none;
                }
                .expand-icon {
                    font-size: 10px;
                    color: var(--text-muted);
                }
                .btn-remove {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .btn-remove:hover { 
                    background: #ef4444; 
                    color: white;
                }
                .step-desc-input {
                    width: 100%;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 12px;
                    color: var(--text-secondary);
                    font-size: 13px;
                    min-height: 80px;
                    margin-bottom: 16px;
                    resize: vertical;
                    line-height: 1.5;
                }
                .step-meta {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }
                .meta-field label {
                    display: block;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                    text-transform: uppercase;
                }
                .step-agent-select {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    padding: 8px 12px;
                    color: var(--text-primary);
                    font-size: 13px;
                    outline: none;
                }
                .step-preview {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin: 0;
                    opacity: 0.8;
                }
                .step-connector-v2 {
                    position: absolute;
                    bottom: -25px;
                    left: 33px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .connector-line {
                    width: 2px;
                    height: 20px;
                    background: linear-gradient(to bottom, var(--accent-blue), transparent);
                    opacity: 0.4;
                }
                .connector-arrow {
                    width: 6px;
                    height: 6px;
                    border-right: 2px solid var(--accent-blue);
                    border-bottom: 2px solid var(--accent-blue);
                    transform: rotate(45deg);
                    opacity: 0.4;
                    margin-top: -4px;
                }
                .label {
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `}</style>
        </div>
    );
}
