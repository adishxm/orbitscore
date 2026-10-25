import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ConnectionStatus } from './ConnectionStatus';
import styles from './Header.module.css';

interface NavItem {
  code: string;
  shortLabel: string;
  fullLabel: string;
  to: string;
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { code: '01', shortLabel: 'Overview', fullLabel: 'COMMAND OVERVIEW', to: '/#hero-section' },
  { code: '02', shortLabel: 'Fleet', fullLabel: 'LIVE FLEET & TLEs', to: '/#telemetry-section' },
  { code: '03', shortLabel: 'Rules', fullLabel: 'DETERMINISTIC RULES', to: '/#matrix-section' },
  { code: '04', shortLabel: 'Workflow', fullLabel: '6-STAGE GATE WORKFLOW', to: '/#workflow-section' },
  { code: '05', shortLabel: 'Citations', fullLabel: 'TELEMETRY CITATIONS', to: '/#states-section' },
  { code: '06', shortLabel: 'Ledger', fullLabel: 'SHA-256 PROVENANCE LEDGER', to: '/#lineage-section' },
];

const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { code: '01', shortLabel: 'Workspaces', fullLabel: 'ALL WORKSPACES', to: '/missions' },
  { code: '02', shortLabel: 'Profiles', fullLabel: 'PROFILES & RULES', to: '/profiles' },
  { code: '03', shortLabel: 'Environment', fullLabel: 'ORBITAL ENVIRONMENT', to: '/orbital-environment' },
  { code: '04', shortLabel: 'Status', fullLabel: 'SYSTEM STATUS', to: '/status' },
  { code: '05', shortLabel: 'Public site', fullLabel: 'PUBLIC OVERVIEW →', to: '/' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState('01');
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/missions') || location.pathname.startsWith('/app');

  const navItems = isWorkspace ? WORKSPACE_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrolled = window.scrollY > 24;
        setIsScrolled(scrolled);

        // Simple scrollspy for public anchors
        if (!isWorkspace) {
          const anchors = [
            { code: '01', id: 'hero-section' },
            { code: '02', id: 'telemetry-section' },
            { code: '03', id: 'matrix-section' },
            { code: '04', id: 'workflow-section' },
            { code: '05', id: 'states-section' },
            { code: '06', id: 'lineage-section' },
          ];
          const scrollPos = window.scrollY + 120;
          for (let i = anchors.length - 1; i >= 0; i--) {
            const anchor = anchors[i];
            if (!anchor) continue;
            const el = document.getElementById(anchor.id);
            if (el && el.offsetTop <= scrollPos) {
              setActiveAnchor(anchor.code);
              break;
            }
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isWorkspace]);

  const handleNavClick = (to: string) => {
    setMobileMenuOpen(false);
    if (to.startsWith('/#')) {
      const targetId = to.replace('/#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={styles.headerWrapper}>
      <header
        className={`${styles.floatingHeader} ${isScrolled ? styles.headerScrolled : ''}`}
        role="banner"
      >
        {/* Left: Brand Identity with SVG Logomark */}
        <div className={styles.brandCol}>
          <Link to="/" className={styles.brandLink} aria-label="OrbitScore Engine Homepage">
            <svg
              className={styles.logomark}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Tilted orbit ring */}
              <ellipse
                cx="12"
                cy="12"
                rx="9.5"
                ry="4"
                transform="rotate(-25 12 12)"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="2 1.5"
              />
              {/* Solid core sphere */}
              <circle cx="12" cy="12" r="3.5" fill="#ffffff" />
              {/* Orbiting dot */}
              <circle cx="18" cy="8.5" r="1.5" fill="var(--accent-2)" />
            </svg>
            <span className={styles.brandText}>OrbitScore</span>
            <span className={styles.brandKernel}>kernel v4.2</span>
          </Link>
        </div>

        {/* Center: Sliding Active Pill Navigation */}
        <nav className={styles.navCol} aria-label="Primary Mission Navigation">
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = activeAnchor === item.code;
              return (
                <li key={item.code} className={styles.navItem}>
                  <a
                    href={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                  >
                    <span className={styles.navIndex}>{item.code}</span>
                    <span className={styles.navLabelWrapper}>
                      <span className={styles.navShortLabel}>{item.shortLabel}</span>
                      <span className="sr-only">{item.fullLabel}</span>
                    </span>
                    {isActive && <span className={styles.activePillGlow} aria-hidden="true" />}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Unified ConnectionStatus & Primary CTA */}
        <div className={styles.actionsCol}>
          <ConnectionStatus />

          {isWorkspace ? (
            <Link to="/missions" className={styles.primaryCta} title="Browse all mission workspaces">
              <span>All workspaces</span>
            </Link>
          ) : (
            <Link
              to="/missions/asteria-3"
              className={styles.primaryCta}
              title="Launch Mission Telemetry Workspace"
            >
              <span className={styles.ctaText}>Launch console</span>
              <span className="sr-only">Asteria-3 Demo</span>
              <ArrowUpRight size={14} className={styles.ctaArrow} aria-hidden="true" />
            </Link>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close Command Menu' : 'Open Command Menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Full-Screen Mobile Drawer */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer} role="dialog" aria-modal="true">
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.brandText}>OrbitScore</span>
              <button
                type="button"
                className={styles.mobileCloseBtn}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>
            <ul className={styles.mobileList}>
              {navItems.map((item) => (
                <li key={item.code}>
                  <a
                    href={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className={styles.mobileLink}
                  >
                    <span className={styles.mobileCode}>{item.code}</span>
                    <span className={styles.mobileLabel}>{item.shortLabel}</span>
                    <span className="sr-only">{item.fullLabel}</span>
                  </a>
                </li>
              ))}
              <li className={styles.mobileCtaItem}>
                <Link
                  to="/missions/asteria-3"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileCta}
                >
                  <span>Launch console</span>
                  <ArrowUpRight size={16} />
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
