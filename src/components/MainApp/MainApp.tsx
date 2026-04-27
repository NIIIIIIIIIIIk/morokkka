import React, { useState, useEffect } from 'react';
import { Event, EasterEgg } from '../../types';
import { loadState, saveState, addEvent, deleteEvent, updateEventStatus, addComment, unlockApp } from '../../utils/storage';
import { checkEasterEgg } from '../../utils/easterEggs';
import { EventList } from './EventList';
import { AddEventForm } from './AddEventForm';
import { EasterEggModal } from '../UI/EasterEggModal';
import { OnboardingTooltip } from '../UI/OnboardingTooltip';
import { Toast } from '../UI/Toast';
import { AutoGenerateButton } from './AutoGenerateButton';
import { FOOTER_TEXT } from '../../utils/constants';
import { ONBOARDING_STEPS } from '../../types';
import styles from './MainApp.module.css';
import { useNavigate } from 'react-router-dom';

export const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [updateKey, setUpdateKey] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEgg, setEasterEgg] = useState<EasterEgg | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 6).toUpperCase());
  const [uptime, setUptime] = useState(0);
  const [matrixColumns, setMatrixColumns] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных из API
  useEffect(() => {
    loadState().then(state => {
      setEvents(state.events);
      setIsLoading(false);
      
      const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowOnboarding(true), 500);
      }
      
      setToast({
        message: `$ connected`,
        type: 'info'
      });
    });
  }, [updateKey]);

  useEffect(() => {
    const columns = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${10 + Math.random() * 15}s`
    }));
    setMatrixColumns(columns);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setUptime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUptime = () => {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const handleUpdate = () => setUpdateKey(k => k + 1);

  const handleEventAdded = async (event: Event) => {
    handleUpdate();
    const egg = checkEasterEgg('firstEvent');
    if (egg) {
      setEasterEgg(egg);
      setShowEasterEgg(true);
    }
    setToast({ message: `$ added`, type: 'success' });
  };

  const handleCommentAdded = (commentCount: number) => {
    if (commentCount === 3) {
      const egg = checkEasterEgg('thirdComment');
      if (egg) {
        setEasterEgg(egg);
        setShowEasterEgg(true);
      }
    }
  };

  const handleAllConfirmed = () => {
    const allConfirmed = events.every(e => e.status === 'УТВЕРЖДЕНО');
    if (allConfirmed && events.length > 0) {
      const egg = checkEasterEgg('allConfirmed');
      if (egg) {
        setEasterEgg(egg);
        setShowEasterEgg(true);
      }
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('has_seen_onboarding', 'true');
    }
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('has_seen_onboarding', 'true');
  };

  const handleAutoGenerate = async (generatedEvent: Omit<Event, 'id' | 'comments'>) => {
    const newEvent = await addEvent({
      ...generatedEvent,
      addedBy: 'NICK'
    });
    handleUpdate();
    setToast({ message: `$ generated`, type: 'success' });
  };

  const handleSecretReset = () => {
    if (window.confirm('reset? [y/N]')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExit = () => {
    navigate('/');
  };

  const stats = {
    confirmed: events.filter(e => e.status === 'УТВЕРЖДЕНО').length,
    pending: events.filter(e => e.status === 'ОЖИДАЕТ').length,
    total: events.length
  };
  
  const generateMatrixText = (length: number) => {
    const chars = '01';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '18px'
      }}>
        $ loading...
      </div>
    );
  }

  return (
    <>
      <div className={styles.app}>
        <div className={styles.lampLight} />
        <div className={styles.matrixOverlay}>
          {matrixColumns.map(col => (
            <div
              key={col.id}
              className={styles.matrixColumn}
              style={{
                left: col.left,
                animationDelay: col.delay,
                animationDuration: col.duration,
              }}
            >
              {generateMatrixText(35)}
            </div>
          ))}
        </div>
        <div className={styles.matrixOverlayDeep}>
          {matrixColumns.slice(0, 10).map(col => (
            <div
              key={`deep-${col.id}`}
              className={styles.matrixColumnDeep}
              style={{
                left: col.left,
                animationDelay: `${parseFloat(col.delay) + 3}s`,
                animationDuration: `${parseFloat(col.duration) * 1.3}s`,
              }}
            >
              {generateMatrixText(25)}
            </div>
          ))}
        </div>

        <header className={styles.appHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.chatHeader}>
              <div className={styles.avatarGroup}>
                <div className={styles.avatar}>N</div>
                <div className={styles.avatar}>E</div>
              </div>
              <div className={styles.chatInfo}>
                <span className={styles.chatName}>Messenger SAM</span>
                <span className={styles.chatStatus}>
                  <span className={styles.onlineDot}></span>
                  online · {stats.total} events
                </span>
              </div>
            </div>
            <div className={styles.projectInfo}>
              <span className={styles.projectLabel}>$</span>
              <span className={styles.projectValue}>/calendar</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.terminalBox}>
              <button className={styles.ticketButton} onClick={() => window.open('/tickets/ticket.pdf')} title="Скачать билетик">
                [🎟️ БИЛЕТ]
              </button>
              <button className={styles.exitButton} onClick={handleExit} title="Выйти в хаб">
                [ХАБ]
              </button>
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>$</span> session
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.output}>{sessionId}</span>
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.prompt}>$</span> uptime
            </div>
            <div className={styles.terminalLine}>
              <span className={styles.output}>{formatUptime()}</span>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <div className={styles.chatSection}>
            <div className={styles.chatSectionHeader}>
              <h2 className={styles.chatSectionTitle}>events</h2>
              <div className={styles.statsContainer}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>all</span>
                  <span className={styles.statValue}>{stats.total}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>✓</span>
                  <span className={styles.statValue}>{stats.confirmed}</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>○</span>
                  <span className={styles.statValue}>{stats.pending}</span>
                </div>
              </div>
            </div>
            <EventList 
              events={events} 
              onUpdate={handleUpdate}
              onCommentAdded={handleCommentAdded}
              onAllConfirmed={handleAllConfirmed}
            />
          </div>

          <div className={styles.inputSection}>
            <div className={styles.inputHeader}>
              <span>$ new message</span>
            </div>
            <AddEventForm onAdd={handleEventAdded} />
            <div className={styles.headerActions} style={{ padding: '0 16px 16px' }}>
              <AutoGenerateButton onGenerate={handleAutoGenerate} />
            </div>
          </div>
        </main>

        <footer className={styles.appFooter}>
          <p>{FOOTER_TEXT}</p>
        </footer>

        <div className={styles.statusBar}>
          <div className={styles.statusBarLeft}>
            <span>здесь</span>
            <span className={styles.separator}>|</span>
            <span>подвал</span>
          </div>
          <div className={styles.statusBarCenter}>
            <span className={styles.blinkingCursor}>_</span>
          </div>
          <div className={styles.statusBarRight}>
            <span>{currentTime.toLocaleTimeString()}</span>
            <span className={styles.separator}>|</span>
            <span>e2e</span>
          </div>
        </div>

        <div className={styles.secretReset} onClick={handleSecretReset} title="reset">
          ·
        </div>
      </div>
      
      {showEasterEgg && easterEgg && (
        <EasterEggModal egg={easterEgg} onClose={() => setShowEasterEgg(false)} />
      )}
      
      {showOnboarding && (
        <OnboardingTooltip
          targetSelector={ONBOARDING_STEPS[onboardingStep].target}
          title={ONBOARDING_STEPS[onboardingStep].title}
          content={ONBOARDING_STEPS[onboardingStep].content}
          step={onboardingStep + 1}
          totalSteps={ONBOARDING_STEPS.length}
          onNext={handleOnboardingNext}
          onSkip={handleOnboardingSkip}
        />
      )}
      
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </>
  );
};
