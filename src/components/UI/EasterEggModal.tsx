import React, { useEffect, useState } from 'react';
import { EasterEgg } from '../../types';
import styles from './EasterEggModal.module.css';

interface EasterEggModalProps {
  egg: EasterEgg;
  onClose: () => void;
}

export const EasterEggModal: React.FC<EasterEggModalProps> = ({ egg, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Анимация появления
    setTimeout(() => setIsVisible(true), 50);

    // Автозакрытие через 5 секунд
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`${styles.overlay} ${isVisible ? styles.visible : ''} ${isLeaving ? styles.leaving : ''}`}
      onClick={handleClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.emoji}>{egg.emoji}</div>
        <div className={styles.message}>{egg.message}</div>
        <div className={styles.signature}>{egg.signature}</div>
        <div className={styles.hint}>кликни в любое место чтобы закрыть</div>
      </div>
    </div>
  );
};