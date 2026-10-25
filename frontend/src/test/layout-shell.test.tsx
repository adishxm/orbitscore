import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { AppContent } from '../App';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';

describe('Slice 2: Layout Shell, Navigation & Aerospace Command Header', () => {
  it('renders the skip to main content accessibility link', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>
    );

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('renders Header with navigation items and non-wrapping CTA button', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/COMMAND OVERVIEW/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/LIVE FLEET & TLEs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/DETERMINISTIC RULES/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6-STAGE GATE WORKFLOW/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TELEMETRY CITATIONS/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SHA-256 PROVENANCE/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/LAUNCH CONSOLE/i)).toBeInTheDocument();
  });

  it('renders Footer with proprietary deterministic telemetry engine specification', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/ORBITSCORE \/\/ DETERMINISTIC MISSION TELEMETRY & VERIFICATION ENGINE/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/DETERMINISTIC KERNEL v4\.2\.0 \/\/ NORAD LINKED/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PROPRIETARY DETERMINISTIC TELEMETRY SPECIFICATION \/\/ RFC 3161 TIME-STAMPED/i)
    ).toBeInTheDocument();
  });

  it('navigates to the /about-limits route and displays the boundary statements', () => {
    render(
      <MemoryRouter initialEntries={['/about-limits']}>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /System Limitations & Boundary Statement/i })).toBeInTheDocument();
    expect(screen.getByText(/Comparative Boundary Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/What OrbitScore Is NOT/i)).toBeInTheDocument();
  });

  it('navigates to /missions and renders available synthetic fixtures', () => {
    render(
      <MemoryRouter initialEntries={['/missions']}>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Select or Initialize Mission Workspace/i })).toBeInTheDocument();
    expect(screen.getByText(/Asteria-3 Mission/i)).toBeInTheDocument();
    expect(screen.getByText(/Microsat-X Test Vehicle/i)).toBeInTheDocument();
  });

  it('navigates to /missions/asteria-3 and renders mission workspace skeleton', () => {
    render(
      <MemoryRouter initialEntries={['/missions/asteria-3']}>
        <AppContent />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /Asteria-3 Technology Demonstration CubeSat/i })
    ).toBeInTheDocument();
    expect(screen.getByText('2. Evidence Register')).toBeInTheDocument();
  });

  it('renders 404 page on unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-path-xyz']}>
        <AppContent />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Requested Path Not Found/i })).toBeInTheDocument();
    expect(screen.getByText(/Return to Homepage/i)).toBeInTheDocument();
  });

  it('passes axe accessibility audit on the layout shell', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
