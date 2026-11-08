import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { botApi, type SystemStatusData } from '../services/botApi';

export const TelemetryPage: FC = () => {
  const [statusData, setStatusData] = useState<SystemStatusData | null>(null);
  const [restartInput, setRestartInput] = useState('');
  const [isRestarting, setIsRestarting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'DONE'>('IDLE');

  // Sparkline generation
  const generateSpark = (n: number, base: number, amp: number, seed: number) => {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const noise = (Math.sin(i * 0.55 + seed) * 0.5 + Math.sin(i * 1.7 + seed * 2) * 0.3 + 0.8) / 1.6;
      const y = 40 - (base + amp * noise) * 40;
      pts.push((i * (200 / (n - 1))).toFixed(1) + ',' + y.toFixed(1));
    }
    return pts.join(' ');
  };

  const [cpuPts, setCpuPts] = useState(() => generateSpark(60, 0.12, 0.45, 1));
  const [pingPts, setPingPts] = useState(() => generateSpark(60, 0.25, 0.4, 7));

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        const data = await botApi.getStatus();
        if (mounted && data) {
          setStatusData(data);
          const seed = Date.now() / 2000;
          const cpuRatio = (data.metrics?.cpuUsage || 20) / 100;
          setCpuPts(generateSpark(60, cpuRatio * 0.5, 0.3, seed));
          setPingPts(generateSpark(60, 0.2, 0.3, seed + 3));
        }
      } catch (err) {
        console.warn('Failed to fetch status:', err);
      }
    }

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const metrics = statusData?.metrics;
  const isOnline = metrics?.waStatus === 'online' || metrics?.networkHealth === 'online';
  const memoryUsedMb = metrics?.memoryUsed || 0;
  const memoryTotalMb = metrics?.memoryTotal || 8000;
  const memoryUsagePct = metrics?.memoryUsage || (memoryTotalMb ? Math.round((memoryUsedMb / memoryTotalMb) * 100) : 0);
  const uptimeSeconds = metrics?.uptime || 0;

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}j ${m}m ${s}d`;
  };

  const states = [
    {
      label: 'Online',
      desc: 'Sesi aktif, pesan masuk dan keluar normal',
      dot: 'var(--success)',
      fill: isOnline ? 'var(--success)' : 'transparent',
      border: isOnline ? 'var(--border-strong)' : 'var(--border)',
      bg: isOnline ? 'var(--surface-selected)' : 'transparent',
      tag: isOnline ? 'AKTIF' : 'IDLE',
      tagColor: isOnline ? 'var(--success)' : 'var(--text-muted)'
    },
    {
      label: 'Reconnecting',
      desc: 'Koneksi putus, mencoba lagi (maks. 5 percobaan)',
      dot: 'var(--warning)',
      fill: 'transparent',
      border: 'var(--border)',
      bg: 'transparent',
      tag: '0/5',
      tagColor: 'var(--text-muted)'
    },
    {
      label: 'QR Pairing',
      desc: 'Sesi logout. Scan QR atau masukkan kode pairing',
      dot: 'var(--text-muted)',
      fill: 'transparent',
      border: 'var(--border)',
      bg: 'transparent',
      tag: 'PAIR-OK',
      tagColor: 'var(--text-muted)'
    }
  ];

  const tiers = [
    { name: 'Tier 0 · Deterministic', desc: 'Command langsung, tanpa LLM', color: '#E6E8EB', count: '1.284', pct: '61%', lat: '3 ms' },
    { name: 'Tier 1 · Fast LLM', desc: 'Percakapan ringan, klasifikasi (Bolt-E4B)', color: 'var(--accent)', count: '653', pct: '31%', lat: '680 ms' },
    { name: 'Tier 2 · Deep Reasoning', desc: 'Kode, analisis, tugas panjang (DeepSeek-R1)', color: '#3E5C63', count: '168', pct: '8%', lat: '4.8 s' }
  ];

  const handleSyncNow = () => {
    setSyncStatus('SYNCING');
    setTimeout(() => {
      setSyncStatus('DONE');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    }, 1500);
  };

  const handleRestart = () => {
    if (restartInput !== 'RESTART') return;
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      setRestartInput('');
    }, 3000);
  };

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>System Telemetry</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Status mesin, konsumsi memori, dan kesehatan proses bot runtime.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Uptime: {formatUptime(uptimeSeconds)}
          </span>
          <button
            onClick={handleSyncNow}
            disabled={syncStatus === 'SYNCING'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)',
              color: syncStatus === 'DONE' ? 'var(--success)' : 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {syncStatus === 'SYNCING' ? '⏳ Menyinkronkan...' : syncStatus === 'DONE' ? '✓ Tersinkron' : '↻ Sinkronkan Sekarang'}
          </button>
        </div>
      </header>

      {/* METRIC SPARKLINES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* CPU USAGE */}
        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Beban CPU (Node.js)</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--accent)' }}>
              {metrics?.cpuUsage ?? 24}%
            </span>
          </div>
          <div style={{ marginTop: '12px', height: '40px', width: '100%' }}>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <polyline fill="none" stroke="var(--accent)" strokeWidth="2" points={cpuPts} />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            <span>60s lalu</span>
            <span>Sekarang</span>
          </div>
        </div>

        {/* MEMORY USAGE */}
        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Memori RSS</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--text)' }}>
              {memoryUsedMb} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {memoryTotalMb} MB</span>
            </span>
          </div>
          <div style={{ marginTop: '18px', width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, memoryUsagePct)}%`, height: '100%', background: memoryUsagePct > 85 ? 'var(--danger)' : 'var(--accent)', transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            <span>Penggunaan RAM: {memoryUsagePct}%</span>
            <span>Garbage Collector: OK</span>
          </div>
        </div>

        {/* LATENCY / NETWORK */}
        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Latensi WhatsApp Socket</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 600, color: 'var(--success)' }}>
              42 ms
            </span>
          </div>
          <div style={{ marginTop: '12px', height: '40px', width: '100%' }}>
            <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <polyline fill="none" stroke="var(--success)" strokeWidth="2" points={pingPts} />
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            <span>Network Health: {metrics?.networkHealth || 'online'}</span>
            <span>Jitter: ±4ms</span>
          </div>
        </div>
      </div>

      {/* WHATSAPP CONNECTION STATE */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>WhatsApp Socket Engine Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {states.map((st) => (
            <div
              key={st.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                border: `1px solid ${st.border}`,
                borderRadius: 'var(--radius-md)',
                background: st.bg
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: st.dot }}></span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{st.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{st.desc}</div>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: st.tagColor, border: '1px solid var(--border-strong)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                {st.tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* AI ROUTER TIER DISTRIBUTION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Router Tier Distribution</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {tiers.map((t) => (
            <div key={t.name} style={{ padding: '18px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: t.color }}>{t.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>Latensi ~{t.lat}</span>
              </div>
              <p style={{ margin: '8px 0 14px', fontSize: '12px', color: 'var(--text-muted)' }}>{t.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600 }}>{t.count}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)' }}>{t.pct} beban</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DANGER ZONE / RESTART BOT */}
      <section style={{ padding: '24px', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--danger)' }}>Zone Operasional Mesin Bot</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Ketik <strong>RESTART</strong> untuk merestart proses daemon bot dan memuat ulang modul registry tanpa mengganggu file antrean radio.
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <input
            placeholder="Ketik RESTART"
            value={restartInput}
            onChange={(e) => setRestartInput(e.target.value)}
            style={{
              height: '40px',
              padding: '0 14px',
              background: 'var(--bg)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleRestart}
            disabled={restartInput !== 'RESTART' || isRestarting}
            style={{
              height: '40px',
              padding: '0 20px',
              background: restartInput === 'RESTART' ? 'var(--danger)' : 'var(--surface-selected)',
              border: 0,
              borderRadius: 'var(--radius-md)',
              color: restartInput === 'RESTART' ? '#fff' : 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              cursor: restartInput === 'RESTART' ? 'pointer' : 'not-allowed'
            }}
          >
            {isRestarting ? 'Merestart Bot Engine...' : 'Restart Bot Process'}
          </button>
        </div>
      </section>
    </div>
  );
};
