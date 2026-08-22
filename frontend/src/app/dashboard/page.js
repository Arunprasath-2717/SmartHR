'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCounter } from '@/hooks/useCounter';
import { useInView } from '@/hooks/useInView';
import { LineChart } from '@/components/charts/Charts';
import { hrDashboardData } from '@/lib/mockData';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ThumbsUp,
  Target,
  Handshake,
  Bot,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import ShinyButton from '@/components/ui/ShinyButton';

/* ─── MINI SPARKLINE used in hero cards ─── */
function Sparkline({ data, color = '#6EE7B7', height = 60 }) {
  const [ref, inView] = useInView();
  const max = Math.max(...data, 1);
  const w = 280, h = height;
  const pts = data.map((v, i) => ({ x:(i/(data.length-1))*w, y:h-(v/max)*h*0.85-4 }));
  const line = pts.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length-1].x} ${h} L0 ${h} Z`;

  return (
    <div ref={ref} style={{width:'100%',height}}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#sg-${color.replace('#','')})`}
          style={{ opacity: inView ? 1 : 0, transition:'opacity 800ms 400ms' }}/>
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 1000, strokeDashoffset: inView ? 0 : 1000, transition:'stroke-dashoffset 1000ms ease-out 200ms' }}/>
        {pts.map((p,i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === pts.length-1 ? 5 : 3}
            fill={color} opacity={0.8}
            style={{ opacity: inView ? 0.8 : 0, transition:`opacity 300ms ease-out ${i*80 + 800}ms`, filter: i === pts.length-1 ? `drop-shadow(0 0 4px ${color})` : 'none' }}/>
        ))}
      </svg>
    </div>
  );
}

