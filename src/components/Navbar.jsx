import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="main-navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo" id="logo-link">
            <div className="navbar-logo-icon">🎨</div>
            <div className="navbar-logo-text">
              Chroma<span>Sense</span>
            </div>
          </Link>

          <ul className="navbar-links">
            <li>
              <Link to="/" className={isActive('/')} id="nav-home">
                Home
              </Link>
            </li>
            <li>
              <Link to="/analyze" className={isActive('/analyze')} id="nav-analyze">
                Analyze
              </Link>
            </li>
            <li>
              <Link
                to="/analyze"
                className="navbar-cta"
                id="nav-cta"
              >
                Discover Your Colors →
              </Link>
            </li>
          </ul>

          <button
            className="navbar-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            id="navbar-toggle-btn"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/')} id="mobile-nav-home">
          Home
        </Link>
        <Link to="/analyze" className={isActive('/analyze')} id="mobile-nav-analyze">
          Analyze
        </Link>
        <Link to="/analyze" className="navbar-cta" id="mobile-nav-cta">
          Discover Your Colors →
        </Link>
      </div>
    </>
  );
}
