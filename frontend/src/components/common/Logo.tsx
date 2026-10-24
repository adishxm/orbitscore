import React from 'react';
import styles from './Logo.module.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  return (
    <div className={`${styles.logoWrap} ${styles[size]}`}>
      <svg
        className={styles.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="#090D12" stroke="#1C2530" strokeWidth="2" />
        <ellipse
          cx="32"
          cy="32"
          rx="24"
          ry="10"
          transform="rotate(-30 32 32)"
          stroke="#00A1FF"
          strokeWidth="2.5"
          strokeDasharray="4 2"
        />
        <ellipse
          cx="32"
          cy="32"
          rx="24"
          ry="10"
          transform="rotate(30 32 32)"
          stroke="#9DAEC2"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <circle cx="44" cy="22" r="4.5" fill="#00A1FF" />
        <circle cx="44" cy="22" r="2" fill="#FFFFFF" />
      </svg>
      {showText && (
        <span className={styles.brandName}>OrbitScore</span>
      )}
    </div>
  );
};

export default Logo;
