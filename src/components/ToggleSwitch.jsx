/**
 * ToggleSwitch — Accessible toggle for optional report sections.
 * Gender-neutral design with smooth animation.
 */
export default function ToggleSwitch({ label, checked, onChange, id }) {
  return (
    <label
      htmlFor={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        cursor: 'pointer',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: checked ? 'var(--primary-subtle)' : 'var(--bg-card)',
        border: `1px solid ${checked ? 'var(--border-active)' : 'var(--border-subtle)'}`,
        transition: 'all var(--transition-base)',
        userSelect: 'none',
      }}
    >
      {/* Toggle track */}
      <div
        style={{
          width: '48px',
          height: '26px',
          borderRadius: '13px',
          background: checked
            ? 'linear-gradient(135deg, var(--primary), hsl(172, 70%, 35%))'
            : 'var(--bg-elevated)',
          border: `1px solid ${checked ? 'transparent' : 'var(--border-card)'}`,
          position: 'relative',
          transition: 'all var(--transition-base)',
          flexShrink: 0,
        }}
      >
        {/* Toggle thumb */}
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: checked ? '25px' : '2px',
            transition: 'left var(--transition-base)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      <span
        style={{
          fontSize: '0.9rem',
          fontWeight: 500,
          color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
          transition: 'color var(--transition-fast)',
        }}
      >
        {label}
      </span>

      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
    </label>
  );
}
