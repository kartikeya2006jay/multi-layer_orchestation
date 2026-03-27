'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/lib/auth';

// Professional SVG icons — clean, scalable, investor-ready
const Icons = {
    overview: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    agents: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><circle cx="9" cy="14" r="1.5" fill="currentColor" /><circle cx="15" cy="14" r="1.5" fill="currentColor" />
        </svg>
    ),
    tasks: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    workflows: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3v12" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
    ),
    oversight: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    analytics: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
        </svg>
    ),
    billing: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
        </svg>
    ),
    logout: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

// Chakra logo SVG — geometric, professional
const ChakraLogo = () => (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2.5" opacity="0.3" />
        <circle cx="16" cy="16" r="9" stroke="url(#logo-grad)" strokeWidth="2" />
        <circle cx="16" cy="16" r="4" fill="url(#logo-grad)" />
        <line x1="16" y1="2" x2="16" y2="8" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="24" x2="16" y2="30" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="16" x2="8" y2="16" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="16" x2="30" y2="16" stroke="url(#logo-grad)" strokeWidth="1.5" strokeLinecap="round" />
        <defs>
            <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
    </svg>
);

const navItems = [
    { href: '/', label: 'Overview', icon: 'overview' },
    { href: '/agents', label: 'Agents', icon: 'agents' },
    { href: '/tasks', label: 'Tasks', icon: 'tasks' },
    { href: '/workflows', label: 'Workflows', icon: 'workflows' },
    { href: '/oversight', label: 'Oversight', icon: 'oversight' },
    { href: '/analytics', label: 'Analytics', icon: 'analytics' },
    { href: '/billing', label: 'Billing', icon: 'billing' },
    { href: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { connected } = useWebSocket();
    const { user, logout } = useAuth();

    return (
        <aside style={{
            position: 'fixed',
            left: 12,
            top: 12,
            bottom: 12,
            width: 'var(--sidebar-width)',
            background: 'rgba(8, 10, 18, 0.85)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 100,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
            {/* Logo */}
            <div style={{ padding: '28px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.15)',
                    }}>
                        <ChakraLogo />
                    </div>
                    <div>
                        <div style={{
                            fontWeight: 800,
                            fontSize: '19px',
                            letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #fff 30%, #8b5cf6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Chakraview
                        </div>
                        <div style={{
                            fontSize: '10px',
                            color: 'var(--accent-blue)',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '1.5px',
                            opacity: 0.8,
                        }}>
                            Neural Core
                        </div>
                    </div>
                </div>

                {/* Workspace Switcher */}
                <div style={{
                    marginTop: '24px',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.025)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)',
                }} className="hover-glass">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: 'var(--accent-purple)',
                            boxShadow: '0 0 8px var(--accent-purple-glow)',
                            flexShrink: 0,
                        }} />
                        <span style={{
                            fontSize: '12px', fontWeight: '600',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            color: 'var(--text-secondary)',
                        }}>
                            {user?.workspace_name || 'Standard Workspace'}
                        </span>
                    </div>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2.5 3.5L5 6L7.5 3.5" />
                    </svg>
                </div>
            </div>

            {/* Divider */}
            <div style={{ margin: '0 20px', height: '1px', background: 'var(--border-glass)' }} />

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={isActive ? 'nav-item-active' : 'nav-item'}
                        >
                            <span className="nav-icon" style={{
                                color: isActive ? 'var(--accent-blue)' : 'inherit',
                                filter: isActive ? 'drop-shadow(0 0 4px var(--accent-blue))' : 'none',
                            }}>
                                {Icons[item.icon]}
                            </span>
                            <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile & Status */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-glass)' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'white',
                            border: '2px solid rgba(139, 92, 246, 0.3)',
                        }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{
                                fontSize: '13px', fontWeight: 600,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                                {user?.name || 'User'}
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
                                color: connected ? 'var(--accent-green)' : 'var(--accent-red)',
                            }}>
                                <span style={{
                                    width: '5px', height: '5px', borderRadius: '50%',
                                    background: connected ? 'var(--accent-green)' : 'var(--accent-red)',
                                    boxShadow: connected ? '0 0 8px var(--accent-green)' : 'none',
                                    display: 'inline-block',
                                    animation: connected ? 'pulse-dot 2s infinite' : 'none',
                                }} />
                                {connected ? 'Live' : 'Offline'}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="btn btn-ghost"
                    style={{
                        width: '100%', justifyContent: 'flex-start',
                        padding: '9px 14px', fontSize: '12px', gap: '8px',
                    }}
                >
                    {Icons.logout}
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
