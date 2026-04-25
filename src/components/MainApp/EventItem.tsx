import React, { useState } from 'react';
import { Event } from '../../types';
import { Button } from '../UI/Button';
import { CommentSection } from './CommentSection';
import { updateEventStatus, deleteEvent } from '../../utils/storage';
import styles from './MainApp.module.css';

interface EventItemProps {
  event: Event;
  onUpdate: () => void;
  onCommentAdded?: (count: number) => void;
  onAllConfirmed?: () => void;
}

export const EventItem: React.FC<EventItemProps> = ({ 
  event, 
  onUpdate, 
  onCommentAdded,
  onAllConfirmed 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState<Record<string, boolean>>({});

  const handleStatusChange = (status: Event['status']) => {
    updateEventStatus(event.id, status);
    onUpdate();
    if (onAllConfirmed) setTimeout(onAllConfirmed, 100);
  };

  const handleDelete = () => {
    if (window.confirm('delete?')) {
      deleteEvent(event.id);
      onUpdate();
    }
  };

  const toggleReaction = (emoji: string) => {
    setReactions(prev => ({ ...prev, [emoji]: !prev[emoji] }));
  };

  const formatDate = (date: string) => {
    if (date === 'TBD') return 'tbd';
    try {
      return new Date(date).toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'short'
      });
    } catch {
      return date;
    }
  };

  const statusClass = {
    'УТВЕРЖДЕНО': styles.statusConfirmed,
    'ОЖИДАЕТ': styles.statusPending,
    'НЕ_ПРИЕМЛЕМО': styles.statusCancelled
  }[event.status];

  return (
    <div className={styles.eventItem}>
      <div className={styles.eventSender}>
        <div className={styles.senderAvatar}>
          {event.addedBy === 'NIK' ? 'N' : 'E'}
        </div>
        <div className={styles.senderInfo}>
          <span className={styles.senderName}>
            {event.addedBy === 'NIK' ? 'nik' : 'elina'}
          </span>
          <span className={styles.eventTime}>
            {formatDate(event.date)}
          </span>
        </div>
      </div>

      <div className={styles.eventHeader}>
        <div className={styles.eventDate}>
          <select
            value={event.status}
            onChange={(e) => handleStatusChange(e.target.value as Event['status'])}
            className={`${styles.statusSelect} ${statusClass}`}
          >
            <option value="УТВЕРЖДЕНО">✓</option>
            <option value="ОЖИДАЕТ">○</option>
            <option value="ОТМЕНЕНО">✗</option>
          </select>
        </div>
        <div className={styles.eventActions}>
          <Button variant="ghost" size="small" onClick={handleDelete}>×</Button>
        </div>
      </div>

      <div className={styles.eventBody}>
        <div className={styles.eventScene}>{event.scene}</div>
        <div className={styles.eventLocation}>{event.location}</div>
        {event.notes && (
          <div className={styles.eventNotes}>{event.notes}</div>
        )}
      </div>

      <div className={styles.eventReactions}>
        <span 
          className={`${styles.reaction} ${reactions['👍'] ? styles.active : ''}`}
          onClick={() => toggleReaction('👍')}
        >
          👍 1
        </span>
        <span 
          className={`${styles.reaction} ${reactions['👀'] ? styles.active : ''}`}
          onClick={() => toggleReaction('👀')}
        >
          👀 1
        </span>
        <span 
          className={`${styles.reaction} ${reactions['🎬'] ? styles.active : ''}`}
          onClick={() => toggleReaction('🎬')}
        >
          🎬 1
        </span>
      </div>

      <div className={styles.eventFooter}>
        <span 
          className={styles.replyButton}
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? '— hide' : `→ ${event.comments.length} replies`}
        </span>
      </div>

      {showComments && (
        <CommentSection
          eventId={event.id}
          comments={event.comments}
          onUpdate={onUpdate}
          onCommentAdded={onCommentAdded}
        />
      )}
    </div>
  );
};