import React, { useState, useEffect, useRef } from 'react';
import styles from './Hub.module.css';
import { useNavigate } from 'react-router-dom';

// Динамическая загрузка Swiper с CDN
const loadSwiper = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && !(window as any).Swiper) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      script.onload = () => resolve((window as any).Swiper);
      document.body.appendChild(script);
    } else {
      resolve((window as any).Swiper);
    }
  });
};

interface LandingCard {
  id: string;
  title: string;
  path: string;
  status: 'active' | 'locked' | 'coming';
  color: string;
  icon: string;
  description: string;
  backgroundImage: string;
}

const LANDINGS: LandingCard[] = [
  {
    id: 'dune',
    title: '',
    path: '/dune', // HashRouter сам добавит #
    status: 'active',
    color: '#e6b450',
    icon: '◈',
    description: 'нажми для продолжения',
    backgroundImage: '/image/fons/duna/duna.png'
  }
];

export const Hub: React.FC = () => {
  const navigate = useNavigate(); // Добавляем useNavigate
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  
  const [bgScale, setBgScale] = useState(1);
  const [bgBlur, setBgBlur] = useState(6);
  const [bgBrightness, setBgBrightness] = useState(0.35);
  
  const [isSliding, setIsSliding] = useState(false);
  
  const [cardTransform, setCardTransform] = useState({ rotateX: 0, rotateY: 0, translateZ: 0 });
  const [glowTransform, setGlowTransform] = useState({ x: 0, y: 0 });
  const [glowScale, setGlowScale] = useState(1);
  const [lightOpacity, setLightOpacity] = useState(0.6);


  // Инициализация Swiper
  useEffect(() => {
    loadSwiper().then((SwiperModule: any) => {
      if (swiperContainerRef.current && !swiperInstance) {
        const swiper = new SwiperModule(swiperContainerRef.current, {
          effect: 'cards',
          grabCursor: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          cardsEffect: {
            perSlideOffset: 8,
            perSlideRotate: 2,
            rotate: true,
            slideShadows: true,
          },
          on: {
            slideChange: (s: any) => {
              setActiveIndex(s.activeIndex);
              animateSlideTransition();
            },
          },
          mousewheel: {
            forceToAxis: true,
            sensitivity: 0.5,
          },
          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },
        });
        setSwiperInstance(swiper);
      }
    });
  }, []);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (isTransitioning) return;
      
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      setCardTransform({
        rotateX: y * 8,
        rotateY: x * 12,
        translateZ: 20
      });
      
      setGlowTransform({ x: x * 40, y: y * 25 });
    };
    
    const pulseInterval = setInterval(() => {
      setGlowScale(1 + Math.random() * 0.1);
      setLightOpacity(0.5 + Math.random() * 0.2);
    }, 3000);

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(pulseInterval);
    };
  }, [isTransitioning]);

  const animateSlideTransition = () => {
    setIsSliding(true);
    
    setBgScale(1.05);
    setBgBrightness(0.25);
    setBgBlur(8);
    setLightOpacity(0.8);
    setGlowScale(1.2);
    setCardTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
    
    setTimeout(() => {
      setBgScale(1);
      setBgBrightness(0.35);
      setBgBlur(6);
      setLightOpacity(0.6);
      setGlowScale(1);
      setIsSliding(false);
    }, 400);
  };

   const handleCardClick = (card: LandingCard) => {
    if (card.status === 'active' && activeIndex === LANDINGS.findIndex(c => c.id === card.id)) {
      setSelectedCard(card.id);
      setIsTransitioning(true);
      
      const startTime = Date.now();
      const duration = 1200;
      
      const animateTransition = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        setBgScale(1 + easeProgress * 0.3);
        setBgBlur(6 - easeProgress * 5);
        setBgBrightness(0.35 + easeProgress * 0.25);
        setLightOpacity(0.6 - easeProgress * 0.6);
        setGlowScale(1 - easeProgress * 1);
        setCardTransform({ rotateX: 0, rotateY: 0, translateZ: 0 });
        
        if (progress < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          setTimeout(() => {
            // Используем navigate вместо window.location.href
            navigate(card.path);
          }, 100);
        }
      };
      
      requestAnimationFrame(animateTransition);
    }
  };


  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'locked': return styles.statusLocked;
      case 'coming': return styles.statusComing;
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'доступен';
      case 'locked': return 'заблокирован';
      case 'coming': return 'скоро';
      default: return '';
    }
  };

  const currentCard = LANDINGS[activeIndex];

  return (
    <div 
      className={`${styles.hub} ${isLoaded ? styles.loaded : ''} ${selectedCard ? styles.exiting : ''}`}
      ref={containerRef}
    >
      {/* Статичный фон */}
      <div 
        className={styles.cardBackground}
        style={{
          transform: `scale(${bgScale})`,
          backgroundImage: `url(/image/fons/duna/duna.png)`,
          filter: `blur(${bgBlur}px) brightness(${bgBrightness})`,
          transition: isSliding 
            ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            : selectedCard 
              ? 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' 
              : 'none'
        }}
      />

      {/* Свет сверху */}
      <div 
        className={styles.topLight}
        style={{
          backgroundImage: `url(/image/hohaina/light.png)`,
          opacity: selectedCard ? 0 : lightOpacity,
          transition: isSliding 
            ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            : selectedCard 
              ? 'opacity 1.2s ease' 
              : 'opacity 3s ease'
        }}
      />

      {/* Свечение снизу */}
      <div 
        className={styles.bottomGlow}
        style={{
          transform: `translate3d(${glowTransform.x}px, ${glowTransform.y}px, 0) scale(${glowScale})`,
          backgroundImage: `url(/image/hohaina/glow.png)`,
          opacity: selectedCard ? 0 : 0.8,
          transition: isSliding 
            ? 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
            : selectedCard 
              ? 'opacity 1.2s ease' 
              : 'transform 0.25s cubic-bezier(0.2, 0, 0, 1), opacity 3s ease'
        }}
      />

      {/* Контент */}
      <div 
        className={styles.content}
        style={{
          opacity: selectedCard ? 0 : 1,
          transform: selectedCard ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className={styles.centerWrapper}>
          <header className={styles.header}>
            <div className={styles.logoWrapper}>
              <span className={styles.logoLine} />
              <span className={styles.logoText}>ВЫБЕРИ СЦЕНУ</span>
              <span className={styles.logoLine} />
            </div>
          </header>

          <div className={styles.swiperContainer}>
            <div className="swiper" ref={swiperContainerRef}>
              <div className="swiper-wrapper">
                {LANDINGS.map((card, index) => (
                  <div className="swiper-slide" key={card.id}>
                    <div
                      className={`
                        ${styles.card} 
                        ${card.status === 'active' ? styles.cardActive : ''} 
                        ${activeIndex === index ? styles.cardActive : ''}
                      `}
                      onClick={() => handleCardClick(card)}
                      style={{ 
                        '--card-color': card.color,
                        transform: activeIndex === index && !isTransitioning ? `
                          perspective(1000px)
                          rotateX(${cardTransform.rotateX}deg)
                          rotateY(${cardTransform.rotateY}deg)
                          translateZ(${cardTransform.translateZ}px)
                        ` : 'none',
                        transition: isSliding ? 'transform 0.4s ease' : 'transform 0.1s ease-out'
                      } as React.CSSProperties}
                    >
                      <div className={styles.cardIcon}>{card.icon}</div>
                      <div className={styles.cardTitle}>{card.title}</div>
                      <div className={styles.cardDescription}>{card.description}</div>
                      <div className={styles.cardStatus}>
                        <span className={`${styles.statusIndicator} ${getStatusClass(card.status)}`} />
                        <span className={styles.statusText}>{getStatusText(card.status)}</span>
                      </div>
                      <div className={styles.cardGlow} />
                      <div className={styles.cardBorder} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.slideIndicator}>
            {LANDINGS.map((_, index) => (
              <span
                key={index}
                className={`${styles.indicatorDot} ${activeIndex === index ? styles.indicatorActive : ''}`}
                onClick={() => swiperInstance?.slideTo(index)}
              />
            ))}
          </div>

          <footer className={styles.footer}>
            <span className={styles.hint}>
              {LANDINGS[activeIndex]?.status === 'active' ? 'нажмите чтобы войти' : 'скоро'}
            </span>
            <span className={styles.swipeHint}>← листайте →</span>
          </footer>
        </div>
      </div>

      <div className={styles.overlays}>
        <div className={styles.vignette} />
        <div className={styles.scanline} />
      </div>

      <div className={styles.depthIndicator}>
        <div className={styles.depthValue}>
          <span>{currentCard?.title || ''}</span>
          <span className={styles.separator}>|</span>
          <span>{activeIndex + 1}/{LANDINGS.length}</span>
        </div>
      </div>
    </div>
  );
};