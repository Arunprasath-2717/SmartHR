'use client';
import { useEffect, useRef } from 'react';
import { useInView } from '@/hooks/useInView';

// Animated SVG Donut Chart
export function DonutChart({ value = 0, max = 100, size = 100, stroke = 10, color = '#6C63FF', bg = 'rgba(0,0,0,0.06)', children }) {
  const [ref, inView] = useInView();
  const circleRef = useRef(null);

  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(value / max, 1);

  useEffect(() => {
    if (!inView || !circleRef.current) return;
    circleRef.current.style.transition = 'stroke-dashoffset 1000ms ease-out 200ms';
    circleRef.current.style.strokeDashoffset = `${circ * (1 - pct)}`;
  }, [inView, pct, circ]);

  return (
    <div ref={ref} style={{ position:'relative', width:size, height:size, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)', position:'absolute' }}>
        {/* Background track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        {/* Animated fill */}
        <circle
          ref={circleRef}
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ}
          style={{ transition:'none' }}
        />
      </svg>
      <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
        {children}
      </div>
    </div>
  );
}

// Animated Mini Bar Chart (no axes, pure visual)
export function MiniBarChart({ data = [], activeIndex = -1, color = '#6C63FF', height = 48 }) {
  const [ref, inView] = useInView();
  const max = Math.max(...data, 1);

  return (
    <div ref={ref} style={{ display:'flex', alignItems:'flex-end', gap:3, height }}>
      {data.map((val, i) => {
        const pct = (val / max) * 100;
        const isActive = i === activeIndex;
        return (
          <div key={i} style={{
            flex:1, borderRadius:3, overflow:'hidden',
            background:'rgba(0,0,0,0.07)', height:'100%',
            display:'flex', alignItems:'flex-end',
          }}>
            <div style={{
              width:'100%', borderRadius:3,
              background: isActive ? color : `${color}99`,
              height: inView ? `${pct}%` : '0%',
              transition: `height 600ms ease-out ${i * 40}ms`,
            }} />
          </div>
        );
      })}
    </div>
  );
}

// Animated Line/Area Chart (SVG path with stroke-dashoffset)
export function LineChart({ data = [], width = 400, height = 120, color = '#6C63FF', showArea = true }) {
  const [ref, inView] = useInView();
  const pathRef = useRef(null);
  const areaRef = useRef(null);

  useEffect(() => {
    if (!inView || !pathRef.current) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = len;
    pathRef.current.style.strokeDashoffset = len;
    pathRef.current.style.transition = 'stroke-dashoffset 1000ms ease-out';
    pathRef.current.style.strokeDashoffset = '0';
    if (areaRef.current) {
      areaRef.current.style.transition = 'opacity 400ms ease-out 1000ms';
      areaRef.current.style.opacity = '0.12';
    }
  }, [inView]);

  if (!data.length) return null;
  const max  = Math.max(...data.map(d => typeof d === 'object' ? d.value : d), 1);
  const vals = data.map(d => typeof d === 'object' ? d.value : d);
  const pts  = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * width,
    y: height - (v / max) * height * 0.9 - 8,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${height} L 0 ${height} Z`;

  return (
    <div ref={ref}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {showArea && (
          <path ref={areaRef} d={areaPath} fill={color} opacity={0} />
        )}
        <path ref={pathRef} d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Dual Line Chart (present vs absent)
export function DualLineChart({ data = [], width = 600, height = 160 }) {
  const [ref, inView] = useInView();
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  const presentVals = data.map(d => d.present || 0);
  const absentVals  = data.map(d => d.absent  || 0);
  const maxVal = Math.max(...presentVals, ...absentVals, 1);

  const buildPath = (vals) => vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * width;
    const y = height - (v / maxVal) * height * 0.85 - 8;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const path1 = buildPath(presentVals);
  const path2 = buildPath(absentVals);

  useEffect(() => {
    if (!inView) return;
    [line1Ref, line2Ref].forEach((r, idx) => {
      if (!r.current) return;
      const len = r.current.getTotalLength();
      r.current.style.strokeDasharray = len;
      r.current.style.strokeDashoffset = len;
      r.current.style.transition = `stroke-dashoffset 1000ms ease-out ${idx * 200}ms`;
      r.current.style.strokeDashoffset = '0';
    });
  }, [inView]);

  return (
    <div ref={ref}>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <path ref={line1Ref} d={path1} fill="none" stroke="#6C63FF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={line2Ref} d={path2} fill="none" stroke="#EF4444" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Horizontal Grouped Bar Chart (for analytics leave)
export function GroupedBarChart({ data = [], keys = [], colors = [], height = 180 }) {
  const [ref, inView] = useInView();
  const max = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);

  return (
    <div ref={ref} style={{ display:'flex', alignItems:'flex-end', gap:12, height, paddingBottom:8 }}>
      {data.map((item, gi) => (
        <div key={gi} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:3, height:height - 24, width:'100%', justifyContent:'center' }}>
            {keys.map((key, ki) => {
              const pct = (item[key] || 0) / max * 100;
              return (
                <div key={key} style={{ width:12, borderRadius:3, overflow:'hidden', background:'rgba(0,0,0,0.06)', height:'100%', display:'flex', alignItems:'flex-end' }}>
                  <div style={{
                    width:'100%', borderRadius:3,
                    background: colors[ki] || '#6C63FF',
                    height: inView ? `${pct}%` : '0%',
                    transition: `height 600ms ease-out ${gi * 50 + ki * 30}ms`,
                  }} />
                </div>
              );
            })}
          </div>
          <span style={{ fontSize:10, color:'var(--text-muted)', fontWeight:500 }}>{item.month || item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Score Gauge Bar
export function ScoreGauge({ score = 0 }) {
  const [ref, inView] = useInView();

  return (
    <div ref={ref} style={{ padding:'12px 0' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:11, color:'var(--text-muted)' }}>
        <span>0</span><span>0.5</span><span>1.0</span>
      </div>
      <div style={{ position:'relative', height:8, borderRadius:99, background:'linear-gradient(to right,#22C55E,#F59E0B,#EF4444)', overflow:'visible' }}>
        <div style={{
          position:'absolute', top:'50%', left:`${score * 100}%`,
          width:18, height:18, background:'#fff', border:'2px solid #0F0F12',
          borderRadius:'50%', transform:'translate(-50%,-50%)',
          boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
          transition: inView ? 'left 1000ms cubic-bezier(0.16,1,0.3,1)' : 'none',
          ...(inView ? { left:`${score * 100}%` } : { left:'0%' }),
        }}>
          <div style={{
            position:'absolute', bottom:'calc(100% + 4px)', left:'50%', transform:'translateX(-50%)',
            background:'#0F0F12', color:'#fff', fontSize:10, fontWeight:700,
            padding:'2px 6px', borderRadius:4, whiteSpace:'nowrap',
          }}>{score.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
