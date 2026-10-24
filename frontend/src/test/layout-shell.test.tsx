import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { AppContent } from '../App';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { StatusBanner } from '../components/common/StatusBanner';

describe('Slice 2: Layout Shell, Navigation & Honesty Banners', () => {
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

  it('renders the StatusBanner with required honesty badges', () => {
    render(
      <MemoryRouter>
        <StatusBanner syntheticMissionName="Asteria-3" />
      </MemoryRouter>
    );

    expect(screen.getByText(/DEMO \/ MOCK/i)).toBeInTheDocument();
    expect(screen.getByText(/SYNTHETIC DATA: Asteria-3/i)).toBeInTheDocument();
    expect(screen.getByText(/LOCAL ONLY/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Stored only in this browser; not durable or private from other users of this device./i)
    ).toBeInTheDocument();
  });

  it('renders Header with navigation items and CTA button', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Overview').length).toBeGreaterThan(0);
    expect(screen.getAllByText('How It Works').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Profiles & Rules').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About Limits').length).toBeGreaterThan(0);
    expect(screen.getAllByText('System Status').length).toBeGreaterThan(0);
    expect(screen.getByText('Asteria-3 Demo')).toBeInTheDocument();
  });

  it('renders Footer with mandatory scope notice and required legal wording', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Mandatory disclaimer
    expect(
      screen.getByText(/Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Not a certification, compliance determination, or official filing/i)).toBeInTheDocument();
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

    expect(screen.getByRole('heading', { level: 1, name: /Asteria-3 CubeSat/i })).toBeInTheDocument();
    expect(screen.getByText(/Workspace Flow Active/i)).toBeInTheDocument();
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
