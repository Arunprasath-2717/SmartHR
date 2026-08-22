'use client';
import { useState } from 'react';
import { anomalies } from '@/lib/mockData';
import { ScoreGauge } from '@/components/charts/Charts';
import { useCounter } from '@/hooks/useCounter';
import Drawer from '@/components/ui/Drawer';
import { getRiskGlowClass } from '@/lib/utils';

const RISK_FILTERS = ['All','HIGH','MEDIUM','LOW'];

function AnomalyCard({ anomaly, onClick, index }) {
  const glowColor = {
    HIGH:   'rgba(239,68,68,0.12)',
    MEDIUM: 'rgba(245,158,11,0.10)',
    LOW:    'rgba(59,130,246,0.08)',
  }[anomaly.risk_level];

  const pillClass = {
    HIGH:   'pill-high',
    MEDIUM: 'pill-medium',
    LOW:    'pill-low',
  }[anomaly.risk_level];

  return (
    <div
      className="card-glass"
      style={{
        padding:24, cursor:'pointer',
        background:`rgba(255,255,255,0.12)`,
        boxShadow:`var(--glass-shadow), 0 0 24px ${glowColor}`,
        animation:`card-in 400ms ease-out ${index * 100}ms both`,
        transition:'transform 200ms ease, box-shadow 200ms ease',
      }}
      onClick={() => onClick(anomaly)}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = `var(--shadow-lg), 0 0 32px ${glowColor}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `var(--glass-shadow), 0 0 24px ${glowColor}`;
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-12 mb-16">
        <div className="avatar avatar-lg">{anomaly.initials}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>{anomaly.name}</div>
          <div className="caption">{anomaly.dept} · {anomaly.employee_id}</div>
        </div>
        <span className={`pill ${pillClass}`}>{anomaly.risk_level}</span>
      </div>

      {/* Event Type */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, padding:'8px 12px', background:'rgba(0,0,0,0.04)', borderRadius:8 }}>
        <span>{anomaly.risk_level === 'HIGH' ? '🔴' : anomaly.risk_level === 'MEDIUM' ? '🟡' : '🟢'}</span>
        <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{anomaly.event_type}</span>
      </div>

      {/* Score Gauge */}
      <div style={{ marginBottom:16 }}>
        <div className="label mb-4">Anomaly Score</div>
        <ScoreGauge score={anomaly.score} />
      </div>

      {/* Reasons */}
      <div style={{ marginBottom:16 }}>
        {anomaly.reasons.map((r, i) => (
          <div key={i} style={{ fontSize:12, color:'var(--text-muted)', padding:'3px 0', animation:`card-in 300ms ease-out ${i*50}ms both` }}>
            · {r}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center" style={{ borderTop:'1px solid rgba(0,0,0,0.07)', paddingTop:12 }}>
        <span style={{ fontSize:11, color:'var(--text-light)' }}>{anomaly.created_at}</span>
        <a href={`/employees/101`} className="text-accent text-xs text-semibold" onClick={e => e.stopPropagation()}>View Employee →</a>
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [riskFilter, setRiskFilter] = useState('All');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const total  = useCounter(anomalies.length, 1200, 0, true);
  const high   = useCounter(anomalies.filter(a => a.risk_level === 'HIGH').length, 1200, 0, true);
  const avgScore = useCounter(anomalies.reduce((s, a) => s + a.score, 0) / anomalies.length, 1200, 2, true);

  const filtered = anomalies.filter(a => {
    const matchRisk   = riskFilter === 'All' || a.risk_level === riskFilter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const openDrawer = (anomaly) => { setSelected(anomaly); setDrawerOpen(true); };

  return (
    <div className="page-wrapper page-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Insights</h1>
          <p className="caption mt-4" style={{ animation:'card-in 300ms ease-out 100ms both' }}>
            Powered by Dayflow AI · Rule-based anomaly detection on leave and attendance patterns
          </p>
        </div>
      </div>

      {/* Glass Filter Bar */}
      <div className="glass p-16 mb-20" style={{ borderRadius:'var(--radius-lg)', display:'flex', alignItems:'center', gap:12, animation:'slide-down 300ms ease-out both' }}>
        <div className="filter-pills">
          {RISK_FILTERS.map(r => (
            <button
              key={r}
              className={`filter-pill ${riskFilter === r ? 'active' : ''}`}
              onClick={() => setRiskFilter(r)}
            >
              {r === 'HIGH' ? '🔴' : r === 'MEDIUM' ? '🟡' : r === 'LOW' ? '🟢' : ''}
              {r === 'All' ? 'All' : ` ${r}`}
            </button>
          ))}
        </div>
        <div className="search-wrapper ml-auto">
          <span className="search-icon">🔍</span>
          <input className="input input-glass" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:200 }} />
        </div>
      </div>

      {/* Summary Ribbon */}
      <div className="grid-3 mb-24">
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 0ms both' }}>
          <div className="label mb-8">Total Anomalies</div>
          <div style={{ fontSize:48, fontWeight:700 }}>{total}</div>
        </div>
        <div className="card p-24 glow-error" style={{ animation:'card-in 400ms ease-out 80ms both', background:'rgba(255,255,255,1)' }}>
          <div className="label mb-8">High Risk</div>
          <div style={{ fontSize:48, fontWeight:700, color:'var(--error)', display:'flex', alignItems:'center', gap:10 }}>
            {high}
            <span className="pulse-dot" style={{ color:'var(--error)', width:10, height:10 }} />
          </div>
        </div>
        <div className="card p-24" style={{ animation:'card-in 400ms ease-out 160ms both' }}>
          <div className="label mb-8">Avg Score</div>
          <div style={{ fontSize:48, fontWeight:700 }}>{avgScore.toFixed(2)}</div>
          <div style={{ marginTop:8 }}>
            <div style={{ height:6, borderRadius:3, background:'linear-gradient(to right,#22C55E,#F59E0B,#EF4444)', position:'relative' }}>
              <div style={{ position:'absolute', left:`${avgScore * 100}%`, top:'50%', width:12, height:12, background:'#fff', border:'2px solid #0F0F12', borderRadius:'50%', transform:'translate(-50%,-50%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Anomaly Cards Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <h3>All Clear</h3>
          <p>No anomalies detected. Leave and attendance patterns look normal.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((anomaly, i) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} index={i} onClick={openDrawer} />
          ))}
        </div>
      )}

      {/* Anomaly Detail Drawer (Screen 18) */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Anomaly Detail" width={500}>
        {selected && (
          <div>
            {/* Employee */}
            <div className="flex items-center gap-12 mb-24" style={{ paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
              <div className="avatar avatar-lg">{selected.initials}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:16 }}>{selected.name}</div>
                <div className="caption">{selected.dept} · {selected.employee_id}</div>
              </div>
            </div>

            {/* Risk Badge */}
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'10px 24px', borderRadius:99,
                background: selected.risk_level === 'HIGH' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                border: `1px solid ${selected.risk_level === 'HIGH' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                boxShadow: selected.risk_level === 'HIGH' ? '0 0 16px rgba(239,68,68,0.25)' : '0 0 16px rgba(245,158,11,0.2)',
              }}>
                <span style={{ fontSize:20 }}>{selected.risk_level === 'HIGH' ? '🔴' : '🟡'}</span>
                <span style={{ fontSize:16, fontWeight:800, color: selected.risk_level === 'HIGH' ? '#991B1B' : '#92400E' }}>
                  {selected.risk_level} RISK ANOMALY
                </span>
              </div>
              <div className="caption mt-8">Anomaly Score: {selected.score.toFixed(2)} / 1.00</div>
            </div>

            {/* Score */}
            <div className="card mb-20" style={{ padding:'16px 20px' }}>
              <div className="label mb-8">Score Breakdown</div>
              <ScoreGauge score={selected.score} />
            </div>

            {/* Event Type */}
            <div className="card-glass mb-16" style={{ padding:'14px 16px', borderRadius:10 }}>
              <div style={{ fontWeight:700, marginBottom:4 }}>📋 {selected.event_type}</div>
              <div className="caption">Detected: {selected.created_at}</div>
            </div>

            {/* Reasons */}
            <div className="card-title mb-10">Anomaly Reasons</div>
            {selected.reasons.map((r, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'flex-start', gap:10, padding:'10px 14px', marginBottom:8,
                background:'rgba(0,0,0,0.03)', borderRadius:8, borderLeft:'3px solid var(--warning)',
                animation:`card-in 300ms ease-out ${i*60}ms both`,
              }}>
                <span style={{ fontSize:16 }}>⚠️</span>
                <span style={{ fontSize:13, fontWeight:500 }}>{r}</span>
              </div>
            ))}

            {/* Links */}
            <div style={{ paddingTop:20, borderTop:'1px solid var(--border)', marginTop:16 }}>
              <a href="/leaves" className="text-accent text-sm text-semibold" style={{ display:'block', padding:'8px 0' }}>→ View Leave Requests for {selected.name}</a>
              <a href="/attendance" className="text-accent text-sm text-semibold" style={{ display:'block', padding:'8px 0' }}>→ View Attendance Records for {selected.name}</a>
            </div>

            <button className="btn btn-primary mt-16" style={{ width:'100%', justifyContent:'center' }} onClick={() => setDrawerOpen(false)}>
              Review Leave Request
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
