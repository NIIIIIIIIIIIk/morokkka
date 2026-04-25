import React, { useEffect, useState, useRef } from 'react';
import styles from './DarkNetTransition.module.css';

interface DarkNetTransitionProps {
  onComplete: () => void;
}

export const DarkNetTransition: React.FC<DarkNetTransitionProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'glitch' | 'hack' | 'complete'>('glitch');
  const [hackProgress, setHackProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showEnterButton, setShowEnterButton] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const horizontalCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const horizontalAnimationRef = useRef<number>();

  const ipAddress = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

  const matrixConfig = {
    fontSize: 16,
    columns: 0,
    drops: [] as number[],
    chars: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
  };

  const horizontalConfig = {
    fontSize: 16,
    rows: 8,
    positions: [] as number[],
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  };

  const initMatrix = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const container = canvas.parentElement;
    if (!container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth || 800;
      canvas.height = container.clientHeight || 400;
      
      matrixConfig.columns = Math.floor(canvas.width / matrixConfig.fontSize);
      matrixConfig.drops = Array(matrixConfig.columns).fill(0).map(() => Math.floor(Math.random() * -20));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  };

  const initHorizontalMatrix = () => {
    if (!horizontalCanvasRef.current) return;
    
    const canvas = horizontalCanvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const wrapper = document.querySelector(`.${styles.horizontalMatrixWrapper}`);
      if (wrapper) {
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = 500;
      }
      
      horizontalConfig.positions = Array(8).fill(0).map(() => Math.floor(Math.random() * -300));
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  };

  const drawMatrix = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${matrixConfig.fontSize}px 'Courier New', monospace`;

    for (let i = 0; i < matrixConfig.drops.length; i++) {
      const char = matrixConfig.chars[Math.floor(Math.random() * matrixConfig.chars.length)];
      const x = i * matrixConfig.fontSize;
      const y = matrixConfig.drops[i] * matrixConfig.fontSize;

      ctx.fillStyle = '#0f0';
      ctx.fillText(char, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        matrixConfig.drops[i] = 0;
      }

      matrixConfig.drops[i]++;
    }

    animationRef.current = requestAnimationFrame(drawMatrix);
  };

  const drawHorizontalMatrix = () => {
    if (!horizontalCanvasRef.current) return;
    
    const canvas = horizontalCanvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${horizontalConfig.fontSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const charsPerRow = Math.ceil(canvas.width / (horizontalConfig.fontSize * 1.2)) + 4;
    
    const rowHeight = canvas.height / (horizontalConfig.rows + 1);
    const rows: number[] = [];
    for (let i = 1; i <= horizontalConfig.rows; i++) {
      rows.push(rowHeight * i);
    }
    
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const y = rows[rowIndex];
      
      for (let j = -charsPerRow/2; j <= charsPerRow/2; j++) {
        const char = horizontalConfig.chars[Math.floor(Math.random() * horizontalConfig.chars.length)];
        const spacing = horizontalConfig.fontSize * 1.2;
        const x = (horizontalConfig.positions[rowIndex] + j * spacing) % (canvas.width + 400) - 200;
        
        if (x > -50 && x < canvas.width + 50) {
          const distanceFromCenter = Math.abs(j);
          const opacity = Math.max(0.06, 0.25 - distanceFromCenter * 0.04);
          ctx.fillStyle = `rgba(0, 130, 0, ${opacity})`;
          ctx.fillText(char, x, y);
        }
      }

      horizontalConfig.positions[rowIndex] -= 2 + (rowIndex * 0.3);
      if (horizontalConfig.positions[rowIndex] < -500) {
        horizontalConfig.positions[rowIndex] = canvas.width + 300;
      }
    }

    horizontalAnimationRef.current = requestAnimationFrame(drawHorizontalMatrix);
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ru-RU', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  // Легкий параллакс для фона
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
    
    const timer = setTimeout(() => {
      setStage('hack');
      startHack();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const startHack = () => {
    initMatrix();
    animationRef.current = requestAnimationFrame(drawMatrix);
    
    addLog('> INITIALIZING BREACH PROTOCOL');
    
    setTimeout(() => addLog(`> TARGET ACQUIRED: ${ipAddress}`), 300);
    setTimeout(() => addLog('> BYPASSING FIREWALL'), 600);
    setTimeout(() => addLog('> FIREWALL NEUTRALIZED'), 900);
    setTimeout(() => addLog('> DECRYPTING LAYER 1'), 1200);
    setTimeout(() => addLog('> LAYER 1 COMPROMISED'), 1500);
    setTimeout(() => addLog('> SCANNING VULNERABILITIES'), 1800);
    setTimeout(() => addLog('> CVE-2077-0145 DETECTED'), 2100);
    setTimeout(() => addLog('> EXPLOITING BACKDOOR'), 2400);
    setTimeout(() => addLog('> ACCESS GRANTED'), 2700);
    setTimeout(() => addLog('> DOWNLOADING DATA'), 3000);
    setTimeout(() => addLog('> PACKET 1/3 RECEIVED'), 3300);
    setTimeout(() => addLog('> PACKET 2/3 RECEIVED'), 3600);
    setTimeout(() => addLog('> PACKET 3/3 RECEIVED'), 3900);
    setTimeout(() => addLog('> COVERING TRACKS'), 4200);
    setTimeout(() => addLog('> LOGS PURGED'), 4500);
    setTimeout(() => addLog('> ENCRYPTING CHANNEL'), 4800);
    setTimeout(() => addLog('> CONNECTION SECURED'), 5100);
    
    const progressInterval = setInterval(() => {
      setHackProgress(prev => {
        if (prev < 100) {
          return Math.min(prev + 2, 100);
        }
        clearInterval(progressInterval);
        return prev;
      });
    }, 100);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setStage('complete');
      setShowEnterButton(true);
      addLog('> BREACH COMPLETE. ACCESS GRANTED.');
      
      setTimeout(() => {
        initHorizontalMatrix();
        horizontalAnimationRef.current = requestAnimationFrame(drawHorizontalMatrix);
      }, 100);
    }, 5500);
  };

  const handleEnterDarknet = () => {
    setShowEnterButton(false);
    setIsVisible(false);
    
    if (horizontalAnimationRef.current) {
      cancelAnimationFrame(horizontalAnimationRef.current);
    }
    
    addLog('> ACCESSING DARKNET');
    
    setTimeout(() => {
      onComplete();
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (horizontalAnimationRef.current) cancelAnimationFrame(horizontalAnimationRef.current);
    };
  }, []);

  return (
    <div 
      className={`${styles.overlay} ${stage === 'hack' ? styles.hacking : ''} ${stage === 'complete' ? styles.complete : ''} ${isVisible ? styles.visible : ''}`}
      ref={containerRef}
    >
      {/* Фон с легким параллаксом */}
      <div 
        className={styles.cyberpunkBg}
        style={{
          transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 5}px) scale(1.02)`
        }}
      />
      
      {stage === 'glitch' && (
        <>
          <img 
            src="/image/dlya-vzlom/glitch_one.gif"
            className={styles.glitchGif}
            alt=""
          />
          <div className={styles.glitchFlash} />
        </>
      )}
      
      {stage === 'hack' && (
        <>
          <img 
            src="/image/dlya-vzlom/glitch.gif"
            className={styles.glitchGif}
            alt=""
          />
          
          <div className={styles.matrixWrapper}>
            <canvas ref={canvasRef} className={styles.matrixCanvas} />
          </div>

          <div className={styles.hackProgress}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${hackProgress}%` }} />
            </div>
            <div className={styles.progressText}>
              BREACH IN PROGRESS... {hackProgress}%
            </div>
          </div>

          <div className={styles.hackLogs}>
            {logs.slice(-8).map((log, i) => (
              <div key={i} className={styles.logLine}>{log}</div>
            ))}
          </div>
        </>
      )}
      
      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      {showEnterButton && stage === 'complete' && (
        <>
          <div className={styles.horizontalMatrixWrapper}>
            <canvas ref={horizontalCanvasRef} className={styles.horizontalCanvas} />
          </div>
          
          <div className={styles.enterSection}>
            <div className={styles.accessGranted}>
              ACCESS GRANTED
            </div>
            <button className={styles.enterButton} onClick={handleEnterDarknet}>
              ENTER DARKNET
            </button>
          </div>
        </>
      )}
    </div>
  );
};