import { useState, useEffect } from 'react';
import type { FC, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { HeroCanvas } from '../components/landing/HeroCanvas';
import { LandingNav } from '../components/landing/LandingNav';
import { SoundwaveVisualizer } from '../components/landing/SoundwaveVisualizer';
import { InteractiveTerminal } from '../components/landing/InteractiveTerminal';

export const LandingPage: FC = () => {
  const [currentAccent, setCurrentAccent] = useState<string>(() => {
    try {
      return localStorage.getItem('ronn_accent_theme') || 'mint';
    } catch {
      return 'mint';
    }
  });

  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('ronn_accent_theme', currentAccent);
      if (currentAccent === 'mint') {
        document.documentElement.removeAttribute('data-accent');
      } else {
        document.documentElement.setAttribute('data-accent', currentAccent);
      }
    } catch {
      // ignore storage access error
    }
  }, [currentAccent]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => {
      setCopiedDomain(null);
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        maxWidth: '100vw',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflowX: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      {/* Top Floating Glassmorphism Navbar */}
      <LandingNav currentAccent={currentAccent} onAccentChange={setCurrentAccent} />

      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          position: 'relative',
          padding: '130px 20px 70px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '85dvh',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Interactive 2D Cybernetic Canvas Background */}
        <HeroCanvas />

        {/* Ambient Blurred Colored Glows (Compositor only) */}
        <div
          className="animate-glow-1"
          style={{
            position: 'absolute',
            top: '20%',
            left: '25%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            filter: 'blur(100px)',
            opacity: 0.12,
            pointerEvents: 'none',
            zIndex: 0
          }}
          aria-hidden="true"
        />
        <div
          className="animate-glow-2"
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '20%',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #C9B6FF 0%, transparent 70%)',
            filter: 'blur(90px)',
            opacity: 0.1,
            pointerEvents: 'none',
            zIndex: 0
          }}
          aria-hidden="true"
        />

        {/* Hero Content Container */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '920px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            boxSizing: 'border-box'
          }}
        >
          {/* Top Status Chip */}
          <div
            className="hero-status-chip"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(18, 22, 27, 0.85)',
              border: '1px solid var(--border-strong)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              boxSizing: 'border-box',
              maxWidth: '100%'
            }}
          >
            <span
              className="animate-pulse-live"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--success)',
                boxShadow: '0 0 8px var(--success)',
                flexShrink: 0
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'var(--text)'
              }}
            >
              RONN PROJECT ECOSYSTEM · v6.3.0
            </span>
            <span style={{ color: 'var(--text-dim)' }}>|</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--accent)'
              }}
            >
              ALL SYSTEMS ONLINE
            </span>
          </div>

          {/* Master Headline */}
          <h1
            style={{
              fontSize: 'clamp(28px, 6.5vw, 56px)',
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: '-0.03em',
              margin: 0,
              color: 'var(--text)',
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}
          >
            Creative Engineering & <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--text) 30%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Autonomous AI Ecosystem
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 'clamp(14px, 2.2vw, 17px)',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              maxWidth: '660px',
              margin: '0 auto',
              padding: '0 6px'
            }}
          >
            Satu domain terpadu <strong>ronnproject.my.id</strong> untuk seluruh karya rekayasa software, autonomous WhatsApp bot, platform gamifikasi, dan siaran live radio 24/7.
          </p>

          {/* Hero Action Buttons */}
          <div
            className="hero-cta-group"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginTop: '6px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <a
              href="#ecosystem"
              className="hero-cta-btn"
              style={{
                height: '46px',
                padding: '0 22px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: '#0B0D10',
                fontWeight: 600,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(127, 209, 199, 0.3)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(127, 209, 199, 0.45)';
              }}
              onMouseLeave={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(127, 209, 199, 0.3)';
              }}
            >
              <span>Jelajahi Subdomain & Proyek</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>

            <Link
              to="/radio"
              className="hero-cta-btn"
              style={{
                height: '46px',
                padding: '0 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-selected)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2"></circle>
                <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"></path>
              </svg>
              <span>Live Radio Hub</span>
            </Link>

            <Link
              to="/commands"
              className="hero-cta-btn"
              style={{
                height: '46px',
                padding: '0 18px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontWeight: 500,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                transition: 'color 0.15s ease, border-color 0.15s ease',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--text-dim)';
              }}
              onMouseLeave={(e: MouseEvent<HTMLElement>) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              <span>Katalog Perintah</span>
            </Link>
          </div>

          {/* Quick HUD Stat Tiles Strip */}
          <div
            className="hero-stats-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '10px',
              width: '100%',
              maxWidth: '820px',
              marginTop: '22px',
              boxSizing: 'border-box'
            }}
          >
            {[
              { label: 'ACTIVE SUBDOMAINS', value: '3 Active', hint: 'equest · wabot · radio', color: 'var(--accent)' },
              { label: 'BOT ENGINE UPTIME', value: '99.98%', hint: 'Self-healing socket', color: 'var(--success)' },
              { label: 'AI ROUTING LATENCY', value: '~140ms', hint: 'Multi-Tier Brain', color: 'var(--warning)' },
              { label: 'AUDIO BROADCAST', value: '24/7 Live', hint: 'Lo-Fi / Synth booth', color: 'var(--text)' }
            ].map((stat, i) => (
              <div
                key={i}
                className="hero-stat-card"
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(18, 22, 27, 0.75)',
                  border: '1px solid var(--border)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  transition: 'border-color 0.2s ease, transform 0.2s ease',
                  minWidth: 0,
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e: MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e: MouseEvent<HTMLElement>) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stat.label}
                </div>
                <div className="hero-stat-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '19px', fontWeight: 600, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stat.hint}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 01: Subdomains & Ecosystem Matrix */}
      <section
        id="ecosystem"
        className="landing-section"
        style={{
          position: 'relative',
          padding: '70px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        {/* Section Header */}
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}
          >
            01 // CENTRAL HUB MATRIX
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.8vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              color: 'var(--text)'
            }}
          >
            Subdomain & Proyek Unggulan
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Semua hobby project, platform gamifikasi, dan asisten bot otonom Ronn terhubung rapi di bawah satu domain utama <strong>ronnproject.my.id</strong>.
          </p>
        </div>

        {/* Project Showcase Cards Grid */}
        <div
          className="ecosystem-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 310px), 1fr))',
            gap: '18px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Card 1: EnglishQuest Web */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(123, 200, 160, 0.1)',
                    border: '1px solid rgba(123, 200, 160, 0.25)',
                    color: 'var(--success)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                  SUBDOMAIN ACTIVE
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  EDTECH · GAMIFIED
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
                EnglishQuest Web
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                Platform petualangan belajar bahasa Inggris interaktif dengan quest adaptif, tantangan kuis harian, dan sistem progres gamifikasi imersif.
              </p>

              {/* Subdomain pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  equest.ronnproject.my.id
                </span>
                <button
                  onClick={() => handleCopy('https://equest.ronnproject.my.id')}
                  title="Salin alamat subdomain"
                  style={{
                    color: copiedDomain === 'https://equest.ronnproject.my.id' ? 'var(--accent)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0
                  }}
                >
                  {copiedDomain === 'https://equest.ronnproject.my.id' ? 'Tersalin ✓' : 'Salin'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <a
                href="https://equest.ronnproject.my.id"
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent)',
                  color: '#0B0D10',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <span>Buka EnglishQuest</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Card 2: WABOT 2.0 Assistant */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(127, 209, 199, 0.1)',
                    border: '1px solid rgba(127, 209, 199, 0.25)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  CORE ENGINE v6.3.0
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  AUTONOMOUS AI BOT
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
                WABOT 2.0 Assistant
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                WhatsApp assistant otonom dengan Dynamic Skills, router AI multi-level (Regex, Gemini Flash, Deepmind), proteksi grup anti-link/anti-toxic, dan telemetry.
              </p>

              {/* Subdomain pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  wabot.ronnproject.my.id
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>Subdomain Ready</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/commands"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-selected)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <span>Katalog 48+ Perintah</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 3: ronn.ai Live Radio */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(224, 180, 106, 0.1)',
                    border: '1px solid rgba(224, 180, 106, 0.25)',
                    color: 'var(--warning)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--warning)', flexShrink: 0 }} />
                  24/7 ON AIR
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  WEB AUDIO API · LO-FI
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
                Live Radio Hub
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                Booth siaran radio lo-fi & indie nonstop dengan visualizer 64-bar real-time, antrean request lagu interaktif, dan mini-player persisten.
              </p>

              {/* Subdomain pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  ronnproject.my.id/radio
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', flexShrink: 0 }}>Live Stream</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/radio"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-selected)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <span>Masuk Studio Radio</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 4: System Telemetry */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(201, 182, 255, 0.1)',
                    border: '1px solid rgba(201, 182, 255, 0.25)',
                    color: '#C9B6FF',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#C9B6FF', flexShrink: 0 }} />
                  OBSERVATORY
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  DIAGNOSTICS
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
                Mission Control Telemetry
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                Monitoring performa server komprehensif: CPU & RAM sparklines, distribusi tier AI routing, live session WhatsApp status, dan terminal ring-buffer logs.
              </p>

              {/* Subdomain pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  /owner/telemetry
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0 }}>Protected</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/owner/telemetry"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-selected)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <span>Akses Telemetry</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 5: AI Center & Dynamic Skills */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(127, 209, 199, 0.1)',
                    border: '1px solid rgba(127, 209, 199, 0.25)',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  AGENTIC SYSTEM
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  SKILLS RUNTIME
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text)' }}>
                AI Center & Skills Runtime
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
                Modul injeksi kemampuan dinamis bot secara real-time tanpa henti, multi-agent coordination, dan integrasi LLM multimodal.
              </p>

              {/* Subdomain pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-inset)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  /owner/ai
                </span>
                <span style={{ fontSize: '11px', color: 'var(--accent)', flexShrink: 0 }}>Live Injection</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <Link
                to="/owner/ai"
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-selected)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--text)',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <span>Buka AI Center</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </Link>
            </div>
          </div>

          {/* Card 6: Upcoming Labs */}
          <div
            className="ecosystem-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(18, 22, 27, 0.45)',
              border: '1px dashed var(--border-strong)',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              position: 'relative',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-dim)', flexShrink: 0 }} />
                  INCUBATING
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                  EXPERIMENT
                </span>
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-muted)' }}>
                Ronn Labs & Sandbox
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-dim)', margin: '0 0 14px 0' }}>
                Ruang inkubasi untuk proyek-proyek eksperimental baru: speech synthesis agents, tools otomatisasi web, dan prototipe API berikutnya.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--text-dim)',
                  gap: '8px',
                  minWidth: 0
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
                  lab.ronnproject.my.id
                </span>
                <span style={{ fontSize: '11px', flexShrink: 0 }}>Pipeline Ready</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
              <div
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  fontWeight: 500,
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box'
                }}
              >
                Dalam Tahap Eksplorasi
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02: Interactive Live Radio Player Showcase */}
      <section
        id="radio-station"
        className="landing-section"
        style={{
          position: 'relative',
          padding: '70px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}
          >
            02 // LIVE AUDIO STREAM & VISUALIZER
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.8vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              color: 'var(--text)'
            }}
          >
            Siaran Radio Lo-Fi & Synth 24/7
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Dengarkan siaran live audio langsung dari website tanpa jeda, dilengkapi visualizer frekuensi Web Audio API dan antrean lagu interaktif.
          </p>
        </div>

        {/* Live Soundwave Visualizer Card */}
        <SoundwaveVisualizer />
      </section>

      {/* Section 03: Interactive Mission Control Terminal */}
      <section
        id="terminal"
        className="landing-section"
        style={{
          position: 'relative',
          padding: '70px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}
          >
            03 // DEVELOPER MISSION CONTROL
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.8vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              color: 'var(--text)'
            }}
          >
            Interactive Terminal Simulator
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Uji coba perintah terminal secara langsung. Klik preset tombol di bawah atau ketik langsung seperti pada console server.
          </p>
        </div>

        {/* Terminal Component */}
        <InteractiveTerminal />
      </section>

      {/* Section 04: Architecture & Engineering Pillars */}
      <section
        id="architecture"
        className="landing-section"
        style={{
          position: 'relative',
          padding: '70px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: 'var(--accent)',
              marginBottom: '8px'
            }}
          >
            04 // SYSTEM ARCHITECTURE
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 3.8vw, 34px)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: '0 0 10px 0',
              color: 'var(--text)'
            }}
          >
            Filosofi Desain & Rekayasa Sistem
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              maxWidth: '640px',
              lineHeight: 1.6,
              margin: 0
            }}
          >
            Dibangun dengan standar rekayasa software modern: latency rendah, hemat komputasi, dan zero-bloat.
          </p>
        </div>

        <div
          className="architecture-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '18px',
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Pillar 1 */}
          <div
            className="architecture-card"
            style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="12 8 8 12 12 16 12 8"></polygon>
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
              Multi-Tier AI Routing
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              Routing otomatis permintaan user: Tier 0 untuk pola deterministik (&lt;5ms), Tier 1 Flash untuk pemrosesan cepat (~150ms), dan Tier 2 Reasoning untuk penalaran kompleks.
            </p>
          </div>

          {/* Pillar 2 */}
          <div
            className="architecture-card"
            style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
              Subdomain Edge Networking
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              Setiap subdomain (equest, wabot, radio) diarahkan secara cerdas melalui DNS Anycast & Edge CDN Vercel dengan enkripsi SSL otomatis dan propagasi instan.
            </p>
          </div>

          {/* Pillar 3 */}
          <div
            className="architecture-card"
            style={{
              padding: '22px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              minWidth: 0
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--surface-inset)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--warning)',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, margin: 0, color: 'var(--text)' }}>
              GPU Compositor Motion
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
              Semua animasi motion dan efek visual dijalankan murni pada thread GPU compositor (opacity, transform, canvas) sehingga sangat halus 60 FPS dan ringan pada memori handphone.
            </p>
          </div>
        </div>
      </section>

      {/* Section 05: Technology Stack Strip */}
      <section
        id="specs"
        className="landing-section"
        style={{
          position: 'relative',
          padding: '50px 20px',
          maxWidth: '1240px',
          margin: '0 auto',
          borderTop: '1px solid var(--border)',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>
            POWERED BY MODERN WEB STACK & CLOUD INFRASTRUCTURE
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            {[
              'React 19',
              'TypeScript',
              'Vite 8',
              'Tailwind CSS Tokens',
              'Web Audio API',
              'Node.js 22 LTS',
              'Baileys Socket',
              'Vercel Edge',
              'Let\'s Encrypt SSL',
              'SQLite FTS5'
            ].map((tech) => (
              <span
                key={tech}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)'
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="landing-footer"
        style={{
          borderTop: '1px solid var(--border)',
          padding: '36px 20px',
          background: 'var(--surface-inset)',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box',
          width: '100%'
        }}
      >
        <div
          className="landing-footer-inner"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em' }}>
              ronn<span style={{ color: 'var(--accent)' }}>project</span>.my.id
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              © 2026 Ronn Creative Engineering. Designed with precision.
            </div>
          </div>

          <div
            className="landing-footer-links"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap'
            }}
          >
            <a
              href="#ecosystem"
              style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Ekosistem
            </a>
            <Link
              to="/radio"
              style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Radio Hub
            </Link>
            <Link
              to="/commands"
              style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              Commands
            </Link>
            <Link
              to="/login"
              style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none' }}
            >
              Owner Portal →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
