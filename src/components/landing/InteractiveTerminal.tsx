import { useState, useRef, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import { useRadio } from '../../context/RadioContext';

interface LogLine {
  id: string;
  type: 'input' | 'output' | 'system' | 'error';
  text: string;
}

export const InteractiveTerminal: FC = () => {
  const { currentSong, isPlaying } = useRadio();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<LogLine[]>([
    {
      id: 'init_1',
      type: 'system',
      text: 'ronnproject.my.id Mission Control Terminal [v6.3.0]'
    },
    {
      id: 'init_2',
      type: 'system',
      text: 'Connected to gateway node AP-SOUTHEAST-3. Type "help" or click presets below.'
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const newLogs: LogLine[] = [
      ...history,
      { id: `in_${Date.now()}`, type: 'input', text: trimmed }
    ];

    const lower = trimmed.toLowerCase();

    if (lower === 'clear' || lower === 'cls') {
      setHistory([
        {
          id: `sys_${Date.now()}`,
          type: 'system',
          text: 'Terminal cleared. Type "help" for command matrix.'
        }
      ]);
      setInputVal('');
      return;
    }

    if (lower === 'help') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: 'AVAILABLE COMMANDS:' },
        { id: `out_${Date.now()}_2`, type: 'output', text: '  projects  - Menampilkan daftar semua project & subdomain aktif' },
        { id: `out_${Date.now()}_3`, type: 'output', text: '  equest    - Detail platform EnglishQuest (equest.ronnproject.my.id)' },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  wabot     - Status autonomous bot WABOT 2.0 & Multi-Tier AI' },
        { id: `out_${Date.now()}_5`, type: 'output', text: '  radio     - Cek siaran radio live, lagu saat ini, dan status stream' },
        { id: `out_${Date.now()}_6`, type: 'output', text: '  stats     - Telemetri node, latensi API, dan resource footprint' },
        { id: `out_${Date.now()}_7`, type: 'output', text: '  clear     - Bersihkan layar terminal' }
      );
    } else if (lower === 'projects') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: 'ROUTER // SUBDOMAIN DIRECTORY:' },
        { id: `out_${Date.now()}_2`, type: 'output', text: '  [1] equest.ronnproject.my.id -> EnglishQuest Web (Vercel Production)' },
        { id: `out_${Date.now()}_3`, type: 'output', text: '  [2] wabot.ronnproject.my.id  -> WABOT 2.0 Dashboard & Telemetry' },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  [3] ronnproject.my.id/radio  -> 24/7 Lo-Fi & Synthwave Live Audio' },
        { id: `out_${Date.now()}_5`, type: 'output', text: '  [4] ronnproject.my.id/commands -> 48+ WhatsApp Bot Commands Catalog' }
      );
    } else if (lower === 'equest') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: 'PROJECT::EnglishQuest Web' },
        { id: `out_${Date.now()}_2`, type: 'output', text: '  URL: https://equest.ronnproject.my.id' },
        { id: `out_${Date.now()}_3`, type: 'output', text: '  STATUS: Online (Vercel Edge, SSL Active)' },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  DESC: Gamified interactive English quest platform with adaptive challenges' }
      );
    } else if (lower === 'wabot') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: 'ENGINE::WABOT 2.0 (Autonomous)' },
        { id: `out_${Date.now()}_2`, type: 'output', text: '  CORE: Node.js 22 LTS, Baileys Socket Engine' },
        { id: `out_${Date.now()}_3`, type: 'output', text: '  BRAIN: Multi-Tier AI (Tier 0 Regex, Tier 1 Flash, Tier 2 Gemini/MiniMax)' },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  CAPABILITIES: Dynamic Skills, Group Shield, Telemetry, Web Audio Sync' }
      );
    } else if (lower === 'radio') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: `RADIO STREAM::${isPlaying ? 'ON AIR' : 'STANDBY'}` },
        { id: `out_${Date.now()}_2`, type: 'output', text: `  TRACK: ${currentSong?.title || 'Ambient Live Stream'}` },
        { id: `out_${Date.now()}_3`, type: 'output', text: `  ARTIST: ${currentSong?.artist || 'WABOT Radio'}` },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  AUDIO ENGINE: Icecast 256kbps / Web Audio API 64-bar visualizer' }
      );
    } else if (lower === 'stats') {
      newLogs.push(
        { id: `out_${Date.now()}_1`, type: 'output', text: 'SYSTEM TELEMETRY METRICS:' },
        { id: `out_${Date.now()}_2`, type: 'output', text: '  NODE: AP-SOUTHEAST-3 (Jakarta/SG Edge)' },
        { id: `out_${Date.now()}_3`, type: 'output', text: '  UPTIME: 99.98% (Self-healing heartbeat active)' },
        { id: `out_${Date.now()}_4`, type: 'output', text: '  AI INFERENCE LATENCY: ~140ms' },
        { id: `out_${Date.now()}_5`, type: 'output', text: '  DNS RESOLUTION: <15ms via Vercel Edge Anycast' }
      );
    } else {
      newLogs.push({
        id: `err_${Date.now()}`,
        type: 'error',
        text: `Perintah "${trimmed}" tidak dikenali. Ketik "help" untuk melihat daftar perintah.`
      });
    }

    setHistory(newLogs);
    setInputVal('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    runCommand(inputVal);
  };

  return (
    <div
      style={{
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface-inset)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 20px 48px -12px rgba(0, 0, 0, 0.75)',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Terminal Title Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E8909A' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#E0B46A' }} />
            <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#7BC8A0' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            guest@ronnproject:~
            <span className="terminal-title-sub"> (bash / interactive)</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)'
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' }}>
            READY
          </span>
        </div>
      </div>

      {/* Preset Command Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.015)',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', flexShrink: 0 }}>
          Quick:
        </span>
        {['help', 'projects', 'equest', 'wabot', 'radio', 'stats', 'clear'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => runCommand(cmd)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'var(--surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'color 0.15s ease, border-color 0.15s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-strong)';
            }}
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Output Area */}
      <div
        style={{
          height: '210px',
          overflowY: 'auto',
          padding: '14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          wordBreak: 'break-word'
        }}
      >
        {history.map((item) => {
          if (item.type === 'input') {
            return (
              <div key={item.id} style={{ display: 'flex', gap: '8px', color: 'var(--text)', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent)', userSelect: 'none', flexShrink: 0 }}>guest@ronnproject:~$</span>
                <span>{item.text}</span>
              </div>
            );
          }
          if (item.type === 'system') {
            return (
              <div key={item.id} style={{ color: 'var(--text-dim)' }}>
                {item.text}
              </div>
            );
          }
          if (item.type === 'error') {
            return (
              <div key={item.id} style={{ color: 'var(--error)' }}>
                [ERR] {item.text}
              </div>
            );
          }
          return (
            <div key={item.id} style={{ color: 'var(--text-log)' }}>
              {item.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          gap: '6px'
        }}
      >
        <span
          className="terminal-prompt-full"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', flexShrink: 0 }}
        >
          guest@ronnproject:~$
        </span>
        <span
          className="terminal-prompt-short"
          style={{ display: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', flexShrink: 0 }}
        >
          ~$
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ketik perintah (help, projects)..."
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text)'
          }}
        />
        <button
          type="submit"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--surface-selected)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          Enter ↵
        </button>
      </form>
    </div>
  );
};
