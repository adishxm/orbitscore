import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { LandingPage } from '../pages/LandingPage';

describe('Slice 9: Aerospace Telemetry Landing Page & Deterministic Command Engine', () => {
  it('renders hero section with real satellite fleet, TLE box, and telemetry grid', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Headline and punchline
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /DETERMINISTIC SPACECRAFT VERIFICATION & LIVE ORBITAL TELEMETRY/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Lock NORAD ephemeris vectors, CAD mass budgets, and thermal vacuum logs/i)
    ).toBeInTheDocument();

    // Spacecraft fleet tabs (EOS-06, Sentinel-6, CAPSTONE, Landsat-9)
    expect(screen.getByRole('tab', { name: /EOS-06/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /SENTINEL-6A/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /CAPSTONE/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /LANDSAT-9/i })).toBeInTheDocument();

    // 8-cell telemetry readouts
    expect(screen.getByText('NORAD CAT ID')).toBeInTheDocument();
    expect(screen.getByText('COSPAR ID')).toBeInTheDocument();
    expect(screen.getByText('APOGEE / PERIGEE')).toBeInTheDocument();
    expect(screen.getByText('ORBITAL VELOCITY')).toBeInTheDocument();

    // Raw TLE Inspector box and action buttons
    expect(screen.getByText(/RAW CELESTRAK TWO-LINE ELEMENT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SYNC LIVE CELESTRAK GP/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /LAUNCH WORKSPACE/i })).toBeInTheDocument();
  });

  it('switches real spacecraft and updates telemetry readouts and TLE on tab click', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Initial spacecraft is EOS-06 [54361]
    expect(screen.getByText('54361')).toBeInTheDocument();
    expect(screen.getByText('2022-158A')).toBeInTheDocument();

    // Switch to Sentinel-6A [46984]
    const sentinelTab = screen.getByRole('tab', { name: /SENTINEL-6A/i });
    fireEvent.click(sentinelTab);

    expect(screen.getByText('46984')).toBeInTheDocument();
    expect(screen.getByText('2020-086A')).toBeInTheDocument();
  });

  it('renders 6-vector orbital telemetry HUD strips with metrics', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/01 \/\/ ORBITAL EPHEMERIS/i)).toBeInTheDocument();
    expect(screen.getByText(/02 \/\/ DEBRIS FLUX & CONJUNCTION/i)).toBeInTheDocument();
    expect(screen.getByText(/03 \/\/ DETERMINISTIC RULE ENGINE/i)).toBeInTheDocument();
    expect(screen.getByText(/04 \/\/ SHA-256 PROVENANCE LEDGER/i)).toBeInTheDocument();
    expect(screen.getByText(/05 \/\/ HUMAN AUTHORITY GATE/i)).toBeInTheDocument();
    expect(screen.getByText(/06 \/\/ REGULATORY MISSION DOSSIER/i)).toBeInTheDocument();
  });

  it('renders engineering benchmark matrix comparing legacy manual vs OrbitScore', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /ELIMINATE SPREADSHEET DRIFT BEFORE FLIGHT READINESS REVIEW/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Cross-Document Audit Time')).toBeInTheDocument();
    expect(screen.getByText('CAD-to-ICD Mass Discrepancy Catch Rate')).toBeInTheDocument();
    expect(screen.getByText('TLE Ephemeris Synchronization')).toBeInTheDocument();
  });

  it('interactive 6-stage phase gate stepper updates gate technical specs on click', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Initial stage: STAGE 00
    expect(
      screen.getByText(/Mean motion bounds, orbital decay velocity vectors/i)
    ).toBeInTheDocument();

    // Click Stage 03 (Deterministic Evaluation)
    const stage3Tab = screen.getByRole('tab', { name: /STAGE 03/i });
    fireEvent.click(stage3Tab);

    expect(
      screen.getByText(/Pure mathematical checks: mass margin, thermal bounds/i)
    ).toBeInTheDocument();

    // Click Stage 05 (SHA-256 Dossier Export)
    const stage5Tab = screen.getByRole('tab', { name: /STAGE 05/i });
    fireEvent.click(stage5Tab);

    expect(
      screen.getByText(/Generates portable JSON and Markdown audit packets ready for regulatory review/i)
    ).toBeInTheDocument();
  });

  it('filters subsystem parameters by discipline category', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Filter to Structural & ICD
    const structuralBtn = screen.getByRole('button', { name: /STRUCTURAL & ICD/i });
    fireEvent.click(structuralBtn);

    expect(screen.getByText('RULE-STR-03')).toBeInTheDocument();
    expect(screen.getByText('RULE-STR-04')).toBeInTheDocument();
  });

  it('interactive 5-state evidence taxonomy updates state console on click', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    // Click 'CONFLICTING' state tab
    const conflictingTab = screen.getByRole('tab', { name: /CONFLICTING/i });
    fireEvent.click(conflictingTab);

    expect(screen.getByText(/STATE INSPECTION: CONFLICTING/i)).toBeInTheDocument();
    expect(
      screen.getByText(/CAD model Z-axis CG at 142\.4 mm exceeds PSLV dispenser interface/i)
    ).toBeInTheDocument();
  });

  it('renders cryptographic audit lineage and live FastAPI engine status console', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/END-TO-END CRYPTOGRAPHIC SHA-256 AUDIT LINEAGE/i)).toBeInTheDocument();
    expect(screen.getByText(/SOURCE ARTIFACT CITATION/i)).toBeInTheDocument();
    expect(screen.getByText(/DETERMINISTIC RULE EXECUTION/i)).toBeInTheDocument();
    expect(screen.getByText(/CHIEF ENGINEER SIGN-OFF PACKET/i)).toBeInTheDocument();

    // FastApi engine status bar
    expect(screen.getByText(/SQLITE WAL PERSISTENCE:/i)).toBeInTheDocument();
    expect(screen.getByText(/CHIEF ENGINEER GATE:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /VERIFY MERKLE CHAIN/i })).toBeInTheDocument();
  });

  it('passes axe accessibility audit on the reference landing page', async () => {
    const { container } = render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
