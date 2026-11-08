import type { FC } from 'react';

interface PlaceholderProps {
  title: string;
  subtitle: string;
  badgeText: string;
}

export const PlaceholderPage: FC<PlaceholderProps> = ({ title, subtitle, badgeText }) => {
  return (
    <div style={{ flex: '999 1 560px', minWidth: 0, boxSizing: 'border-box', padding: '28px 40px 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h1>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2"></rect>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
          </svg>
          {badgeText}
        </span>
      </header>

      <section style={{
        padding: '56px 32px',
        border: '1px dashed var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--surface-selected)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 500, margin: 0 }}>{title}</h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--accent)',
          background: 'var(--surface-inset)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border)'
        }}>
          Segera hadir · Mengikuti rilis desain berikutnya
        </div>
      </section>
    </div>
  );
};

