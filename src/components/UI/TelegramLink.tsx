import React from 'react';
import styles from './TelegramLink.module.css';

interface TelegramLinkProps {
  username?: string;
  onAnalytics?: () => void;
  className?: string;
}

export const TelegramLink: React.FC<TelegramLinkProps> = ({ 
  username = 'niiiiiiiiiiiiiiiii_iiiiiiik',
  onAnalytics,
  className 
}) => {
  const handleClick = () => {
    if (onAnalytics) {
      onAnalytics();
    }
    window.open(`https://t.me/${username.replace('@', '')}`, '_blank');
  };

  return (
    <button 
      className={`${styles.telegramButton} ${className || ''}`}
      onClick={handleClick}
    >
      <span className={styles.telegramIcon}>⌬</span>
      <span className={styles.telegramText}>@</span>
      <span className={styles.telegramUsername}>{username}</span>
    </button>
  );
};