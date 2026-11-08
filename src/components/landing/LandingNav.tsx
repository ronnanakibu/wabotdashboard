import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useRadio } from '../../context/RadioContext';

interface LandingNavProps {
  currentAccent: string;
  onAccentChange: (accent: string) => void;
}

export const LandingNav: FC<LandingNavProps> = ({ currentAccent, onAccentChange }) => {
  const { isPlaying, isLiveConnected } = useRadio();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Ekosistem', href: '#ecosystem' },
    { label: 'Radio 24/7', href: '#radio-station' },
    { label: 'Terminal', href: '#terminal' },
    { label: 'Arsitektur', href: '#architecture' },
    { label: 'Status Node', href: '#specs' }
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: isScrolled ? '12px 20px' : '18px 24px',
        transition: 'padding 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease',
        background: isScrolled ? 'rgba(11, 13, 16, 0.88)' : 'rgba(11, 13, 16, 0.45)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: isScrolled ? '1px solid var(--border)' : '1px solid rgba(255, 255, 255, 0.05)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        {/* Brand */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="2"></circle>
              <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
            </svg>
            <span
              className="animate-pulse-live"
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isLiveConnected ? 'var(--success)' : 'var(--accent)',
                boxShadow: `0 0 8px ${isLiveConnected ? 'var(--success)' : 'var(--accent)'}`
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em' }}>
                ronn<span style={{ color: 'var(--accent)' }}>project</span>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(127, 209, 199, 0.1)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(127, 209, 199, 0.25)',
                  lineHeight: '1.4'
                }}
              >
                my.id
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-dim)',
                letterSpacing: '0.04em'
              }}
            >
              ENGINEERING HUB
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav
          className="desktop-nav-links"
          aria-label="Navigasi halaman"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-muted)',
                transition: 'color 0.15s ease, background-color 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Accent switcher + Dashboard Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Accent Color Palette Switcher */}
          <div
            title="Pilih aksen tema (Mint / Lavender / Amber)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 5px',
              borderRadius: '999px',
              background: 'var(--surface)',
              border: '1px solid var(--border)'
            }}
          >
            {[
              { id: 'mint', color: '#7FD1C7', label: 'Mint' },
              { id: 'lavender', color: '#C9B6FF', label: 'Lavender' },
              { id: 'amber', color: '#E8C27A', label: 'Amber' }
            ].map((theme) => {
              const active = currentAccent === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onAccentChange(theme.id)}
                  aria-label={`Ganti aksen tema ke ${theme.label}`}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: theme.color,
                    border: active ? '2px solid #FFFFFF' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    transform: active ? 'scale(1.15)' : 'scale(1)'
                  }}
                />
              );
            })}
          </div>

          {/* Quick link to Radio Hub / Dashboard */}
          <Link
            to="/radio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0 16px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent)',
              color: '#0B0D10',
              fontWeight: 600,
              fontSize: '13px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 2px 14px rgba(127, 209, 199, 0.25)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(127, 209, 199, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 14px rgba(127, 209, 199, 0.25)';
            }}
          >
            {isPlaying ? (
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#0B0D10',
                  animation: 'livePulse 1.2s infinite'
                }}
              />
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
            <span>Buka Radio Hub</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigasi mobile"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            marginTop: '12px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            boxShadow: '0 16px 36px rgba(0,0,0,0.6)'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                color: 'var(--text)',
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{link.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          ))}
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/radio"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: '#0B0D10',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              Radio Hub
            </Link>
            <Link
              to="/commands"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                flex: 1,
                height: '42px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 500,
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              Commands
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
