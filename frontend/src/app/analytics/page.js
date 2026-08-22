'use client';
import { useState } from 'react';
import { analyticsOverview, attendanceTrend, leaveAnalytics } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { LineChart, DualLineChart, GroupedBarChart, DonutChart } from '@/components/charts/Charts';
import { Users, Clock, CheckCircle2, ClipboardList, Check, TrendingUp } from 'lucide-react';

const TABS = ['Overview','Attendance','Leave'];

export default function AnalyticsPage() {
  const [tab, setTab] = useState('Overview');
  const [dept, setDept] = useState('All');

  const totalEmp   = useCounter(analyticsOverview.total_employees, 1200, 0, true);
  const avgHours   = useCounter(analyticsOverview.avg_hours, 1200, 1, true);
  const rate       = useCounter(analyticsOverview.attendance_rate, 1200, 1, true);
  const pending    = useCounter(analyticsOverview.pending_leaves, 1200, 0, true);
  const approved   = useCounter(analyticsOverview.approved_this_month, 1200, 0, true);

  const leaveTotal   = useCounter(leaveAnalytics.total, 1200, 0, true);
  const leaveApp     = useCounter(leaveAnalytics.approved, 1200, 0, true);
  const leavePend    = useCounter(leaveAnalytics.pending, 1200, 0, true);
  const leaveRej     = useCounter(leaveAnalytics.rejected, 1200, 0, true);

  const attRate = useCounter(analyticsOverview.attendance_rate, 1200, 1, true);

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="caption mt-4">Workforce intelligence and trends</p>
        </div>
      </div>

      {/* Glass Filter Bar */}
      <div className="glass p-20 mb-20" style={{ borderRadius:'var(--radius-lg)', display:'flex', gap:12, alignItems:'center', animation:'slide-down 300ms ease-out both' }}>
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)' }}>Date Range</div>
        <input type="date" className="input" style={{ width:160 }} defaultValue="2026-08-01" />
        <span className="text-muted">–</span>
        <input type="date" className="input" style={{ width:160 }} defaultValue="2026-08-31" />
        <select className="input" style={{ width:160 }} value={dept} onChange={e => setDept(e.target.value)}>
          <option>All Departments</option>
          <option>Engineering</option><option>Design</option><option>Marketing</option>
        </select>
        <button className="btn btn-primary btn-sm ml-auto">Apply</button>
        <button className="btn btn-ghost btn-sm">Reset</button>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div style={{ animation:'page-in 200ms ease-out both' }}>
          <div className="grid-4 mb-24" style={{ gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label:'Total Employees', val:totalEmp,  color:'var(--accent)', icon: Users },
              { label:'Avg Worked Hours', val:`${avgHours.toFixed(1)}h`, color:'var(--info)', icon: Clock },
              { label:'Attendance Rate',  val:`${rate.toFixed(1)}%`, color:'var(--success)', icon: CheckCircle2 },
              { label:'Pending Leaves',   val:pending,  color:'var(--warning)', icon: ClipboardList },
              { label:'Approved This Month', val:approved, color:'var(--success)', icon: Check },
            ].map((kpi, i) => {
              const KpiIcon = kpi.icon;
              return (
                <div key={i} className="card p-24" style={{ animation:`card-in 400ms ease-out ${i*60}ms both` }}>
                  <div style={{ marginBottom:10, color: kpi.color, display:'flex', alignItems:'center' }}>
                    <KpiIcon size={24} />
                  </div>
                  <div style={{ fontSize:36, fontWeight:700, color:kpi.color }}>{kpi.val}</div>
                  <div className="label mt-6">{kpi.label}</div>
                  <div style={{ marginTop:12 }}>
                    <LineChart data={analyticsOverview.attendance_trend} height={30} color={kpi.color} showArea={false} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid-55-45">
            <div className="card" style={{ animation:'card-in 400ms ease-out 360ms both' }}>
              <div className="section-header">
                <span className="card-title">Attendance vs Leave Correlation</span>
              </div>
              <div style={{ padding:'20px 24px' }}>
                <DualLineChart data={attendanceTrend} />
                <div className="flex gap-16 mt-12">
                  <div className="flex items-center gap-6"><div style={{ width:12, height:3, borderRadius:2, background:'var(--accent)' }} /><span className="caption">Present</span></div>
                  <div className="flex items-center gap-6"><div style={{ width:12, height:3, borderRadius:2, background:'var(--error)' }} /><span className="caption">Absent</span></div>
                </div>
              </div>
            </div>
            <div className="card" style={{ animation:'card-in 400ms ease-out 440ms both' }}>
              <div className="section-header">
                <span className="card-title">Department Breakdown</span>
              </div>
              <div style={{ padding:'20px 24px' }}>
                {['Engineering','Design','Marketing','HR','Finance'].map((d, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:12, fontWeight:500, minWidth:90, color:'var(--text-muted)' }}>{d}</span>
                    <div style={{ flex:1, height:8, borderRadius:4, background:'rgba(0,0,0,0.06)', overflow:'hidden' }}>
                      <div style={{ width:`${[78, 65, 85, 90, 70][i]}%`, height:'100%', background:'var(--accent)', borderRadius:4, transition:`width 600ms ease-out ${i*80}ms` }} />
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, minWidth:36 }}>{[78, 65, 85, 90, 70][i]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {tab === 'Attendance' && (
        <div style={{ animation:'page-in 200ms ease-out both' }}>
          <div className="grid-2 mb-24">
            <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
              <div className="label mb-6">Average Hours</div>
              <div style={{ fontSize:42, fontWeight:700 }}>{avgHours.toFixed(1)}<span style={{ fontSize:22 }}>h</span></div>
            </div>
            <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
              <div className="label mb-6">Attendance Rate</div>
              <div style={{ fontSize:42, fontWeight:700 }}>{attRate.toFixed(1)}%</div>
              <div className="delta-badge delta-up mt-8">
                <TrendingUp size={12} /> +1.2% vs last period
              </div>
            </div>
          </div>
          <div className="card mb-20" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
            <div className="section-header">
              <span className="card-title">Present vs Absent — Daily Trend</span>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <DualLineChart data={attendanceTrend} height={150} />
              <div className="flex gap-16 mt-12">
                <div className="flex items-center gap-6"><div style={{ width:12, height:3, borderRadius:2, background:'var(--accent)' }} /><span className="caption">Present</span></div>
                <div className="flex items-center gap-6"><div style={{ width:12, height:3, borderRadius:2, background:'var(--error)' }} /><span className="caption">Absent</span></div>
              </div>
            </div>
          </div>
          <div className="card" style={{ animation:'card-in 400ms ease-out 240ms both' }}>
            <table className="data-table">
              <thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Rate</th><th>Trend</th></tr></thead>
              <tbody>
                {attendanceTrend.map((row, i) => (
                  <tr key={i} style={{ animation:`card-in 300ms ease-out ${i*40}ms both` }}>
                    <td style={{ fontWeight:500 }}>{row.date}</td>
                    <td style={{ color:'var(--success)', fontWeight:600 }}>{row.present}</td>
                    <td style={{ color:'var(--error)', fontWeight:600 }}>{row.absent}</td>
                    <td style={{ fontWeight:700 }}>{((row.present/(row.present+row.absent))*100).toFixed(1)}%</td>
                    <td>
                      <div style={{ height:6, width:80, borderRadius:3, background:'rgba(0,0,0,0.07)', overflow:'hidden' }}>
                        <div style={{ width:`${(row.present/(row.present+row.absent))*100}%`, height:'100%', background:'var(--success)', borderRadius:3 }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Tab */}
      {tab === 'Leave' && (
        <div style={{ animation:'page-in 200ms ease-out both' }}>
          <div className="grid-4 mb-24">
            {[
              { label:'Total Requests', val:leaveTotal, color:'var(--accent)' },
              { label:'Approved',       val:leaveApp,   color:'var(--success)' },
              { label:'Pending',        val:leavePend,  color:'var(--warning)', pulse:true },
              { label:'Rejected',       val:leaveRej,   color:'var(--error)' },
            ].map((kpi, i) => (
              <div key={i} className="card-glass p-24" style={{ animation:`card-in 400ms ease-out ${i*80}ms both` }}>
                <div className="label mb-8">{kpi.label}</div>
                <div style={{ fontSize:42, fontWeight:700, color:kpi.color, display:'flex', alignItems:'center', gap:8 }}>
                  {kpi.val}
                  {kpi.pulse && <span className="pulse-dot" style={{ color:kpi.color, width:8, height:8 }} />}
                </div>
              </div>
            ))}
          </div>

          <div className="grid-55-45">
            <div className="card" style={{ animation:'card-in 400ms ease-out 320ms both' }}>
              <div className="section-header">
                <span className="card-title">Leave Distribution</span>
              </div>
              <div style={{ padding:'24px', display:'flex', alignItems:'center', gap:32 }}>
                <DonutChart value={leaveAnalytics.approved} max={leaveAnalytics.total} size={140} stroke={16}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:700 }}>{leaveAnalytics.total}</div>
                    <div style={{ fontSize:10, color:'var(--text-muted)' }}>Total</div>
                  </div>
                </DonutChart>
                <div style={{ flex:1 }}>
                  {[
                    { label:'Approved', val:leaveAnalytics.approved, color:'var(--success)' },
                    { label:'Pending',  val:leaveAnalytics.pending,  color:'var(--warning)' },
                    { label:'Rejected', val:leaveAnalytics.rejected, color:'var(--error)'   },
                  ].map((seg, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <div style={{ width:10, height:10, borderRadius:50, background:seg.color, flexShrink:0 }} />
                      <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{seg.label}</span>
                      <span style={{ fontWeight:700 }}>{seg.val}</span>
                      <span className="caption" style={{ minWidth:35 }}>{((seg.val / leaveAnalytics.total) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card" style={{ animation:'card-in 400ms ease-out 400ms both' }}>
              <div className="section-header">
                <span className="card-title">Monthly Leave Requests</span>
              </div>
              <div style={{ padding:'20px 24px' }}>
                <GroupedBarChart
                  data={leaveAnalytics.monthly}
                  keys={['approved','pending','rejected']}
                  colors={['#22C55E','#F59E0B','#EF4444']}
                  height={160}
                />
                <div className="flex gap-16 mt-12">
                  {[['Approved','#22C55E'],['Pending','#F59E0B'],['Rejected','#EF4444']].map(([l, c]) => (
                    <div key={l} className="flex items-center gap-6"><div style={{ width:10, height:10, borderRadius:2, background:c }} /><span className="caption">{l}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
