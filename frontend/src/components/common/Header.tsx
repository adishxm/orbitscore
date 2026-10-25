import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useOrbitStore } from '../../store/useOrbitStore';
import styles from './Header.module.css';

interface NavItem {
  code: string;
  label: string;
  srLabel: string;
  to: string;
}

const PUBLIC_NAV_ITEMS: NavItem[] = [
  { code: '01', label: 'COMMAND OVERVIEW', srLabel: 'Overview', to: '/' },
  { code: '02', label: 'LIVE FLEET & TLEs', srLabel: 'How It Works', to: '/orbital-environment' },
  { code: '03', label: 'DETERMINISTIC RULES', srLabel: 'Profiles & Rules', to: '/profiles' },
  { code: '04', label: '6-STAGE GATE WORKFLOW', srLabel: 'About Limits', to: '/#workflow' },
  { code: '05', label: 'TELEMETRY CITATIONS', srLabel: 'Citations', to: '/#telemetry' },
  { code: '06', label: 'SHA-256 PROVENANCE LEDGER', srLabel: 'System Status', to: '/status' },
];

const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { code: '01', label: 'ALL WORKSPACES', srLabel: 'Workspaces', to: '/missions' },
  { code: '02', label: 'PROFILES & RULES', srLabel: 'Profiles', to: '/profiles' },
  { code: '03', label: 'ORBITAL ENVIRONMENT', srLabel: 'Environment', to: '/orbital-environment' },
  { code: '04', label: 'SYSTEM STATUS', srLabel: 'Status', to: '/status' },
  { code: '05', label: 'PUBLIC OVERVIEW →', srLabel: 'Public Site', to: '/' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isApiConnected } = useOrbitStore();
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/missions') || location.pathname.startsWith('/app');

  const navItems = isWorkspace ? WORKSPACE_NAV_ITEMS : PUBLIC_NAV_ITEMS;

  return (
    <header className={styles.commandHeader} role="banner">
      {/* Brand Identity */}
      <div className={styles.brandCol}>
        <Link to="/" className={styles.brandLink} aria-label="OrbitScore Engine Homepage">
          <span className={styles.brandIcon} />
          <span className={styles.brandText}>ORBITSCORE</span>
          <span className={styles.brandKernel}>// C2C2 KERNEL v4.2</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={styles.navCol} aria-label="Primary Mission Navigation">
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.to} className={styles.navItem}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                <span className={styles.navCode}>{item.code}</span>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.srOnly}>{item.srLabel}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Live State & Non-Wrapping CTA */}
      <div className={styles.actionsCol}>
        <div className={styles.statusPill} aria-label="System Operating Mode">
          <span
            className={`${styles.statusDot} ${isApiConnected ? styles.dotLive : styles.dotStandby}`}
            aria-hidden="true"
          />
          <span className={styles.statusText}>
            {isApiConnected ? 'FASTAPI LIVE' : 'DETERMINISTIC LOCAL'}
          </span>
        </div>

        {isWorkspace ? (
          <Link
            to="/missions"
            className={styles.workspaceCta}
            title="Browse all mission workspaces"
          >
            <span className={styles.ctaText}>ALL WORKSPACES</span>
          </Link>
        ) : (
          <Link
            to="/missions/asteria-3"
            className={styles.primaryCta}
            title="Launch Mission Telemetry Workspace"
          >
            <span className={styles.ctaText}>LAUNCH CONSOLE &rarr;</span>
            <span className={styles.srOnly}>Asteria-3 Demo</span>
            <ArrowUpRight size={13} aria-hidden="true" />
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

      {/* Full-Bleed Mobile Command Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <ul className={styles.mobileList}>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileLink}
                >
                  <span className={styles.navCode}>{item.code}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li className={styles.mobileCtaItem}>
              <Link
                to="/missions/asteria-3"
                onClick={() => setMobileMenuOpen(false)}
                className={styles.mobileCta}
              >
                LAUNCH MISSION WORKSPACE &rarr;
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;

