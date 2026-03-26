'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/lib/websocket';

const navItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/agents', label: 'Agents', icon: '🤖' },
    { href: '/tasks', label: 'Tasks', icon: '⚡' },
    { href: '/workflows', label: 'Workflows', icon: '🔄' },
    { href: '/oversight', label: 'Oversight', icon: '👁️' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { connected } = useWebSocket();

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: 'var(--sidebar-width)',
            background: 'rgba(10, 11, 15, 0.95)',
            borderRight: '1px solid var(--border-glass)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            padding: '0',
        }}>
            {/* Logo */}
            <div style={{
                padding: '28px 24px 24px',
                borderBottom: '1px solid var(--border-glass)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--gradient-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: 'var(--shadow-glow-blue)',
                    }}>
                        🧠
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.3px' }}>
                            Command Center
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            AI Agent Platform
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: isActive ? 'var(--bg-glass-hover)' : 'transparent',
                                border: isActive ? '1px solid var(--border-glass-hover)' : '1px solid transparent',
                                transition: 'all var(--transition-fast)',
                                position: 'relative',
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{item.icon}</span>
                            <span>{item.label}</span>
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '20px',
                                    borderRadius: '0 3px 3px 0',
                                    background: 'var(--accent-blue)',
                                    boxShadow: '0 0 10px var(--accent-blue)',
                                }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Connection Status */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-glass)' }}>
                <div className={`ws-indicator ${connected ? 'ws-connected' : 'ws-disconnected'}`}>
                    <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: connected ? 'var(--accent-green)' : 'var(--accent-red)',
                        animation: connected ? 'pulse-dot 2s infinite' : 'none',
                    }} />
                    {connected ? 'Live' : 'Disconnected'}
                </div>
            </div>
        </aside>
    );
}
