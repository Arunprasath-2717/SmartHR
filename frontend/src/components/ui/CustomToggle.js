'use client';

export default function CustomToggle({ checked, onChange, size = '44px', id, className = '' }) {
  return (
    <div className={`checkbox-wrapper-41 ${className}`} style={{ '--size': size }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
      />
    </div>
  );
}
