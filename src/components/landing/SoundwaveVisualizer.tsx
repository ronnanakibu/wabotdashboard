import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useRadio } from '../../context/RadioContext';

export const SoundwaveVisualizer: FC = () => {
  const { currentSong, isPlaying, togglePlay, isLiveConnected, isStreamIdle, getAudioData } = useRadio();
  const [bars, setBars] = useState<number[]>(() => new Array(32).fill(0.15));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      if (prefersReducedMotion) return;

      if (isPlaying) {
        const audioData = getAudioData();
        if (audioData && audioData.length > 0) {
          const step = Math.floor(audioData.length / 32);
          const newBars = [];
          for (let i = 0; i < 32; i++) {
            const val = audioData[i * step] / 255;
            newBars.push(Math.max(0.08, val));
          }
          setBars(newBars);
        } else {
          const time = Date.now() * 0.005;
          const newBars = [];
          for (let i = 0; i < 32; i++) {
            const wave = Math.sin(time + i * 0.28) * 0.35 + Math.cos(time * 0.7 + i * 0.15) * 0.35 + 0.38;
            newBars.push(Math.max(0.1, Math.min(1, wave)));
          }
          setBars(newBars);
        }
      } else {
        const time = Date.now() * 0.002;
        const newBars = [];
        for (let i = 0; i < 32; i++) {
          const wave = Math.sin(time + i * 0.18) * 0.12 + 0.18;
          newBars.push(Math.max(0.06, wave));
        }
        setBars(newBars);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, getAudioData]);

  return (
    <div
      className="soundwave-card"
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(180deg, rgba(18, 22, 27, 0.95) 0%, rgba(14, 17, 22, 0.98) 100%)',
        border: '1px solid var(--border-strong)',
        padding: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.65)',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              background: isPlaying ? 'rgba(127, 209, 199, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${isPlaying ? 'var(--accent)' : 'var(--border)'}`
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isLiveConnected ? (isStreamIdle ? 'var(--warning)' : 'var(--success)') : 'var(--text-dim)',
                boxShadow: isLiveConnected ? (isStreamIdle ? '0 0 8px var(--warning)' : '0 0 8px var(--success)') : 'none',
                flexShrink: 0
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: isPlaying ? 'var(--accent)' : 'var(--text-muted)'
              }}
            >
              {isPlaying ? (isStreamIdle ? 'STANDBY' : 'LIVE ON AIR') : (isLiveConnected ? 'READY' : 'STANDBY')}
            </span>
          </div>

          <span
            className="soundwave-header-tag"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-dim)'
            }}
          >
            ICECAST · 256KBPS
          </span>
        </div>

        <Link
          to="/radio"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--accent)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(127, 209, 199, 0.25)',
            background: 'rgba(127, 209, 199, 0.05)',
            transition: 'background-color 0.15s ease',
            flexShrink: 0
          }}
        >
          <span>Buka Booth Radio</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </Link>
      </div>

      {/* Visualizer Frequency Bars Display */}
      <div
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '2px',
          padding: '6px 0',
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box'
        }}
        aria-label="Audio frequency visualizer"
      >
        {bars.map((heightFraction, idx) => {
          const heightPx = Math.max(4, Math.round(heightFraction * 62));
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                minWidth: '1.5px',
                height: `${heightPx}px`,
                backgroundColor: isPlaying ? 'var(--accent)' : 'var(--border-strong)',
                opacity: isPlaying ? 0.35 + heightFraction * 0.65 : 0.4,
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.06s ease, background-color 0.2s ease, opacity 0.2s ease'
              }}
            />
          );
        })}
      </div>

      {/* Current Song Details & Interactive Play Bar */}
      <div
        className="soundwave-controls"
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, width: '100%' }}>
          {/* Thumbnail / Disc Icon */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--surface-inset)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentSong?.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentSong?.title || 'ronn.ai Ambient Radio Station'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentSong?.artist || '24/7 Lo-Fi & Synth Streams'}
              </span>
              {currentSong?.requester && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>•</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent)', flexShrink: 0 }}>
                    Req: {currentSong.requester}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Play / Pause Action Button */}
        <button
          onClick={togglePlay}
          className="soundwave-play-btn"
          aria-label={isPlaying ? 'Jeda siaran radio' : 'Putar siaran radio'}
          style={{
            height: '42px',
            padding: '0 18px',
            borderRadius: 'var(--radius-md)',
            background: isPlaying ? 'var(--surface-selected)' : 'var(--accent)',
            color: isPlaying ? 'var(--text)' : '#0B0D10',
            border: isPlaying ? '1px solid var(--border-strong)' : '1px solid transparent',
            fontWeight: 600,
            fontSize: '13px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, background 0.15s ease',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isPlaying ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              <span>Jeda Musik</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Dengarkan Siaran</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
