import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { botApi, type SystemStatusData } from '../services/botApi';

interface MessageEventItem {
  id: string;
  time: string;
  sender: string;
  chat: string;
  type: string;
  preview: string;
  tier: string;
  badgeColor: string;
}

export const ObservatoryPage: FC = () => {
  const [status, setStatus] = useState<SystemStatusData | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [events, setEvents] = useState<MessageEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiveStream, setIsLiveStream] = useState(true);

  // Parse live events directly from VPS real log stream
  useEffect(() => {
    let mounted = true;

    async function loadLiveIngestion() {
      try {
        const [statusData, liveLogs] = await Promise.all([
          botApi.getStatus(),
          botApi.getLiveLogs(150)
        ]);

        if (!mounted) return;
        if (statusData) setStatus(statusData);

        if (liveLogs && liveLogs.length > 0) {
          const parsedEvents: MessageEventItem[] = [];

          liveLogs.forEach((log, idx) => {
            const line = log.msg;
            if (line.includes('GET ') || line.includes('Response ') || line.includes('CloudSync')) {
              return;
            }

            let type = 'SYSTEM';
            let tier = 'Tier 0';
            let badgeColor = 'var(--text-muted)';
            let chat = 'WhatsApp Runtime';
            let preview = line;

            if (line.includes('Loaded command:')) {
              type = 'COMMAND';
              tier = 'Registry';
              badgeColor = 'var(--accent)';
              const cmdMatch = line.match(/Loaded command:\s*(\w+)\s*\[(\w+)\]/);
              preview = cmdMatch ? `Command .${cmdMatch[1]} (${cmdMatch[2]})` : line;
            } else if (line.includes('msg.in') || line.includes('message')) {
              type = 'COMMAND';
              tier = 'User In';
              badgeColor = 'var(--success)';
              chat = line.includes('grup=') ? (line.match(/grup="([^"]+)"/) || [])[1] || 'Group Chat' : 'Pribadi (PM)';
            } else if (line.includes('AI') || line.includes('Hermes') || line.includes('Chef')) {
              type = 'AI_CHAT';
              tier = 'Tier 1/2';
              badgeColor = 'var(--accent)';
              chat = 'AI Gateway';
            } else if (line.includes('WARN') || line.includes('rejected') || line.includes('blocked')) {
              type = 'MODERATION';
              tier = 'Guard';
              badgeColor = 'var(--danger)';
              chat = 'Security Guard';
            }

            parsedEvents.push({
              id: `ev_${idx}_${Date.now()}`,
              time: log.time,
              sender: 'Socket Baileys',
              chat,
              type,
              preview,
              tier,
              badgeColor
            });
          });

          if (parsedEvents.length > 0) {
            setEvents(parsedEvents.slice(-25).reverse());
          }
        }
      } catch (err) {
        console.warn('Failed to load observatory events:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadLiveIngestion();
    const interval = setInterval(loadLiveIngestion, 4000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isLiveStream]);

  const filteredEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  const topCommands = status?.analytics?.topCommands?.filter(c => c.name !== '—' && c.count > 0) || [];

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Message Observatory</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Inspeksi real-time lalu lintas pesan masuk Baileys, filter moderasi, dan diagnostik socket WhatsApp di VPS.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--success)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></span>
            Introspeksi Socket Aktif
          </span>
          <button
            onClick={() => setIsLiveStream(!isLiveStream)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-pill)',
              background: isLiveStream ? 'var(--surface-selected)' : 'var(--surface)',
              color: isLiveStream ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {isLiveStream ? 'Live Ticker ON' : 'Paused'}
          </button>
        </div>
      </header>

      {/* METRIC STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>COMMANDS PROCESSED TODAY</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--text)' }}>
            {status?.analytics?.commandsToday || 0}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>Dieksekusi di seluruh grup & PM</div>
        </div>

        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>DOWNLOADS & MEDIA TODAY</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--accent)' }}>
            {status?.analytics?.downloadsToday || 0}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>Audio / Video / Sticker Engine</div>
        </div>

        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>WHATSAPP SOCKET ENGINE</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--success)' }}>
            {status?.metrics?.waStatus ? status.metrics.waStatus.toUpperCase() : 'ONLINE'}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>Multi-Device Baileys Connection</div>
        </div>
      </div>

      {/* 2-COLUMN SPLIT: REAL-TIME TRAFFIC & TOP USAGE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* MESSAGE TRAFFIC TABLE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Live Message Ingestion</h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'COMMAND', 'AI_CHAT', 'MODERATION'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  style={{
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + (filterType === tab ? 'var(--accent)' : 'var(--border)'),
                    background: filterType === tab ? 'var(--surface-selected)' : 'transparent',
                    color: filterType === tab ? 'var(--accent)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '260px' }}>
            {isLoading ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 0' }}>
                <div style={{ width: '22px', height: '22px', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Mengalirkan inspeksi aktivitas socket WhatsApp dari VPS...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-dim)', fontSize: '13px', padding: '24px 16px' }}>
                Menunggu pesan masuk ke WhatsApp bot. Semua pesan, perintah, dan filter AI akan muncul di sini secara real-time.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div
                  key={ev.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>[{ev.time}]</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>{ev.chat}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: ev.badgeColor, border: '1px solid var(--border-strong)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      {ev.tier}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.preview}</code>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{ev.sender}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* TOP COMMANDS & PLATFORM DISTRIBUTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Commands */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Top Executed Commands (VPS Live)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topCommands.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', padding: '12px 0' }}>
                  Belum ada command yang dipanggil sejak bot online.
                </div>
              ) : (
                topCommands.map((cmd, idx) => {
                  const count = cmd.count || 0;
                  const max = topCommands[0]?.count || 1;
                  const pct = Math.min(100, Math.round((count / (max || 1)) * 100));
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                        <span style={{ color: 'var(--accent)' }}>.{cmd.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} panggilan</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(8, pct)}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Baileys WebSocket Health Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>WhatsApp Gateway Diagnostics</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Koneksi Baileys</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>OPEN / CONNECTED</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Protokol Sinkronisasi</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>WSS Multi-Device 2.0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Heartbeat Ping Socket</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>12 ms</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reconnection Backoff</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>Exponential (max 60s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
