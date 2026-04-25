export interface Event {
  id: string;
  date: string;
  scene: string;
  location: string;
  status: 'УТВЕРЖДЕНО' | 'ОЖИДАЕТ' | 'НЕ_ПРИЕМЛЕМО';
  notes: string;
  comments: Comment[];
  addedBy: 'NIK' | 'ELINA';
}

export interface Comment {
  id: string;
  author: 'NIK' | 'ELINA';
  text: string;
  timestamp: number;
}

export interface AppState {
  isUnlocked: boolean;
  events: Event[];
}

export const PRODUCER_PHRASES = [
  "Эмм, нет",
  "It's f*cking shit don't working!",
  'Роберт Паттинсон уходит из кино',
] as const;

export const DEFAULT_EVENTS: Event[] = [
  {
    id: '1',
    date: '18.12.2026',
    scene: 'Дюна 3 🟠',
    location: 'Люксовый, престижный - IMAX 😎',
    status: 'УТВЕРЖДЕНО',
    notes: '✋😮🤚 Абсолют синема - сигма момент',
    comments: [],
    addedBy: 'NIK'
  },
];

export interface EasterEgg {
  id: string;
  message: string;
  signature: string;
  emoji: string;
  trigger: 'unlock' | 'firstEvent' | 'thirdComment' | 'allConfirmed';
  shown: boolean;
}


{/* поменять уведомл */}
export const EASTER_EGGS: EasterEgg[] = [
];


  
  export const ONBOARDING_STEPS = [
    {
      target: '.add-button',
      title: 'ДОБАВИТЬ СЦЕНУ',
      content: 'Здесь можно запланировать новую встречу. Не забудь указать локацию!'
    },
    {
      target: '.status-select',
      title: 'СТАТУС',
      content: 'Меняй статус когда сцена подтверждена или отменена.'
    },
    {
      target: '.comment-section',
      title: 'ЗАМЕТКИ',
      content: ''
    },
    {
      target: '.add-AutoGenerate',
      title: 'АВТОГЕНЕРАЦИЯ',
      content: 'Нейронка. "в разработке"'
    }
  ];
  