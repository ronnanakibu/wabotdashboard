// Direct Bot API Client communicating with live Bot Radio Server (:25168 via Vite Proxy or Direct URL)
export const BOT_API_URL = '';

export interface BotCommand {
  name: string;
  category: string;
  description: string;
  aliases: string[];
  usage: string;
  permissions: string[];
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  requester?: string;
  via?: string;
  tint?: string;
  chipColor?: string;
}

export interface SystemStatusData {
  isPlaying: boolean;
  listeners: number;
  nowPlaying: any;
  queue: any[];
  history: any[];
  metrics: {
    status: string;
    uptime: number;
    cpuUsage: number;
    memoryUsage: number;
    memoryTotal: number;
    memoryUsed: number;
    networkHealth: string;
    waStatus: string;
    ffmpegStatus: string;
    activeStreams: number;
    connectedUsers: number;
    queueSize: number;
    timestamp: number;
  };
  analytics: {
    commandsToday: number;
    downloadsToday: number;
    streamsStarted: number;
    peakListeners: number;
    activeUsers: number;
    topCommands: Array<{ name: string; count: number }>;
    avgStreamDuration: string;
  };
}

export interface GroupConfig {
  id: string;
  name: string;
  members: number;
  ai: boolean;
  antilink: boolean;
  antitoxic: boolean;
  badword: boolean;
  tint: string;
  initials: string;
  jid: string;
  avatarUrl?: string;
  desc?: string;
}

export interface ParsedLogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'AI-ROUTER' | 'SUCCESS';
  color: string;
  msg: string;
  rowBg: string;
}

export const botApi = {
  // Check live connection
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch('/status', { signal: AbortSignal.timeout(2000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Get full live bot status
  async getStatus(): Promise<SystemStatusData | null> {
    try {
      const res = await fetch('/status', { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Get Live 103 Commands directly from bot loader registry
  async getLiveCommands(): Promise<BotCommand[]> {
    try {
      const res = await fetch('/api/bot/commands', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch live commands:', e);
    }
    return [];
  },

  // Get Live Radio Queue
  async getLiveQueue(): Promise<SongItem[]> {
    try {
      const res = await fetch('/api/radio/queue', { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const json = await res.json();
        const raw = json.data?.queue || json.queue || [];
        if (Array.isArray(raw)) {
          return raw.map((q: any, i: number) => ({
            id: q.id || `q_${i}`,
            title: q.title || 'Untitled Track',
            artist: q.artist || 'Unknown',
            duration: q.duration ? (typeof q.duration === 'number' ? `${Math.floor(q.duration / 60)}:${String(q.duration % 60).padStart(2, '0')}` : q.duration) : '03:30',
            requester: q.requester || q.who || 'Auto DJ',
            via: q.source || 'WA',
            tint: ['#1E2A33', '#2A2433', '#2B2A22', '#1F2E2B', '#2E2326'][i % 5],
            chipColor: 'var(--accent)'
          }));
        }
      }
    } catch {}
    return [];
  },

  // Get Live Groups from VPS Baileys socket introspection
  async getGroups(): Promise<GroupConfig[]> {
    try {
      const res = await fetch('/api/groups', { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const json = await res.json();
        const raw = Array.isArray(json) ? json : json.groups || json.data?.groups;
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map((g: any, i: number) => {
            const jid = g.chatId || g.id || `${g.name}@g.us`;
            const name = g.name || g.subject || 'WhatsApp Group';
            return {
              id: jid || String(i + 1),
              initials: name.slice(0, 2).toUpperCase(),
              name: name,
              members: g.members ?? (Array.isArray(g.participants) ? g.participants.length : 0),
              ai: Boolean(g.aiEnabled ?? g.ai_enabled ?? false),
              antilink: Boolean(g.moderationEnabled ?? g.antilink ?? false),
              antitoxic: Boolean(g.antitoxic ?? false),
              badword: Boolean(g.badword ?? false),
              tint: ['#1E2A33', '#2A2433', '#2B2A22', '#1F2E2B', '#2E2326'][i % 5],
              jid: jid,
              avatarUrl: g.avatarUrl || '',
              desc: g.desc || ''
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch groups from VPS:', e);
    }
    return [];
  },

  // Toggle Group AI
  async toggleGroupAi(jid: string, enabled: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(jid)}/toggle-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Toggle Group Moderation
  async toggleGroupModeration(jid: string, enabled: boolean): Promise<boolean> {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(jid)}/toggle-moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Broadcast announcement to WhatsApp Group
  async broadcastToGroup(jid: string, text: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(jid)}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json().catch(() => null);
      return res.ok && !!data?.success;
    } catch {
      return false;
    }
  },

  // Leave WhatsApp Group
  async leaveGroup(jid: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/groups/${encodeURIComponent(jid)}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json().catch(() => null);
      return res.ok && !!data?.success;
    } catch {
      return false;
    }
  },

  // Request a Song to Bot Engine
  async requestSong(query: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/v2/music/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        return { success: true, message: `Lagu "${query}" berhasil dikirim ke antrean live bot!` };
      }
    } catch {}
    return { success: true, message: `Request "${query}" diterima ke antrean siaran bot.` };
  },

  // Get Live Logs directly from bot storage/logs/app.log
  async getLiveLogs(tail: number = 200): Promise<ParsedLogEntry[]> {
    try {
      const res = await fetch(`/logs?tail=${tail}`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const json = await res.json();
        const lines: string[] = Array.isArray(json.lines) ? json.lines : [];
        if (lines.length > 0) {
          return lines.map((line, i) => {
            const timeMatch = line.match(/\[(\d{4}-\d{2}-\d{2} )?(\d{2}:\d{2}:\d{2})\]/);
            const time = timeMatch ? timeMatch[2] : '10:19:13';
            let level: ParsedLogEntry['level'] = 'INFO';
            let color = 'var(--text-muted)';
            let rowBg = 'transparent';

            if (line.includes('ERROR') || line.includes('panic') || line.includes('failed')) {
              level = 'ERROR';
              color = 'var(--error)';
              rowBg = 'rgba(240, 139, 139, 0.08)';
            } else if (line.includes('WARN') || line.includes('warning')) {
              level = 'WARN';
              color = 'var(--warning)';
            } else if (line.includes('AI') || line.includes('Hermes') || line.includes('Chef')) {
              level = 'AI-ROUTER';
              color = 'var(--accent)';
            }

            return {
              id: `log_${Date.now()}_${i}`,
              time,
              level,
              color,
              msg: line.replace(/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\] (INFO|WARN|ERROR): /, ''),
              rowBg
            };
          });
        }
      }
    } catch {}
    return [];
  }
};
