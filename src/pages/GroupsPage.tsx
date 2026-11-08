import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { botApi, type GroupConfig } from '../services/botApi';

export const GroupsPage: FC = () => {
  const [groups, setGroups] = useState<GroupConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastStatus, setBroadcastStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveFeedback, setLeaveFeedback] = useState<string | null>(null);

  const fetchLiveGroups = async () => {
    setIsLoading(true);
    try {
      const liveGroups = await botApi.getGroups();
      if (liveGroups && liveGroups.length > 0) {
        setGroups(liveGroups);
        setSelectedId((prev) => (prev && liveGroups.some(g => g.id === prev) ? prev : liveGroups[0].id));
      } else {
        setGroups([]);
      }
    } catch (e) {
      console.warn('Failed to load live groups:', e);
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGroups();
  }, []);

  const selectedGroup = groups.find((g) => g.id === selectedId) || groups[0];

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.jid.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGroupFeature = async (feature: 'ai' | 'antilink' | 'antitoxic' | 'badword') => {
    if (!selectedGroup) return;
    const nextVal = !selectedGroup[feature];

    // Optimistic UI update
    setGroups((prev) =>
      prev.map((g) => (g.id === selectedId ? { ...g, [feature]: nextVal } : g))
    );

    if (feature === 'ai') {
      await botApi.toggleGroupAi(selectedGroup.jid, nextVal);
    } else if (feature === 'antilink') {
      await botApi.toggleGroupModeration(selectedGroup.jid, nextVal);
    }
  };

  const getModCount = (g: GroupConfig) => {
    let count = 0;
    if (g.antilink) count++;
    if (g.antitoxic) count++;
    if (g.badword) count++;
    return `MOD ${count}/3`;
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim() || !selectedGroup) return;
    setBroadcastStatus('SENDING');
    const ok = await botApi.broadcastToGroup(selectedGroup.jid, broadcastText.trim());
    if (ok) {
      setBroadcastStatus('SUCCESS');
      setTimeout(() => {
        setBroadcastStatus('IDLE');
        setBroadcastText('');
      }, 3000);
    } else {
      setBroadcastStatus('ERROR');
      setTimeout(() => setBroadcastStatus('IDLE'), 3500);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    const confirmed = window.confirm(`Apakah Anda yakin ingin mengeluarkan bot dari grup "${selectedGroup.name}"?`);
    if (!confirmed) return;

    setIsLeaving(true);
    setLeaveFeedback(null);
    const ok = await botApi.leaveGroup(selectedGroup.jid);
    setIsLeaving(false);

    if (ok) {
      setLeaveFeedback(`✓ Bot berhasil keluar dari grup ${selectedGroup.name}`);
      const remaining = groups.filter((g) => g.id !== selectedGroup.id);
      setGroups(remaining);
      if (remaining.length > 0) {
        setSelectedId(remaining[0].id);
      }
      setTimeout(() => setLeaveFeedback(null), 4000);
    } else {
      alert(`Gagal mengeluarkan bot dari grup. Pastikan VPS bot sudah di-pull ke commit terbaru dan socket WhatsApp online.`);
    }
  };

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Groups Management</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Inspeksi realtime grup WhatsApp bot, avatar profil, moderasi, pengumuman siaran, dan kontrol keanggotaan.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchLiveGroups}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 14px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--surface)',
              color: 'var(--accent)',
              fontSize: '12px',
              cursor: isLoading ? 'wait' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Memuat Socket...' : '↻ Muat Ulang Grup'}
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2"></rect>
              <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
            </svg>
            Owner Mission Control
          </span>
        </div>
      </header>

      {/* FEEDBACK BANNER */}
      {leaveFeedback && (
        <div style={{ padding: '12px 16px', background: 'var(--surface-selected)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }}>
          {leaveFeedback}
        </div>
      )}

      {/* LOADING STATE - ZERO DUMMY DATA */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)', fontWeight: 500 }}>
            Mengambil Data Grup & Foto Profil dari Socket Baileys di VPS...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', maxWidth: '420px', lineHeight: 1.5 }}>
            Menghubungi endpoint VPS <code style={{ color: 'var(--text)' }}>/api/groups</code> untuk memverifikasi keanggotaan aktif dan mengunduh URL profil WhatsApp.
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>Tidak Ada Grup WhatsApp Aktif</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
            Akun WhatsApp bot di VPS belum terdaftar di grup mana pun atau socket Baileys sedang re-authenticating.
          </div>
          <button
            onClick={fetchLiveGroups}
            style={{ marginTop: '8px', padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px' }}
          >
            Coba Sinkronisasi Ulang
          </button>
        </div>
      ) : (
        /* 2-COLUMN SPLIT: LIST & DETAIL */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* GROUP LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                placeholder="Cari grup aktif berdasarkan nama atau ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  height: '42px',
                  padding: '0 14px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  fontSize: '13px'
                }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                {filteredGroups.length} Grup
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredGroups.map((g) => {
                const isSel = g.id === selectedId;
                return (
                  <div
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid ' + (isSel ? 'var(--accent)' : 'var(--border)'),
                      background: isSel ? 'var(--surface-selected)' : 'var(--surface)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      {g.avatarUrl ? (
                        <img
                          src={g.avatarUrl}
                          alt={g.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-strong)', flexShrink: 0 }}
                        />
                      ) : null}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: g.tint,
                          display: g.avatarUrl ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '13px',
                          color: '#fff',
                          flexShrink: 0
                        }}
                      >
                        {g.initials}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {g.members} Anggota
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {getModCount(g)}
                      </span>
                      {g.ai && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--success)', border: '1px solid var(--success-border)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                          AI
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GROUP DETAIL & MODERATION */}
          {selectedGroup && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {selectedGroup.avatarUrl ? (
                    <img
                      src={selectedGroup.avatarUrl}
                      alt={selectedGroup.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-strong)', flexShrink: 0 }}
                    />
                  ) : null}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: selectedGroup.tint,
                      display: selectedGroup.avatarUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#fff',
                      flexShrink: 0
                    }}
                  >
                    {selectedGroup.initials}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedGroup.name}
                    </h2>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {selectedGroup.jid} · {selectedGroup.members} Anggota
                    </div>
                  </div>
                </div>

                {selectedGroup.desc && (
                  <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: '72px', overflowY: 'auto' }}>
                    {selectedGroup.desc}
                  </div>
                )}
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: 0 }} />

              {/* TOGGLES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>MODERASI & FITUR OTOMATIS</div>

                {[
                  { key: 'ai' as const, label: 'Respon Otomatis AI', desc: 'Izinkan bot menjawab pesan dengan multi-tier AI router' },
                  { key: 'antilink' as const, label: 'Anti-Link Otomatis', desc: 'Hapus pesan link mencurigakan dan beri peringatan pengguna' },
                  { key: 'badword' as const, label: 'Filter Kata Kasar (Badword)', desc: 'Sensor kata terlarang sesuai kamus blacklist' },
                  { key: 'antitoxic' as const, label: 'Anti-Toxic AI Scan', desc: 'Deteksi ujaran kebencian secara kontekstual' }
                ].map((item) => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                    <button
                      onClick={() => toggleGroupFeature(item.key)}
                      style={{
                        height: '26px',
                        padding: '0 12px',
                        borderRadius: 'var(--radius-pill)',
                        border: 0,
                        background: selectedGroup[item.key] ? 'var(--accent)' : 'var(--surface)',
                        color: selectedGroup[item.key] ? '#0B0D10' : 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {selectedGroup[item.key] ? 'AKTIF' : 'NONAKTIF'}
                    </button>
                  </div>
                ))}
              </div>

              {/* BROADCAST TO GROUP */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.04em' }}>KIRIM PENGUMUMAN RESMI (BROADCAST KE ANGGOTA)</div>
                <textarea
                  rows={3}
                  placeholder={`Tulis pesan pengumuman resmi ke seluruh anggota grup ${selectedGroup.name}...`}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  style={{
                    padding: '12px',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    resize: 'none'
                  }}
                />
                <button
                  onClick={handleSendBroadcast}
                  disabled={!broadcastText.trim() || broadcastStatus === 'SENDING'}
                  style={{
                    height: '38px',
                    border: 0,
                    borderRadius: 'var(--radius-md)',
                    background: broadcastStatus === 'SUCCESS' ? 'var(--success)' : broadcastStatus === 'ERROR' ? 'var(--danger)' : 'var(--accent)',
                    color: '#0B0D10',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: broadcastText.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  {broadcastStatus === 'SENDING' ? 'Mengirim ke Baileys...' : broadcastStatus === 'SUCCESS' ? '✓ Pengumuman Berhasil Terkirim ke WhatsApp!' : broadcastStatus === 'ERROR' ? 'Gagal Mengirim Pengumuman' : 'Kirim Pengumuman ke Grup'}
                </button>
              </div>

              {/* DANGER: LEAVE GROUP */}
              <div style={{ marginTop: 'auto', padding: '16px', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--danger)' }}>Keluarkan Bot dari Grup Ini</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Bot akan pamit dan keluar dari keanggotaan WhatsApp Baileys.
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveGroup}
                    disabled={isLeaving}
                    style={{
                      height: '34px',
                      padding: '0 16px',
                      borderRadius: 'var(--radius-sm)',
                      border: 0,
                      background: 'var(--danger)',
                      color: '#fff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: isLeaving ? 'wait' : 'pointer'
                    }}
                  >
                    {isLeaving ? 'Mengeluarkan...' : 'Keluar dari Grup'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
