'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import {
  Search,
  Bell,
  Sun,
  SunMedium,
  Moon,
  ChevronDown,
  ClipboardList,
  Bot,
  CreditCard,
  User,
  LogOut,
  Shield,
  ClockCheck,
  Clock
} from 'lucide-react';
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
  '/profile':      { title:'My Profile',     subtitle:'View and edit your personal & job details.' },
};

export default function TopBar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user, role, logout, switchRole } = useAuth();
  const toast     = useToast();

  const [searchQ, setSearchQ] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [checkedIn, setCheckedIn] = useState(true);
  const [notifCount] = useState(3);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const page = PAGE_TITLES[pathname] || PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => pathname.startsWith(k)) || ''] || { title:'Dayflow', subtitle:'HR Management System' };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? SunMedium : Moon;

  const notifications = [
    { id:1, icon: ClipboardList, text:'Sarah\'s leave request is pending approval', time:'2h ago', dot:'#F59E0B' },
    { id:2, icon: Bot,           text:'AI flagged 2 new anomalies in attendance', time:'4h ago', dot:'#EF4444' },
    { id:3, icon: CreditCard,    text:'August payroll processing complete', time:'1d ago', dot:'#10B981' },
  ];

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleToggleAttendance = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      toast({ message: 'Checked In successfully at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'success' });
    } else {
      setCheckedIn(false);
      toast({ message: 'Checked Out successfully at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'info' });
    }
  };

  return (
    <div className={styles.topBar}>
      {/* Left: Greeting + page title */}
      <div className={styles.topLeft}>
        <div className={styles.greeting}>
          <span className={styles.greetIcon} style={{ color: '#FCD34D', display:'flex', alignItems:'center' }}>
            <GreetIcon size={24} />
          </span>
          <div>
            <div className={styles.greetTitle}>{greeting}! <span style={{ fontWeight:800 }}>{user?.name || 'Welcome Back'}</span></div>
            <div className={styles.greetSub}>{page.subtitle}</div>
          </div>
        </div>
      </div>

      {/* Right: Actions & User context */}
      <div className={styles.topRight}>
        {/* Attendance Check-in / Check-out Button */}
        <button
          onClick={handleToggleAttendance}
          style={{
            padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: checkedIn ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
            color: checkedIn ? '#6EE7B7' : '#FCD34D',
            border: `1px solid ${checkedIn ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
            display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'all 200ms'
          }}
        >
          {checkedIn ? <ClockCheck size={15} /> : <Clock size={15} />}
          {checkedIn ? 'Checked In' : 'Check In Now'}
        </button>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon} style={{ color: 'rgba(255,255,255,0.6)', display:'flex', alignItems:'center' }}>
            <Search size={15} />
          </span>
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
            <Bell size={18} />
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
              {notifications.map(n => {
                const ItemIcon = n.icon;
                return (
                  <div key={n.id} className={styles.notifItem}>
                    <div className={styles.notifIconCircle} style={{ background:`${n.dot}18`, color: n.dot, border:`1px solid ${n.dot}33` }}>
                      <ItemIcon size={16} />
                    </div>
                    <div className={styles.notifText}>
                      <div style={{ fontSize:12, fontWeight:500, color:'#0F172A' }}>{n.text}</div>
                      <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{n.time}</div>
                    </div>
                    <div className={styles.unreadDot} style={{ background:n.dot }} />
                  </div>
                );
              })}
              <div className={styles.notifFooter}>View all updates</div>
            </div>
          )}
        </div>

        {/* User Profile Menu & Role Switcher */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button className={styles.userChip} onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <div className={styles.userChipAvatar}>{user?.initials || 'CS'}</div>
            <span className={styles.userChipName}>{user?.name?.split(' ')[0] || 'User'}</span>
            <ChevronDown size={14} style={{ color:'rgba(255,255,255,0.7)', marginLeft:2 }} />
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 220,
              background: '#fff', borderRadius: 16, border: '1px solid rgba(59,130,246,0.12)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 16px rgba(59,130,246,0.15)', overflow: 'hidden', zIndex: 1000,
              animation: 'dropdown-in 150ms ease-out'
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(59,130,246,0.04)' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{user?.email}</div>
                <span className="pill pill-info" style={{ marginTop: 6, fontSize: 10 }}>
                  Role: {role.toUpperCase()}
                </span>
              </div>

              <div style={{ padding: '6px' }}>
                <button
                  className="dropdown-item"
                  onClick={() => { setUserMenuOpen(false); router.push('/profile'); }}
                  style={{ width: '100%', borderRadius: 8 }}
                >
                  <User size={15} /> My Profile
                </button>

                <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '4px 0' }} />

                <button
                  className="dropdown-item danger"
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  style={{ width: '100%', borderRadius: 8, color: '#EF4444' }}
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
