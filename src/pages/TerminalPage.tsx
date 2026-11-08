import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { botApi, type ParsedLogEntry } from '../services/botApi';

export const TerminalPage: FC = () => {
  const [logs, setLogs] = useState<ParsedLogEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('Semua');
  const [isPaused, setIsPaused] = useState(false);
  const [isLiveOnline, setIsLiveOnline] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement | null>(null);

  // Poll real log lines from bot backend
  useEffect(() => {
    let mounted = true;

    async function fetchLogs() {
      if (isPaused) return;
      try {
        const liveLogs = await botApi.getLiveLogs(120);
        if (mounted && liveLogs && liveLogs.length > 0) {
          setLogs(liveLogs);
          setIsLiveOnline(true);
        }
      } catch (e) {
        if (mounted) setIsLiveOnline(false);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isPaused]);

  // Auto scroll when new logs arrive and user is not paused
  useEffect(() => {
    if (!isPaused && consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const countInfo = logs.filter((l) => l.level === 'INFO').length;
  const countWarn = logs.filter((l) => l.level === 'WARN').length;
  const countError = logs.filter((l) => l.level === 'ERROR').length;
  const countRouter = logs.filter((l) => l.level === 'AI-ROUTER').length;

  const fdefs = [
    { label: 'Semua', count: logs.length },
    { label: 'INFO', count: countInfo },
    { label: 'WARN', count: countWarn },
    { label: 'ERROR', count: countError },
    { label: 'AI-ROUTER', count: countRouter }
  ];

  const filteredLogs = logs.filter((l) => {
    if (activeFilter === 'Semua') return true;
    return l.level === activeFilter;
  });

  const stats = [
    { label: 'STATUS ENGINE', val: isLiveOnline ? 'ONLINE' : 'CONNECTING', color: isLiveOnline ? 'var(--success)' : 'var(--warning)' },
    { label: 'BUFFERED ENTRIES', val: `${logs.length} Lines`, color: 'var(--text)' },
    { label: 'STREAM TRANSPORT', val: 'HTTP / LOG TAIL', color: 'var(--accent)' }
  ];

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Terminal & Logs</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time runtime logs dari storage/logs/app.log bot engine.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: isLiveOnline ? 'var(--success)' : 'var(--warning)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLiveOnline ? 'var(--success)' : 'var(--warning)', boxShadow: `0 0 8px ${isLiveOnline ? 'var(--success)' : 'var(--warning)'}` }}></span>
            {isLiveOnline ? 'Backend Streaming' : 'Polling Backend'}
          </span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              background: isPaused ? 'var(--surface-selected)' : 'var(--surface)',
              color: isPaused ? 'var(--warning)' : 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isPaused ? '▶ Lanjutkan Auto-scroll' : '⏸ Jeda Stream'}
          </button>
        </div>
      </header>

      {/* TOP STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {stats.map((s) => (
          <div key={s.label} style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>{s.label}</div>
            <div style={{ marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* FILTER TABS */}
      <div role="group" aria-label="Filter log" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {fdefs.map((f) => {
          const isActive = activeFilter === f.label;
          return (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '36px',
                padding: '0 14px',
                border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
                borderRadius: 'var(--radius-pill)',
                background: isActive ? 'var(--surface-selected)' : 'var(--surface)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {f.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isActive ? 'var(--accent)' : 'var(--text-dim)' }}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TERMINAL CONSOLE */}
      <div
        style={{
          height: '560px',
          overflowY: 'auto',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface)',
          padding: '16px 20px',
          boxSizing: 'border-box',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: 1.7,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', margin: 'auto', textAlign: 'center' }}>
            Menunggu stream log dari backend...
          </div>
        ) : (
          filteredLogs.map((l) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: l.rowBg,
                wordBreak: 'break-all'
              }}
            >
              <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>[{l.time}]</span>
              <span
                style={{
                  color: l.color,
                  fontWeight: 600,
                  flexShrink: 0,
                  width: '74px'
                }}
              >
                {l.level}
              </span>
              <span style={{ color: 'var(--text)', flex: 1 }}>{l.msg}</span>
            </div>
          ))
        )}
        <div ref={consoleBottomRef} />
      </div>
    </div>
  );
};
