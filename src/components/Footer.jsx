import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: 'var(--space-xl) var(--space-lg)',
        textAlign: 'center',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          🎨 Chroma<span style={{ color: 'var(--primary)' }}>Sense</span>
        </Link>

        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            maxWidth: '500px',
          }}
        >
          Discover your most flattering colors through AI-powered skin tone analysis.
          Gender-inclusive. India-focused. Always free.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-lg)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
          }}
        >
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Home
          </Link>
          <Link to="/analyze" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Analyze
          </Link>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.6 }}>
          © {new Date().getFullYear()} ChromaSense — All rights reserved
        </p>
      </div>
    </footer>
  );
}
