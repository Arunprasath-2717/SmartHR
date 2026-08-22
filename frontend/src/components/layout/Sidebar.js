'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  ClipboardList,
  CalendarDays,
  CreditCard,
  Banknote,
  BarChart3,
  Bot,
  Settings,
  X,
  ArrowRight,
  Sparkles,
  User
} from 'lucide-react';
import styles from './Sidebar.module.css';

const navGroups = [
  {
    label: 'Navigation',
    color: '#3B82F6',
    items: [
      { id:'dashboard',    href:'/dashboard',    icon: LayoutDashboard, label:'Dashboard',     roles:['hr'] },
      { id:'my-dashboard', href:'/my-dashboard', icon: LayoutDashboard, label:'Dashboard',     roles:['employee'] },
      { id:'employees',    href:'/employees',    icon: Users,           label:'Team Members',  roles:['hr'] },
      { id:'attendance',   href:'/attendance',   icon: CalendarCheck,   label:'Attendance',    roles:['hr'] },
    ],
  },
  {
    label: 'Workforce',
    color: '#F59E0B',
    items: [
      { id:'leaves',    href:'/leaves',    icon: ClipboardList, label:'Leave Center', roles:['hr'] },
      { id:'my-leaves', href:'/my-leaves', icon: CalendarDays,  label:'My Leaves',    roles:['employee'] },
      { id:'payroll',   href:'/payroll',   icon: CreditCard,    label:'Payroll Hub',  roles:['hr'] },
      { id:'my-payroll',href:'/my-payroll',icon: Banknote,      label:'My Payslips',  roles:['employee'] },
    ],
  },
  {
    label: 'Intelligence',
    color: '#8B5CF6',
    items: [
      { id:'analytics',   href:'/analytics',   icon: BarChart3, label:'Analytics',   roles:['hr'] },
      { id:'ai-insights', href:'/ai-insights', icon: Bot,        label:'AI Insights', roles:['hr'] },
    ],
  },
  {
    label: 'Account',
    color: '#10B981',
    items: [
      { id:'profile',  href:'/profile',  icon: User,     label:'My Profile', roles:['hr','employee'] },
      { id:'settings', href:'/settings', icon: Settings, label:'Settings',   roles:['hr','employee'] },
    ],
  },
];

export default function Sidebar({ role = 'hr' }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user: authUser } = useAuth();

  const [indicatorY, setIndicatorY]    = useState(0);
  const [indicatorH, setIndicatorH]    = useState(0);
  const [indicatorVisible, setVisible] = useState(false);
  const [showPromo, setShowPromo]     = useState(true);
  const navRef = useRef(null);

  const filteredGroups = navGroups.map(g => ({
    ...g,
    items: g.items.filter(i => i.roles.includes(role)),
  })).filter(g => g.items.length > 0);

  const allItems = filteredGroups.flatMap(g => g.items);
  const active   = allItems.find(i => i.href === pathname || pathname.startsWith(i.href + '/'));

  useEffect(() => {
    if (!navRef.current || !active) return;
    const el = navRef.current.querySelector(`[data-nav-id="${active.id}"]`);
    if (!el) return;
    const navRect  = navRef.current.getBoundingClientRect();
    const elRect   = el.getBoundingClientRect();
    setIndicatorY(elRect.top - navRect.top);
    setIndicatorH(elRect.height);
    setVisible(true);
  }, [pathname, active]);

  const user = authUser || (role === 'hr'
    ? { name:'Carla Sanford', title:'HR Officer', initials:'CS', dept:'Human Resources' }
    : { name:'John Doe',      title:'Software Engineer', initials:'JD', dept:'Engineering' });

  return (
    <aside className={styles.sidebar} id="app-sidebar">
      {/* User Profile Header */}
      <div className={styles.profileSection} onClick={() => router.push('/profile')} style={{ cursor: 'pointer' }}>
        <div className={styles.avatarRing}>
          <div className={styles.avatarInner} suppressHydrationWarning>{user?.initials || 'CS'}</div>
          <div className={styles.onlineDot} />
        </div>
        <div className={styles.profileInfo}>
          <span className={styles.profileName} suppressHydrationWarning>{user?.name || 'User'}</span>
          <span className={styles.profileTitle} suppressHydrationWarning>{user?.title || user?.role?.toUpperCase() || 'HR OFFICER'}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} ref={navRef}>
        {/* Sliding Indicator */}
        <div
          className={styles.indicator}
          style={{ top:indicatorY, height:indicatorH, opacity: indicatorVisible ? 1 : 0 }}
        />

        {filteredGroups.map((group) => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel} style={{ color: group.color }}>
              {group.label}
            </span>
            {group.items.map((item, idx) => {
              const isActive = item.href === pathname || pathname.startsWith(item.href + '/');
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  data-nav-id={item.id}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={() => router.push(item.href)}
                  style={{ animationDelay:`${idx * 50}ms` }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={styles.navIcon}>
                    <IconComp size={18} strokeWidth={2} />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive && <span className={styles.activeDot} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* AI Promo Card at Bottom (HR only) */}
      {role === 'hr' && showPromo && (
        <div className={styles.promoCard}>
          <button className={styles.promoClose} onClick={() => setShowPromo(false)} aria-label="Close">
            <X size={14} />
          </button>
          <div className={styles.promoRobot}>
            <Sparkles size={24} />
          </div>
          <div className={styles.promoText}>
            <strong>Try AI Insights</strong>
            <span>Detect anomalies automatically</span>
          </div>
          <button className={styles.promoBtn} onClick={() => router.push('/ai-insights')}>
            Explore <ArrowRight size={13} style={{ marginLeft: 2 }} />
          </button>
        </div>
      )}
    </aside>
  );
}
