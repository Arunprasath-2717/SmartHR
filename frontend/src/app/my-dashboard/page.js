'use client';
import { useCounter } from '@/hooks/useCounter';
import { DonutChart, MiniBarChart } from '@/components/charts/Charts';
import { employeeDashboardData } from '@/lib/mockData';

export default function EmployeeDashboard() {
  const d = employeeDashboardData;
  const hoursToday   = useCounter(d.today_worked_hours, 1200, 1, true);
  const monthlyHours = useCounter(d.monthly_worked_hours, 1200, 0, true);
  const leaveBalance = useCounter(d.leave_balance.annual, 1200, 0, true);
  const salary       = useCounter(d.net_salary, 1200, 0, true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetIcon = hour < 12 ? '☀️' : hour < 17 ? '🌤' : '🌙';

  return (
    <div className="page-wrapper page-in">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 style={{ fontSize:36, fontWeight:700, letterSpacing:'-0.02em', animation:'card-in 500ms ease-out both' }}>
            {greeting}, John {greetIcon}
          </h1>
          <p className="caption mt-4">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      {/* Hero Stat Row — 4 Glass Cards */}
      <div className="grid-4 mb-20">
        {/* Card 1: Today's Hours */}
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
          <div className="label mb-8">Hours Today</div>
          <div style={{ fontSize:52, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1 }}>{hoursToday.toFixed(1)}<span style={{ fontSize:22 }}>h</span></div>
          <div className="progress-bar mt-12 mb-12">
            <div className="progress-fill" style={{ width:`${(d.today_worked_hours / 8) * 100}%` }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span className="caption">Target: 8h</span>
            <span className={`pill ${d.checked_in ? 'pill-active checked-in-badge' : 'pill-cancelled'}`} style={{ fontSize:11 }}>
              <span className="pulse-dot" style={{ display: d.checked_in ? 'inline-block' : 'none' }} />
              {d.checked_in ? 'Live · Checked In' : 'Checked Out'}
            </span>
          </div>
        </div>

        {/* Card 2: Monthly Hours */}
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
          <div className="label mb-8">Monthly Hours</div>
          <div style={{ fontSize:52, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1 }}>{monthlyHours}<span style={{ fontSize:22 }}>h</span></div>
          <div className="mt-16">
            <MiniBarChart data={d.weekly_hours} activeIndex={4} height={50} />
          </div>
        </div>

        {/* Card 3: Leave Balance */}
        <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
          <div className="label mb-12">Leave Balance</div>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <DonutChart value={d.leave_balance.annual} max={d.leave_balance.total} size={90} stroke={9}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700 }}>{leaveBalance}</div>
                <div style={{ fontSize:9, color:'var(--text-muted)', fontWeight:500 }}>days</div>
              </div>
            </DonutChart>
            <div style={{ flex:1 }}>
              <div className="flex gap-6 flex-wrap">
                <span className="pill pill-info" style={{ fontSize:10 }}>Annual · {d.leave_balance.annual}</span>
                <span className="pill pill-pending" style={{ fontSize:10 }}>Sick · {d.leave_balance.sick}</span>
              </div>
              <div className="caption mt-8">Used {d.leave_balance.used} / {d.leave_balance.total}</div>
            </div>
          </div>
          <a href="/my-leaves" className="btn btn-primary btn-sm mt-16" style={{ display:'inline-flex', width:'100%', justifyContent:'center' }}>Apply Leave</a>
        </div>

        {/* Card 4: Payslip (Dark Glass) */}
        <div className="card-glass-dark p-24" style={{ animation:'card-in 400ms ease-out 240ms both' }}>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:500, letterSpacing:'0.05em', marginBottom:8 }}>{d.payslip_period}</div>
          <div style={{ fontSize:48, fontWeight:700, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>
            ₹{salary.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:4 }}>Net Salary</div>
          <div className="flex justify-between items-center mt-16">
            <span className="pill pill-paid">● {d.payslip_status}</span>
            <a href="/my-payroll" style={{ color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600 }} className="text-semibold">View Details →</a>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="grid-60-40">
        {/* Recent Activity Feed */}
        <div className="card">
          <div className="section-header">
            <span className="card-title">Recent Activity</span>
            <a href="#" className="text-accent text-sm text-semibold">View All</a>
          </div>
          <div style={{ padding:'16px 24px' }}>
            <div className="timeline">
              {d.recent_activity.map((item, i) => (
                <div key={item.id} className="timeline-item" style={{ animation:`card-in 400ms ease-out ${i*60}ms both` }}>
                  <div className="timeline-dot" style={{ background: item.color }} />
                  <div className="timeline-line" />
                  <div className="timeline-content">
                    <div className="flex justify-between items-start">
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{item.title}</div>
                        <div className="caption mt-2">{item.desc}</div>
                      </div>
                      <span className="caption flex-shrink-0">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions (Dark Glass) */}
        <div className="card-glass-dark" style={{ animation:'card-in 400ms ease-out 320ms both' }}>
          <div className="section-header" style={{ borderBottomColor:'rgba(255,255,255,0.08)' }}>
            <span className="card-title text-white">Quick Actions</span>
          </div>
          {[
            { icon:'📋', label:'Apply Leave',      href:'/my-leaves' },
            { icon:'💳', label:'View Payslips',    href:'/my-payroll' },
            { icon:'⏱',  label:'My Attendance',    href:'/attendance' },
            { icon:'👤', label:'Update Profile',   href:'/settings' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              style={{
                display:'flex', alignItems:'center', gap:14, padding:'14px 20px',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition:'background 150ms', cursor:'pointer', textDecoration:'none',
                animation:`card-in 400ms ease-out ${320 + i*60}ms both`,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent-20)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{action.icon}</div>
              <span style={{ flex:1, color:'#fff', fontSize:13, fontWeight:500 }}>{action.label}</span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:14, transition:'transform 150ms' }}>›</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
