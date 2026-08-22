'use client';
import { useState, useEffect, use } from 'react';
import { employeeDetail } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { LineChart } from '@/components/charts/Charts';
import Link from 'next/link';
import { Pencil, Download, MoreHorizontal, ChevronRight, TrendingUp } from 'lucide-react';

export default function EmployeeDetailPage({ params }) {
  const resolvedParams = use ? use(params) : params;
  const empId = resolvedParams?.id || 1;
  const [emp, setEmp] = useState(employeeDetail);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('dayflow_token') : null;
        const res = await fetch(`/api/v1/employees/${empId}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok && isMounted) {
          const json = await res.json();
          const item = json.data;
          if (item) {
            setEmp({
              ...employeeDetail,
              id: `#EMP-00${item.id}`,
              name: item.name,
              email: item.work_email || item.email || `${item.name.toLowerCase().replace(' ', '.')}@company.com`,
              phone: item.work_phone || item.phone || '+1-555-0100',
              title: item.job_title || 'Software Engineer',
              dept: item.department?.name || item.department_name || 'Engineering',
              initials: (item.name || 'EM').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
            });
          }
        }
      } catch (e) {}
    })();
    return () => { isMounted = false; };
  }, [empId]);

  const d = emp;
  const attendanceRate = useCounter(d.attendance_rate, 1200, 1, true);
  const salary = useCounter(d.net_salary, 1200, 0, true);

  return (
    <div className="page-wrapper page-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/employees">Employees</Link>
        <span className="breadcrumb-sep"><ChevronRight size={14} /></span>
        <span>{d.name}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, alignItems:'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* Profile Card */}
          <div className="card p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div className="avatar avatar-2xl">{d.initials}</div>
              <button className="btn btn-ghost btn-sm btn-icon" title="Edit">
                <Pencil size={15} />
              </button>
            </div>
            <div style={{ fontWeight:700, fontSize:18, marginBottom:2 }}>{d.name}</div>
            <div className="caption mb-4">{d.title}</div>
            <div className="monospace text-sm text-muted mb-16">{d.id}</div>
            <div className="divider" />
            {[
              { label:'Work Email', value:d.email },
              { label:'Work Phone', value:d.phone },
              { label:'Department', value:d.dept },
              { label:'Manager',    value:(
                <div className="flex items-center gap-6">
                  <div className="avatar avatar-sm">{d.manager_initials}</div>
                  <span>{d.manager}</span>
                </div>
              )},
              { label:'Status', value:(
                <span className={`pill ${d.active ? 'pill-active' : 'pill-inactive'}`}>● {d.active ? 'Active' : 'Inactive'}</span>
              )},
            ].map((row, i) => (
              <div key={i} className="info-row">
                <span className="info-label">{row.label}</span>
                <span className="info-value">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Recent Activities */}
          <div className="card" style={{ animation:'card-in 400ms ease-out 100ms both' }}>
            <div className="section-header">
              <span className="card-title">Recent Activities</span>
              <button style={{ cursor:'pointer', background:'none', border:'none', color:'#94A3B8' }}>
                <MoreHorizontal size={18} />
              </button>
            </div>
            <div style={{ padding:'12px 24px 16px' }}>
              <div className="timeline">
                {d.activities.map((act, i) => (
                  <div key={i} className="timeline-item" style={{ animation:`card-in 300ms ease-out ${i*60}ms both` }}>
                    <div className="timeline-dot" style={{ background: act.color }} />
                    <div className="timeline-line" />
                    <div className="timeline-content">
                      <div style={{ fontWeight:600, fontSize:12 }}>{act.title}</div>
                      <div className="caption mt-1">{act.desc}</div>
                      <div style={{ fontSize:10, color:'var(--text-light)', marginTop:4 }}>{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {/* 3 Stat Cards */}
          <div className="grid-3">
            <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
              <div className="label mb-8">Leave Remaining</div>
              <div style={{ fontSize:42, fontWeight:700 }}>{d.leave_remaining}</div>
              <div className="caption mt-4">days left</div>
              <div className="flex gap-6 mt-8 flex-wrap">
                <span className="pill pill-info" style={{ fontSize:10 }}>Annual</span>
                <span className="pill pill-pending" style={{ fontSize:10 }}>Sick</span>
              </div>
            </div>
            <div className="card-glass p-24" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
              <div className="label mb-8">Attendance Rate</div>
              <div style={{ fontSize:42, fontWeight:700 }}>{attendanceRate.toFixed(1)}%</div>
              <div className="delta-badge delta-up mt-8">
                <TrendingUp size={12} /> +2.1% vs last month
              </div>
            </div>
            <div className="card-glass-dark p-24" style={{ animation:'card-in 400ms ease-out 240ms both' }}>
              <div className="label mb-8" style={{ color:'rgba(255,255,255,0.5)' }}>Latest Payslip</div>
              <div style={{ fontSize:32, fontWeight:700, color:'#fff' }}>₹{salary.toLocaleString('en-IN')}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{d.payslip_period}</div>
              <span className="pill pill-paid mt-8" style={{ display:'inline-flex' }}>● Paid</span>
            </div>
          </div>

          {/* Leave Over Time Chart */}
          <div className="card" style={{ animation:'card-in 400ms ease-out 300ms both' }}>
            <div className="section-header">
              <span className="card-title">Leave Over Time</span>
              <span className="pill pill-info text-xs">Last 7 Months</span>
            </div>
            <div style={{ padding:'20px 24px' }}>
              <LineChart data={d.leave_history_chart} height={100} />
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="card" style={{ animation:'card-in 400ms ease-out 380ms both' }}>
            <div className="section-header">
              <span className="card-title">Attendance Records</span>
              <button className="btn btn-ghost btn-sm">
                <Download size={14} /> Export CSV
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" style={{ accentColor:'var(--accent)' }} /></th>
                  <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {d.attendance_records.map((rec, i) => (
                  <tr key={i} style={{ animation:`card-in 300ms ease-out ${i*40}ms both` }}>
                    <td><input type="checkbox" style={{ accentColor:'var(--accent)' }} /></td>
                    <td style={{ fontWeight:500 }}>{rec.date}</td>
                    <td className="monospace">{rec.check_in}</td>
                    <td className="monospace">{rec.check_out}</td>
                    <td>
                      {rec.hours > 0 ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ fontWeight:600, minWidth:30 }}>{rec.hours}h</span>
                          <div style={{ flex:1, height:4, borderRadius:2, background:'rgba(0,0,0,0.07)', overflow:'hidden', width:60 }}>
                            <div style={{ width:`${(rec.hours/10)*100}%`, height:'100%', background:'var(--accent)', borderRadius:2, transition:'width 600ms ease-out' }} />
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td><span className={`pill ${rec.status === 'Present' ? 'pill-approved' : 'pill-rejected'}`}>● {rec.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
