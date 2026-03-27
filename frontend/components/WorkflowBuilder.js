'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

const NODE_COLORS = {
    Agent: { bg: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', border: 'rgba(59,130,246,0.4)', glow: '0 8px 32px rgba(59,130,246,0.3)' },
    Tool: { bg: 'linear-gradient(135deg, #059669, #10b981)', border: 'rgba(16,185,129,0.4)', glow: '0 8px 32px rgba(16,185,129,0.3)' },
    'API Call': { bg: 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'rgba(245,158,11,0.4)', glow: '0 8px 32px rgba(245,158,11,0.3)' },
    Conditional: { bg: 'linear-gradient(135deg, #dc2626, #f87171)', border: 'rgba(239,68,68,0.4)', glow: '0 8px 32px rgba(239,68,68,0.3)' },
    Parallel: { bg: 'linear-gradient(135deg, #7c3aed, #a855f7)', border: 'rgba(139,92,246,0.4)', glow: '0 8px 32px rgba(139,92,246,0.3)' },
};

const LEGEND_ITEMS = [
    { label: 'Agent', color: '#3b82f6' },
    { label: 'Tool', color: '#10b981' },
    { label: 'API Call', color: '#f59e0b' },
    { label: 'Conditional', color: '#f87171' },
    { label: 'Parallel', color: '#a855f7' },
];

export default function WorkflowCanvas({ nodes, onNodesChange, selectedNode, onSelectNode }) {
    const canvasRef = useRef(null);
    const [dragging, setDragging] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    const NODE_W = 200;
    const NODE_H = 90;

    const handleMouseDown = useCallback((e, index) => {
        e.stopPropagation();
        const rect = canvasRef.current.getBoundingClientRect();
        setDragging(index);
        setDragOffset({
            x: e.clientX - rect.left - nodes[index].x - canvasOffset.x,
            y: e.clientY - rect.top - nodes[index].y - canvasOffset.y,
        });
        onSelectNode(index);
    }, [nodes, canvasOffset, onSelectNode]);

    const handleCanvasMouseDown = useCallback((e) => {
        if (e.target === canvasRef.current || e.target.closest('.canvas-grid')) {
            setIsPanning(true);
            setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
            onSelectNode(null);
        }
    }, [canvasOffset, onSelectNode]);

    const handleMouseMove = useCallback((e) => {
        if (dragging !== null) {
            const rect = canvasRef.current.getBoundingClientRect();
            const newNodes = [...nodes];
            newNodes[dragging] = {
                ...newNodes[dragging],
                x: e.clientX - rect.left - dragOffset.x - canvasOffset.x,
                y: e.clientY - rect.top - dragOffset.y - canvasOffset.y,
            };
            onNodesChange(newNodes);
        } else if (isPanning) {
            setCanvasOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            });
        }
    }, [dragging, dragOffset, nodes, onNodesChange, isPanning, panStart, canvasOffset]);

    const handleMouseUp = useCallback(() => {
        setDragging(null);
        setIsPanning(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [handleMouseUp, handleMouseMove]);

    // Build connector paths between sequential nodes
    const connectors = [];
    for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        const x1 = from.x + NODE_W / 2 + canvasOffset.x;
        const y1 = from.y + NODE_H + canvasOffset.y;
        const x2 = to.x + NODE_W / 2 + canvasOffset.x;
        const y2 = to.y + canvasOffset.y;
        const midY = (y1 + y2) / 2;
        connectors.push(
            <g key={`conn-${i}`}>
                <path
                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    fill="none"
                    stroke="rgba(59,130,246,0.35)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                />
                {/* Arrow head */}
                <polygon
                    points={`${x2 - 5},${y2 - 8} ${x2 + 5},${y2 - 8} ${x2},${y2}`}
                    fill="rgba(59,130,246,0.5)"
                />
            </g>
        );
    }

    return (
        <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                cursor: isPanning ? 'grabbing' : 'default',
                background: '#080a12',
                borderRadius: '0',
            }}
        >
            {/* Grid Pattern */}
            <div className="canvas-grid" style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: `${canvasOffset.x % 40}px ${canvasOffset.y % 40}px`,
                pointerEvents: 'none',
            }} />

            {/* SVG Connectors */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {connectors}
            </svg>

            {/* Nodes */}
            {nodes.map((node, i) => {
                const colors = NODE_COLORS[node.stepType] || NODE_COLORS.Agent;
                const isSelected = selectedNode === i;
                return (
                    <div
                        key={i}
                        onMouseDown={(e) => handleMouseDown(e, i)}
                        style={{
                            position: 'absolute',
                            left: node.x + canvasOffset.x,
                            top: node.y + canvasOffset.y,
                            width: NODE_W,
                            minHeight: NODE_H,
                            background: colors.bg,
                            border: `2px solid ${isSelected ? '#fff' : colors.border}`,
                            borderRadius: '16px',
                            padding: '16px 20px',
                            cursor: dragging === i ? 'grabbing' : 'grab',
                            zIndex: dragging === i ? 100 : 2,
                            boxShadow: isSelected
                                ? `${colors.glow}, 0 0 0 2px rgba(255,255,255,0.3)`
                                : colors.glow,
                            transition: dragging === i ? 'none' : 'box-shadow 0.2s ease',
                            userSelect: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        {/* Top Handle */}
                        <div style={{
                            position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)',
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: '#0d0f17', border: '2px solid rgba(255,255,255,0.3)',
                            zIndex: 3,
                        }} />
                        {/* Bottom Handle */}
                        <div style={{
                            position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
                            width: '12px', height: '12px', borderRadius: '50%',
                            background: '#0d0f17', border: '2px solid rgba(255,255,255,0.3)',
                            zIndex: 3,
                        }} />

                        <div style={{
                            fontSize: '14px', fontWeight: 800, color: '#fff',
                            lineHeight: '1.4', wordBreak: 'break-word',
                        }}>
                            {node.title || 'Untitled Step'}
                        </div>
                        <div style={{
                            fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
                            marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px',
                        }}>
                            {node.stepType || 'Agent'}
                        </div>
                    </div>
                );
            })}

            {/* Legend */}
            <div style={{
                position: 'absolute', bottom: '20px', right: '20px',
                background: 'rgba(13,15,23,0.9)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '16px 20px', zIndex: 10,
                backdropFilter: 'blur(12px)',
            }}>
                <div style={{
                    fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px',
                }}>Legend</div>
                {LEGEND_ITEMS.map((item) => (
                    <div key={item.label} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)',
                        fontWeight: 500,
                    }}>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '3px',
                            background: item.color, boxShadow: `0 0 8px ${item.color}40`,
                        }} />
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {nodes.length === 0 && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center', color: 'var(--text-muted)',
                    pointerEvents: 'none',
                }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '16px' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                    </svg>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>Add steps from the right panel</div>
                    <div style={{ fontSize: '13px', marginTop: '6px', opacity: 0.6 }}>Configure and add nodes to build your pipeline</div>
                </div>
            )}
        </div>
    );
}
