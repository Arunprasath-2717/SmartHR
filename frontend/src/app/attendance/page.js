'use client';
import { attendanceRecords, attendanceSummary } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { getStatusClass } from '@/lib/utils';

export default function AttendancePage() {
  const present  = useCounter(attendanceSummary.present, 1200, 0, true);
  const absent   = useCounter(attendanceSummary.absent, 1200, 0, true);
  const avgHours = useCounter(attendanceSummary.avg_hours, 1200, 1, true);

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="caption mt-4">Monitor employee attendance records</p>
        </div>
        <button className="btn btn-ghost">⬇ Export CSV</button>
      </div>

      {/* Glass Filter Bar */}
      <div className="glass p-20 mb-20" style={{ borderRadius:'var(--radius-lg)', display:'flex', flexWrap:'wrap', gap:12, alignItems:'center', animation:'slide-down 300ms ease-out both' }}>
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input className="input input-glass" placeholder="Search employee..." style={{ width:200 }} />
        </div>
        <input type="date" className="input" style={{ width:150 }} />
        <input type="date" className="input" style={{ width:150 }} />
        <select className="input" style={{ width:140 }}><option>All Status</option><option>Present</option><option>Absent</option></select>
        <select className="input" style={{ width:150 }}><option>All Departments</option></select>
      </div>

      {/* Summary Cards */}
      <div className="grid-3 mb-24">
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
          <div className="label mb-8">Present Today</div>
          <div style={{ fontSize:48, fontWeight:700, color:'var(--success)' }}>{present}</div>
        </div>
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 80ms both' }}>
          <div className="label mb-8">Absent Today</div>
          <div style={{ fontSize:48, fontWeight:700, color:'var(--error)' }}>{absent}</div>
        </div>
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
          <div className="label mb-8">Avg Worked Hours</div>
          <div style={{ fontSize:48, fontWeight:700 }}>{avgHours.toFixed(1)}<span style={{ fontSize:24 }}>h</span></div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ animation:'card-in 400ms ease-out 240ms both' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Worked Hours</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((rec, i) => (
              <tr key={i} style={{ animation:`card-in 300ms ease-out ${i*40}ms both` }}>
                <td>
                  <div className="flex items-center gap-8">
                    <div className="avatar avatar-sm">{rec.initials}</div>
                    <span style={{ fontWeight:500 }}>{rec.employee}</span>
                  </div>
                </td>
                <td style={{ fontWeight:500 }}>{rec.date}</td>
                <td className="monospace">{rec.check_in}</td>
                <td className="monospace">{rec.check_out}</td>
                <td>
                  {rec.hours > 0 ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:600, minWidth:36 }}>{rec.hours}h</span>
                      <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(0,0,0,0.07)', overflow:'hidden', minWidth:80 }}>
                        <div style={{
                          width:`${(rec.hours / 10) * 100}%`, height:'100%',
                          background:'var(--accent)', borderRadius:3,
                          transition:`width 600ms ease-out ${i*40}ms`,
                        }} />
                      </div>
                    </div>
                  ) : <span className="text-muted">—</span>}
                </td>
                <td>
                  <span className={`pill ${getStatusClass(rec.status)}`}>● {rec.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pagination">
          <span className="pagination-info">Showing 1–{attendanceRecords.length} of {attendanceRecords.length}</span>
          <div className="pagination-controls">
            <button className="page-btn">‹</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
