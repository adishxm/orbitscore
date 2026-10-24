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
    const demoCta = screen.getByRole('link', { name: /Open Asteria-3 Demo/i });
    expect(demoCta).toBeInTheDocument();
    expect(demoCta).toHaveAttribute('href', '/missions/asteria-3');

    const howCta = screen.getByRole('link', { name: /How It Works/i });
    expect(howCta).toBeInTheDocument();
    expect(howCta).toHaveAttribute('href', '/how-it-works');

    // Metrics pills
    expect(screen.getByText('100% Deterministic Engine')).toBeInTheDocument();
    expect(screen.getByText('Zero Flight Safety Claims')).toBeInTheDocument();
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

    // Initial state: missing
    expect(screen.getByText(/A required baseline parameter has no citation or entry/i)).toBeInTheDocument();

    // Click 'conflicting' tab
    const conflictingTab = screen.getByRole('tab', { name: /CONFLICTING/i });
    fireEvent.click(conflictingTab);

    expect(
      screen.getByText(/Multiple values exist across active engineering documents/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/3\.82 kg in CAD model vs 4\.15 kg/i)).toBeInTheDocument();

    // Click 'stale' tab
    const staleTab = screen.getByRole('tab', { name: /STALE/i });
    fireEvent.click(staleTab);

    expect(
      screen.getByText(/The cited document revision or test record predates/i)
    ).toBeInTheDocument();
  });

  it('renders traceability chain and synthetic fixtures launchers', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Traceability chain
    expect(screen.getByText('ICD-AST3-004')).toBeInTheDocument();
    expect(screen.getByText('Finding C-03')).toBeInTheDocument();
    expect(screen.getByText('Waiver Granted')).toBeInTheDocument();

    // Fixtures
    expect(screen.getByText('Asteria-3 Technology Demo')).toBeInTheDocument();
    expect(screen.getByText('Microsat-X ESPA Class')).toBeInTheDocument();

    const asteriaLink = screen.getByRole('link', { name: /Launch Asteria-3 Workspace/i });
    expect(asteriaLink).toHaveAttribute('href', '/missions/asteria-3');

    const microsatLink = screen.getByRole('link', { name: /Inspect Boundary Gate/i });
    expect(microsatLink).toHaveAttribute('href', '/missions/microsat-x');
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
