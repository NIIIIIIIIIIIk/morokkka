import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Hub } from './components/Hub/Hub';
import { DuneLanding } from './components/DuneLanding/DuneLanding';
import { LandingPage } from './components/LandingPage/LandingPage';
import { MainApp } from './components/MainApp/MainApp';
import { loadState } from './utils/storage';
import './styles/globals.css';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadState().then(state => {
      // Проверяем и localStorage на случай если API не работает
      const localUnlocked = localStorage.getItem('call_sheet_unlocked') === 'true';
      setIsUnlocked(state.isUnlocked || localUnlocked);
      setIsLoading(false);
    });
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  if (isLoading) {
    return <div style={{ 
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace' 
    }}>LOADING...</div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/dune" element={<DuneLanding onUnlock={handleUnlock} />} />
        <Route path="/landing" element={<LandingPage onUnlock={handleUnlock} />} />
        <Route path="/app" element={
          isUnlocked ? <MainApp /> : <Navigate to="/landing" replace />
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
