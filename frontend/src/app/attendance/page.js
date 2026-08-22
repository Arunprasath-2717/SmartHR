'use client';
import { attendanceRecords, attendanceSummary } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { getStatusClass } from '@/lib/utils';
import { Download, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function AttendancePage() {
  const present  = useCounter(attendanceSummary.present, 1200, 0, true);
  const absent   = useCounter(attendanceSummary.absent, 1200, 0, true);
  const avgHours = useCounter(attendanceSummary.avg_hours, 1200, 1, true);

  return (
    <div className="page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Records</h1>
          <p className="text-muted text-sm mt-4">Real-time presence monitoring and shift logs</p>
        </div>
        <button className="btn btn-ghost">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card mb-20" style={{ padding:'16px 20px', borderRadius:20 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
          <div className="search-wrapper flex-1" style={{ minWidth:200 }}>
            <span className="search-icon" style={{ display:'flex', alignItems:'center' }}>
              <Search size={15} />
            </span>
            <input className="input" placeholder="Search employee..." style={{ borderRadius:20 }} />
          </div>
          <input type="date" className="input" style={{ width:160, borderRadius:20 }} defaultValue="2026-08-22" />
          <select className="input" style={{ width:140, borderRadius:20 }}><option>All Status</option><option>Present</option><option>Absent</option></select>
          <select className="input" style={{ width:160, borderRadius:20 }}><option>All Departments</option><option>Engineering</option><option>Design</option></select>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid-3 mb-24">
        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 0ms both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span className="text-muted text-xs text-bold uppercase">Present Today</span>
            <CheckCircle2 size={22} color="#10B981" />
          </div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--success)', letterSpacing:'-0.03em' }}>{present}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>94% of active workforce</div>
        </div>

        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 100ms both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span className="text-muted text-xs text-bold uppercase">Absent Today</span>
            <XCircle size={22} color="#EF4444" />
          </div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--error)', letterSpacing:'-0.03em' }}>{absent}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Includes planned leaves</div>
        </div>

        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 200ms both' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span className="text-muted text-xs text-bold uppercase">Avg Worked Hours</span>
            <Clock size={22} color="#3B82F6" />
          </div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--accent)', letterSpacing:'-0.03em' }}>{avgHours.toFixed(1)}<span style={{ fontSize:22 }}>h</span></div>
          <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Target: 8.0h / day</div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card card-no-hover" style={{ animation:'card-in 400ms ease-out 300ms both' }}>
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
                  <div className="flex items-center gap-10">
                    <div className="avatar avatar-sm" style={{ background:`linear-gradient(135deg, ${['#3B82F6','#10B981','#8B5CF6','#F59E0B'][i%4]}, #1D4ED8)` }}>
                      {rec.initials}
                    </div>
                    <span style={{ fontWeight:600, color:'#0F172A' }}>{rec.employee}</span>
                  </div>
                </td>
                <td style={{ fontWeight:500 }}>{rec.date}</td>
                <td className="monospace">{rec.check_in}</td>
                <td className="monospace">{rec.check_out}</td>
                <td>
                  {rec.hours > 0 ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:700, minWidth:36 }}>{rec.hours}h</span>
                      <div style={{ flex:1, height:5, borderRadius:3, background:'rgba(0,0,0,0.06)', overflow:'hidden', maxWidth:100 }}>
                        <div style={{
                          width:`${(rec.hours / 10) * 100}%`, height:'100%',
                          background:'linear-gradient(90deg, #3B82F6, #1D4ED8)', borderRadius:3,
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
          <span className="pagination-info">Showing 1–{attendanceRecords.length} of {attendanceRecords.length} entries</span>
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
