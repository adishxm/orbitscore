import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Agent37Copilot } from '../components/workspace/Agent37Copilot';
import { useOrbitStore } from '../store/useOrbitStore';
import * as agent37Api from '../api/agent37';

describe('Agent 37 Copilot Integration', () => {
  beforeEach(() => {
    useOrbitStore.getState().resetDemo();
    vi.restoreAllMocks();
  });

  it('renders Agent 37 drawer when isOpen is true with instance badge and safety boundary', () => {
    render(<Agent37Copilot isOpen={true} onClose={() => {}} />);

    expect(screen.getByText(/Agent 37 Copilot/i)).toBeInTheDocument();
    expect(screen.getAllByText('z2dhn46l7d').length).toBeGreaterThan(0);
    expect(screen.getByText(/Bounded AI Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/Evidence Triage/i)).toBeInTheDocument();
    expect(screen.getByText(/Mission Assistant/i)).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Agent37Copilot isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText(/Agent 37 Copilot/i)).not.toBeInTheDocument();
  });

  it('switches between Evidence Triage and Mission Assistant tabs', () => {
    render(<Agent37Copilot isOpen={true} onClose={() => {}} />);

    const assistantTab = screen.getByRole('tab', { name: /Mission Assistant/i });
    fireEvent.click(assistantTab);

    expect(screen.getByText(/Frequently Asked Space Safety Questions/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask Agent 37 about orbital mechanics/i)).toBeInTheDocument();
  });

  it('imports extracted candidate evidence with strictly unconfirmed state', async () => {
    // Mock successful triage extraction
    vi.spyOn(agent37Api, 'triageExcerptWithAgent37').mockResolvedValueOnce({
      status: 'SUCCESS',
      provider: 'agent37_cloud_hermes',
      model_template: 'spacecraft-evidence-triage-v1',
      request_time: new Date().toISOString(),
      source_hash: 'hash_test_12345',
      candidates: [
        {
          field: 'disposal_duration_years',
          value: 4.5,
          unit: 'years',
          exact_quote: 'Post-mission disposal within 4.5 years via atmospheric drag',
          source_identifier: 'workspace_triage_box',
          uncertainty: 0.05,
          confidence_tier: 'HIGH',
          human_confirmed: false,
        },
      ],
      disclaimer: 'Agent37 candidate extraction only.',
    });

    render(<Agent37Copilot isOpen={true} onClose={() => {}} />);

    const triageButton = screen.getByRole('button', { name: /Run Agent 37 Candidate Extraction/i });
    fireEvent.click(triageButton);

    await waitFor(() => {
      expect(screen.getByText(/disposal_duration_years/i)).toBeInTheDocument();
    });

    const importButton = screen.getByRole('button', { name: /Import to Evidence/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText(/Imported as Candidate/i)).toBeInTheDocument();
    });

    // Check store has the item unconfirmed
    const currentItems = useOrbitStore.getState().evidence['asteria-3'] || [];
    const importedItem = currentItems.find((i) => i.parameter_key === 'disposal_duration_years');
    expect(importedItem).toBeDefined();
    expect(importedItem?.state).toBe('unconfirmed');
    expect(importedItem?.value).toBe(4.5);
    expect(importedItem?.human_confirmed_by).toBeUndefined();
  });
});
