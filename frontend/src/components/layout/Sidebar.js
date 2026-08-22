'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './Sidebar.module.css';

const navItems = [
  { group:'Main Menu', items:[
    { id:'dashboard',    href:'/dashboard',    icon:'⬡',  label:'Dashboard',     roles:['hr'] },
    { id:'my-dashboard', href:'/my-dashboard', icon:'⬡',  label:'Dashboard',     roles:['employee'] },
    { id:'employees',    href:'/employees',    icon:'👥',  label:'Employees',     roles:['hr'] },
    { id:'attendance',   href:'/attendance',   icon:'⏱',  label:'Attendance',    roles:['hr','employee'] },
  ]},
  { group:'Leave', items:[
    { id:'leaves',       href:'/leaves',       icon:'📋',  label:'Leave Requests', roles:['hr'] },
    { id:'my-leaves',    href:'/my-leaves',    icon:'🗓',  label:'My Leaves',      roles:['employee'] },
  ]},
  { group:'Payroll', items:[
    { id:'payroll',      href:'/payroll',      icon:'💳',  label:'Payroll',        roles:['hr'] },
    { id:'my-payroll',   href:'/my-payroll',   icon:'💳',  label:'Payroll',        roles:['employee'] },
  ]},
  { group:'Reports', items:[
    { id:'analytics',   href:'/analytics',    icon:'📊',  label:'Analytics',     roles:['hr'] },
    { id:'ai-insights', href:'/ai-insights',  icon:'🤖',  label:'AI Insights',   roles:['hr'] },
  ]},
  { group:'Account', items:[
    { id:'settings',    href:'/settings',     icon:'⚙',  label:'Settings',      roles:['hr','employee'] },
  ]},
];

export default function Sidebar({ role = 'hr' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const navRef   = useRef(null);

  const filteredNav = navItems.map(group => ({
    ...group,
    items: group.items.filter(item => item.roles.includes(role)),
  })).filter(g => g.items.length > 0);

  const allItems = filteredNav.flatMap(g => g.items);
  const activeItem = allItems.find(i => i.href === pathname || pathname.startsWith(i.href + '/'));

  // Slide the nav indicator to the active item
  useEffect(() => {
    if (!navRef.current || !activeItem) return;
    const el = navRef.current.querySelector(`[data-id="${activeItem.id}"]`);
    if (!el) return;
    const { offsetTop, offsetHeight } = el;
    setIndicatorStyle({ top: offsetTop, height: offsetHeight, opacity: 1 });
  }, [pathname, activeItem]);

  const user = role === 'hr'
    ? { name:'Carla Sanford', role:'HR Officer', initials:'CS' }
    : { name:'John Doe',      role:'Employee',   initials:'JD' };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoMark}>⬡</span>
        <span className={styles.logoText}>Dayflow</span>
      </div>

      {/* Nav */}
      <nav className={styles.nav} ref={navRef}>
        {/* Animated indicator */}
        <div className={styles.indicator} style={indicatorStyle} />

        {filteredNav.map(group => (
          <div key={group.group} className={styles.group}>
            <span className={styles.groupLabel}>{group.group}</span>
            {group.items.map(item => {
              const isActive = item.href === pathname || pathname.startsWith(item.href + '/');
              return (
                <button
                  key={item.id}
                  data-id={item.id}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={() => router.push(item.href)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className={styles.userCard}>
        <div className={`${styles.userAvatar} avatar avatar-sm`}>{user.initials}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>
        <div className={styles.onlineDot} />
      </div>
    </aside>
  );
}
