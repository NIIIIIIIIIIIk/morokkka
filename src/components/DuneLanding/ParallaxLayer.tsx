import React, { useEffect, useRef } from 'react';
import styles from './DuneLanding.module.css';

interface ParallaxLayerProps {
  imageUrl: string;
  speed: number;
  className?: string;
  initialOffset?: number;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({ 
  imageUrl, 
  speed, 
  className = '',
  initialOffset = 0
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(initialOffset);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!layerRef.current) return;
      
      const mouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const mouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      
      const moveX = mouseX * speed * 50;
      const moveY = mouseY * speed * 30;
      
      positionRef.current = initialOffset + moveX;
      
      layerRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };

    const handleScroll = () => {
      if (!layerRef.current) return;
      
      const scrolled = window.pageYOffset;
      const moveY = scrolled * speed * 0.3;
      
      layerRef.current.style.transform = `translate3d(${positionRef.current}px, ${moveY}px, 0)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, initialOffset]);

  return (
    <div 
      ref={layerRef}
      className={`${styles.parallaxLayer} ${className}`}
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        willChange: 'transform'
      }}
    />
  );
};