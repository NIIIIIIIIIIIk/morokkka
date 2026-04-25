import React, { useState } from 'react';
import { Event } from '../../types';
import { Button } from '../UI/Button';
import styles from './AutoGenerateButton.module.css';

// База данных идей для встреч
const DATE_IDEAS: Array<{
  scene: string;
  location: string;
  notes: string;
  vibe: 'романтика' | 'absolut cinema' | 'EXPIRIENCE' | 'уют';
  emoji: string;
}> = [
  {
    scene: 'Моза парк',
    location: 'СЕВЕР "БАЙКОНУРСКАЯ"',
    notes: 'заметка',
    vibe: 'EXPIRIENCE',
    emoji: '🎳🙂'
  },
  {
    scene: '«Одиссея»',
    location: '',
    notes: 'заметка',
    vibe: 'absolut cinema',
    emoji: '🦸🏻'
  },
  {
    scene: '«Avengers: Doomsday»',
    location: '',
    notes: 'заметка',
    vibe: 'absolut cinema',
    emoji: '🪐'
  }

];

interface AutoGenerateButtonProps {
  onGenerate: (event: Omit<Event, 'id' | 'comments'>) => void;
}

export const AutoGenerateButton: React.FC<AutoGenerateButtonProps> = ({ onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<typeof DATE_IDEAS[0] | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rollingText, setRollingText] = useState('');

  const generateRandomDate = () => {
    // Анимация "прокрутки" вариантов
    setIsGenerating(true);
    setShowPreview(true);
    
    const rollInterval = setInterval(() => {
      const randomIdea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
      setCurrentSuggestion(randomIdea);
      setRollingText(randomIdea.scene);
    }, 100);

    // Останавливаем анимацию и показываем финальный результат
    setTimeout(() => {
      clearInterval(rollInterval);
      const finalIdea = DATE_IDEAS[Math.floor(Math.random() * DATE_IDEAS.length)];
      setCurrentSuggestion(finalIdea);
      setRollingText('');
      setIsGenerating(false);
    }, 1500);
  };

  const handleConfirm = () => {
    if (currentSuggestion) {
      // Генерируем дату на ближайшие выходные
      const date = new Date();
      date.setDate(date.getDate() + (6 - date.getDay())); // Ближайшая суббота
      const dateStr = date.toISOString().split('T')[0];
      
      onGenerate({
        date: dateStr,
        scene: currentSuggestion.scene,
        location: currentSuggestion.location,
        status: 'ОЖИДАЕТ',
        notes: currentSuggestion.notes,
        addedBy: 'NIK'
      });
      
      setShowPreview(false);
      setCurrentSuggestion(null);
    }
  };

  const handleClose = () => {
    setShowPreview(false);
    setCurrentSuggestion(null);
    setIsGenerating(false);
  };

  return (
    <>
      <button 
        className={`${styles.generateButton} ${isGenerating ? styles.generating : ''}`}
        onClick={generateRandomDate}
        disabled={isGenerating}
        title="Сгенерировать идею"
      >
        <span className={styles.diceEmoji}>🎲</span>
        <span className={styles.buttonText}>
          {isGenerating ? 'ИЩЕМ ИДЕЮ...' : 'АВТОГЕНЕРАЦИЯ'}
        </span>
      </button>

      {showPreview && currentSuggestion && (
        <div className={styles.previewOverlay} onClick={handleClose}>
          <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.previewHeader}>
              <span className={styles.previewEmoji}>{currentSuggestion.emoji}</span>
              <h3 className={styles.previewTitle}>
                {rollingText || currentSuggestion.scene}
              </h3>
            </div>
            
            <div className={styles.previewBody}>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>ЛОКАЦИЯ:</span>
                <span className={styles.previewValue}>{currentSuggestion.location}</span>
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>ЗАМЕТКИ:</span>
                <span className={styles.previewValue}>{currentSuggestion.notes}</span>
              </div>
              <div className={styles.previewRow}>
                <span className={styles.previewLabel}>ВАЙБ:</span>
                <span className={`${styles.previewValue} ${styles.vibe}`}>
                  {currentSuggestion.vibe}
                </span>
              </div>
            </div>

            {!isGenerating && (
              <div className={styles.previewActions}>
                <Button variant="primary" onClick={handleConfirm}>
                  ДОБАВИТЬ В КАЛЕНДАРЬ
                </Button>
                <Button variant="ghost" onClick={generateRandomDate}>
                  Ещё
                </Button>
              </div>
            )}

            <div className={styles.previewHint}>
              {isGenerating ? '' : 'кликни вне окна чтобы закрыть'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};