/* ─── HERO STAT CARD ─── */
function HeroCard({ title, value, suffix='', prefix='', sub=[], sparkColor, sparkData, colorAccent='#6EE7B7', style={}, delay=0 }) {
  const count = useCounter(value, 1400, 0, true);
  return (
    <div style={{
      background:'rgba(255,255,255,0.10)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      border:'1px solid rgba(255,255,255,0.20)',
      borderRadius:20,
      padding:'24px 24px 0',
      color:'#fff',
      position:'relative',
      overflow:'hidden',
      animation:`hero-card-3d 600ms cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
      transition:'transform 300ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms',
      cursor:'default',
      ...style,
    }}
    onMouseEnter={e => { e.currentTarget.style.transform='perspective(600px) rotateX(-3deg) translateY(-8px)'; e.currentTarget.style.boxShadow='0 24px 48px rgba(0,0,0,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${colorAccent},${colorAccent}88)`,borderRadius:'20px 20px 0 0' }}/>

      <div style={{ fontSize:36, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1, marginBottom:4 }}>
        {prefix}{count}{suffix}
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:colorAccent, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:16 }}>{title}</div>

      {sparkData && (
        <div style={{ margin:'0 -24px', marginBottom:-1 }}>
          <Sparkline data={sparkData} color={colorAccent} height={70} />
        </div>
      )}

      {sub.length > 0 && (
        <div style={{ display:'flex', background:'rgba(255,255,255,0.1)', backdropFilter:'blur(8px)', margin:'0 -24px', padding:'10px 24px', borderTop:'1px solid rgba(255,255,255,0.1)' }}>
          {sub.map((s, i) => (
            <div key={i} style={{ flex:1, textAlign:'center', borderRight: i < sub.length-1 ? '1px solid rgba(255,255,255,0.15)' : 'none', padding:'4px 0' }}>
              <div style={{ fontSize:20, fontWeight:800 }}>{s.val}</div>
              <div style={{ fontSize:10, color:colorAccent, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── ACTIVITY ITEM ─── */
function ActivityItem({ time, IconComp, iconBg, text, sub, delay=0 }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(59,130,246,0.06)', animation:`card-in 300ms ease-out ${delay}ms both` }}>
      <div style={{ fontSize:12, color:'#94A3B8', minWidth:52, flexShrink:0, paddingTop:3, textAlign:'right' }}>{time}</div>
      <div style={{
        width:36,height:36,borderRadius:'50%',flexShrink:0,
        background:iconBg, display:'flex',alignItems:'center',justifyContent:'center',color: iconBg.includes('239') ? '#EF4444' : iconBg.includes('16,185') ? '#10B981' : iconBg.includes('245') ? '#F59E0B' : '#3B82F6',
        boxShadow:`0 4px 12px ${iconBg}55`, transition:'transform 200ms cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform='scale(1.15) rotate(5deg)'}
      onMouseLeave={e => e.currentTarget.style.transform=''}>
        <IconComp size={18} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, fontSize:13, color:'#0F172A' }}>{text}</div>
        {sub && <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── BOTTOM STAT ROW CARD ─── */
function BottomStatCard({ label, value, prefix='', suffix='', trend, color, sparkData, delay=0 }) {
  const count = useCounter(parseFloat(value.toString().replace(/,/g,'')), 1400, typeof value === 'string' && value.includes('.') ? 2 : 0, true);
  return (
    <div className="card" style={{ padding:'20px 24px', animation:`card-in-3d 500ms ease-out ${delay}ms both` }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ fontSize:28, fontWeight:800, color, letterSpacing:'-0.02em' }}>
          {prefix}{typeof count === 'number' ? count.toLocaleString('en-IN') : count}{suffix}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:600, color: trend.up ? '#10B981':'#EF4444' }}>
          {trend.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {trend.label}
        </div>
      </div>
      <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:12 }}>{label}</div>
      {sparkData && (
        <div style={{ height:40 }}>
          <Sparkline data={sparkData} color={color} height={40} />
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN PAGE ═══ */
export default function HRDashboard() {
  const d = hrDashboardData;
  const [checkedRows, setCheckedRows] = useState([]);

  const attendanceSpark = d.monthly_attendance.map(m => m.rate);
  const presentSpark    = [68,72,75,70,80,78,85,82,88,84,90,87];
  const leaveSpark      = [5,8,6,10,4,7,9,5,11,8,6,9];

  const activities = [
    { time:'2 hrs ago', IconComp: ThumbsUp,  iconBg:'rgba(59,130,246,0.15)', text:'+1,652 New Employees Onboarded', sub:'Quarterly onboarding batch completed!' },
    { time:'4 hrs ago', IconComp: Target,    iconBg:'rgba(239,68,68,0.15)',  text:'5 New Leave Requests Submitted', sub:'Needs your review.' },
    { time:'2 days ago',IconComp: Handshake, iconBg:'rgba(16,185,129,0.15)', text:'+3 Contracts Renewed', sub:'Great retention this quarter!' },
    { time:'2 days ago',IconComp: Bot,       iconBg:'rgba(245,158,11,0.15)', text:'AI detected 2 Attendance Anomalies', sub:'Review AI Insights for details.' },
  ];

  const projects = d.employees.slice(0,5).map((emp, i) => ({
    ...emp,
    project: ['Q3 Performance Review','Leave Policy Update','Payroll Audit','Team Building','Compliance Audit'][i],
    due: ['Sep, 15','Oct, 01','Aug, 30','Sep, 22','Oct, 10'][i],
    priority: ['Low','High','Medium','Low','High'][i],
  }));

  return (
    <div style={{ animation:'page-in 350ms ease-out both' }}>
      {/* ── HEADER ACTIONS ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <ShinyButton onClick={() => window.location.href='/payroll'}>Generate Payroll Process</ShinyButton>
      </div>

      {/* ── HERO STAT CARDS ── */}
      <div style={{
        background:'linear-gradient(135deg, #0B1E3D 0%, #1A3A6B 55%, #2563EB 100%)',
        borderRadius:24, padding:'28px 28px 32px', marginBottom:28,
        position:'relative', overflow:'hidden',
        boxShadow:'0 20px 60px rgba(11,30,61,0.4)',
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 0.5fr 0.5fr', gap:16, position:'relative' }}>
          <HeroCard
            title="Total Employees"
            value={d.total_employees}
            suffix="+"
            colorAccent="#6EE7B7"
            sparkData={presentSpark}
            sub={[{val:d.present_today,label:'Present'},{val:d.absent_today,label:'Absent'},{val:d.pending_leaves,label:'Pending'}]}
            delay={0}
          />
          <HeroCard
            title="Attendance Rate"
            value={d.attendance_rate}
            suffix="%"
            colorAccent="#93C5FD"
            sparkData={attendanceSpark}
            sub={[{val:d.active_employees,label:'Active'},{val:d.new_this_month,label:'New'},{val:d.ai_anomalies_total,label:'Flagged'}]}
            delay={100}
          />
          {/* Compact right cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:16, padding:'18px 20px', color:'#fff', animation:'hero-card-3d 600ms ease-out 200ms both' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#FCD34D', letterSpacing:'-0.02em' }}>₹{(d.total_employees * 45000).toLocaleString('en-IN')}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2, marginBottom:10 }}>Monthly Payroll</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)' }}>
                  <div style={{ width:'73%', height:'100%', borderRadius:2, background:'linear-gradient(90deg,#FCD34D,#F59E0B)' }}/>
                </div>
                <span style={{ fontSize:10, color:'#FCD34D', fontWeight:600, display:'flex', alignItems:'center', gap:2 }}>
                  <TrendingUp size={12} /> 4.2%
                </span>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.18)', borderRadius:16, padding:'18px 20px', color:'#fff', animation:'hero-card-3d 600ms ease-out 300ms both' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#6EE7B7' }}>{d.total_employees}+</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2, marginBottom:10 }}>Page Views</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)' }}>
                  <div style={{ width:'58%', height:'100%', borderRadius:2, background:'linear-gradient(90deg,#6EE7B7,#10B981)' }}/>
                </div>
                <span style={{ fontSize:10, color:'#6EE7B7', fontWeight:600, display:'flex', alignItems:'center', gap:2 }}>
                  <TrendingUp size={12} /> 8.1%
                </span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'rgba(239,68,68,0.25)', backdropFilter:'blur(16px)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:16, padding:'18px 20px', color:'#fff', animation:'hero-card-3d 600ms ease-out 380ms both' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#FCA5A5' }}>{d.ai_anomalies_total}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2, marginBottom:10 }}>AI Anomalies</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <AlertTriangle size={14} color="#FCA5A5" />
                <span style={{ fontSize:10, color:'#FCA5A5', fontWeight:600 }}>{d.ai_high_risk} High Risk</span>
              </div>
            </div>
            <div style={{ background:'rgba(59,130,246,0.25)', backdropFilter:'blur(16px)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:16, padding:'18px 20px', color:'#fff', animation:'hero-card-3d 600ms ease-out 460ms both' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#93C5FD' }}>{d.pending_leaves}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginTop:2, marginBottom:10 }}>Pending Leaves</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Clock size={14} color="#93C5FD" />
                <span style={{ fontSize:10, color:'#93C5FD', fontWeight:600 }}>Needs Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW: Projects Table + Latest Updates ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:20, marginBottom:20 }}>
        {/* Projects Table */}
        <div className="card card-no-hover">
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(59,130,246,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Team Assignments</span>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <Link href="/employees" style={{ fontSize:12, color:'#3B82F6', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                View All <ArrowRight size={13} />
              </Link>
              <MoreHorizontal size={18} style={{ color:'#94A3B8', cursor:'pointer' }} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'32px 1fr 1fr 90px 80px', gap:12, padding:'10px 24px', borderBottom:'1px solid rgba(59,130,246,0.06)', background:'rgba(248,250,255,0.8)' }}>
            {['CHECK','ASSIGNED','PROJECT','DUE DATE','PRIORITY'].map((h,i) => (
              <div key={i} style={{ fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#94A3B8' }}>{h}</div>
            ))}
          </div>
          {projects.map((emp, i) => (
            <div key={emp.id}
              style={{ display:'grid', gridTemplateColumns:'32px 1fr 1fr 90px 80px', gap:12, padding:'13px 24px', borderBottom:'1px solid rgba(59,130,246,0.05)', alignItems:'center', cursor:'pointer' }}
            >
              <input type="checkbox" style={{ accentColor:'#3B82F6', width:14, height:14 }}
                checked={checkedRows.includes(emp.id)}
                onChange={e => setCheckedRows(p => e.target.checked ? [...p,emp.id] : p.filter(r=>r!==emp.id))} />
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:32,height:32,borderRadius:'50%',background:`linear-gradient(135deg,${['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'][i]},${['#1D4ED8','#059669','#6D28D9','#D97706','#DC2626'][i]})`,color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{emp.initials}</div>
                <div>
                  <div style={{ fontSize:13,fontWeight:600,color:'#0F172A' }}>{emp.name}</div>
                  <div style={{ fontSize:11,color:'#94A3B8' }}>{emp.title}</div>
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight:500, color:'#334155' }}>{emp.project}</div>
              <div style={{ fontSize:12, color:'#64748B' }}>{emp.due}</div>
              <span style={{
                display:'inline-flex',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600,
                background: emp.priority==='High' ? '#FEE2E2':emp.priority==='Medium' ? '#FEF3C7':'#D1FAE5',
                color: emp.priority==='High' ? '#991B1B':emp.priority==='Medium' ? '#92400E':'#065F46',
                border: `1px solid ${emp.priority==='High' ? 'rgba(239,68,68,0.2)':emp.priority==='Medium' ? 'rgba(245,158,11,0.2)':'rgba(16,185,129,0.2)'}`,
              }}>{emp.priority}</span>
            </div>
          ))}
        </div>

        {/* Latest Updates */}
        <div className="card card-no-hover">
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(59,130,246,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Latest Updates</span>
            <MoreHorizontal size={18} style={{ color:'#94A3B8', cursor:'pointer' }} />
          </div>
          <div style={{ padding:'8px 24px' }}>
            {activities.map((a, i) => (
              <ActivityItem key={i} {...a} delay={i*80} />
            ))}
          </div>
          <div style={{ padding:'12px 24px', textAlign:'right', borderTop:'1px solid rgba(59,130,246,0.06)' }}>
            <a href="/analytics" style={{ fontSize:12, fontWeight:600, color:'#3B82F6', display:'inline-flex', alignItems:'center', gap:4 }}>
              View all updates <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: 3 Stat Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20, marginBottom:20 }}>
        <BottomStatCard label="Total Employees" value={d.total_employees} color="#3B82F6" sparkData={presentSpark} trend={{ up:true, label:'12%' }} delay={0}/>
        <BottomStatCard label="Attendance Rate" value={d.attendance_rate} suffix="%" color="#10B981" sparkData={attendanceSpark} trend={{ up:true, label:'2.1%' }} delay={100}/>
        <BottomStatCard label="AI Anomaly Score" value={d.ai_anomalies_total} color="#EF4444" sparkData={leaveSpark} trend={{ up:false, label:'1 new' }} delay={200}/>
      </div>

      {/* ── BOTTOM SECTION ── */}
      <div className="grid-65-35">
        {/* Leave Distribution Card */}
        <div className="card card-no-hover">
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(59,130,246,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Leave Overview</span>
            <MoreHorizontal size={18} style={{ color:'#94A3B8', cursor:'pointer' }} />
          </div>
          <div>
            {d.leave_distribution.map((row, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'16px 24px', borderBottom: i < d.leave_distribution.length-1 ? '1px solid rgba(59,130,246,0.05)' : 'none', gap:16 }}>
                <div style={{ width:52, textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:800, color:['#3B82F6','#10B981','#EF4444'][i] }}>{row.count}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:6 }}>{row.label}</div>
                  <div style={{ height:6, borderRadius:3, background:'rgba(0,0,0,0.06)', overflow:'hidden' }}>
                    <div style={{ width:`${row.pct}%`, height:'100%', borderRadius:3, background:['linear-gradient(90deg,#3B82F6,#1D4ED8)','linear-gradient(90deg,#10B981,#059669)','linear-gradient(90deg,#EF4444,#DC2626)'][i] }}/>
                  </div>
                </div>
                <span style={{ fontWeight:700, fontSize:16, minWidth:40, color:['#3B82F6','#10B981','#EF4444'][i] }}>{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="card card-no-hover" style={{ background:'linear-gradient(180deg,#0F172A,#1E293B)', borderRadius:20 }}>
          <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Pending Approvals</span>
            <span style={{ padding:'4px 10px', borderRadius:20, background:'rgba(239,68,68,0.25)', color:'#FCA5A5', fontSize:11, fontWeight:700 }}>
              {d.pending_approvals.length} waiting
            </span>
          </div>
          {d.pending_approvals.map((item, i) => (
            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 24px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background:`linear-gradient(135deg,${['#3B82F6','#10B981','#F59E0B','#EF4444'][i]},${['#1D4ED8','#059669','#D97706','#DC2626'][i]})`,color:'#fff',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>{item.initials}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:13, color:'#fff' }}>{item.name}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{item.leave_type} · {item.dates}</div>
              </div>
              <a href="/leaves" style={{ fontSize:12, color:'#93C5FD', fontWeight:600, whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:2 }}>
                Review <ArrowRight size={13} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
