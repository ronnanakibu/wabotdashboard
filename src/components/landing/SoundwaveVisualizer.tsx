import { useEffect, useRef, useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { useRadio } from '../../context/RadioContext';

export const SoundwaveVisualizer: FC = () => {
  const { currentSong, isPlaying, togglePlay, isLiveConnected, isStreamIdle, getAudioData } = useRadio();
  const [bars, setBars] = useState<number[]>(() => new Array(36).fill(0.15));
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      if (prefersReducedMotion) return;

      if (isPlaying) {
        // Try getting real Web Audio data
        const audioData = getAudioData();
        if (audioData && audioData.length > 0) {
          const step = Math.floor(audioData.length / 36);
          const newBars = [];
          for (let i = 0; i < 36; i++) {
            const val = audioData[i * step] / 255;
            newBars.push(Math.max(0.08, val));
          }
          setBars(newBars);
        } else {
          // Fallback smooth harmonic wave
          const time = Date.now() * 0.005;
          const newBars = [];
          for (let i = 0; i < 36; i++) {
            const wave = Math.sin(time + i * 0.28) * 0.35 + Math.cos(time * 0.7 + i * 0.15) * 0.35 + 0.38;
            newBars.push(Math.max(0.1, Math.min(1, wave)));
          }
          setBars(newBars);
        }
      } else {
        // Gentle breathing idle wave
        const time = Date.now() * 0.002;
        const newBars = [];
        for (let i = 0; i < 36; i++) {
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
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(180deg, rgba(18, 22, 27, 0.95) 0%, rgba(14, 17, 22, 0.98) 100%)',
        border: '1px solid var(--border-strong)',
        padding: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.65)'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                boxShadow: isLiveConnected ? (isStreamIdle ? '0 0 8px var(--warning)' : '0 0 8px var(--success)') : 'none'
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
              {isPlaying ? (isStreamIdle ? 'STREAM STANDBY' : 'LIVE BROADCAST') : (isLiveConnected ? 'NODE READY' : 'RADIO STANDBY')}
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-dim)'
            }}
          >
            ICECAST · 256KBPS AUDIO
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
            transition: 'background-color 0.15s ease'
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
          height: '76px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '3px',
          padding: '8px 0',
          position: 'relative'
        }}
        aria-label="Audio frequency visualizer"
      >
        {bars.map((heightFraction, idx) => {
          const heightPx = Math.max(4, Math.round(heightFraction * 68));
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                minWidth: '2px',
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
        style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          {/* Thumbnail / Disc Icon */}
          <div
            style={{
              width: '42px',
              height: '42px',
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '14px',
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
                fontSize: '12px',
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{currentSong?.artist || '24/7 Lo-Fi & Synth Streams'}</span>
              {currentSong?.requester && (
                <>
                  <span style={{ color: 'var(--text-dim)' }}>•</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)' }}>
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
            transition: 'transform 0.15s ease, background 0.15s ease'
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
