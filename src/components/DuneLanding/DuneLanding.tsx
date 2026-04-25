import React, { useState, useEffect, useRef } from 'react';
import { ParallaxLayer } from './ParallaxLayer';
import { NoButton } from '../LandingPage/NoButton';
import { EasterEggModal } from '../UI/EasterEggModal';
import { DarkNetTransition } from '../UI/DarkNetTransition';
import { unlockApp } from '../../utils/storage';
import { checkEasterEgg } from '../../utils/easterEggs';
import { trackVisit } from '../../utils/analytics';
import { EasterEgg } from '../../types';
import { DIRECTOR_NAME, PRODUCER_NAME } from '../../utils/constants';
import { TelegramLink } from '../UI/TelegramLink';
import styles from './DuneLanding.module.css';
import { useNavigate } from 'react-router-dom';

interface DuneLandingProps {
  onUnlock?: () => void;
}

export const DuneLanding: React.FC<DuneLandingProps> = ({ onUnlock }) => {
  const navigate = useNavigate();
  const [showTransition, setShowTransition] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null); 
  const [denyAttempts, setDenyAttempts] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [spiceParticles, setSpiceParticles] = useState<Array<{ id: number; x: number; y: number; scale: number; delay: number }>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isFullyClosed, setIsFullyClosed] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isUnlockingRef = useRef(false);

  useEffect(() => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.3,
      delay: Math.random() * 5
    }));
    setSpiceParticles(particles);

    const fadeInInterval = setInterval(() => {
      setBgOpacity(prev => {
        if (prev < 1) {
          return Math.min(prev + 0.02, 1);
        }
        clearInterval(fadeInInterval);
        return prev;
      });
    }, 30);

    setTimeout(() => {
      const contentInterval = setInterval(() => {
        setContentOpacity(prev => {
          if (prev < 1) {
            return Math.min(prev + 0.03, 1);
          }
          clearInterval(contentInterval);
          return prev;
        });
      }, 30);
    }, 500);

    setTimeout(() => {
      setIsLoaded(true);
      const loader = document.querySelector('.loading-spice');
      if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 500);
      }
    }, 1000);

    return () => {
      clearInterval(fadeInInterval);
    };
  }, []);

  const handleConfirm = () => {
    console.log('Кнопка ДА нажата'); 
    if (isUnlocking || isUnlockingRef.current) return;
    
    isUnlockingRef.current = true;
    setIsUnlocking(true);
    
    // Запускаем закрытие экрана
    setIsClosing(true);
    
    // Ждем завершения анимации закрытия
    setTimeout(() => {
      setIsFullyClosed(true);
    }, 800);
    
    const egg = checkEasterEgg('unlock');
    if (egg) {
      setEasterEgg(egg);
      setShowEasterEgg(true);
    }
    
    trackVisit('unlock');
    unlockApp();
    
    if (onUnlock && typeof onUnlock === 'function') {
      onUnlock();
    }
    
    // Показываем переход через 2 секунды
    setTimeout(() => {
      setShowTransition(true);
    }, 2000);
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
    navigate('/app');
  };

  const handleMemeShown = () => {
    setDenyAttempts(prev => prev + 1);
  };

  const getDenyMessage = () => {
    const messages = ['...'];
    return messages[denyAttempts % messages.length];
  };

  const handleTelegramAnalytics = () => {
    console.log('Telegram link clicked');
  };

  return (
    <>
      <div className={`${styles.duneContainer} ${isClosing ? styles.closing : ''} ${isFullyClosed ? styles.fullyClosed : ''}`} ref={containerRef}>
        {/* Эффект закрывающегося экрана */}
        <div className={styles.screenClose}>
          <div className={styles.screenCloseTop} />
          <div className={styles.screenCloseBottom} />
        </div>
        
        {/* Полностью черный экран после закрытия */}
        <div className={styles.blackScreen} />
        
        {/* Статический шум при закрытии */}
        <div className={styles.staticOverlay} />
        
        {/* Текст на черном экране */}
        {isFullyClosed && (
          <div className={styles.closedMessage}>
            <div className={styles.messageText}>ИНИЦИАЛИЗАЦИЯ ПЕРЕХОДА</div>
            <div className={styles.messageDots}>
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}

        <div 
          className={styles.parallaxScene}
          style={{ 
            opacity: isClosing ? 0 : bgOpacity,
            transition: 'opacity 0.4s ease'
          }}
        >
          <ParallaxLayer 
            imageUrl="/image/fons/duna/duna.png"
            speed={0.1}
            className={styles.layerBase}
          />
          
          <div className={styles.spiceParticles}>
            {spiceParticles.map(particle => (
              <div
                key={particle.id}
                className={styles.spiceParticle}
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  transform: `scale(${particle.scale})`,
                  animationDelay: `${particle.delay}s`,
                  opacity: bgOpacity
                }}
              />
            ))}
          </div>
        </div> 

        <div 
          className={`${styles.content} ${isLoaded ? styles.loaded : ''}`}
          style={{ 
            opacity: isClosing ? 0 : contentOpacity,
            transition: 'opacity 0.3s ease'
          }}
        >
          <div className={styles.terminal}>
            <div className={styles.fremenBorder}>
              <div className={styles.cornerTopLeft} />
              <div className={styles.cornerTopRight} />
              <div className={styles.cornerBottomLeft} />
              <div className={styles.cornerBottomRight} />
            </div>

            <div className={styles.messageBox}>
              <div className={styles.line}>
                <span className={styles.prompt}>&gt;</span> 
                <span className={styles.fremen}>Для:</span> {PRODUCER_NAME}
              </div>
              
              <div className={styles.line}>
                <span className={styles.prompt}>&gt;</span> 
                <span className={styles.fremen}>От:</span> {DIRECTOR_NAME}
              </div>
              
              <div className={styles.line}>
                <span className={styles.prompt}>&gt;</span> 
                <span className={styles.spiceText}>Остановлено. Ожидает подтверждения...</span>
              </div>

              <div className={styles.divider}>
                <span className={styles.spice}></span>
              </div>

              <div className={styles.proposal}>
                <div className={styles.proposalHeader}>
                  <span className={styles.spice}>✦</span> PROJECT: CINEMA_v2
                  <span className={styles.spice}>✦</span>
                </div>
                
                <div className={styles.proposalItem}>
                  <span className={styles.tag}>SCENE:</span> 
                  <span className={styles.value}>Дюна: третья</span>
                </div>
                
                <div className={styles.proposalItem}>
                  <span className={styles.tag}>LOCATION:</span> 
                  <span className={styles.value}>Престижный люкс - IMAX</span>
                </div>
                
                <div className={styles.proposalItem}>
                  <span className={styles.tag}>TIME:</span> 
                  <span className={styles.value}>18 декабря 2026</span>
                </div>
                
                <div className={styles.statusLine}>
                  <span className={styles.tag}>Статус:</span> 
                  <span className={styles.pending}>
                    В ПРИОРИТЕТЕ
                    <span className={styles.cursor}>_</span>
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.confirmButton}
                onClick={handleConfirm}
                disabled={isUnlocking}
              >
                Ёёёёёёу (ДА!)
              </button>
              
              <div className={styles.denyWrapper}>
                <NoButton onShowMeme={handleMemeShown} />
                {denyAttempts > 0 && (
                  <div className={styles.denyMessage}>
                    {getDenyMessage()}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.footerLeft}>
                <span className={styles.footerText}>Вопросы:</span>
                <TelegramLink 
                  username="niiiiiiiiiiiiiiiii_iiiiiiik"
                  onAnalytics={handleTelegramAnalytics}
                />
              </div>
              <div className={styles.footerDivider}>
              </div>
              <div className={styles.footerRight}>
                <span className={styles.footerIcon}>⌬</span>
                <span className={styles.footerText}>БЕЗ ПРАВ И ОГРАНИЧЕНИЙ</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heatHaze} />
      </div>
      
      {showTransition && (
        <DarkNetTransition onComplete={handleTransitionComplete} />
      )}
      
      {showEasterEgg && easterEgg && (
        <EasterEggModal egg={easterEgg} onClose={() => setShowEasterEgg(false)} />
      )}
    </>
  );
};