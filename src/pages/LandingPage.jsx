import { Link } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import './LandingPage.css';

const HERO_DOTS = [
  { color: '#20D3B2', top: '10%', left: '15%', delay: '0s' },
  { color: '#E8A830', top: '25%', right: '8%', delay: '0.5s' },
  { color: '#8B5CF6', bottom: '27%', left: '50%', delay: '1s' },
  { color: '#E8735A', bottom: '15%', right: '20%', delay: '1.5s' },
  { color: '#009B76', top: '60%', left: '85%', delay: '0.7s' },
  { color: '#C85A3E', top: '45%', left: '10%', delay: '1.2s' },
];

export default function LandingPage() {
  return (
    <main>
      {/* ═══════════ HERO ═══════════ */}
      <section className="hero" id="hero-section">
        <ParticleBackground />
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge badge-primary">✨ AI-Powered Analysis</span>
              </div>

              <h1 className="hero-title">
                Discover Your{' '}
                <span className="gradient-text">True Colors</span>
              </h1>

              <p className="hero-desc">
                Upload a photo and let our AI detect your skin undertone — then get a
                personalized color palette with styling suggestions that celebrate your
                unique beauty. Gender-neutral. India-focused. Always free.
              </p>

              <div className="hero-actions">
                <Link to="/analyze" className="btn btn-primary btn-lg" id="hero-cta-primary">
                  Analyze My Colors →
                </Link>
                <a href="#how-it-works" className="btn btn-secondary btn-lg" id="hero-cta-learn">
                  Learn How It Works
                </a>
              </div>

              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="hero-stat-value">8</div>
                  <div className="hero-stat-label">Undertone Types</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">70+</div>
                  <div className="hero-stat-label">Color Matches</div>
                </div>
                <div className="hero-stat">
                  <div className="hero-stat-value">100%</div>
                  <div className="hero-stat-label">Client-Side</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-color-wheel">
                <div className="hero-ring hero-ring-1" />
                <div className="hero-ring hero-ring-2" />
                <div className="hero-ring hero-ring-3" />
                <div className="hero-center-circle" />
                <div className="hero-center-icon">🎨</div>

                {HERO_DOTS.map((dot, i) => (
                  <div
                    key={i}
                    className="hero-dot"
                    style={{
                      backgroundColor: dot.color,
                      top: dot.top,
                      left: dot.left,
                      right: dot.right,
                      bottom: dot.bottom,
                      animationDelay: dot.delay,
                      boxShadow: `0 0 12px ${dot.color}60`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-accent">How It Works</span>
            <h2 style={{ marginTop: 'var(--space-md)' }}>
              From Selfie to Style Guide in Seconds
            </h2>
            <p>
              Our hybrid AI system combines machine learning face detection with custom
              color science to give you accurate, personalized results.
            </p>
          </div>

          <div className="steps-grid">
            {[
              {
                icon: '📸',
                title: 'Upload Photo',
                desc: 'Take or upload a clear headshot in natural lighting. Your image stays private — all processing happens in your browser.',
              },
              {
                icon: '🔍',
                title: 'Detect Skin',
                desc: 'MediaPipe AI identifies your face and maps skin regions (cheeks & forehead), ignoring background and hair.',
              },
              {
                icon: '🧪',
                title: 'Analyze Undertone',
                desc: 'Our system identifies your exact undertone — including hybrid variants like Neutral-Warm. Not perfect? Use our manual tuner to fine-tune results.',
              },
              {
                icon: '📊',
                title: 'Get Your Report',
                desc: 'See your best colors, styling tips, metals, and colors to avoid — all tailored to your unique undertone.',
              },
            ].map((step, i) => (
              <div
                className="step-card animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
                key={i}
              >
                <div className="step-number">{i + 1}</div>
                <span className="step-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="section" id="features-section">
        <div className="container">
          <div className="section-header">
            <span className="badge badge-primary">Why ChromaSense</span>
            <h2 style={{ marginTop: 'var(--space-md)' }}>
              Built Different, By Design
            </h2>
            <p>
              Not just another color quiz. Real AI, real color science, designed for
              everyone.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: 'hsla(140, 50%, 40%, 0.15)' }}
              >
                🌿
              </div>
              <h3>India-Focused Olive Detection</h3>
              <p>
                Most color analysis tools miss olive undertones — especially common in
                South Asian skin. Our system detects Warm Olive and Cool Olive
                variants with precision.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: 'hsla(280, 50%, 50%, 0.15)' }}
              >
                🏳️‍🌈
              </div>
              <h3>Gender-Inclusive Design</h3>
              <p>
                No "men's" or "women's" sections. Neutral language throughout.
                Makeup and accessory suggestions are optional toggles — not
                assumptions.
              </p>
            </div>

            <div className="feature-card">
              <div
                className="feature-icon"
                style={{ background: 'hsla(35, 80%, 50%, 0.15)' }}
              >
                ⚡
              </div>
              <h3>Real-Time, Private Analysis</h3>
              <p>
                Everything runs in your browser. Your photos are never uploaded to any
                server. Get instant results powered by MediaPipe AI and Canvas API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="section cta-section" id="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Find Your Colors?</h2>
            <p>
              It takes less than 30 seconds. Upload a selfie, get your personalized
              color palette, and download a shareable result card.
            </p>
            <Link to="/analyze" className="btn btn-primary btn-lg" id="cta-analyze-btn">
              Start Analysis — It's Free →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
