import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConjunctionWorkspacePage } from '../pages/ConjunctionWorkspacePage';
import { OrbitalEnvironmentPage } from '../pages/OrbitalEnvironmentPage';
import { ScenarioComparisonPage } from '../pages/ScenarioComparisonPage';
import { MissionsListPage } from '../pages/MissionsListPage';

describe('Extended Workspaces & Mission Capabilities', () => {
  it('renders ConjunctionWorkspacePage with disclaimer and screening tables', async () => {
    render(
      <MemoryRouter>
        <ConjunctionWorkspacePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Conjunction Assessment & Close-Approach Registry/i)).toBeInTheDocument();
    expect(screen.getByText(/NON-OPERATIONAL SCREENING NOTICE/i)).toBeInTheDocument();
    expect(screen.getByText(/Screened Events/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by object name, NORAD ID, or event/i)).toBeInTheDocument();
  });

  it('renders OrbitalEnvironmentPage with schematic notice and altitude bands', async () => {
    render(
      <MemoryRouter>
        <OrbitalEnvironmentPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Orbital Environment, Debris Density & Ground Track/i)).toBeInTheDocument();
    expect(screen.getByText(/SCHEMATIC VISUALIZATION NOTICE/i)).toBeInTheDocument();
    expect(screen.getByText(/Sub-Satellite Ground Track/i)).toBeInTheDocument();
    expect(screen.getByText(/LEO Debris Density Bands/i)).toBeInTheDocument();
    expect(screen.getByText(/Debris Flux Exposure Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Sourced CelesTrak GP Elements/i)).toBeInTheDocument();
  });

  it('renders ScenarioComparisonPage and updates counterfactual levers', async () => {
    render(
      <MemoryRouter>
        <ScenarioComparisonPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Scenario & Architecture Comparison/i)).toBeInTheDocument();
    expect(screen.getByText(/ILLUSTRATIVE TRADE-OFF STUDY NOTICE/i)).toBeInTheDocument();
    expect(screen.getByText(/Current Baseline/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Counterfactual Architecture/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Guideline Alignment Matrix/i).length).toBeGreaterThan(0);

    // Toggle deorbit device
    const select = screen.getByLabelText(/Post-Mission Disposal Device/i);
    fireEvent.change(select, { target: { value: 'PROPULSION' } });
    expect(screen.getByText(/Low-Thrust Chemical Propulsion Module/i)).toBeInTheDocument();
  });

  it('renders MissionsListPage with asset portfolio and opens registration dialog', async () => {
    render(
      <MemoryRouter>
        <MissionsListPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Select or Initialize Mission Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/Asteria-3 Mission/i)).toBeInTheDocument();
    expect(screen.getByText(/Microsat-X Test Vehicle/i)).toBeInTheDocument();

    const registerBtn = screen.getByRole('button', { name: /Register new mission profile/i });
    expect(registerBtn).toBeInTheDocument();

    fireEvent.click(registerBtn);
    expect(screen.getByText(/Asset Onboarding/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MISSION IDENTIFIER/i)).toBeInTheDocument();
  });
});
