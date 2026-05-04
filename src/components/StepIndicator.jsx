/**
 * StepIndicator — Visual progress stepper for the analysis flow.
 */
export default function StepIndicator({ steps, currentStep }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        padding: 'var(--space-lg) 0',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: index < steps.length - 1 ? 1 : 'none',
            }}
          >
            {/* Step circle + label */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minWidth: '70px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isCompleted ? '1.1rem' : '0.9rem',
                  fontWeight: 700,
                  transition: 'all var(--transition-base)',
                  background: isCompleted
                    ? 'linear-gradient(135deg, var(--primary), hsl(172, 70%, 35%))'
                    : isActive
                    ? 'var(--bg-elevated)'
                    : 'var(--bg-card)',
                  color: isCompleted
                    ? 'white'
                    : isActive
                    ? 'var(--primary)'
                    : 'var(--text-muted)',
                  border: isActive
                    ? '2px solid var(--primary)'
                    : '2px solid var(--border-subtle)',
                  boxShadow: isActive ? '0 0 16px var(--primary-glow)' : 'none',
                }}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  margin: '0 8px',
                  marginBottom: '28px',
                  background: isCompleted
                    ? 'var(--primary)'
                    : 'var(--border-subtle)',
                  transition: 'background var(--transition-base)',
                  borderRadius: '1px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
