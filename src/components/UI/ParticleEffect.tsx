import React, { useEffect, useRef } from 'react';
import styles from './ParticleEffect.module.css';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const ParticleEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Создание начальных частиц
    const initParticles = () => {
      const particles: Particle[] = [];
      for (let i = 0; i < 50; i++) {
        particles.push(createParticle());
      }
      particlesRef.current = particles;
    };

    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.3 - 0.2, // Легкое поднятие вверх
        opacity: Math.random() * 0.6 + 0.2,
        life: 1,
        maxLife: Math.random() * 300 + 200
      };
    };

    // Эффект специй (красные/оранжевые частицы)
    const drawParticle = (particle: Particle) => {
      if (!ctx) return;

      // Градиент для эффекта специй
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
      );
      
      // Цвета специй из Dune
      const hue = Math.random() * 20 + 340; // 340-360 (красный/малиновый)
      const color1 = `hsla(${hue}, 80%, 60%, ${particle.opacity})`;
      const color2 = `hsla(${hue}, 90%, 40%, ${particle.opacity * 0.5})`;
      
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Добавляем свечение
      ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.5)`;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const updateParticles = () => {
      const particles = particlesRef.current;
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Движение
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Влияние мыши
        if (mouseRef.current.isMoving) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const force = (1 - dist / 150) * 2;
            p.x += dx * force * 0.05;
            p.y += dy * force * 0.05;
          }
        }
        
        // Легкое покачивание
        p.x += Math.sin(Date.now() * 0.001 + i) * 0.02;
        
        // Затухание жизни
        p.life -= 0.003;
        p.opacity = p.life * 0.6;
        
        // Уменьшение размера со временем
        p.size = p.size * 0.999;
        
        // Возврат в экран
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
        
        // Удаление мертвых частиц и создание новых
        if (p.life <= 0 || p.size < 0.5) {
          particles.splice(i, 1);
          particles.push(createParticle());
        }
      }
      
      // Поддерживаем количество частиц
      while (particles.length < 60) {
        particles.push(createParticle());
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      // Очистка с эффектом следа
      ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      updateParticles();
      
      // Отрисовка частиц
      particlesRef.current.forEach(drawParticle);
      
      // Добавляем эффект "свечения" специй
      ctx.globalCompositeOperation = 'lighter';
      particlesRef.current.slice(0, 10).forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(229, 9, 20, ${p.opacity * 0.1})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      ctx.globalCompositeOperation = 'source-over';
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Отслеживание мыши
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isMoving = true;
      
      // Сбрасываем флаг через 100ms
      setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);
    };

    initParticles();
    animate();

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.particleCanvas} />;
};