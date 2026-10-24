import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { OrbitalContextCard } from '../components/workspace/OrbitalContextCard';
import { ASTERIA_3_MISSION } from '../fixtures/asteria-3';

describe('Orbital Context Component & Honesty Rules', () => {
  it('renders synthetic badges and mandatory persistent caption', () => {
    render(<OrbitalContextCard mission={ASTERIA_3_MISSION} />);

    // Mandatory badges
    expect(screen.getByText('SYNTHETIC DEMO DATA')).toBeInTheDocument();
    expect(screen.getByText('DEMO ONLY — NOT LIVE TRACKING')).toBeInTheDocument();

    // Mandatory persistent caption required by build brief
    const caption = screen.getByText(
      /Illustrative synthetic data — not live tracking, collision prediction, or operational guidance\./i
    );
    expect(caption).toBeInTheDocument();

    // Mission telemetry parameters
    expect(screen.getByText(ASTERIA_3_MISSION.target_orbit)).toBeInTheDocument();
    expect(screen.getByText('3U')).toBeInTheDocument();
  });

  it('renders National to Global Scalability Matrix details', () => {
    render(<OrbitalContextCard mission={ASTERIA_3_MISSION} />);

    expect(screen.getByText(/Scalability Framework: National to Global/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 1 — India ISRO DFSM 2030:/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2 — Global Guidelines:/i)).toBeInTheDocument();
  });

  it('switches to LIVE-SOURCE-CITED badge when liveMode is enabled', () => {
    render(<OrbitalContextCard mission={ASTERIA_3_MISSION} liveMode={true} />);

    expect(screen.getByText('LIVE-SOURCE-CITED')).toBeInTheDocument();
    expect(screen.getByText('SPACE-TRACK EPHEMERIS')).toBeInTheDocument();
    expect(screen.queryByText('SYNTHETIC DEMO DATA')).not.toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<OrbitalContextCard mission={ASTERIA_3_MISSION} />);
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
