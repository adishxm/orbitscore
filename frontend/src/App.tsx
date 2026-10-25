import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { useOrbitStore } from './store/useOrbitStore';

// Route Pages
import { LandingPage } from './pages/LandingPage';
import { SolutionPage } from './pages/SolutionPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { AboutLimitsPage } from './pages/AboutLimitsPage';
import { StatusPage } from './pages/StatusPage';
import { MissionsListPage } from './pages/MissionsListPage';
import { MissionWorkspacePage } from './pages/MissionWorkspacePage';
import { ConjunctionWorkspacePage } from './pages/ConjunctionWorkspacePage';
import { OrbitalEnvironmentPage } from './pages/OrbitalEnvironmentPage';
import { ScenarioComparisonPage } from './pages/ScenarioComparisonPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const AppContent: React.FC = () => {
  useEffect(() => {
    // Automatically connect frontend to the live FastAPI backend on startup
    useOrbitStore.getState().setApiMode('live').catch(() => {});
  }, []);

  return (
    <div
      className="app-root relative min-h-screen text-[#ffffff]"
      style={{
        backgroundImage: 'url(/background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: '#000000',
      }}
    >
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-[#0d9488] focus:text-[#FFFFFF]">
        Skip to main content
      </a>

      {/* Sticky Full-Bleed Command Header */}
      <Header />

      <main id="main-content" tabIndex={-1} className="relative z-10 w-full focus:outline-none">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/solution" element={<SolutionPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/about-limits" element={<AboutLimitsPage />} />
          <Route path="/status" element={<StatusPage />} />

          {/* Dedicated Spacecraft, Conjunction & Environment Workspaces */}
          <Route path="/conjunctions" element={<ConjunctionWorkspacePage />} />
          <Route path="/orbital-environment" element={<OrbitalEnvironmentPage />} />
          <Route path="/scenarios" element={<ScenarioComparisonPage />} />

          {/* Missions listing & workspace routes */}
          <Route path="/missions" element={<MissionsListPage />} />
          <Route path="/missions/:id" element={<MissionWorkspacePage />} />
          <Route path="/app/missions" element={<MissionsListPage />} />
          <Route path="/app/missions/:id" element={<MissionWorkspacePage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Full-Bleed Aerospace Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
