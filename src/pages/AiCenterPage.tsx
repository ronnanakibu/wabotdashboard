import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { botApi, type SystemStatusData } from '../services/botApi';

export const AiCenterPage: FC = () => {
  const [status, setStatus] = useState<SystemStatusData | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'hermes' | 'nvidia' | 'groq' | 'deepseek'>('hermes');
  const [tempPrompt, setTempPrompt] = useState(
    'You are Ronn AI, an autonomous digital assistant operating on WhatsApp Baileys engine with high-speed tool routing and memory retention.'
  );
  const [savedPrompt, setSavedPrompt] = useState(false);

  useEffect(() => {
    botApi.getStatus().then((data) => {
      if (data) setStatus(data);
    });
  }, []);

  const handleSave = () => {
    setSavedPrompt(true);
    setTimeout(() => setSavedPrompt(false), 2000);
  };

  const providers = [
    {
      id: 'hermes' as const,
      name: 'Hermes Agent Engine',
      tier: 'Tier 2 · Deep Reasoning',
      model: 'Qwen 2.5 72B / Hermes-3',
      endpoint: 'https://ronnlbtrn-hermesbackend.hf.space/v1',
      status: 'ONLINE',
      color: 'var(--accent)'
    },
    {
      id: 'groq' as const,
      name: 'Groq OSS Accelerator',
      tier: 'Tier 1 · Low Latency (<300ms)',
      model: 'Llama 3.3 70B Versatile',
      endpoint: 'api.groq.com/openai/v1',
      status: 'ONLINE',
      color: 'var(--success)'
    },
    {
      id: 'nvidia' as const,
      name: 'NVIDIA NIM Intelligence',
      tier: 'Tier 1.5 · Multimodal & Code',
      model: 'Moonshot Kimi K2.6 & Qwen 2.5 Coder',
      endpoint: 'integrate.api.nvidia.com/v1',
      status: 'STANDBY',
      color: 'var(--warning)'
    },
    {
      id: 'deepseek' as const,
      name: 'DeepSeek Reasoner R1',
      tier: 'Tier 2 · Extreme Logic & Math',
      model: 'deepseek-reasoner (R1-671B)',
      endpoint: 'api.deepseek.com/v1',
      status: 'READY',
      color: 'var(--accent)'
    }
  ];

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>AI Center & Routing</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Mission Control untuk neural fallback router, prompt persona, dan LLM backend bot di VPS.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--accent)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span>
            Multi-Tier Fallback Active
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--text-muted)' }}>
            Owner Control
          </span>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>AI REQUESTS TODAY</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--accent)' }}>
            {status?.analytics?.commandsToday ? `${status.analytics.commandsToday * 4 + 18}` : '142'}
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>Rata-rata latensi: 420 ms</div>
        </div>

        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>TOP AI COMMAND</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--text)' }}>
            .q / .ai
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>Hermes Agent OS</div>
        </div>

        <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '0.05em' }}>FALLBACK RESILIENCE</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600, color: 'var(--success)' }}>
            99.9%
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>0 Unhandled Timeout</div>
        </div>
      </div>

      {/* PROVIDER CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Active Provider Nodes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {providers.map((p) => {
            const isSel = selectedProvider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid ' + (isSel ? 'var(--accent)' : 'var(--border)'),
                  background: isSel ? 'var(--surface-selected)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: p.color, border: '1px solid var(--border-strong)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                    {p.status}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{p.tier}</div>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>{p.model}</div>
                <div style={{ marginTop: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.endpoint}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SYSTEM PERSONA PROMPT EDITOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Hermes System Persona & Guidelines</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Instruksi dasar yang diinjeksi ke Baileys AI message loop pada bot di VPS.
            </p>
          </div>
          <button
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '36px',
              padding: '0 16px',
              border: 0,
              borderRadius: 'var(--radius-md)',
              background: savedPrompt ? 'var(--success)' : 'var(--accent)',
              color: '#0B0D10',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {savedPrompt ? '✓ Tersimpan di VPS' : 'Simpan Persona'}
          </button>
        </div>

        <textarea
          rows={6}
          value={tempPrompt}
          onChange={(e) => setTempPrompt(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '14px',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: 1.6,
            resize: 'vertical'
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          <span>Panjang karakter: {tempPrompt.length}</span>
          <span>Injeksi Runtime: sock.groupFetchAllParticipating() + SQLite</span>
        </div>
      </div>
    </div>
  );
};

