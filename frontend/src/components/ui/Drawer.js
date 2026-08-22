'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.css';

export default function Drawer({ isOpen, onClose, title, children, width = 460 }) {
  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', esc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', esc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
        aria-hidden
      />
      {/* Drawer panel */}
      <aside
        className={`${styles.drawer} ${isOpen ? styles.open : ''}`}
        style={{ width }}
        role="complementary"
        aria-label={title}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close drawer">
            <X size={16} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  );
}
