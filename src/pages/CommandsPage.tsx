import { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { botApi, type BotCommand } from '../services/botApi';

interface DisplayCommand {
  name: string;
  aliases: string[];
  desc: string;
  usage: string;
  access: 'Public' | 'Admin Grup' | 'Master Owner';
  badgeColor: string;
  badgeBorder: string;
  category: 'Semua' | 'Radio & Media' | 'AI & Pintar' | 'Grup & Admin' | 'Alat & Utilitas' | 'Owner';
}

function mapCategory(rawCat: string): DisplayCommand['category'] {
  const cat = (rawCat || '').toLowerCase();
  if (['audio', 'media', 'downloader', 'entertainment'].includes(cat)) return 'Radio & Media';
  if (['ai', 'intelligent'].includes(cat)) return 'AI & Pintar';
  if (['group', 'grup', 'admin'].includes(cat)) return 'Grup & Admin';
  if (['owner', 'master', 'system'].includes(cat)) return 'Owner';
  return 'Alat & Utilitas';
}

function mapAccess(permissions: string[] = []): { access: DisplayCommand['access']; badgeColor: string; badgeBorder: string } {
  if (permissions.includes('owner')) {
    return { access: 'Master Owner', badgeColor: 'var(--danger)', badgeBorder: 'var(--danger-border)' };
  }
  if (permissions.includes('admin')) {
    return { access: 'Admin Grup', badgeColor: 'var(--warning)', badgeBorder: 'var(--warning-border)' };
  }
  return { access: 'Public', badgeColor: 'var(--success)', badgeBorder: 'var(--success-border)' };
}

export const CommandsPage: FC = () => {
  const [commands, setCommands] = useState<DisplayCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadLiveCommands() {
      try {
        const live = await botApi.getLiveCommands();
        if (mounted && live && live.length > 0) {
          const mapped: DisplayCommand[] = live.map((c: BotCommand) => {
            const { access, badgeColor, badgeBorder } = mapAccess(c.permissions);
            return {
              name: c.name.startsWith('.') ? c.name : `.${c.name}`,
              aliases: (c.aliases || []).map((a) => (a.startsWith('.') ? a : `.${a}`)),
              desc: c.description || 'Tidak ada deskripsi tersedia.',
              usage: c.usage || c.name,
              access,
              badgeColor,
              badgeBorder,
              category: mapCategory(c.category)
            };
          });
          setCommands(mapped);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to load commands:', err);
      }
      if (mounted) setLoading(false);
    }

    loadLiveCommands();
    return () => {
      mounted = false;
    };
  }, []);

  // Global Ctrl+K / '/' focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categoryCounts = {
    Semua: commands.length,
    'Radio & Media': commands.filter((c) => c.category === 'Radio & Media').length,
    'AI & Pintar': commands.filter((c) => c.category === 'AI & Pintar').length,
    'Grup & Admin': commands.filter((c) => c.category === 'Grup & Admin').length,
    'Alat & Utilitas': commands.filter((c) => c.category === 'Alat & Utilitas').length,
    Owner: commands.filter((c) => c.category === 'Owner').length
  };

  const categories = [
    { label: 'Semua', count: categoryCounts['Semua'] },
    { label: 'Radio & Media', count: categoryCounts['Radio & Media'] },
    { label: 'AI & Pintar', count: categoryCounts['AI & Pintar'] },
    { label: 'Grup & Admin', count: categoryCounts['Grup & Admin'] },
    { label: 'Alat & Utilitas', count: categoryCounts['Alat & Utilitas'] },
    { label: 'Owner', count: categoryCounts['Owner'] }
  ];

  const filteredCommands = commands.filter((cmd) => {
    const matchesCat = activeCategory === 'Semua' || cmd.category === activeCategory;
    const matchesSearch =
      cmd.name.toLowerCase().includes(search.toLowerCase()) ||
      cmd.aliases.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      cmd.desc.toLowerCase().includes(search.toLowerCase()) ||
      cmd.usage.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (usageText: string, name: string) => {
    navigator.clipboard.writeText(usageText);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 1600);
  };

  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Command Catalog</h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Daftar lengkap perintah live terhubung langsung ke registry runtime bot.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--accent)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span>
            Live Registry ({commands.length} Commands)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--text-muted)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"></path>
            </svg>
            Halaman publik
          </span>
        </div>
      </header>

      {/* SPOTLIGHT SEARCH */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', height: '64px', padding: '0 20px', boxSizing: 'border-box', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
        <input
          ref={searchInputRef}
          aria-label="Cari perintah bot"
          placeholder={`Cari dari ${commands.length || '103'} perintah live, alias, atau kegunaan...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontFamily: 'inherit', fontSize: '18px' }}
        />
        <span style={{ display: 'inline-flex', alignItems: 'center', height: '28px', padding: '0 8px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          Ctrl K
        </span>
      </div>

      {/* CATEGORY FILTERS */}
      <div role="group" aria-label="Filter kategori" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map((k) => {
          const isActive = activeCategory === k.label;
          return (
            <button
              key={k.label}
              onClick={() => setActiveCategory(k.label)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 16px',
                border: '1px solid ' + (isActive ? 'var(--accent)' : 'var(--border)'),
                borderRadius: 'var(--radius-pill)',
                background: isActive ? 'var(--surface-selected)' : 'var(--surface)',
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                fontFamily: 'inherit',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease'
              }}
            >
              {k.label}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: isActive ? 'var(--accent)' : 'var(--text-dim)' }}>
                {k.count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Menampilkan {filteredCommands.length} dari {commands.length} perintah</span>
        {loading && <span style={{ color: 'var(--accent)' }}>Memuat data live bot...</span>}
      </div>

      {/* COMMAND CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {filteredCommands.map((c) => {
          const isCopied = copiedName === c.name;
          return (
            <article key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between', gap: '12px' }}>
                <h2 style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500, color: 'var(--text)' }}>{c.name}</h2>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: '24px', padding: '0 8px', border: `1px solid ${c.badgeBorder}`, borderRadius: 'var(--radius-sm)', fontSize: '12px', color: c.badgeColor, whiteSpace: 'nowrap' }}>
                  {c.access}
                </span>
              </div>

              {c.aliases && c.aliases.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {c.aliases.map((a) => (
                    <span key={a} style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 8px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {a}
                    </span>
                  ))}
                </div>
              )}

              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5, color: 'var(--text-muted)' }}>{c.desc}</p>

              <div style={{ display: 'flex', alignItems: 'center', height: '44px', marginTop: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--bg)', overflow: 'hidden' }}>
                <code style={{ flex: 1, minWidth: 0, padding: '0 12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.usage}
                </code>
                <button
                  onClick={() => handleCopy(c.usage, c.name)}
                  aria-label={`Copy syntax ${c.name}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '44px', padding: '0 14px', border: 0, borderLeft: '1px solid var(--border)', background: 'transparent', color: isCopied ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px', cursor: 'pointer' }}
                >
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Salin
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
