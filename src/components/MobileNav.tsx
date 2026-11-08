import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { useRadio } from '../context/RadioContext';
import { useAuth } from '../context/AuthContext';

export const MobileNav: FC = () => {
  const { currentSong, isPlaying, togglePlay, isLiveConnected, isStreamIdle } = useRadio();
  const { isAuthenticated } = useAuth();

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

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Top Header */}
      <header
        className="mobile-top-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(11, 13, 16, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '7px', background: 'var(--surface)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
            </svg>
          </div>
          <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '-0.01em' }}>
            ronn<span style={{ color: 'var(--accent)' }}>.ai</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isLiveConnected ? (isStreamIdle ? 'var(--warning)' : 'var(--success)') : 'var(--text-dim)',
              boxShadow: isLiveConnected ? (isStreamIdle ? '0 0 6px var(--warning)' : '0 0 6px var(--success)') : 'none',
              flexShrink: 0
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            {isLiveConnected ? (isStreamIdle ? 'STANDBY' : 'ON AIR') : 'OFFLINE'}
          </span>
        </div>
      </header>

      {/* Floating Mini Player (Docked directly above Middle Navbar when active) */}
      {isPlaying && (
        <div
          style={{
            position: 'fixed',
            bottom: '66px',
            left: 0,
            right: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 49,
            padding: '0 12px',
            boxSizing: 'border-box'
          }}
        >
          <div
            className="mobile-mini-player"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              width: '100%',
              maxWidth: '330px',
              boxSizing: 'border-box',
              borderRadius: '16px',
              background: 'rgba(16, 20, 28, 0.92)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 12px 36px -6px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
              padding: '7px 10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'var(--cover-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1px solid var(--accent)'
                }}
              >
                {currentSong?.thumbnail ? (
                  <img
                    src={currentSong.thumbnail}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="8" fill="var(--cover-moon)" />
                  </svg>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text)' }}>
                  {currentSong?.title || 'Radio Offline'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentSong?.artist || 'Connecting...'}
                </div>
              </div>
            </div>

            <button
              onClick={togglePlay}
              aria-label="Jeda siaran"
              style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#FFFFFF',
                color: '#0B0D10',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="4" width="4" height="16" rx="1"></rect>
                <rect x="15" y="4" width="4" height="16" rx="1"></rect>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Middle Island Bottom Dock Navbar */}
      <div
        style={{
          position: 'fixed',
          bottom: '12px',
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 50,
          padding: '0 10px',
          boxSizing: 'border-box'
        }}
      >
        <nav
          className="mobile-middle-dock"
          aria-label="Mobile Bottom Navigation"
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            width: 'fit-content',
            maxWidth: '100%',
            boxSizing: 'border-box',
            background: 'rgba(14, 18, 25, 0.92)',
            backdropFilter: 'blur(32px) saturate(210%)',
            WebkitBackdropFilter: 'blur(32px) saturate(210%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.75), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
            padding: '4px 5px',
            alignItems: 'center',
            gap: '2px'
          }}
        >
        {/* Portal Beranda */}
        <NavLink
          to="/"
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              {isActive && <span>Portal</span>}
            </>
          )}
        </NavLink>

        {/* Radio */}
        <NavLink
          to="/radio"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
              </svg>
              {isActive && <span>Radio</span>}
            </>
          )}
        </NavLink>

        {/* Commands */}
        <NavLink
          to="/commands"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              {isActive && <span>Cmds</span>}
            </>
          )}
        </NavLink>

        {/* Groups */}
        <NavLink
          to="/owner/groups"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              {isActive && <span>Groups</span>}
            </>
          )}
        </NavLink>

        {/* System / Telemetry */}
        <NavLink
          to="/owner/telemetry"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              {isActive && <span>System</span>}
            </>
          )}
        </NavLink>

        {/* Terminal / Login */}
        <NavLink
          to={isAuthenticated ? "/owner/terminal" : "/login"}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: isActive ? '6px 11px' : '6px 8px',
            borderRadius: '9999px',
            background: isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: isActive ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
            fontSize: '11px',
            fontWeight: 500,
            transition: 'all 0.18s ease'
          })}
        >
          {({ isActive }) => (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 6H3M21 12H3M15 18H3"></path>
              </svg>
              {isActive && <span>{isAuthenticated ? 'Logs' : 'Login'}</span>}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  </>
);
};
