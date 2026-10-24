import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">
        <h1>OrbitScore</h1>
        <p>
          A source-linked, human-reviewed workspace that helps student, university, and small
          spacecraft teams organize mission evidence before qualified expert review.
        </p>
      </main>
    </div>
  );
};

export default App;
