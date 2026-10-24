import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { LandingPage } from '../pages/LandingPage';

describe('Slice 9: Reference Landing Page & Motion Layer', () => {
  it('renders hero section with headline, CTA links, and orbital schematic', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Headline and kicker
    expect(
      screen.getByRole('heading', { level: 1, name: /Organize Mission Evidence Before Human Review/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Evidence Preparation System/i)).toBeInTheDocument();

    // CTAs
    const demoCta = screen.getByRole('link', { name: /Open demo workspace/i });
    expect(demoCta).toBeInTheDocument();
    expect(demoCta).toHaveAttribute('href', '/missions/asteria-3');

    const howCta = screen.getByRole('link', { name: /How It Works/i });
    expect(howCta).toBeInTheDocument();
    expect(howCta).toHaveAttribute('href', '/how-it-works');

    // Metrics pills & Synthetic badges
    expect(screen.getByText('100% Deterministic Engine')).toBeInTheDocument();
    expect(screen.getByText('Zero Flight Safety Claims')).toBeInTheDocument();
    expect(screen.getAllByText('SYNTHETIC DEMO DATA').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Illustrative synthetic data — not live tracking, collision prediction, or operational guidance\./i)
    ).toBeInTheDocument();
  });

  it('renders truth-in-advertising section with What It Is vs What It Is Not', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('What OrbitScore Is')).toBeInTheDocument();
    expect(screen.getByText('What OrbitScore Is NOT')).toBeInTheDocument();

    // Specific honesty items
    expect(screen.getByText(/Primary Evidence Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Not a Flight Safety Certification/i)).toBeInTheDocument();
    expect(screen.getByText(/Not a Scoring or Grading System/i)).toBeInTheDocument();

    // Mandatory boundary disclaimer
    expect(
      screen.getAllByText(
        /Despite the name, OrbitScore does not score or certify missions; it organizes evidence for human review/i
      ).length
    ).toBeGreaterThan(0);
  });

  it('interactive 6-stage workflow stepper updates stage details on click', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Initial stage: Stage 01
    expect(screen.getByText(/Stage 01: Mission Context/i)).toBeInTheDocument();

    // Click Stage 04 (Deterministic Checks)
    const stage4Tab = screen.getByRole('tab', { name: /STAGE 04/i });
    fireEvent.click(stage4Tab);

    expect(screen.getByText(/Stage 04: Deterministic Checks/i)).toBeInTheDocument();
    expect(screen.getByText(/Execute pure, deterministic, rule-based verification checks/i)).toBeInTheDocument();

    // Click Stage 06 (Cited Export Dossier)
    const stage6Tab = screen.getByRole('tab', { name: /STAGE 06/i });
    fireEvent.click(stage6Tab);

    expect(screen.getByText(/Stage 06: Cited Export Dossier/i)).toBeInTheDocument();
  });

  it('interactive 5-state evidence model tabs update definition and example', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Initial state: confirmed
    expect(screen.getByText(/A human team member with named technical role has verified/i)).toBeInTheDocument();

    // Click 'conflicting' tab
    const conflictingTab = screen.getByRole('tab', { name: /Active source documents disagree/i });
    fireEvent.click(conflictingTab);

    expect(
      screen.getByText(/Multiple values exist across active engineering documents/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3\.82 kg in CAD model vs 4\.15 kg/i)).toBeInTheDocument();

    // Click 'out-of-scope' tab
    const outOfScopeTab = screen.getByRole('tab', { name: /Parameter belongs outside profile applicability/i });
    fireEvent.click(outOfScopeTab);

    expect(
      screen.getByText(/Parameter belongs to a subsystem, payload, or vehicle class outside/i)
    ).toBeInTheDocument();

    // Verify temporal stale notice is present
    expect(screen.getByText(/Temporal Currency Notice/i)).toBeInTheDocument();
  });

  it('renders traceability chain and synthetic fixtures launchers', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Traceability chain with honest human decision
    expect(screen.getByText('ICD-AST3-004')).toBeInTheDocument();
    expect(screen.getByText('Finding C-03')).toBeInTheDocument();
    expect(screen.getByText('Accepted for packet')).toBeInTheDocument();

    // Fixtures
    expect(screen.getByText('Asteria-3 Technology Demo')).toBeInTheDocument();
    expect(screen.getByText('Microsat-X ESPA Class')).toBeInTheDocument();

    const asteriaLinks = screen.getAllByRole('link', { name: /Launch Asteria-3 Workspace/i });
    expect(asteriaLinks.length).toBeGreaterThan(0);
    expect(asteriaLinks[0]).toHaveAttribute('href', '/missions/asteria-3');

    const microsatLink = screen.getByRole('link', { name: /Inspect Boundary Gate/i });
    expect(microsatLink).toHaveAttribute('href', '/missions/microsat-x');

    // Closing CTA
    expect(screen.getByText('Ready to Inspect Mission Evidence?')).toBeInTheDocument();
  });

  it('passes axe accessibility audit on the reference landing page', async () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const results = await axe.run(container);
    expect(results.violations).toHaveLength(0);
  });
});
