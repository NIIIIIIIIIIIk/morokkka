import React from 'react';
import { Event } from '../../types';
import { EventItem } from './EventItem';
import styles from './MainApp.module.css';

interface EventListProps {
  events: Event[];
  onUpdate: () => void;
  onCommentAdded?: (count: number) => void;
  onAllConfirmed?: () => void;
}

export const EventList: React.FC<EventListProps> = ({ 
  events, 
  onUpdate, 
  onCommentAdded,
  onAllConfirmed 
}) => {
  const sortedEvents = [...events].sort((a, b) => {
    // CONFIRMED first, then PENDING, then CANCELLED
    const statusOrder = { УТВЕРЖДЕНО: 0, ОЖИДАЕТ: 1, НЕ_ПРИЕМЛЕМО: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  if (events.length === 0) {
    return (
      <div className={styles.noComments}>
        <span className={styles.emptyIcon}>📅</span>
        <p>Календарь пуст</p>
        <p className={styles.emptyHint}>Добавьте первую сцену с помощью кнопки ниже</p>
      </div>
    );
  }

  return (
    <div className={styles.eventList}>
      {sortedEvents.map(event => (
        <EventItem 
          key={event.id} 
          event={event} 
          onUpdate={onUpdate}
          onCommentAdded={onCommentAdded}
          onAllConfirmed={onAllConfirmed}
        />
      ))}
    </div>
  );
};