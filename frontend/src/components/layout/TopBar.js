'use client';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import styles from './TopBar.module.css';

const PAGE_TITLES = {
  '/dashboard':    { title:'Dashboard',      subtitle:'Good to see you! Here\'s what\'s happening today.' },
  '/my-dashboard': { title:'My Dashboard',   subtitle:'Welcome back. Here\'s your personal overview.' },
  '/employees':    { title:'Team Members',   subtitle:'Manage your workforce and employee profiles.' },
  '/attendance':   { title:'Attendance',     subtitle:'Monitor and track employee attendance records.' },
  '/leaves':       { title:'Leave Center',   subtitle:'Review, approve and manage all leave requests.' },
  '/my-leaves':    { title:'My Leaves',      subtitle:'Track and apply for your leave requests.' },
  '/payroll':      { title:'Payroll Hub',    subtitle:'Manage salaries and payment processing.' },
  '/my-payroll':   { title:'My Payslips',    subtitle:'View your salary details and payslip history.' },
  '/analytics':    { title:'Analytics',      subtitle:'Workforce intelligence and trend reports.' },
  '/ai-insights':  { title:'AI Insights',    subtitle:'Machine learning anomaly detection reports.' },
  '/settings':     { title:'Settings',       subtitle:'Manage your account preferences.' },
};

export default function TopBar() {
  const pathname  = usePathname();
  const [searchQ, setSearchQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount] = useState(3);
  const notifRef = useRef(null);

  const page = PAGE_TITLES[pathname] || PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k)) || ''] || { title:'DayFlow', subtitle:'HR Management System' };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetIcon = hour < 12 ? '☀️' : hour < 17 ? '🌤' : '🌙';

  const notifications = [
    { id:1, icon:'📋', text:'Sarah\'s leave request is pending approval', time:'2h ago', dot:'#F59E0B' },
    { id:2, icon:'🤖', text:'AI flagged 2 new anomalies in attendance', time:'4h ago', dot:'#EF4444' },
    { id:3, icon:'💳', text:'August payroll processing complete', time:'1d ago', dot:'#10B981' },
  ];

  // Close notif on outside click
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.topBar}>
      {/* Left: Greeting + page title */}
      <div className={styles.topLeft}>
        <div className={styles.greeting}>
          <span className={styles.greetIcon}>{greetIcon}</span>
          <div>
            <div className={styles.greetTitle}>{greeting}! <span style={{ fontWeight:800 }}>Welcome Back</span></div>
            <div className={styles.greetSub}>{page.subtitle}</div>
          </div>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className={styles.topRight}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
        </div>

        {/* Notification Bell */}
        <div className={styles.notifWrapper} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            🔔
            {notifCount > 0 && (
              <span className={styles.badge}>{notifCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span style={{ fontWeight:700 }}>Notifications</span>
                <button className={styles.markRead} style={{ fontSize:11, color:'#3B82F6' }}>Mark all read</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={styles.notifItem}>
                  <div className={styles.notifIconCircle} style={{ background:`${n.dot}22`, border:`1.5px solid ${n.dot}44` }}>
                    {n.icon}
                  </div>
                  <div className={styles.notifText}>
                    <div style={{ fontSize:12, fontWeight:500, color:'#0F172A' }}>{n.text}</div>
                    <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{n.time}</div>
                  </div>
                  <div className={styles.unreadDot} style={{ background:n.dot }} />
                </div>
              ))}
              <div className={styles.notifFooter}>View all updates</div>
            </div>
          )}
        </div>

        {/* User Quick Access */}
        <button className={styles.userChip}>
          <div className={styles.userChipAvatar}>CS</div>
          <span className={styles.userChipName}>Carla</span>
          <span style={{ fontSize:10, color:'#94A3B8', marginLeft:2 }}>▾</span>
        </button>
      </div>
    </div>
  );
}
