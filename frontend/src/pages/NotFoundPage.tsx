import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import styles from './pages.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-4)' }}>
        <Compass size={48} style={{ color: 'var(--color-state-conflicting)', margin: '0 auto var(--space-4)' }} />
        <div className={styles.kicker}>Error 404 • Trajectory Lost</div>
        <h1 className={styles.title}>Requested Path Not Found</h1>
        <p className={styles.lead} style={{ margin: '0 auto var(--space-8)' }}>
          The requested route does not correspond to an active OrbitScore mission workspace or resource.
        </p>
        <Link to="/" className={styles.actionButton}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
