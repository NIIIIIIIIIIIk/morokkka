import { EASTER_EGGS, EasterEgg } from '../types';

const STORAGE_KEY = 'shown_easter_eggs';

export const getShownEggs = (): string[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const markEggAsShown = (eggId: string): void => {
  const shown = getShownEggs();
  if (!shown.includes(eggId)) {
    shown.push(eggId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shown));
  }
};

export const checkEasterEgg = (trigger: EasterEgg['trigger']): EasterEgg | null => {
  const shown = getShownEggs();
  const egg = EASTER_EGGS.find(e => e.trigger === trigger && !shown.includes(e.id));
  
  if (egg) {
    markEggAsShown(egg.id);
    return egg;
  }
  
  return null;
};

export const resetAllEasterEggs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};