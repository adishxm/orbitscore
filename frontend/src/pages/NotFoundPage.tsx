import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import styles from './pages.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.pageRoot}>
      <div className={styles.centerContainer}>
        <Compass size={48} className={styles.icon404} aria-hidden="true" />
        <div className={styles.kicker}>Error 404 • Trajectory Lost</div>
        <h1 className={styles.title}>Requested Path Not Found</h1>
        <p className={styles.leadCenter}>
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
