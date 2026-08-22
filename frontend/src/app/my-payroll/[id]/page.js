'use client';
import { payslipDetail } from '@/lib/mockData';
import { useCounter } from '@/hooks/useCounter';
import { useToast } from '@/components/ui/Toast';

export default function PayslipDetailPage({ params }) {
  const d = payslipDetail;
  const netCount = useCounter(d.net, 1400, 0, true);
  const toast = useToast();

  const handleDownload = async () => {
    toast({ message:'Preparing PDF download...', type:'info' });
    await new Promise(r => setTimeout(r, 1500));
    toast({ message:'Payslip downloaded successfully! ✓', type:'success' });
  };

  return (
    <div className="page-wrapper page-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/my-payroll">Payroll</a>
        <span className="breadcrumb-sep">›</span>
        <span>{d.period}</span>
      </div>
      <div className="page-header">
        <h1 className="page-title">Payslip — {d.period}</h1>
        <div className="flex gap-10">
          <button className="btn btn-ghost" onClick={handleDownload}>⬇ Download PDF</button>
          <button className="btn btn-ghost">↗ Share</button>
        </div>
      </div>

      {/* Payslip Card */}
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <div className="card-glass" style={{ animation:'card-in 400ms ease-out 100ms both' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg, #6C63FF, #8B5CF6)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', padding:'24px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:'#fff', letterSpacing:'-0.02em' }}>⬡ Dayflow</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:2 }}>Payslip</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>{d.period}</div>
              <span className="pill pill-paid" style={{ marginTop:6, display:'inline-flex' }}>● {d.status}</span>
            </div>
          </div>

          {/* Employee Info */}
          <div style={{ padding:'20px 32px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:16, background:'rgba(255,255,255,0.7)' }}>
            <div className="avatar avatar-lg">{d.initials}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:17 }}>{d.employee_name}</div>
              <div className="caption">{d.job_title} · {d.dept}</div>
              <div className="caption mt-2">{d.from} – {d.to}</div>
            </div>
          </div>

          <div style={{ padding:'24px 32px' }}>
            {/* Earnings Table */}
            <div style={{ marginBottom:24 }}>
              <div className="table-header mb-10">Earnings</div>
              {d.earnings.map((e, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{e.label}</span>
                  <span style={{ fontWeight:500, fontSize:13 }}>₹{e.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid var(--border-med)', marginTop:4 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Gross Total</span>
                <span style={{ fontWeight:700, fontSize:14 }}>₹{d.gross.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Deductions Table */}
            <div style={{ marginBottom:24 }}>
              <div className="table-header mb-10">Deductions</div>
              {d.deductions.map((e, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{e.label}</span>
                  <span style={{ fontWeight:500, fontSize:13, color:'var(--error)' }}>–₹{e.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderTop:'2px solid var(--border-med)', marginTop:4 }}>
                <span style={{ fontWeight:700, fontSize:14, color:'var(--error)' }}>Total Deductions</span>
                <span style={{ fontWeight:700, fontSize:14, color:'var(--error)' }}>–₹{d.total_deductions.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Net Salary */}
            <div style={{
              background:'linear-gradient(135deg, var(--accent), #8B5CF6)',
              borderRadius:12, padding:'20px 24px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              animation:'card-in 400ms ease-out 600ms both',
            }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.65)' }}>Net Salary</div>
                <div style={{ fontSize:40, fontWeight:800, color:'#fff', letterSpacing:'-0.03em', lineHeight:1, marginTop:4 }}>
                  ₹{netCount.toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ fontSize:40 }}>💳</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
