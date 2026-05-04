import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import ColorCard from '../components/ColorCard';
import ToggleSwitch from '../components/ToggleSwitch';
import ResultCard from '../components/ResultCard';
import CustomPicker from '../components/CustomPicker';
import {
  getUndertoneEmoji,
  getUndertoneDescription,
  adjustAndReclassify,
} from '../utils/undertoneClassifier';
import { getRecommendations } from '../data/colorRecommendations';
import { 
  generateDynamicPalette, 
  generateBetterColor, 
  explainColorChoice 
} from '../utils/smartRecommendations';
import './ResultsPage.css';

export default function ResultsPage() {
  const location = useLocation();
  const originalResult = location.state?.analysisResult;
  const userImage = location.state?.userImage;

  const [showMakeup, setShowMakeup] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [adjustment, setAdjustment] = useState(0); // -30 to +30
  const [activeDrape, setActiveDrape] = useState(null);

  // No data guard
  if (!originalResult) {
    return (
      <main className="results-page">
        <div className="container">
          <div className="no-data-container">
            <span className="no-data-icon">🎨</span>
            <h2>No Analysis Data Found</h2>
            <p style={{ marginBottom: 'var(--space-xl)', maxWidth: '400px', margin: '0 auto var(--space-xl)' }}>
              It looks like you haven't analyzed a photo yet. Head to the analysis page to get started!
            </p>
            <Link to="/analyze" className="btn btn-primary" id="go-analyze-btn">
              Start Analysis →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Re-classify when slider moves (memoized for performance)
  const result = useMemo(() => {
    if (adjustment === 0) return originalResult;
    return adjustAndReclassify(originalResult, adjustment);
  }, [originalResult, adjustment]);

  const { undertone, confidence, skinDepth, dominantHex, dominantRGB, dominantHSV, lighting } = result;
  const emoji = getUndertoneEmoji(undertone);
  const description = getUndertoneDescription(undertone);
  
  // New depth-aware recommendations
  const recs = useMemo(() => getRecommendations(undertone, skinDepth), [undertone, skinDepth]);
  
  // Smart Dynamic Data
  const dynamicPalette = useMemo(() => generateDynamicPalette(dominantHex, undertone), [dominantHex, undertone]);
  
  const enhancedAvoid = useMemo(() => {
    return recs.avoidColors.map(color => ({
      ...color,
      betterHex: generateBetterColor(color.hex, undertone),
      explanation: explainColorChoice(undertone, color.name)
    }));
  }, [recs.avoidColors, undertone]);

  const isAdjusted = adjustment !== 0;

  // Set initial drape
  useEffect(() => {
    if (recs.bestColors.length > 0 && !activeDrape) {
      setActiveDrape(recs.bestColors[0].hex);
    }
  }, [recs.bestColors, activeDrape]);


  return (
    <main className="results-page">
      <div className="container">
        {/* ═══════ HERO: Undertone result ═══════ */}
        <section className="result-hero" id="result-hero">
          <div className="result-undertone-badge" id="undertone-badge">
            <span className="result-undertone-emoji">{emoji}</span>
            <div className="result-undertone-text">
              <div className="result-undertone-label">Your Undertone</div>
              <div className="result-undertone-value">{undertone}</div>
            </div>
          </div>

          {/* Lighting Indicator */}
          {lighting && (
            <div className={`lighting-status lighting-${lighting.status}`} id="lighting-indicator">
              <span className="lighting-icon">{lighting.icon}</span>
              <span className="lighting-label">{lighting.label}</span>
              {lighting.warning && <span className="lighting-warning-tooltip">? <span className="tooltip-text">{lighting.warning}</span></span>}
            </div>
          )}

          <p className="result-description">{description}</p>

          {/* Skin details */}
          <div className="skin-details-row" id="skin-details">
            <div className="skin-detail-item">
              <div className="skin-swatch" style={{ backgroundColor: dominantHex }} />
              <div>
                <div className="skin-detail-label">Detected Color</div>
                <div className="skin-detail-value">{dominantHex}</div>
              </div>
            </div>

            <div className="skin-detail-item">
              <div>
                <div className="skin-detail-label">Skin Depth</div>
                <div className="skin-detail-value">{skinDepth}</div>
              </div>
            </div>

            <div className="skin-detail-item">
              <div>
                <div className="skin-detail-label">HSV</div>
                <div className="skin-detail-value">
                  {dominantHSV.h}° / {dominantHSV.s}% / {dominantHSV.v}%
                </div>
              </div>
            </div>
          </div>

          {/* Confidence meter */}
          <div className="confidence-meter" id="confidence-meter">
            <div className="confidence-label">
              <span>Estimated Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <div className="confidence-bar-bg">
              <div
                className="confidence-bar-fill"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
          </div>

          {/* ═══════ MANUAL CORRECTION SLIDER ═══════ */}
          <div className="correction-slider-container" id="correction-slider">
            <div className="correction-header">
              <span className="correction-icon">🎛️</span>
              <div>
                <h4 className="correction-title">Does this look accurate?</h4>
                <p className="correction-subtitle">
                  Fine-tune if the result doesn't feel right — drag to adjust
                </p>
              </div>
            </div>

            <div className="correction-slider-row">
              <span className="correction-label-cool">❄️ Cooler</span>
              <input
                type="range"
                min="-30"
                max="30"
                value={adjustment}
                onChange={(e) => setAdjustment(Number(e.target.value))}
                className="correction-range"
                id="correction-range-input"
              />
              <span className="correction-label-warm">Warmer ☀️</span>
            </div>

            {isAdjusted && (
              <div className="correction-status">
                <span>
                  Adjusted by {adjustment > 0 ? '+' : ''}{adjustment} →{' '}
                  <strong>{undertone}</strong>
                </span>
                <button
                  className="correction-reset"
                  onClick={() => setAdjustment(0)}
                  id="correction-reset-btn"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ VIRTUAL DRAPING SECTION (NEW) ═══════ */}
        {userImage && (
          <section className="result-section draping-section" id="draping-section">
            <div className="result-section-header">
              <div className="result-section-icon" style={{ background: 'hsla(280, 60%, 40%, 0.15)' }}>
                🧥
              </div>
              <div>
                <h2>Virtual Draping Preview</h2>
                <p className="section-subtitle">Test these colors directly against your face</p>
              </div>
            </div>

            <div className="draping-layout">
              <div className="draping-preview-container" style={{ borderColor: activeDrape }}>
                <img src={userImage} alt="Virtual Draping" className="user-drape-image" />
                <div className="drape-overlay" style={{ backgroundColor: activeDrape }}></div>
                <div className="drape-label" style={{ backgroundColor: activeDrape }}>
                  {recs.bestColors.find(c => c.hex === activeDrape)?.name || 'Selected Color'}
                </div>
              </div>

              <div className="draping-controls">
                <div className="draping-controls-header">
                  <h4 className="controls-title">Tap a color to drape it</h4>
                  <button 
                    className={`picker-toggle-btn ${showPicker ? 'active' : ''}`}
                    onClick={() => setShowPicker(!showPicker)}
                  >
                    {showPicker ? '✖ Close Picker' : '🎨 Custom Picker'}
                  </button>
                </div>

                {showPicker ? (
                  <CustomPicker initialColor={activeDrape} onChange={setActiveDrape} />
                ) : (
                  <div className="drape-grid">
                    {recs.bestColors.slice(0, 24).map((color, idx) => (
                      <button
                        key={idx}
                        className={`drape-btn ${activeDrape === color.hex ? 'active' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setActiveDrape(color.hex)}
                        title={color.name}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ═══════ DYNAMIC HARMONY SECTION ═══════ */}
        <section className="result-section" id="harmony-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(190, 60%, 40%, 0.15)' }}>
              ✨
            </div>
            <div>
              <h2>Skin Tone Harmony</h2>
              <p className="section-subtitle">Generated dynamically from your actual pixel data</p>
            </div>
          </div>
          <div className="color-grid">
            {dynamicPalette.map((color, idx) => (
              <ColorCard key={idx} name={color.name} hex={color.hex} />
            ))}
          </div>
        </section>

        {/* ═══════ BEST COLORS ═══════ */}
        <section className="result-section" id="best-colors-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(172, 60%, 40%, 0.15)' }}>
              🎨
            </div>
            <h2>Best Colors For You</h2>
          </div>

          <div className="color-grid" id="best-colors-grid">
            {recs.bestColors.map((color, i) => (
              <ColorCard
                key={i}
                name={color.name}
                hex={color.hex}
              />
            ))}
          </div>
        </section>

        {/* ═══════ COLORS TO AVOID (SMART) ═══════ */}
        <section className="result-section" id="avoid-colors-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(0, 60%, 45%, 0.15)' }}>
              🚫
            </div>
            <h2>Colors to Avoid</h2>
          </div>

          <div className="avoid-list">
            {enhancedAvoid.map((color, idx) => (
              <div key={idx} className="avoid-card-enhanced">
                <div className="avoid-card-main">
                  <div className="avoid-swatch-container">
                    <div className="avoid-swatch" style={{ backgroundColor: color.hex }}></div>
                    <div className="avoid-info">
                      <h3>{color.name}</h3>
                      <p className="avoid-reason">{color.reason}</p>
                    </div>
                  </div>
                  <div className="instead-section">
                    <span className="instead-label">Instead try:</span>
                    <div className="instead-swatch-container">
                      <div className="instead-swatch" style={{ backgroundColor: color.betterHex }}></div>
                      <span className="instead-name">Optimized Variant</span>
                    </div>
                  </div>
                </div>
                <div className="smart-explanation">
                  <span className="smart-badge">💡 Smart Advice</span>
                  <p>{color.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ JEWELRY & METALS ═══════ */}
        <section className="result-section" id="metals-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(35, 80%, 50%, 0.15)' }}>
              💍
            </div>
            <h2>Best Metals & Jewelry</h2>
          </div>

          <div className="metals-grid" id="metals-grid">
            {recs.metals.map((metal, i) => (
              <div className="metal-card" key={i}>
                <div
                  className="metal-swatch"
                  style={{
                    background: `linear-gradient(135deg, ${recs.metalHexes[i]}, ${adjustBrightness(recs.metalHexes[i], -30)})`,
                  }}
                />
                <span className="metal-name">{metal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════ STYLE SUGGESTIONS ═══════ */}
        <section className="result-section" id="style-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(280, 50%, 50%, 0.15)' }}>
              👔
            </div>
            <h2>Style Suggestions</h2>
          </div>

          {/* Clothing — always shown */}
          <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
            Clothing
          </h3>
          <ul className="suggestions-list" id="clothing-suggestions">
            {recs.clothingSuggestions.map((tip, i) => (
              <li className="suggestion-item" key={i}>
                <span className="suggestion-icon">👕</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>

          {/* Optional toggles */}
          <div className="toggle-section">
            <div className="toggle-group" id="toggle-group">
              <ToggleSwitch
                label="Show makeup suggestions"
                checked={showMakeup}
                onChange={() => setShowMakeup(!showMakeup)}
                id="toggle-makeup"
              />
              <ToggleSwitch
                label="Show accessory suggestions"
                checked={showAccessories}
                onChange={() => setShowAccessories(!showAccessories)}
                id="toggle-accessories"
              />
            </div>

            {showMakeup && (
              <div style={{ marginBottom: 'var(--space-xl)', animation: 'fadeInUp 0.3s ease-out' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                  If you use makeup...
                </h3>
                <ul className="suggestions-list" id="makeup-suggestions">
                  {recs.makeupSuggestions.map((tip, i) => (
                    <li className="suggestion-item" key={i}>
                      <span className="suggestion-icon">💄</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showAccessories && (
              <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                  Accessories that complement your tone...
                </h3>
                <ul className="suggestions-list" id="accessory-suggestions">
                  {recs.accessorySuggestions.map((tip, i) => (
                    <li className="suggestion-item" key={i}>
                      <span className="suggestion-icon">🎒</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ SHAREABLE RESULT CARD ═══════ */}
        <section className="result-section" id="share-section">
          <div className="result-section-header">
            <div className="result-section-icon" style={{ background: 'hsla(172, 60%, 40%, 0.15)' }}>
              📸
            </div>
            <h2>Your Shareable Result Card</h2>
          </div>

          <div className="share-section">
            <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Download or share your personalized color analysis card with friends!
            </p>
            <ResultCard
              undertone={undertone}
              emoji={emoji}
              skinDepth={skinDepth}
              hex={dominantHex}
              bestColors={recs.bestColors}
            />
          </div>
        </section>

        {/* ═══════ BACK ═══════ */}
        <div className="back-row">
          <Link to="/analyze" className="btn btn-secondary" id="analyze-again-btn">
            ← Analyze Another Photo
          </Link>
        </div>
      </div>
    </main>
  );
}

/**
 * Adjust hex color brightness.
 */
function adjustBrightness(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
