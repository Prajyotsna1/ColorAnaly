import { useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';

/**
 * ResultCard — Shareable result card that can be downloaded as an image.
 */
export default function ResultCard({ undertone, emoji, skinDepth, hex, bestColors = [] }) {
  const cardRef = useRef(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `chromasense-${undertone.toLowerCase().replace(/\s/g, '-')}-palette.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [undertone]);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0d1117',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (navigator.share && blob) {
          const file = new File([blob], 'chromasense-result.png', { type: 'image/png' });
          try {
            await navigator.share({
              title: `My Undertone: ${undertone} ${emoji}`,
              text: `I just discovered my skin undertone is ${undertone}! Check out my personalized color palette.`,
              files: [file],
            });
          } catch {
            // User cancelled share
          }
        } else {
          // Fallback: download
          handleDownload();
        }
      });
    } catch {
      handleDownload();
    }
  }, [undertone, emoji, handleDownload]);

  const displayColors = bestColors.slice(0, 6);

  return (
    <div>
      {/* The card itself */}
      <div
        ref={cardRef}
        style={{
          background: 'linear-gradient(135deg, #0d1117, #151d2b, #0d1117)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '420px',
          margin: '0 auto',
          border: '1px solid hsla(0, 0%, 100%, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'hsl(172, 66%, 40%)',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            🎨 ChromaSense
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: '#f0f0f0',
              lineHeight: 1.2,
            }}
          >
            {emoji} {undertone}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: '#999',
              marginTop: '4px',
            }}
          >
            {skinDepth} Skin Tone
          </div>
        </div>

        {/* Detected color swatch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: hex,
              border: '3px solid hsla(0, 0%, 100%, 0.2)',
            }}
          />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: '#777' }}>Detected Skin Tone</div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: '#ccc',
                fontWeight: 600,
              }}
            >
              {hex}
            </div>
          </div>
        </div>

        {/* Best colors strip */}
        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#777',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            Your Best Colors
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '6px',
            }}
          >
            {bestColors.slice(0, 12).map((c, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: '8px',
                  backgroundColor: c.hex,
                  border: '1px solid hsla(0, 0%, 100%, 0.1)',
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons (outside the captured card) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-md)',
          marginTop: 'var(--space-lg)',
        }}
      >
        <button
          className="btn btn-primary btn-sm"
          onClick={handleDownload}
          id="download-result-btn"
        >
          📥 Download
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={handleShare}
          id="share-result-btn"
        >
          🔗 Share
        </button>
      </div>
    </div>
  );
}
