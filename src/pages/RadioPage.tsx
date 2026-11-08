import { useState, useEffect, useRef } from 'react';
import type { FC, FormEvent } from 'react';
import { useRadio } from '../context/RadioContext';

export type RadioTheme = 'apple-glass' | 'cyber-obsidian' | 'midnight-oled';

export const RadioPage: FC = () => {
  const { currentSong, isPlaying, isStreamIdle, listeners, isLiveConnected, queue, history, togglePlay, requestSong, getAudioData } = useRadio();
  const [songInput, setSongInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Persistent Radio Theme (Apple Glass / Cyber Obsidian / Midnight OLED)
  const [theme, setTheme] = useState<RadioTheme>(() => {
    try {
      return (localStorage.getItem('ronn_radio_theme') as RadioTheme) || 'apple-glass';
    } catch {
      return 'apple-glass';
    }
  });

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

  const handleThemeChange = (newTheme: RadioTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('ronn_radio_theme', newTheme);
    } catch (_) {}
  };

  // Focus search input when '/' is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 32-bar real-time beat & frequency visualizer state (responsive across all mobile & desktop viewports)
  const [barOffsets, setBarOffsets] = useState<number[]>(() =>
    Array.from({ length: 32 }, (_, i) => Math.abs(Math.sin(i * 0.42) * Math.cos(i * 0.17 + 1)) * 0.75 + 0.18 * Math.abs(Math.sin(i * 1.3)))
  );

  useEffect(() => {
    let animId: number;

    const renderFrame = () => {
      if (!isPlaying) {
        // Idle state: gentle calm wave
        const t = Date.now() / 1200;
        setBarOffsets(prev => prev.map((_, i) => Math.max(0.08, (Math.sin(i * 0.22 + t) * 0.5 + 0.5) * 0.16 + 0.08)));
        return;
      }

      const data = getAudioData();
      if (data && data.length > 0) {
        let sum = 0;
        for (let i = 0; i < Math.min(32, data.length); i++) sum += data[i];

        if (sum > 5) {
          // Live audio beat analysis across 32 frequency bands
          const bars: number[] = new Array(32);
          for (let i = 0; i < 32; i++) {
            const raw = data[i] / 255;
            const boosted = Math.pow(raw, 0.75) * 1.35;
            bars[i] = Math.min(1.0, Math.max(0.08, boosted));
          }
          setBarOffsets(bars);
        } else {
          // Audio connected but stream buffering or quiet
          const t = Date.now() / 400;
          setBarOffsets(prev => prev.map((_, i) => {
            const v = Math.abs(Math.sin(i * 0.42 + t) * Math.cos(i * 0.17 + 1)) * 0.4 + 0.1;
            return Math.min(1, Math.max(0.08, v));
          }));
        }
      } else {
        // Fallback simulation if browser Web Audio is not capturing
        const t = Date.now() / 320;
        setBarOffsets(prev => prev.map((_, i) => {
          const v = Math.abs(Math.sin(i * 0.42 + t) * Math.cos(i * 0.17 + 1)) * 0.75 + 0.18 * Math.abs(Math.sin(i * 1.3 + t));
          return Math.min(1, Math.max(0.08, v));
        }));
      }

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, getAudioData]);

  const handleRequest = async (e: FormEvent) => {
    e.preventDefault();
    if (!songInput.trim()) return;
    setSubmitting(true);
    const res = await requestSong(songInput);
    setFeedbackMsg({ text: res.message || `"${songInput}" berhasil dikirim ke antrean!` });
    setSongInput('');
    setSubmitting(false);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const displayQueue = queue.length > 0 ? queue : [
    { id: 'def_1', title: 'Belum ada lagu di antrean', artist: 'Ketik judul di atas untuk request lagu!', duration: '--:--', requester: 'Siaran Otomatis' }
  ];

  const displayHistory = history.length > 0 ? history : [
    { id: 'def_h1', title: 'Siaran Radio Bot', artist: 'Ronn AI Music Engine', duration: 'LIVE', requester: 'Tadi' }
  ];

  // Visualizer bar styling based on current active theme
  const getVisualizerBarStyle = (v: number) => {
    const heightPercent = `${Math.round(Math.max(8, v * 100))}%`;
    if (!isPlaying || isStreamIdle) {
      return {
        flex: '1 1 0px',
        minWidth: 0,
        height: heightPercent,
        background: 'var(--border-strong)',
        borderRadius: '3px',
        transition: 'height 0.2s ease'
      };
    }

    if (theme === 'apple-glass') {
      return {
        flex: '1 1 0px',
        minWidth: 0,
        height: heightPercent,
        background: 'linear-gradient(180deg, #C084FC 0%, #38BDF8 100%)',
        boxShadow: v > 0.6 ? '0 0 10px rgba(192, 132, 252, 0.45)' : 'none',
        borderRadius: '3px',
        transition: 'none'
      };
    }

    if (theme === 'midnight-oled') {
      return {
        flex: '1 1 0px',
        minWidth: 0,
        height: heightPercent,
        background: '#FFFFFF',
        boxShadow: v > 0.6 ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none',
        borderRadius: '2px',
        transition: 'none'
      };
    }

    // Default 'cyber-obsidian'
    return {
      flex: '1 1 0px',
      minWidth: 0,
      height: heightPercent,
      background: 'var(--accent)',
      boxShadow: v > 0.6 ? '0 0 10px rgba(127, 209, 199, 0.4)' : 'none',
      borderRadius: '2px',
      transition: 'none'
    };
  };

  return (
    <div
      className="radio-page-container"
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: isMobile ? '14px 12px 140px' : '28px 36px 64px'
      }}
    >
      {/* Top Header with Theme Switcher & Status Badge */}
      <header
        className="radio-header-wrap"
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '10px' : '14px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '20px', fontWeight: 600, letterSpacing: '-0.01em', textAlign: isMobile ? 'center' : 'left' }}>
            Radio Hub
          </h1>
          <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-muted)', textAlign: isMobile ? 'center' : 'left' }}>
            Live audio streaming engine dengan real-time beat visualizer & cover art resolver.
          </p>
        </div>

        <div
          className="radio-header-controls"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: '8px',
            width: isMobile ? '100%' : 'auto',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Theme Switcher Segmented Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              padding: '2px 3px',
              gap: '2px',
              width: isMobile ? '100%' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            <button
              onClick={() => handleThemeChange('apple-glass')}
              title="Modern Apple Glassmorphism UI"
              style={{
                flex: isMobile ? 1 : 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                fontWeight: theme === 'apple-glass' ? 600 : 400,
                background: theme === 'apple-glass' ? 'rgba(255, 255, 255, 0.16)' : 'transparent',
                color: theme === 'apple-glass' ? '#FFFFFF' : 'var(--text-muted)',
                boxShadow: theme === 'apple-glass' ? 'inset 0 1px 1px rgba(255,255,255,0.2)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🍎</span>
              <span>Glass</span>
            </button>

            <button
              onClick={() => handleThemeChange('cyber-obsidian')}
              title="Cyber Obsidian Neon UI"
              style={{
                flex: isMobile ? 1 : 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                fontWeight: theme === 'cyber-obsidian' ? 600 : 400,
                background: theme === 'cyber-obsidian' ? 'var(--surface-selected)' : 'transparent',
                color: theme === 'cyber-obsidian' ? 'var(--accent)' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>⚡</span>
              <span>Cyber</span>
            </button>

            <button
              onClick={() => handleThemeChange('midnight-oled')}
              title="Midnight OLED Pitch Black"
              style={{
                flex: isMobile ? 1 : 'none',
                padding: '5px 8px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '11px',
                fontWeight: theme === 'midnight-oled' ? 600 : 400,
                background: theme === 'midnight-oled' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: theme === 'midnight-oled' ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🌌</span>
              <span>OLED</span>
            </button>
          </div>

          {/* Connection Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '28px',
              padding: '0 10px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: isLiveConnected ? (isStreamIdle ? 'var(--warning)' : 'var(--accent)') : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              margin: isMobile ? '0 auto' : undefined
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isLiveConnected ? (isStreamIdle ? 'var(--warning)' : 'var(--accent)') : 'var(--text-muted)',
                boxShadow: isLiveConnected ? (isStreamIdle ? '0 0 6px var(--warning)' : '0 0 6px var(--accent)') : 'none',
                flexShrink: 0
              }}
            />
            <span>{isLiveConnected ? (isStreamIdle ? 'STANDBY' : `ON AIR · ${listeners}`) : 'OFFLINE'}</span>
          </div>
        </div>
      </header>

      {/* NOW PLAYING HERO (ADAPTIVE THEME & FULLY RESPONSIVE) */}
      <section
        aria-label="Sedang diputar"
        className="animate-fade-in"
        style={{
          position: 'relative',
          overflow: 'hidden',
          contain: 'paint',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          borderRadius: theme === 'apple-glass' ? '22px' : theme === 'midnight-oled' ? '16px' : 'var(--radius-lg)',
          background: theme === 'apple-glass'
            ? 'rgba(255, 255, 255, 0.04)'
            : theme === 'midnight-oled'
            ? '#000000'
            : 'var(--surface)',
          backdropFilter: theme === 'apple-glass' ? 'blur(36px) saturate(210%)' : undefined,
          WebkitBackdropFilter: theme === 'apple-glass' ? 'blur(36px) saturate(210%)' : undefined,
          border: theme === 'apple-glass'
            ? '1px solid rgba(255, 255, 255, 0.16)'
            : theme === 'midnight-oled'
            ? '1px solid rgba(255, 255, 255, 0.09)'
            : '1px solid var(--border)',
          boxShadow: theme === 'apple-glass'
            ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), 0 20px 48px -10px rgba(0, 0, 0, 0.6)'
            : theme === 'midnight-oled'
            ? '0 0 40px rgba(0, 0, 0, 0.95)'
            : '0 8px 24px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ambient Blurred Glowing Blobs (Desktop only to prevent mobile overflow & conserve GPU memory) */}
        {!isMobile && theme === 'apple-glass' && (
          <>
            <div
              aria-hidden="true"
              className="animate-glow-1"
              style={{
                position: 'absolute',
                left: '-40px',
                top: '-50px',
                width: 'min(280px, 60vw)',
                height: 'min(280px, 60vw)',
                borderRadius: '50%',
                background: '#8B5CF6',
                opacity: 0.18,
                filter: 'blur(75px)',
                pointerEvents: 'none'
              }}
            />
            <div
              aria-hidden="true"
              className="animate-glow-2"
              style={{
                position: 'absolute',
                right: '-30px',
                bottom: '-60px',
                width: 'min(300px, 60vw)',
                height: 'min(300px, 60vw)',
                borderRadius: '50%',
                background: '#06B6D4',
                opacity: 0.16,
                filter: 'blur(80px)',
                pointerEvents: 'none'
              }}
            />
          </>
        )}

        {!isMobile && theme === 'cyber-obsidian' && (
          <div
            aria-hidden="true"
            className="animate-glow-1"
            style={{
              position: 'absolute',
              left: '-40px',
              top: '-50px',
              width: 'min(280px, 60vw)',
              height: 'min(280px, 60vw)',
              borderRadius: '50%',
              background: 'var(--accent)',
              opacity: 0.10,
              filter: 'blur(70px)',
              pointerEvents: 'none'
            }}
          />
        )}

        <div
          className="radio-hero-inner"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            padding: isMobile ? '18px 12px' : '32px',
            gap: isMobile ? '16px' : '32px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Cover Art with Live Thumbnail & High-Res Fallback */}
          <div
            className="radio-cover-box"
            style={{
              width: isMobile ? '130px' : '240px',
              height: isMobile ? '130px' : '240px',
              flex: isMobile ? '0 0 130px' : '0 0 240px',
              margin: isMobile ? '0 auto' : undefined,
              borderRadius: theme === 'apple-glass' ? '18px' : theme === 'midnight-oled' ? '14px' : 'var(--radius-md)',
              border: theme === 'apple-glass' ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid var(--border-strong)',
              boxShadow: isPlaying
                ? (theme === 'apple-glass'
                  ? '0 16px 36px -8px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.2)'
                  : '0 10px 28px rgba(0, 0, 0, 0.55)')
                : 'none'
            }}
          >
            {currentSong?.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt={`Cover art ${currentSong?.title || 'Radio'}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <svg role="img" aria-label={`Cover art ${currentSong?.title}`} width="100%" height="100%" viewBox="0 0 280 280" style={{ display: 'block' }}>
                <rect width="280" height="280" fill="var(--cover-bg)"></rect>
                <circle cx="176" cy="104" r="58" fill="var(--cover-moon)"></circle>
                <circle cx="200" cy="90" r="52" fill="var(--cover-bg)"></circle>
                <g stroke="var(--accent)" strokeWidth="1" opacity="0.7">
                  <line x1="64" y1="196" x2="216" y2="196"></line>
                  <line x1="84" y1="210" x2="196" y2="210"></line>
                  <line x1="104" y1="224" x2="176" y2="224"></line>
                </g>
              </svg>
            )}
          </div>

          {/* Song Details & Controls */}
          <div
            className="radio-info-box"
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              flex: isMobile ? '1 1 auto' : '1 1 300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'center' : 'stretch',
              textAlign: isMobile ? 'center' : 'left',
              gap: isMobile ? '14px' : '20px',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start', gap: '8px', width: '100%' }}>
              <span
                className="radio-badge-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: 'fit-content',
                  height: '24px',
                  padding: '0 10px',
                  border: `1px solid ${isStreamIdle ? 'var(--warning)' : theme === 'apple-glass' ? 'rgba(255,255,255,0.2)' : 'var(--accent)'}`,
                  borderRadius: 'var(--radius-pill)',
                  background: isStreamIdle ? 'rgba(224, 180, 106, 0.1)' : 'rgba(255, 255, 255, 0.08)',
                  color: isStreamIdle ? 'var(--warning)' : theme === 'apple-glass' ? '#A7F3D0' : 'var(--accent)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  margin: isMobile ? '0 auto' : undefined
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isStreamIdle ? 'var(--warning)' : 'var(--accent)' }}></span>
                <span>{isStreamIdle ? 'STANDBY · SIAGA' : 'SEDANG MENGUDARA'}</span>
              </span>

              <h2
                className="radio-song-title"
                style={{
                  margin: 0,
                  fontSize: isMobile ? '18px' : '24px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  wordBreak: 'break-word',
                  lineHeight: 1.25,
                  textAlign: isMobile ? 'center' : 'left'
                }}
              >
                {currentSong?.title || 'Menunggu Lagu'}
              </h2>

              <div style={{ fontSize: isMobile ? '13px' : '15px', color: 'var(--text-muted)', fontWeight: 400, textAlign: isMobile ? 'center' : 'left' }}>
                {currentSong?.artist || 'Unknown Artist'}
              </div>

              <div
                className="radio-song-meta"
                style={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  gap: '6px'
                }}
              >
                <span>Direquest oleh:</span>
                <span style={{ color: theme === 'apple-glass' ? '#7FD1C7' : 'var(--accent)', fontWeight: 500 }}>
                  {currentSong?.requester || 'Auto DJ'}
                </span>
              </div>
            </div>

            {/* VISUALIZER 32-BAR (AUDIO BEAT SYNC) */}
            <div
              className="radio-visualizer-container"
              style={{
                width: '100%',
                maxWidth: isMobile ? '280px' : '100%',
                margin: isMobile ? '0 auto' : undefined
              }}
            >
              {barOffsets.map((v, i) => (
                <div key={i} style={getVisualizerBarStyle(v)} />
              ))}
            </div>

            {/* PLAYBACK CONTROLS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start', width: '100%' }}>
              <button
                className="radio-btn-play"
                onClick={togglePlay}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  height: '44px',
                  padding: '0 24px',
                  width: isMobile ? '100%' : 'auto',
                  maxWidth: isMobile ? '240px' : 'none',
                  margin: isMobile ? '0 auto' : undefined,
                  background: theme === 'apple-glass'
                    ? '#FFFFFF'
                    : theme === 'midnight-oled'
                    ? '#FFFFFF'
                    : 'var(--accent)',
                  color: '#0B0D10',
                  border: 0,
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: theme === 'apple-glass' ? '0 4px 18px rgba(255, 255, 255, 0.35)' : 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {isPlaying ? (
                  isStreamIdle ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="5" y="4" width="4" height="16" rx="1"></rect>
                        <rect x="15" y="4" width="4" height="16" rx="1"></rect>
                      </svg>
                      <span>Jeda (Standby)</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="5" y="4" width="4" height="16" rx="1"></rect>
                        <rect x="15" y="4" width="4" height="16" rx="1"></rect>
                      </svg>
                      <span>Jeda Siaran</span>
                    </>
                  )
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <span>Putar Live Radio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REQUEST FORM */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Request Lagu ke Radio Bot</h3>
        <form onSubmit={handleRequest} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          <input
            ref={searchInputRef}
            placeholder="Ketik judul lagu, artis, atau link..."
            value={songInput}
            onChange={(e) => setSongInput(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: '42px',
              padding: '0 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              fontSize: '13px'
            }}
          />
          <button
            type="submit"
            disabled={submitting || !songInput.trim()}
            style={{
              flexShrink: 0,
              height: '42px',
              padding: '0 16px',
              background: songInput.trim() ? 'var(--accent)' : 'var(--surface-selected)',
              color: songInput.trim() ? '#0B0D10' : 'var(--text-muted)',
              border: 0,
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: songInput.trim() ? 'pointer' : 'not-allowed',
              whiteSpace: 'nowrap'
            }}
          >
            {submitting ? '...' : 'Request'}
          </button>
        </form>
        {feedbackMsg && (
          <div style={{ fontSize: '12px', color: feedbackMsg.isError ? 'var(--danger)' : 'var(--success)', fontFamily: 'var(--font-mono)' }}>
            ✓ {feedbackMsg.text}
          </div>
        )}
      </section>

      {/* 2-COLUMN QUEUE & HISTORY (RESPONSIVE GRID) */}
      <div className="radio-two-col-grid">
        {/* QUEUE */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Antrean Lagu</h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{queue.length} Lagu</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
            {displayQueue.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', width: '18px', flexShrink: 0 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.artist} · <span style={{ color: 'var(--text-dim)' }}>{item.requester}</span>
                    </div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                  {item.duration}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RECENTLY PLAYED */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>Baru Saja Diputar</h3>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Riwayat</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
            {displayHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                  <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.artist}
                    </div>
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', flexShrink: 0, marginLeft: '8px' }}>
                  {item.requester}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
