import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: FC = () => {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/owner/groups';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (login(key)) {
      navigate(from, { replace: true });
    } else {
      setError(true);
      setTimeout(() => setError(false), 2500);
    }
  };

  return (
    <div style={{
      flex: '999 1 560px',
      minWidth: 0,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        boxSizing: 'border-box'
      }}>
        {/* Header card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--surface-selected)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            marginBottom: '4px'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"></rect>
              <path d="M8 11V7a4 4 0 0 1 8 0v4"></path>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}>Owner Mission Control</h1>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
            Masukkan PIN atau Master Key owner untuk mengakses panel kendali bot.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              MASTER KEY / PIN
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              height: '46px',
              padding: '0 14px',
              border: '1px solid ' + (error ? 'var(--danger-border)' : 'var(--border-strong)'),
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg)',
              transition: 'border-color 0.2s ease'
            }}>
              <input
                type="password"
                placeholder="Ketik PIN owner (cth: ronn)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 0,
                  outline: 0,
                  color: 'var(--text)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  letterSpacing: '0.1em'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--error-row)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}>
              PIN atau Master Key tidak valid!
            </div>
          )}

          <button
            type="submit"
            style={{
              height: '46px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent)',
              color: '#0B0D10',
              fontWeight: 600,
              fontSize: '14px',
              border: 0,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            Buka Mission Control
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)'
        }}>
          Otorisasi tersimpan di local session
        </div>
      </div>
    </div>
  );
};

