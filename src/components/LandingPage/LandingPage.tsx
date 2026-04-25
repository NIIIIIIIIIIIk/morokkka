import React, { useState, useEffect } from 'react';
import { NoButton } from './NoButton';
import { Button } from '../UI/Button';
import { EasterEggModal } from '../UI/EasterEggModal';
import { SuccessModal } from '../UI/SuccessModal';
import { unlockApp } from '../../utils/storage';
import { checkEasterEgg } from '../../utils/easterEggs';
import { trackVisit } from '../../utils/analytics';
import { PRODUCER_NAME } from '../../utils/constants';
import { EasterEgg } from '../../types'; // Добавляем импорт типа
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onUnlock: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onUnlock }) => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null); // Указываем тип
  const [denyAttempts, setDenyAttempts] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const handleConfirm = () => {
    if (isUnlocking) return; // Предотвращаем двойное нажатие
    setIsUnlocking(true);
    
    // Показываем модальное окно успеха
    setShowSuccessModal(true);
    
    // Проверяем пасхалку при разблокировке
    const egg = checkEasterEgg('unlock');
    if (egg) {
      setEasterEgg(egg);
      setShowEasterEgg(true);
    }
    
    trackVisit('unlock');
    unlockApp();
  };

  const handleSuccessComplete = () => {
    setShowSuccessModal(false);
    onUnlock();
  };

  const handleMemeShown = () => {
    setDenyAttempts(prev => prev + 1);
  };

  const getHintMessage = () => {
    if (denyAttempts === 0) {
      return 'Подсказка: попробуй нажать НЕТ 😏';
    } else if (denyAttempts === 1) {
      return 'Серьёзно? Опять? Нажимай ДА! ';
    } else if (denyAttempts >= 2) {
      return 'Ок, ты выиграла. Теперь ДА? 🎭';
    }
    return '';
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.terminal}>
          <div className={styles.header}>
            <span className={styles.project}>PROJECT: CINEMA_v2</span>
            <span className={styles.status}>Статус: НА УТВЕРЖДЕНИИ</span>
          </div>

          <div className={styles.content}>
            <div className={styles.line}>
              <span className={styles.prompt}>$</span> Для: {PRODUCER_NAME}
            </div>
            
            <div className={styles.line}>
              <span className={styles.prompt}>&gt;</span> От: NIK
            </div>

            <div className={styles.divider}>// ----------------------------------------</div>

            <div className={styles.proposal}>
              <div className={styles.proposalHeader}>CURRENT PROPOSAL:</div>
              <div className={styles.proposalItem}>
                <span className={styles.tag}>SCENE:</span> Дюна 3
              </div>
              <div className={styles.proposalItem}>
                <span className={styles.tag}>LOCATION:</span> Престижный, Люксовый - IMAX
              </div>
              <div className={styles.proposalItem}>
                <span className={styles.tag}>Дата:</span> Запрашивается
              </div>
              <div className={styles.proposalItem}>
                <span className={styles.tag}>Статус:</span> 
                <span className={styles.pending}>
                  НА УТВЕРЖДЕНИИ...
                  <span className={`${styles.cursor} ${cursorVisible ? styles.visible : ''}`}>_</span>
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="primary" size="large" onClick={handleConfirm}>
                Ёёёёёу (ДА!)
              </Button>
              <NoButton onShowMeme={handleMemeShown} />
            </div>
            
            <div className={styles.hint}>
              {getHintMessage()}
            </div>
          </div>

          <div className={styles.footer}>
          </div>
        </div>
      </div>
      
      {showSuccessModal && (
        <SuccessModal onComplete={handleSuccessComplete} />
      )}
      
      {showEasterEgg && easterEgg && (
        <EasterEggModal egg={easterEgg} onClose={() => setShowEasterEgg(false)} />
      )}
    </>
  );
};