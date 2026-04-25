import React, { useState } from 'react';
import { Comment } from '../../types';
import { addComment } from '../../utils/storage';
import styles from './MainApp.module.css';

interface CommentSectionProps {
  eventId: string;
  comments: Comment[];
  onUpdate: () => void;
  onCommentAdded?: (count: number) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  eventId,
  comments,
  onUpdate,
  onCommentAdded
}) => {
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState<'NIK' | 'ELINA'>('NIK');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(eventId, author, newComment.trim());
      setNewComment('');
      onUpdate();
      if (onCommentAdded) onCommentAdded(comments.length + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentList}>
        {comments.length === 0 ? (
          <div className={styles.noComments}>no replies yet</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentAvatar}>
                {comment.author === 'NIK' ? 'N' : 'E'}
              </div>
              <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                  <span className={styles.commentAuthor}>
                    {comment.author === 'NIK' ? 'nik' : 'elina'}
                  </span>
                  <span className={styles.commentTime}>
                    {new Date(comment.timestamp).toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className={styles.commentText}>{comment.text}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.commentForm}>
        <div className={styles.commentInputWrapper}>
          <div className={styles.commentAs}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="NIK"
                checked={author === 'NIK'}
                onChange={(e) => setAuthor(e.target.value as 'NIK')}
              />
              nik
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="ELINA"
                checked={author === 'ELINA'}
                onChange={(e) => setAuthor(e.target.value as 'ELINA')}
              />
              elina
            </label>
          </div>
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="reply..."
            className={styles.commentInput}
          />
        </div>
      </form>
    </div>
  );
};