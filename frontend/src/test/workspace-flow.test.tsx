import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { StateChip } from '../components/common/StateChip';
import { Stepper, WorkspaceStep } from '../components/workspace/Stepper';
import { MissionContextCard } from '../components/workspace/MissionContextCard';
import { DataTable } from '../components/workspace/DataTable';
import { SidePanel } from '../components/workspace/SidePanel';
import { MissionWorkspacePage } from '../pages/MissionWorkspacePage';
import { useOrbitStore } from '../store/useOrbitStore';
import { ASTERIA_3_MISSION, ASTERIA_3_EVIDENCE } from '../fixtures/asteria-3';

describe('Slice 5: Workspace Flow, Context & Evidence Register', () => {
  beforeEach(() => {
    useOrbitStore.getState().resetDemo();
  });

  describe('StateChip Component', () => {
    it('renders all 5 evidence states with distinct text labels and icons', () => {
      const { rerender } = render(<StateChip state="confirmed" />);
      expect(screen.getByText('Confirmed')).toBeInTheDocument();

      rerender(<StateChip state="unconfirmed" />);
      expect(screen.getByText('Unconfirmed')).toBeInTheDocument();

      rerender(<StateChip state="conflicting" />);
      expect(screen.getByText('Conflicting')).toBeInTheDocument();

      rerender(<StateChip state="stale" />);
      expect(screen.getByText('Stale')).toBeInTheDocument();

      rerender(<StateChip state="missing" />);
      expect(screen.getByText('Missing')).toBeInTheDocument();
    });
  });

  describe('Stepper Component', () => {
    it('renders all 6 workflow stages and fires onStepChange on click', () => {
      let active: WorkspaceStep = 'evidence';
      const handleStepChange = (newStep: WorkspaceStep) => {
        active = newStep;
      };

      render(
        <Stepper
          currentStep={active}
          onStepChange={handleStepChange}
          completedSteps={['context']}
        />
      );

      expect(screen.getByText('1. Mission Context')).toBeInTheDocument();
      expect(screen.getByText('2. Evidence Register')).toBeInTheDocument();
      expect(screen.getByText('3. Profile Gate')).toBeInTheDocument();
      expect(screen.getByText('4. Findings')).toBeInTheDocument();
      expect(screen.getByText('5. Review Decisions')).toBeInTheDocument();
      expect(screen.getByText('6. Export Packet')).toBeInTheDocument();

      fireEvent.click(screen.getByText('3. Profile Gate'));
      expect(active).toBe('profile');
    });
  });

  describe('MissionContextCard Component', () => {
    it('displays mission metadata and summary counts', () => {
      render(
        <MissionContextCard
          mission={ASTERIA_3_MISSION}
          evidence={ASTERIA_3_EVIDENCE}
        />
      );

      expect(screen.getByText(ASTERIA_3_MISSION.name)).toBeInTheDocument();
      expect(screen.getByText('3U')).toBeInTheDocument();
      expect(screen.getByText('4.00 kg')).toBeInTheDocument();
      expect(screen.getByText(/REGISTERED EVIDENCE:/i)).toBeInTheDocument();
      expect(screen.getByText('SYNTHETIC DEMO DATA')).toBeInTheDocument();
    });

    it('allows editing mission parameters when onUpdateMission is provided', () => {
      let updatedData = {};
      const handleUpdate = (updates: any) => {
        updatedData = updates;
      };

      render(
        <MissionContextCard
          mission={ASTERIA_3_MISSION}
          evidence={ASTERIA_3_EVIDENCE}
          onUpdateMission={handleUpdate}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: /Edit mission parameters/i }));
      const nameInput = screen.getByLabelText(/Mission Name/i) as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'Asteria-3 Updated Flight Name' } });

      fireEvent.click(screen.getByText('Save Context'));
      expect(updatedData).toMatchObject({ name: 'Asteria-3 Updated Flight Name' });
    });
  });

  describe('DataTable Component', () => {
    it('renders evidence rows and filters via search input', () => {
      let selected: string | null = null;
      render(
        <DataTable
          items={ASTERIA_3_EVIDENCE}
          selectedId={selected}
          onSelectItem={(id) => {
            selected = id;
          }}
        />
      );

      expect(screen.getAllByText('Total Measured Wet Mass')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Stowed Envelope Dimensions')[0]).toBeInTheDocument();

      // Search for thermal
      const searchInput = screen.getByPlaceholderText(/Search parameter/i);
      fireEvent.change(searchInput, { target: { value: 'thermal' } });

      expect(screen.getAllByText('Thermal Vacuum Cycling Report')[0]).toBeInTheDocument();
      expect(screen.queryByText('Stowed Envelope Dimensions')).not.toBeInTheDocument();
    });

    it('filters rows by evidence state', () => {
      render(
        <DataTable
          items={ASTERIA_3_EVIDENCE}
          selectedId={null}
          onSelectItem={() => {}}
        />
      );

      const stateFilter = screen.getByLabelText(/Filter by evidence state/i);
      fireEvent.change(stateFilter, { target: { value: 'conflicting' } });

      expect(screen.getAllByText('Total Measured Wet Mass')[0]).toBeInTheDocument();
      expect(screen.queryByText('Stowed Envelope Dimensions')).not.toBeInTheDocument();
    });

    it('fires onSelectItem when a table row is clicked', () => {
      let selected: string | null = null;
      render(
        <DataTable
          items={ASTERIA_3_EVIDENCE}
          selectedId={selected}
          onSelectItem={(id) => {
            selected = id;
          }}
        />
      );

      fireEvent.click(screen.getAllByText('Total Measured Wet Mass')[0]!);
      expect(selected).toBe('ev-ast3-01');
    });
  });

  describe('SidePanel Inspector Component', () => {
    it('displays source document citation details and conflicting values alert', () => {
      const conflictingItem = ASTERIA_3_EVIDENCE.find((e) => e.state === 'conflicting')!;

      render(
        <SidePanel
          item={conflictingItem}
          onClose={() => {}}
          onConfirm={() => {}}
        />
      );

      expect(screen.getByText('Asteria-3 Master Interface Control Document')).toBeInTheDocument();
      expect(screen.getByText(/Discrepancy: Diverging Values Detected Across Records/i)).toBeInTheDocument();
      expect(screen.getByText(/CAD Master Assembly Solid Model/i)).toBeInTheDocument();
    });

    it('submits human confirmation with reviewer name and role', () => {
      const unconfirmedItem = ASTERIA_3_EVIDENCE.find((e) => e.state === 'unconfirmed')!;
      let confirmedData: { id: string; name: string } | null = null;

      render(
        <SidePanel
          item={unconfirmedItem}
          onClose={() => {}}
          onConfirm={(id, name) => {
            confirmedData = { id, name };
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(/Dr. Alex Vance/i);
      fireEvent.change(nameInput, { target: { value: 'Dr. Jane Smith (Power Lead)' } });

      fireEvent.click(screen.getByText('Record Human Confirmation'));
      expect(confirmedData).toEqual({
        id: unconfirmedItem.id,
        name: 'Dr. Jane Smith (Power Lead)',
      });
    });
  });

  describe('Full Workspace Integration', () => {
    it('renders the complete workspace and promotes an item to confirmed', async () => {
      render(
        <MemoryRouter initialEntries={['/missions/asteria-3']}>
          <MissionWorkspacePage />
        </MemoryRouter>
      );

      expect(screen.getByText('Asteria-3 Technology Demonstration CubeSat')).toBeInTheDocument();
      expect(screen.getAllByText('Total Measured Wet Mass')[0]).toBeInTheDocument();

      // Click on unconfirmed battery item
      fireEvent.click(screen.getAllByText('Battery Vacuum Runaway Test Record')[0]!);

      // SidePanel should be open
      expect(
        screen.getAllByText('Battery Vendor Acceptance Screening Document').length
      ).toBeGreaterThanOrEqual(2);

      // Confirm the item
      const reviewerInput = screen.getByPlaceholderText(/Dr. Alex Vance/i);
      fireEvent.change(reviewerInput, { target: { value: 'Lead Flight Director' } });
      fireEvent.click(screen.getByText('Record Human Confirmation'));

      // Check store reflects confirmation
      const storeItem = useOrbitStore
        .getState()
        .evidence['asteria-3']?.find((e) => e.parameter_key === 'battery_screening_report');

      expect(storeItem?.state).toBe('confirmed');
      expect(storeItem?.human_confirmed_by).toBe('Lead Flight Director');
    });

    it('restores clean synthetic demo data when Reset Demo Data is clicked', () => {
      render(
        <MemoryRouter initialEntries={['/missions/asteria-3']}>
          <MissionWorkspacePage />
        </MemoryRouter>
      );

      const resetBtn = screen.getByRole('button', { name: /Reset Demo Data/i });
      expect(resetBtn).toBeInTheDocument();
      fireEvent.click(resetBtn);

      const items = useOrbitStore.getState().evidence['asteria-3'] || [];
      expect(items.length).toBeGreaterThan(0);
    });

    it('passes axe accessibility audit on workspace layout', async () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/missions/asteria-3']}>
          <MissionWorkspacePage />
        </MemoryRouter>
      );

      const results = await axe.run(container);
      expect(results.violations).toEqual([]);
    });
  });
});
