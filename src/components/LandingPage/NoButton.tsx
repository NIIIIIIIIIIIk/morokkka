import React, { useState } from 'react';
import { PRODUCER_PHRASES } from '../../types';
import { getImagePath } from '../../utils/paths';
import styles from './LandingPage.module.css';

interface Meme {
  url: string;
  phrase: string;
  movie: string;
}

// Пути к изображениям - используем правильные пути для GitHub Pages
const MEME_COLLECTION: Meme[] = [
  {
    url: 'https://i.postimg.cc/0zYfjcz8/hom.gif',
    phrase: "",
    movie: ''
  },
  {
    url: 'https://i.postimg.cc/mPYwk8Pr/hom2.gif',
    phrase: '',
    movie: ''
  },
  {
    url: 'https://i.postimg.cc/3kXBNnk8/sen2.jpg',
    phrase: '',
    movie: ''
  },
  {
    url: 'https://i.postimg.cc/87RHct7g/timoti.jpg',
    phrase: '',
    movie: ''
  },
  {
    url: 'https://i.postimg.cc/68r0qY8N/denny.jpg',
    phrase: '',
    movie: ''
  },
];

interface NoButtonProps {
  onShowMeme?: () => void;
}

export const NoButton: React.FC<NoButtonProps> = ({ onShowMeme }) => {
  const [showMeme, setShowMeme] = useState(false);
  const [currentMeme, setCurrentMeme] = useState<Meme | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    const randomMeme = MEME_COLLECTION[Math.floor(Math.random() * MEME_COLLECTION.length)];
    setCurrentMeme(randomMeme);
    setShowMeme(true);
    setImageError(false);
    setClickCount(prev => prev + 1);
    setPhraseIndex(clickCount % PRODUCER_PHRASES.length);
    
    setTimeout(() => {
      setShowMeme(false);
    }, 1500);
    
    if (onShowMeme) {
      onShowMeme();
    }
  };

  const handleImageError = () => {
    console.warn('Failed to load image:', currentMeme?.url);
    setImageError(true);
  };

  return (
    <>
      <button className={styles.noButton} onClick={handleClick}>
        [{PRODUCER_PHRASES[phraseIndex]}]
      </button>
      
      {showMeme && currentMeme && (
        <div className={styles.memeOverlay}>
          <div className={styles.memeContainer}>
            {!imageError ? (
              <img 
  src={getImagePath(currentMeme.url)} 
  alt={currentMeme.phrase}
  className={styles.memeImage}
  onError={handleImageError}
/>
            ) : (
              <div className={styles.textMeme}>
                <div className={styles.textMemeEmoji}>🎬</div>
                <div className={styles.fallbackText}>{currentMeme.phrase}</div>
              </div>
            )}
            <div className={styles.memeCaption}>
              <div className={styles.memePhrase}>"{currentMeme.phrase}"</div>
              <div className={styles.memeMovie}>— {currentMeme.movie}</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};