'use client';
import { useInView } from '@/hooks/useInView';
import { useCounter } from '@/hooks/useCounter';
import styles from './StatCard.module.css';

export default function StatCard({
  label, value, suffix = '', prefix = '', decimals = 0,
  variant = 'solid', // 'solid' | 'glass' | 'dark'
  icon, children, className = '', style = {},
  delay = 0,
}) {
  const [ref, inView] = useInView();
  const count = useCounter(value, 1200, decimals, inView);

  const cardClass = {
    solid: 'card',
    glass: 'card-glass',
    dark:  'card-glass-dark',
  }[variant];

  return (
    <div
      ref={ref}
      className={`${cardClass} ${styles.statCard} ${className}`}
      style={{
        ...style,
        animation: `card-in 400ms ease-out ${delay}ms both`,
      }}
    >
      {icon && <div className={styles.iconRow}>{icon}</div>}
      <div className={styles.stat}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <span className={styles.number}>{count.toFixed(decimals)}</span>
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  );
}
