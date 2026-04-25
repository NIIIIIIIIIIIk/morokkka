import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './OnboardingTooltip.module.css';

interface OnboardingTooltipProps {
  targetSelector: string;
  title: string;
  content: string;
  step: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  targetSelector,
  title,
  content,
  step,
  totalSteps,
  onNext,
  onSkip
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [arrowDirection, setArrowDirection] = useState<'top' | 'bottom'>('top');

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (target) {
      const rect = target.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      // Определяем, показывать тултип сверху или снизу
      if (spaceBelow < 250 && spaceAbove > 250) {
        // Показываем сверху
        setPosition({
          top: rect.top + window.scrollY - 10,
          left: rect.left + window.scrollX
        });
        setArrowDirection('bottom');
      } else {
        // Показываем снизу
        setPosition({
          top: rect.bottom + window.scrollY + 10,
          left: rect.left + window.scrollX
        });
        setArrowDirection('top');
      }
      
      // Подсветка целевого элемента
      target.classList.add(styles.highlighted);
      
      setTimeout(() => setIsVisible(true), 100);
    } else {
      console.warn(`Target element "${targetSelector}" not found`);
    }

    return () => {
      const target = document.querySelector(targetSelector);
      if (target) {
        target.classList.remove(styles.highlighted);
      }
    };
  }, [targetSelector]);

  return createPortal(
    <div 
      className={`${styles.tooltip} ${styles[arrowDirection]} ${isVisible ? styles.visible : ''}`}
      style={{ top: position.top, left: position.left }}
    >
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <span className={styles.counter}>{step}/{totalSteps}</span>
      </div>
      <div className={styles.content}>{content}</div>
      <div className={styles.actions}>
        <button onClick={onSkip} className={styles.skipButton}>
          ПРОПУСТИТЬ
        </button>
        <button onClick={onNext} className={styles.nextButton}>
          {step === totalSteps ? 'ЗАВЕРШИТЬ 🎬' : 'ДАЛЕЕ →'}
        </button>
      </div>
      <div className={styles.arrow} />
    </div>,
    document.body
  );
};