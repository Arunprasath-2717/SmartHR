'use client';
import { useCounter } from '@/hooks/useCounter';
import { DonutChart, MiniBarChart } from '@/components/charts/Charts';
import { employeeDashboardData } from '@/lib/mockData';
import {
  Sun,
  SunMedium,
  Moon,
  ClipboardList,
  CreditCard,
  Clock,
  Settings,
  ChevronRight
} from 'lucide-react';

export default function EmployeeDashboard() {
  const d = employeeDashboardData;
  const hoursToday   = useCounter(d.today_worked_hours, 1200, 1, true);
  const monthlyHours = useCounter(d.monthly_worked_hours, 1200, 0, true);
  const leaveBalance = useCounter(d.leave_balance.annual, 1200, 0, true);
  const salary       = useCounter(d.net_salary, 1200, 0, true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetIcon = hour < 12 ? Sun : hour < 17 ? SunMedium : Moon;

  return (
    <div className="page-in">
      {/* Hero Banner with Dark Navy Glass Theme */}
      <div style={{
        background: 'linear-gradient(135deg, #0B1E3D 0%, #1A3A6B 55%, #2563EB 100%)',
        borderRadius: 24, padding: '28px 28px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(11,30,61,0.35)',
      }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 50% 80% at 80% 30%, rgba(139,92,246,0.2) 0%,transparent 70%)', pointerEvents:'none' }} />
        
        <div style={{ position:'relative', zIndex:1, marginBottom:20 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'#93C5FD', letterSpacing:'0.05em', textTransform:'uppercase' }}>Personal Workspace</span>
          <h1 style={{ fontSize:28, fontWeight:800, color:'#fff', marginTop:2, display:'flex', alignItems:'center', gap:8 }}>
            {greeting}, John <GreetIcon size={26} color="#FCD34D" />
          </h1>
        </div>

        {/* 4 Hero Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, position:'relative', zIndex:1 }}>
          {/* Card 1 */}
          <div style={{
            background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.18)', borderRadius:16, padding:20, color:'#fff',
            transition:'transform 300ms cubic-bezier(0.34,1.56,0.64,1)', animation:'card-in-3d 500ms ease-out 0ms both',
          }}>
            <div style={{ fontSize:11, color:'#93C5FD', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Hours Today</div>
            <div style={{ fontSize:36, fontWeight:800, letterSpacing:'-0.03em', margin:'8px 0 4px' }}>{hoursToday.toFixed(1)}<span style={{ fontSize:18 }}>h</span></div>
            <div className="progress-bar" style={{ background:'rgba(255,255,255,0.15)', height:5, marginBottom:10 }}>
              <div className="progress-fill" style={{ width:`${(d.today_worked_hours / 8) * 100}%`, background:'linear-gradient(90deg, #6EE7B7, #10B981)' }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11 }}>
              <span style={{ color:'rgba(255,255,255,0.6)' }}>Target: 8h</span>
              <span style={{ color:'#6EE7B7', fontWeight:600 }}>{d.checked_in ? '● Checked In' : 'Checked Out'}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.18)', borderRadius:16, padding:20, color:'#fff',
            transition:'transform 300ms cubic-bezier(0.34,1.56,0.64,1)', animation:'card-in-3d 500ms ease-out 100ms both',
          }}>
            <div style={{ fontSize:11, color:'#93C5FD', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Monthly Hours</div>
            <div style={{ fontSize:36, fontWeight:800, letterSpacing:'-0.03em', margin:'8px 0 4px' }}>{monthlyHours}<span style={{ fontSize:18 }}>h</span></div>
            <div style={{ marginTop:8 }}>
              <MiniBarChart data={d.weekly_hours} activeIndex={4} color="#6EE7B7" height={36} />
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.18)', borderRadius:16, padding:20, color:'#fff',
            transition:'transform 300ms cubic-bezier(0.34,1.56,0.64,1)', animation:'card-in-3d 500ms ease-out 200ms both',
          }}>
            <div style={{ fontSize:11, color:'#93C5FD', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Leave Balance</div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:6 }}>
              <DonutChart value={d.leave_balance.annual} max={d.leave_balance.total} size={64} stroke={7} color="#FCD34D" bg="rgba(255,255,255,0.15)">
                <span style={{ fontSize:15, fontWeight:800, color:'#fff' }}>{leaveBalance}</span>
              </DonutChart>
              <div>
                <div style={{ fontSize:12, fontWeight:600 }}>{d.leave_balance.annual} Days</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,0.6)' }}>Used {d.leave_balance.used}/{d.leave_balance.total}</div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div style={{
            background:'rgba(255,255,255,0.12)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(255,255,255,0.22)', borderRadius:16, padding:20, color:'#fff',
            transition:'transform 300ms cubic-bezier(0.34,1.56,0.64,1)', animation:'card-in-3d 500ms ease-out 300ms both',
          }}>
            <div style={{ fontSize:11, color:'#FCD34D', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em' }}>Net Payslip</div>
            <div style={{ fontSize:32, fontWeight:800, letterSpacing:'-0.03em', margin:'6px 0 2px' }}>₹{salary.toLocaleString('en-IN')}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>{d.payslip_period}</div>
            <span style={{ padding:'3px 8px', borderRadius:20, background:'rgba(16,185,129,0.25)', color:'#6EE7B7', fontSize:10, fontWeight:700 }}>● {d.payslip_status}</span>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid-60-40">
        {/* Activity Feed */}
        <div className="card card-no-hover">
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(59,130,246,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Recent Activity</span>
            <span style={{ fontSize:12, color:'#3B82F6', fontWeight:600, cursor:'pointer' }}>View All</span>
          </div>
          <div style={{ padding:'16px 24px' }}>
            <div className="timeline">
              {d.recent_activity.map((item, i) => (
                <div key={item.id} className="timeline-item" style={{ animation:`card-in 400ms ease-out ${i*60}ms both` }}>
                  <div className="timeline-dot" style={{ background: item.color, boxShadow:`0 0 8px ${item.color}66` }} />
                  <div className="timeline-line" />
                  <div className="timeline-content">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13, color:'#0F172A' }}>{item.title}</div>
                        <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{item.desc}</div>
                      </div>
                      <span style={{ fontSize:11, color:'#94A3B8', flexShrink:0 }}>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card card-no-hover">
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(59,130,246,0.07)' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Quick Actions</span>
          </div>
          <div style={{ padding:'12px 16px' }}>
            {[
              { icon: ClipboardList, label:'Apply for Leave', sub:'Submit a new leave request', href:'/my-leaves', color:'#3B82F6' },
              { icon: CreditCard,    label:'View Payslips', sub:'Download latest salary statement', href:'/my-payroll', color:'#10B981' },
              { icon: Clock,         label:'My Attendance', sub:'Check monthly hours & logs', href:'/attendance', color:'#F59E0B' },
              { icon: Settings,      label:'Account Settings', sub:'Manage security & profile', href:'/settings', color:'#8B5CF6' },
            ].map((act, i) => {
              const ActionIcon = act.icon;
              return (
                <a
                  key={i}
                  href={act.href}
                  style={{
                    display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14,
                    textDecoration:'none', color:'inherit', transition:'all 200ms', marginBottom:4,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(59,130,246,0.05)'; e.currentTarget.style.transform='translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.transform=''; }}
                >
                  <div style={{ width:40, height:40, borderRadius:12, background:`${act.color}15`, color:act.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <ActionIcon size={20} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0F172A' }}>{act.label}</div>
                    <div style={{ fontSize:11, color:'#94A3B8', marginTop:1 }}>{act.sub}</div>
                  </div>
                  <ChevronRight size={18} style={{ color:'#CBD5E1' }} />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
