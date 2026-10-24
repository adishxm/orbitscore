import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Logo } from './Logo';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Track scroll position to update sticky header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Overview', to: '/' },
    { label: 'How It Works', to: '/how-it-works' },
    { label: 'Profiles & Rules', to: '/profiles' },
    { label: 'Missions', to: '/missions' },
    { label: 'Conjunctions', to: '/conjunctions' },
    { label: 'Environment', to: '/orbital-environment' },
    { label: 'Scenarios', to: '/scenarios' },
    { label: 'About Limits', to: '/about-limits' },
    { label: 'System Status', to: '/status' },
  ];

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <div className={`container ${styles.grid}`}>
        {/* Left: Brand Logo */}
        <div className={styles.colLeft}>
          <Link to="/" aria-label="OrbitScore Homepage">
            <Logo size={isScrolled ? 'sm' : 'md'} />
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className={styles.colMid} aria-label="Primary Navigation">
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  data-text={link.label}
                >
                  <span className={styles.navLinkText}>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className={styles.colRight}>
          <Link to="/app/missions" className={styles.ctaButton}>
            <span>Asteria-3 Demo</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Full-Screen Mobile Drawer */}
      <div
        id="mobile-nav-menu"
        className={`${styles.mobileDrawer} ${mobileMenuOpen ? styles.mobileDrawerOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.mobileDrawerContent}>
          <nav aria-label="Mobile Navigation">
            <ul className={styles.mobileNavList}>
              {navLinks.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className={styles.mobileCtaItem}>
                <Link to="/app/missions" className={styles.mobileCtaButton}>
                  Open Asteria-3 Workspace
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
