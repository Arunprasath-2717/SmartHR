'use client';
import { useState } from 'react';
import { useCounter } from '@/hooks/useCounter';
import { useInView } from '@/hooks/useInView';
import { DonutChart, MiniBarChart } from '@/components/charts/Charts';
import { hrDashboardData } from '@/lib/mockData';
import { formatCurrency, getStatusClass } from '@/lib/utils';
import styles from './page.module.css';

export default function HRDashboard() {
  const d = hrDashboardData;
  const [ref, inView] = useInView();
  const empCount    = useCounter(d.total_employees, 1200, 0, true);
  const present     = useCounter(d.present_today, 1200, 0, true);
  const absent      = useCounter(d.absent_today, 1200, 0, true);
  const pending     = useCounter(d.pending_leaves, 1200, 0, true);
  const anomalies   = useCounter(d.ai_anomalies_total, 1200, 0, true);
  const rate        = useCounter(d.attendance_rate, 1200, 1, true);

  return (
    <div className={`page-wrapper page-in`}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="caption mt-4">Welcome back, Carla · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div className="flex items-center gap-12">
          <div className="avatar avatar-md">CS</div>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>Carla Sanford</div>
            <div className="pill pill-info text-xs" style={{ marginTop:2 }}>HR Officer</div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-4 mb-20">
        {/* Card 1: Total Employees */}
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
          <div className="flex items-center gap-10 mb-16">
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent-10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👥</div>
            <span className="label">Total Employees</span>
          </div>
          <div className="display-stat" style={{ fontSize:42 }}>{empCount}</div>
          <div className="caption mt-4">{d.active_employees} active</div>
          <div className="delta-badge delta-up mt-8">▲ +{d.new_this_month} this month</div>
        </div>

        {/* Card 2: Attendance Today */}
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
          <div className="flex items-center gap-10 mb-16">
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--success-10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✅</div>
            <span className="label">Attendance Today</span>
          </div>
          <div className="flex gap-16 items-end">
            <div>
              <div style={{ fontSize:36, fontWeight:700, color:'var(--success)' }}>{present}</div>
              <div className="caption">Present</div>
            </div>
            <div>
              <div style={{ fontSize:36, fontWeight:700, color:'var(--error)' }}>{absent}</div>
              <div className="caption">Absent</div>
            </div>
          </div>
          <div className="progress-bar mt-12">
            <div className="progress-fill progress-fill-success" style={{ '--target': `${(d.present_today / (d.present_today + d.absent_today)) * 100}%` }} ref={ref} />
          </div>
        </div>

        {/* Card 3: Pending Leaves */}
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 160ms both', position:'relative' }}>
          <div className="flex items-center gap-10 mb-16">
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--warning-10)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>📋</div>
            <span className="label">Pending Leaves</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:48, fontWeight:700, color:'var(--warning)' }}>{pending}</div>
            <span className="pulse-dot" style={{ color:'var(--warning)', width:8, height:8 }} />
          </div>
          <div className="caption mt-4">Needs Review</div>
          <a href="/leaves" className="text-accent text-sm text-semibold mt-8" style={{ display:'block' }}>→ Review All</a>
        </div>

        {/* Card 4: AI Anomalies (Dark Glass) */}
        <div className="card-glass-dark p-24" style={{ animation:'card-in 400ms ease-out 240ms both', ...(d.ai_high_risk > 0 ? { boxShadow:'0 0 24px rgba(239,68,68,0.2), var(--dark-glass-shadow)' } : {}) }}>
          <div className="flex items-center gap-10 mb-16">
            <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🤖</div>
            <span className="label text-white" style={{ color:'rgba(255,255,255,0.5)' }}>AI Anomalies</span>
          </div>
          <div style={{ fontSize:48, fontWeight:700, color:'#fff' }}>{anomalies}</div>
          <div className="flex gap-8 mt-8">
            <span className="pill pill-high" style={{ fontSize:10 }}>⚠ {d.ai_high_risk} High Risk</span>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.5)', alignSelf:'center' }}>{d.ai_anomalies_total - d.ai_high_risk} Low/Med</span>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid-65-35 mb-20">
        {/* Attendance Rate Card */}
        <div className="card" style={{ animation:'card-in 400ms ease-out 320ms both' }}>
          <div className="section-header">
            <span className="card-title">Attendance Rate</span>
            <span className="pill pill-info text-xs">Past 30 Days</span>
          </div>
          <div className="section-content">
            <div className="flex items-end gap-12 mb-20">
              <div style={{ fontSize:52, fontWeight:700, lineHeight:1 }}>{rate.toFixed(1)}%</div>
              <div className="delta-badge delta-down mb-8">▼ {Math.abs(d.attendance_delta)}% vs last month</div>
            </div>
            {/* Monthly bars */}
            <div style={{ display:'flex', gap:8, alignItems:'flex-end', height:80, marginBottom:16 }}>
              {d.monthly_attendance.map((m, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{ width:'100%', borderRadius:4, overflow:'hidden', background:'rgba(0,0,0,0.06)', height:60, display:'flex', alignItems:'flex-end' }}>
                    <div style={{
                      width:'100%', borderRadius:4,
                      background: i === d.monthly_attendance.length - 1 ? 'var(--accent)' : 'rgba(108,99,255,0.3)',
                      height:`${m.rate}%`,
                      transition:`height 600ms ease-out ${i*80}ms`,
                    }} />
                  </div>
                  <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>{m.month}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="card-title mb-12">Top Attendance</div>
            {d.top_attendance.map((emp, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < d.top_attendance.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div className="avatar avatar-sm">{emp.initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13 }}>{emp.name}</div>
                  <div className="caption">{emp.days} days present</div>
                </div>
                <div style={{ fontSize:22 }}>🏆</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals (Dark Glass) */}
        <div className="card-glass-dark" style={{ animation:'card-in 400ms ease-out 400ms both' }}>
          <div className="section-header" style={{ borderBottomColor:'rgba(255,255,255,0.08)' }}>
            <span className="card-title text-white">Pending Actions</span>
            <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{d.pending_approvals.length} items</span>
          </div>
          <div style={{ padding:'12px 0' }}>
            {d.pending_approvals.map((item, i) => (
              <div key={item.id} style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 20px',
                borderBottom: i < d.pending_approvals.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                animation:`card-in 400ms ease-out ${400 + i*60}ms both`,
              }}>
                <div className="avatar avatar-sm">{item.initials}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:13, color:'#fff' }}>{item.name}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{item.leave_type} · {item.dates}</div>
                </div>
                <a href="/leaves" className="btn btn-ghost-white btn-sm">Review →</a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid-65-35">
        {/* Employee Table */}
        <div className="card" style={{ animation:'card-in 400ms ease-out 480ms both' }}>
          <div className="section-header">
            <span className="card-title">Employees</span>
            <div className="flex gap-10 items-center">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input className="input input-glass" placeholder="Search..." style={{ width:160, height:34 }} />
              </div>
              <a href="/employees" className="text-accent text-sm text-semibold">View All →</a>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Department</th><th>Title</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.employees.map((emp, i) => (
                <tr key={emp.id} style={{ animation:`card-in 300ms ease-out ${i*40}ms both`, cursor:'pointer' }}>
                  <td className="monospace text-muted text-sm">{emp.id}</td>
                  <td>
                    <div className="flex items-center gap-8">
                      <div className="avatar avatar-sm">{emp.initials}</div>
                      <span style={{ fontWeight:500 }}>{emp.name}</span>
                    </div>
                  </td>
                  <td><span className="pill pill-info">{emp.dept}</span></td>
                  <td className="text-muted">{emp.title}</td>
                  <td>
                    <span className={`pill ${emp.active ? 'pill-active' : 'pill-inactive'}`}>
                      ● {emp.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leave Distribution */}
        <div className="card" style={{ animation:'card-in 400ms ease-out 560ms both' }}>
          <div className="section-header">
            <span className="card-title">Leave Distribution</span>
          </div>
          <div style={{ padding:'8px 0' }}>
            {d.leave_distribution.map((row, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', padding:'16px 24px', borderBottom: i < d.leave_distribution.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize:28, fontWeight:700, width:50 }}>{row.count}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{row.label}</div>
                  <div className={`progress-bar`} style={{ height:4 }}>
                    <div className={`progress-fill progress-fill-${row.color}`} style={{ width:`${row.pct}%` }} />
                  </div>
                </div>
                <div style={{ marginLeft:16 }}>
                  <span className={`pill pill-${row.color === 'success' ? 'approved' : row.color === 'error' ? 'rejected' : 'pending'}`}>{row.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
