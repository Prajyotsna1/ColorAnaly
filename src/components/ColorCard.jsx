/**
 * ColorCard — Reusable color swatch card component.
 * Used in both "Best Colors" and "Avoid Colors" sections.
 */
export default function ColorCard({ name, hex, reason, isAvoid = false, style = {} }) {
  // Calculate whether text should be light or dark based on background
  const textColor = getContrastColor(hex);

  return (
    <div
      className="color-card"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'all var(--transition-base)',
        cursor: 'default',
        position: 'relative',
        ...style,
      }}
      title={`${name} — ${hex}`}
    >
      {/* Color swatch */}
      <div
        className="color-card-swatch"
        style={{
          backgroundColor: hex,
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {isAvoid && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              color: 'white',
            }}
          >
            ✕
          </div>
        )}
      </div>

      {/* Info section */}
      <div
        style={{
          padding: '10px 12px',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: reason ? '6px' : 0,
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--text-primary)',
            }}
          >
            {name}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              background: 'var(--bg-elevated)',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {hex}
          </span>
        </div>

        {reason && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            {reason}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Determine if text on a color should be light or dark.
 */
function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}
