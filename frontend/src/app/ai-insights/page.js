'use client';
import { useState } from 'react';
import { anomalies } from '@/lib/mockData';
import { ScoreGauge } from '@/components/charts/Charts';
import { useCounter } from '@/hooks/useCounter';
import Drawer from '@/components/ui/Drawer';
import CustomToggle from '@/components/ui/CustomToggle';
import { ShieldAlert, Search, AlertTriangle, AlertCircle, ArrowRight } from 'lucide-react';

const RISK_FILTERS = ['All','HIGH','MEDIUM','LOW'];

function AnomalyCard({ anomaly, onClick, index }) {
  const glowColor = {
    HIGH:   'rgba(239,68,68,0.25)',
    MEDIUM: 'rgba(245,158,11,0.20)',
    LOW:    'rgba(59,130,246,0.15)',
  }[anomaly.risk_level];

  const borderAccent = {
    HIGH:   '#EF4444',
    MEDIUM: '#F59E0B',
    LOW:    '#3B82F6',
  }[anomaly.risk_level];

  const pillClass = {
    HIGH:   'pill-high',
    MEDIUM: 'pill-medium',
    LOW:    'pill-low',
  }[anomaly.risk_level];

  return (
    <div
      className="card card-3d"
      style={{
        padding:24, cursor:'pointer', position:'relative', overflow:'hidden',
        boxShadow:`var(--card-shadow), 0 0 20px ${glowColor}`,
        animation:`card-in-3d 500ms ease-out ${index * 80}ms both`,
        borderLeft:`4px solid ${borderAccent}`,
      }}
      onClick={() => onClick(anomaly)}
    >
      {/* Header */}
      <div className="flex items-center gap-12 mb-16">
        <div className="avatar avatar-lg" style={{ background: `linear-gradient(135deg, ${borderAccent}, #0F172A)` }}>
          {anomaly.initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15, color:'#0F172A' }}>{anomaly.name}</div>
          <div className="text-muted text-xs">{anomaly.dept} · {anomaly.employee_id}</div>
        </div>
        <span className={`pill ${pillClass}`}>{anomaly.risk_level} RISK</span>
      </div>

      {/* Event Type */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, padding:'10px 14px', background:'rgba(59,130,246,0.04)', borderRadius:10, border:'1px solid rgba(59,130,246,0.08)' }}>
        <AlertTriangle size={16} color={borderAccent} />
        <span style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>{anomaly.event_type}</span>
      </div>

      {/* Score Gauge */}
      <div style={{ marginBottom:16 }}>
        <div className="text-muted text-xs text-bold uppercase mb-4">Anomaly Risk Score</div>
        <ScoreGauge score={anomaly.score} />
      </div>

      {/* Reasons */}
      <div style={{ marginBottom:16 }}>
        {anomaly.reasons.map((r, i) => (
          <div key={i} style={{ fontSize:12, color:'#475569', padding:'4px 0', display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ color:borderAccent }}>•</span> {r}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center" style={{ borderTop:'1px solid rgba(59,130,246,0.06)', paddingTop:12 }}>
        <span style={{ fontSize:11, color:'#94A3B8' }}>{anomaly.created_at}</span>
        <span className="text-accent text-xs text-semibold flex items-center gap-4">
          Analyze Anomaly <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}

export default function AIInsightsPage() {
  const [riskFilter, setRiskFilter] = useState('All');
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiScannerActive, setAiScannerActive] = useState(true);

  const total    = useCounter(anomalies.length, 1200, 0, true);
  const high     = useCounter(anomalies.filter(a => a.risk_level === 'HIGH').length, 1200, 0, true);
  const avgScore = useCounter(anomalies.reduce((s, a) => s + a.score, 0) / anomalies.length, 1200, 2, true);

  const filtered = anomalies.filter(a => {
    const matchRisk   = riskFilter === 'All' || a.risk_level === riskFilter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchSearch;
  });

  const openDrawer = (anomaly) => { setSelected(anomaly); setDrawerOpen(true); };

  return (
    <div className="page-in">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">AI Anomaly Insights</h1>
          <p className="text-muted text-sm mt-4">Automated pattern recognition & fraud protection engine</p>
        </div>
        <div className="card p-12 flex items-center gap-12" style={{ background: '#fff', borderRadius: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>AI Live Engine</span>
          <CustomToggle
            checked={aiScannerActive}
            onChange={(e) => setAiScannerActive(e.target.checked)}
            size="44px"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-20" style={{ padding:'16px 20px', borderRadius:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div className="filter-pills">
            {RISK_FILTERS.map(r => (
              <button
                key={r}
                className={`filter-pill ${riskFilter === r ? 'active' : ''}`}
                onClick={() => setRiskFilter(r)}
              >
                {r === 'All' ? 'All Risks' : ` ${r}`}
              </button>
            ))}
          </div>
          <div className="search-wrapper ml-auto">
            <span className="search-icon" style={{ display:'flex', alignItems:'center' }}>
              <Search size={15} />
            </span>
            <input className="input" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:220, borderRadius:20 }} />
          </div>
        </div>
      </div>

      {/* Ribbon Summary */}
      <div className="grid-3 mb-24">
        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 0ms both' }}>
          <div className="text-muted text-xs text-bold uppercase mb-8">Detected Anomalies</div>
          <div style={{ fontSize:42, fontWeight:800, color:'#0F172A' }}>{total}</div>
        </div>

        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 100ms both', borderLeft:'4px solid #EF4444' }}>
          <div className="text-muted text-xs text-bold uppercase mb-8">High Risk Alerts</div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--error)', display:'flex', alignItems:'center', gap:10 }}>
            {high}
            <span className="pulse-dot" style={{ color:'var(--error)', width:10, height:10 }} />
          </div>
        </div>

        <div className="card card-3d p-24" style={{ animation:'card-in-3d 500ms ease-out 200ms both' }}>
          <div className="text-muted text-xs text-bold uppercase mb-8">System Average Score</div>
          <div style={{ fontSize:42, fontWeight:800, color:'var(--accent)' }}>{avgScore.toFixed(2)}</div>
        </div>
      </div>

      {/* Anomaly Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon text-muted">
            <ShieldAlert size={48} />
          </div>
          <h3>System Normal</h3>
          <p>No workforce anomalies matching your filter selection.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((anomaly, i) => (
            <AnomalyCard key={anomaly.id} anomaly={anomaly} index={i} onClick={openDrawer} />
          ))}
        </div>
      )}

      {/* Drawer Detail */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="Anomaly Deep Analysis" width={500}>
        {selected && (
          <div>
            <div className="flex items-center gap-12 mb-24" style={{ paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
              <div className="avatar avatar-lg">{selected.initials}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:16, color:'#0F172A' }}>{selected.name}</div>
                <div className="text-muted text-xs">{selected.dept} · {selected.employee_id}</div>
              </div>
            </div>

            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                padding:'10px 24px', borderRadius:99,
                background: selected.risk_level === 'HIGH' ? '#FEE2E2' : '#FEF3C7',
                color: selected.risk_level === 'HIGH' ? '#991B1B' : '#92400E',
                fontWeight:800, fontSize:14,
              }}>
                <AlertCircle size={18} />
                {selected.risk_level} RISK ANOMALY DETECTED
              </div>
            </div>

            <div className="card p-20 mb-20">
              <div className="text-muted text-xs text-bold uppercase mb-8">Confidence Metric</div>
              <ScoreGauge score={selected.score} />
            </div>

            <div className="card-title mb-10">Flagged Indicators</div>
            {selected.reasons.map((r, i) => (
              <div key={i} style={{
                padding:'12px 14px', marginBottom:8, background:'rgba(59,130,246,0.04)',
                borderRadius:10, borderLeft:'3px solid var(--warning)', fontSize:13, fontWeight:500,
              }}>
                • {r}
              </div>
            ))}

            <button className="btn btn-primary mt-20" style={{ width:'100%', justifyContent:'center' }} onClick={() => setDrawerOpen(false)}>
              Acknowledge & Action
            </button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
