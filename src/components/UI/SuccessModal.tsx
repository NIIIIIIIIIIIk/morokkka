import React, { useEffect, useState } from 'react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  onComplete: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);

    const timer = setTimeout(() => {
      handleClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div 
      className={`${styles.overlay} ${isVisible ? styles.visible : ''} ${isLeaving ? styles.leaving : ''}`}
      onClick={handleClose}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Текстовая анимация вместо изображения */}
        <div className={styles.textAnimation}>
          <div className={styles.clapperboardLarge}>🎬</div>
          <div className={styles.sceneText}>SCENE 1</div>
          <div className={styles.takeText}>TAKE 1</div>
          <div className={styles.actionText}>ACTION!</div>
        </div>
        
        <div className={styles.message}>
          <span className={styles.emoji}></span>
          GREENLIT!
          <span className={styles.emoji}></span>
        </div>
        <div className={styles.subtitle}>
          Project approved by Producer
        </div>
        <div className={styles.hint}>
          кликни в любое место чтобы продолжить
        </div>
      </div>
    </div>
  );
};