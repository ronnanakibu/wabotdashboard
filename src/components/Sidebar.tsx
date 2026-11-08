import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useRadio } from '../context/RadioContext';
import { useAuth } from '../context/AuthContext';

export const Sidebar: FC = () => {
  const { currentSong, isPlaying, togglePlay, isLiveConnected } = useRadio();
  const { isAuthenticated, logout } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.matchMedia('(max-width: 840px)').matches : false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 840px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);
    update(mql);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ronn_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ronn_sidebar_collapsed', String(isCollapsed));
      if (!isMobile) {
        document.documentElement.style.setProperty('--sidebar-w', isCollapsed ? '72px' : '248px');
      }
    } catch (_) {}
  }, [isCollapsed, isMobile]);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isMobile) {
    return null;
  }

  return (
    <aside
      className="sidebar-desktop"
      style={{
        flex: `0 0 ${isCollapsed ? '72px' : 'var(--sidebar-w)'}`,
        width: isCollapsed ? '72px' : 'var(--sidebar-w)',
        minWidth: isCollapsed ? '72px' : 'var(--sidebar-w)',
        boxSizing: 'border-box',
        padding: isCollapsed ? '20px 10px' : '24px 16px',
        borderRight: '1px solid var(--border)',
        flexDirection: 'column',
        gap: '24px',
        minHeight: '100dvh',
        background: 'var(--bg)',
        transition: 'width 0.24s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.24s cubic-bezier(0.16, 1, 0.3, 1), padding 0.24s ease'
      }}
    >
      {/* Brand & Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '8px',
          padding: isCollapsed ? '0' : '0 4px',
          position: 'relative'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            title="ronn.ai Live Station"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--surface)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
            </svg>
            {isLiveConnected && (
              <span
                className="animate-pulse-live"
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  boxShadow: '0 0 8px var(--success)'
                }}
                title="Live bot server connected"
              />
            )}
          </div>
          {!isCollapsed && (
            <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '-0.01em' }}>
              ronn<span style={{ color: 'var(--accent)' }}>.ai</span>
            </span>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Bentangkan menu sidebar (Ctrl+B)' : 'Ciutkan menu sidebar (Ctrl+B)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color 0.15s ease, background 0.15s ease, border-color 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {isCollapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          )}
        </button>
      </div>

      {/* Nav groups */}
      <nav aria-label="Navigasi utama" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* PUBLIK */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {!isCollapsed ? (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-dim)', padding: '0 10px 4px' }}>
              PUBLIK
            </div>
          ) : (
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 6px 8px' }} />
          )}

          {/* Portal Beranda */}
          <NavLink
            to="/"
            end
            title={isCollapsed ? 'Beranda Portal' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                {!isCollapsed && <span>Beranda Portal</span>}
              </>
            )}
          </NavLink>

          {/* Radio Hub */}
          <NavLink
            to="/radio"
            title={isCollapsed ? 'Radio Hub' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="2"></circle>
                  <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
                </svg>
                {!isCollapsed && <span>Radio Hub</span>}
              </>
            )}
          </NavLink>

          <NavLink
            to="/commands"
            title={isCollapsed ? 'Commands' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                {!isCollapsed && <span>Commands</span>}
              </>
            )}
          </NavLink>
        </div>

        {/* OWNER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>
                OWNER
              </span>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  title="Keluar dari sesi Owner"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: 'var(--danger)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--danger-border)',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  LOGOUT
                </button>
              ) : (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
                  LOCKED
                </span>
              )}
            </div>
          ) : (
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 6px 8px' }} />
          )}

          <NavLink
            to="/owner/groups"
            title={isCollapsed ? 'Groups' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                {!isCollapsed && <span>Groups</span>}
                {!isCollapsed && (
                  <svg style={{ marginLeft: 'auto', color: 'var(--text-dim)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/owner/ai"
            title={isCollapsed ? 'AI Center' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"></path>
                  <path d="M19 17v4M17 19h4"></path>
                </svg>
                {!isCollapsed && <span>AI Center</span>}
                {!isCollapsed && (
                  <svg style={{ marginLeft: 'auto', color: 'var(--text-dim)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/owner/observatory"
            title={isCollapsed ? 'Observatory' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {!isCollapsed && <span>Observatory</span>}
                {!isCollapsed && (
                  <svg style={{ marginLeft: 'auto', color: 'var(--text-dim)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/owner/telemetry"
            title={isCollapsed ? 'System Telemetry' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                {!isCollapsed && <span>System</span>}
                {!isCollapsed && (
                  <svg style={{ marginLeft: 'auto', color: 'var(--text-dim)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                )}
              </>
            )}
          </NavLink>

          <NavLink
            to="/owner/terminal"
            title={isCollapsed ? 'Terminal Logs' : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px',
              height: '40px',
              padding: isCollapsed ? '0' : '0 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 500,
              background: isActive ? 'var(--surface)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-muted)',
              border: isActive ? '1px solid var(--border)' : '1px solid transparent',
              transition: 'background 0.15s ease, color 0.15s ease'
            })}
          >
            {({ isActive }) => (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'var(--accent)' : 'currentColor'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 6H3M21 12H3M15 18H3"></path>
                </svg>
                {!isCollapsed && <span>Terminal</span>}
                {!isCollapsed && (
                  <svg style={{ marginLeft: 'auto', color: 'var(--text-dim)' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
                  </svg>
                )}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Persistent Mini-Player Pinned to Bottom */}
      <div
        style={{
          marginTop: 'auto',
          border: '1px solid var(--border)',
          borderRadius: isCollapsed ? '16px' : 'var(--radius-lg)',
          background: 'var(--surface)',
          padding: isCollapsed ? '8px 4px' : '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'stretch',
          gap: isCollapsed ? '6px' : '10px'
        }}
      >
        {isCollapsed ? (
          /* Collapsed Mini Player Button */
          <button
            onClick={togglePlay}
            title={currentSong ? `${currentSong.title} — ${currentSong.artist} (${isPlaying ? 'Klik untuk jeda' : 'Klik untuk putar'})` : 'Radio Hub Live'}
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: isPlaying ? '1px solid var(--accent)' : '1px solid var(--border-strong)',
              background: 'var(--cover-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0
            }}
          >
            {currentSong?.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt="Mini cover"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
              />
            ) : (
              <svg width="24" height="24" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="9" fill="var(--cover-moon)" />
              </svg>
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1"></rect>
                  <rect x="14" y="5" width="4" height="14" rx="1"></rect>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </div>
          </button>
        ) : (
          /* Expanded Mini Player Card */
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  background: 'var(--cover-bg)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border)'
                }}
              >
                {currentSong?.thumbnail ? (
                  <img
                    src={currentSong.thumbnail}
                    alt="Mini cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg width="24" height="24" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="8" fill="var(--cover-moon)" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentSong?.title || 'Radio Offline'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentSong?.artist || 'Menghubungkan...'}
                </div>
              </div>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda siaran' : 'Putar siaran'}
                style={{
                  flex: '0 0 36px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-strong)',
                  background: isPlaying ? 'var(--surface-selected)' : 'transparent',
                  color: isPlaying ? 'var(--accent)' : 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="5" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="15" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>
            </div>
            {/* 2px progress line in accent */}
            <div style={{ height: '2px', background: 'var(--border)', borderRadius: '1px', overflow: 'hidden' }}>
              <div
                style={{
                  width: isPlaying ? '100%' : '0%',
                  height: '2px',
                  background: 'var(--accent)',
                  borderRadius: '1px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
