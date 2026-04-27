import React, { useState } from 'react';
import { Event } from '../../types';
import { Button } from '../UI/Button';
import { addEvent } from '../../utils/storage';
import styles from './MainApp.module.css';

interface AddEventFormProps {
  onAdd: () => void;
}

export const AddEventForm: React.FC<AddEventFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    scene: '',
    location: '',
    notes: '',
    status: 'ОЖИДАЕТ' as Event['status'],
    addedBy: 'NIK' as 'NIK' | 'ELINA'
  });

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.scene && formData.location) {
        const newEvent = await addEvent(formData);
        setFormData({
            date: '',
            scene: '',
            location: '',
            notes: '',
            status: 'PENDING',
            addedBy: 'NICK'
        });
        setIsOpen(false);
        onAdd(newEvent); // Передаём созданное событие
    }
};

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)} className="add-button">
        + ДОБАВИТЬ
      </Button>
    );
  }

  if (!isOpen) {
  return (
    <Button variant="secondary" onClick={() => setIsOpen(true)} className="add-button">
      + ADD SCENE
    </Button>
  );
}

  return (
    <form onSubmit={handleSubmit} className={styles.addForm}>
      <h3 className={styles.formTitle}>NEW / SCHEDULE</h3>
      
      <div className={styles.formGroup}>
        <label>Дата:</label>
        <input
          type="text"
          placeholder="2026-12-18 or TBD"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div className={styles.formGroup}>
        <label>SCENE *</label>
        <input
          type="text"
          placeholder="Scene name"
          value={formData.scene}
          onChange={(e) => setFormData({ ...formData, scene: e.target.value })}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>LOCATION *</label>
        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>NOTES:</label>
        <textarea
          placeholder="Additional notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label>ADDED BY:</label>
        <select
          value={formData.addedBy}
          onChange={(e) => setFormData({ ...formData, addedBy: e.target.value as 'NIK' | 'ELINA' })}
        >
          <option value="NIK">NIK</option>
          <option value="ELINA">ELINA</option>
        </select>
      </div>

      <div className={styles.formActions}>
        <Button type="submit">Сохранить</Button>
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          Назад
        </Button>
      </div>
    </form>
  );
};
