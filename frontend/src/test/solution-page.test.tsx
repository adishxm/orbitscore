import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SolutionPage } from '../pages/SolutionPage';

describe('SolutionPage Component (OrbitScore Aerospace Solution)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                status: 'ok',
                version: '0.1.0',
                uptime: '1240s',
                integrations: {
                  celestrak: { status: 'healthy', cache_ttl: '7200s' },
                  spacetrack: { status: 'configured' },
                },
              }),
          });
        }
        return Promise.reject(new Error('not found'));
      })
    );
  });

  it('renders the aerospace Hero with verified orbital copy', () => {
    render(
      <MemoryRouter>
        <SolutionPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Space Needs/i })).toBeInTheDocument();
    expect(screen.getByText(/Verified Orbital Evidence/i)).toBeInTheDocument();
    expect(screen.getByText(/36,000\+/i)).toBeInTheDocument();
    expect(screen.getByText(/900,000\+/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1T\+/i)).toBeInTheDocument();
    expect(screen.getAllByText(/2-Hour/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the 4 core feature cards under Intelligence for a Safer Orbit', () => {
    render(
      <MemoryRouter>
        <SolutionPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /Intelligence for a Safer Orbit/i })).toBeInTheDocument();
    expect(screen.getByText('Mission Workspaces')).toBeInTheDocument();
    expect(screen.getByText('API & Ephemeris Access')).toBeInTheDocument();
    expect(screen.getByText('AI & ML Predictions')).toBeInTheDocument();
    expect(screen.getByText('Custom Simulations & Gating')).toBeInTheDocument();
  });

  it('renders the AI & ML Roadmap with status badges matching aerospace specification', () => {
    render(
      <MemoryRouter>
        <SolutionPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /AI & ML Roadmap/i })).toBeInTheDocument();
    expect(screen.getByText(/"Built on NASA data. Scaled by AI."/i)).toBeInTheDocument();
    expect(screen.getAllByText('Live Today').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('In Development').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('Future Vision').length).toBeGreaterThanOrEqual(3);
  });

  it('allows switching between interactive backend capability tabs', async () => {
    render(
      <MemoryRouter>
        <SolutionPage />
      </MemoryRouter>
    );

    // Initial tab is SGP4 Propagator
    expect(screen.getByText(/CelesTrak Ephemeris Cache/i)).toBeInTheDocument();

    // Click Deterministic Checks tab
    const rulesTabBtn = screen.getByRole('button', { name: /Deterministic Checks/i });
    fireEvent.click(rulesTabBtn);
    expect(screen.getByText(/C-01 to C-06 Pure Logic/i)).toBeInTheDocument();

    // Click Decay ML Model tab
    const mlTabBtn = screen.getByRole('button', { name: /Decay ML Model/i });
    fireEvent.click(mlTabBtn);
    expect(screen.getByText(/GradientBoostingRegressor/i)).toBeInTheDocument();
  });

  it('probes and displays backend live status from /api/health', async () => {
    render(
      <MemoryRouter>
        <SolutionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ONLINE \(200 OK\)/i)).toBeInTheDocument();
    });
  });
});
