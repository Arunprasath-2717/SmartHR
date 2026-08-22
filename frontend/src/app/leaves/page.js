'use client';
import { useState } from 'react';
import { hrLeaveRequests } from '@/lib/mockData';
import { getStatusClass } from '@/lib/utils';
import Drawer from '@/components/ui/Drawer';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { ScoreGauge } from '@/components/charts/Charts';

const TABS = ['All','Pending','Approved','Rejected'];

export default function HRLeavesPage() {
  const [tab, setTab]               = useState('All');
  const [selected, setSelected]     = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [checkedRows, setCheckedRows]   = useState([]);
  const [loading, setLoading]           = useState(false);
  const toast = useToast();

  const counts = TABS.reduce((acc, t) => ({
    ...acc, [t]: t === 'All' ? hrLeaveRequests.length : hrLeaveRequests.filter(r => r.status === t).length,
  }), {});

  const filtered = hrLeaveRequests.filter(r => tab === 'All' || r.status === tab);

  const handleApprove = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setApproveModal(false);
    setDrawerOpen(false);
    toast({ message:`Leave approved for ${selected?.employee}`, type:'success' });
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setRejectModal(false);
    setDrawerOpen(false);
    toast({ message:`Leave rejected for ${selected?.employee}`, type:'error' });
    setRejectReason('');
  };

  const openDrawer = (leave) => { setSelected(leave); setDrawerOpen(true); };

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Requests</h1>
          <p className="caption mt-4">Review and manage all employee leave requests</p>
        </div>
      </div>

      {/* Glass Filter Bar */}
      <div className="glass p-20 mb-20" style={{ borderRadius:'var(--radius-lg)', animation:'slide-down 300ms ease-out both', display:'flex', flexWrap:'wrap', gap:12, alignItems:'center' }}>
        <div className="search-wrapper flex-1" style={{ minWidth:200 }}>
          <span className="search-icon">🔍</span>
          <input className="input input-glass" placeholder="Search employee..." style={{ minWidth:180 }} />
        </div>
        {[
          { label:'Leave Type ▾', w:140 },
          { label:'Status ▾', w:120 },
          { label:'Department ▾', w:140 },
        ].map((f, i) => (
          <select key={i} className="input" style={{ width:f.w }}><option>{f.label}</option></select>
        ))}
        <input type="date" className="input" style={{ width:150 }} />
        <button className="btn btn-ghost btn-sm">Clear ✕</button>
      </div>

      {/* Bulk bar */}
      {checkedRows.length > 0 && (
        <div className="bulk-bar">
          <strong>{checkedRows.length} selected</strong>
          <button className="btn btn-ghost-success btn-sm" onClick={() => toast({ message:`Approved ${checkedRows.length} requests`, type:'success' })}>✓ Approve All</button>
          <button className="btn btn-ghost-danger btn-sm" onClick={() => toast({ message:`Rejected ${checkedRows.length} requests`, type:'error' })}>✕ Reject All</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setCheckedRows([])}>Clear</button>
        </div>
      )}

      {/* Tab row */}
      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t} <span className="tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" style={{ accentColor:'var(--accent)' }} /></th>
              <th>Employee</th><th>Leave Type</th><th>From–To</th><th>Days</th><th>Reason</th><th>Status</th><th>AI Flag</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((leave, i) => (
              <tr
                key={leave.id}
                style={{ animation:`card-in 300ms ease-out ${i*40}ms both`, cursor:'pointer' }}
                onClick={() => openDrawer(leave)}
              >
                <td onClick={e => e.stopPropagation()}>
                  <input type="checkbox" style={{ accentColor:'var(--accent)' }}
                    checked={checkedRows.includes(leave.id)}
                    onChange={e => setCheckedRows(prev => e.target.checked ? [...prev, leave.id] : prev.filter(id => id !== leave.id))}
                  />
                </td>
                <td>
                  <div className="flex items-center gap-8">
                    <div className="avatar avatar-sm">{leave.initials}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13 }}>{leave.employee}</div>
                      <div className="caption">{leave.dept}</div>
                    </div>
                  </div>
                </td>
                <td><span className="pill pill-info">{leave.type}</span></td>
                <td className="text-sm text-muted">{leave.from} – {leave.to}</td>
                <td style={{ fontWeight:700 }}>{leave.days}d</td>
                <td className="text-muted text-sm text-truncate" style={{ maxWidth:120 }}>{leave.reason}</td>
                <td>
                  <span className={`pill ${getStatusClass(leave.status)}`}>
                    {leave.status === 'Pending' && <span className="pulse-dot" />}
                    {leave.status}
                  </span>
                </td>
                <td>
                  {leave.ai_flagged && (
                    <span className="ai-flag-chip" title={`Score: ${leave.ai_score}`}>⚠ AI Flagged</span>
                  )}
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="flex gap-6">
                    {leave.status === 'Pending' && (
                      <>
                        <button className="btn btn-ghost-success btn-sm" onClick={() => { setSelected(leave); setApproveModal(true); }}>✓</button>
                        <button className="btn btn-ghost-danger btn-sm" onClick={() => { setSelected(leave); setRejectModal(true); }}>✕</button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => openDrawer(leave)}>👁</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* HR Leave Detail Drawer (Screen 09) */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={`Leave #${selected?.id}`} width={500}>
        {selected && (
          <div>
            {/* Employee Info */}
            <div className="flex items-center gap-12 mb-24" style={{ padding:'0 0 20px', borderBottom:'1px solid var(--border)' }}>
              <div className="avatar avatar-lg">{selected.initials}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{selected.employee}</div>
                <div className="caption">{selected.dept}</div>
                <div className="monospace text-sm text-muted">{selected.employee_id}</div>
              </div>
              <div className="ml-auto">
                <span className={`pill ${getStatusClass(selected.status)}`} style={{ fontSize:13, padding:'6px 14px' }}>
                  {selected.status === 'Pending' && <span className="pulse-dot" />}
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="card-title mb-12">Leave Details</div>
            <div className="card mb-20" style={{ padding:'0 16px' }}>
              {[
                { label:'Leave Type', value:<span className="pill pill-info">{selected.type}</span> },
                { label:'Duration',   value:<strong>{selected.days} days</strong> },
                { label:'From',       value:selected.from },
                { label:'To',         value:selected.to },
                { label:'Reason',     value:selected.reason },
              ].map((row, i) => (
                <div key={i} className="info-row">
                  <span className="info-label">{row.label}</span>
                  <span className="info-value">{row.value}</span>
                </div>
              ))}
            </div>

            {/* AI Anomaly Section */}
            {selected.ai_flagged && (
              <div className="mb-20" style={{ background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:12, padding:16, animation:'card-in 300ms ease-out both' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>⚠️</span>
                  <span style={{ fontWeight:700, fontSize:14, color:'#92400E' }}>AI Anomaly Detected</span>
                  <span style={{ marginLeft:'auto' }}><span className="pill pill-high">HIGH RISK</span></span>
                </div>
                <div style={{ marginBottom:8 }}>
                  <div className="label mb-4">Anomaly Score</div>
                  <ScoreGauge score={selected.ai_score} />
                </div>
                {selected.ai_reasons?.map((r, i) => (
                  <div key={i} style={{ fontSize:12, color:'var(--text-muted)', padding:'4px 0', borderTop: i > 0 ? '1px solid rgba(0,0,0,0.05)' : 'none', animation:`card-in 300ms ease-out ${i*50}ms both` }}>
                    · {r}
                  </div>
                ))}
                <a href="/ai-insights" className="text-accent text-sm text-semibold" style={{ display:'block', marginTop:12 }}>View Full AI Report →</a>
              </div>
            )}

            {/* Action Footer */}
            {selected.status === 'Pending' && (
              <div style={{ paddingTop:20, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:10 }}>
                <button className="btn btn-success" style={{ justifyContent:'center' }} onClick={() => setApproveModal(true)}>
                  ✓ Approve Leave
                </button>
                <button className="btn btn-ghost-danger" style={{ justifyContent:'center' }} onClick={() => setRejectModal(true)}>
                  ✕ Reject Leave
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Approve Modal (Screen 19) */}
      <Modal isOpen={approveModal} onClose={() => setApproveModal(false)} title="Approve Leave Request" width={400}>
        <p className="text-muted mb-16" style={{ fontSize:14 }}>
          You are approving <strong>{selected?.days} days</strong> of <strong>{selected?.type}</strong> for <strong>{selected?.employee}</strong> ({selected?.from} – {selected?.to}). This cannot be undone.
        </p>
        {selected && (
          <div style={{ background:'rgba(0,0,0,0.04)', borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div className="avatar avatar-sm">{selected.initials}</div>
            <div>
              <div style={{ fontWeight:600, fontSize:13 }}>{selected.employee}</div>
              <div className="caption">{selected.from} – {selected.to}</div>
            </div>
          </div>
        )}
        <div className="flex gap-10 justify-between">
          <button className="btn btn-ghost" onClick={() => setApproveModal(false)}>Cancel</button>
          <button className={`btn btn-success ${loading ? 'btn-disabled' : ''}`} onClick={handleApprove} id="confirm-approve">
            {loading ? <span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⟳</span> : '✓ Confirm Approval'}
          </button>
        </div>
      </Modal>

      {/* Reject Modal (Screen 20) */}
      <Modal isOpen={rejectModal} onClose={() => setRejectModal(false)} title="Reject Leave Request" width={420}>
        <p className="text-muted mb-16" style={{ fontSize:14 }}>
          Rejecting leave request for <strong>{selected?.employee}</strong>.
        </p>
        <div className="form-group" style={{ position:'relative' }}>
          <textarea
            id="reject-reason"
            className="input"
            placeholder="Rejection reason *"
            rows={4}
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            style={{ paddingTop:14 }}
          />
          <div style={{ position:'absolute', bottom:8, right:12, fontSize:10, color:'var(--text-light)' }}>{rejectReason.length}/300</div>
        </div>
        <div className="flex gap-10 justify-between mt-8">
          <button className="btn btn-ghost" onClick={() => setRejectModal(false)}>Cancel</button>
          <button
            id="confirm-reject"
            className={`btn btn-danger ${!rejectReason || loading ? 'btn-disabled' : ''}`}
            onClick={handleReject}
            disabled={!rejectReason}
          >
            {loading ? <span style={{ animation:'spin 0.8s linear infinite', display:'inline-block' }}>⟳</span> : '✕ Confirm Rejection'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
