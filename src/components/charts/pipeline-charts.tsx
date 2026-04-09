// @ts-nocheck
'use client';
import { useEffect, useRef, useState } from 'react';

const BLUE = '#2563eb';
const TEAL = '#1D9E75';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';
const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// ── RADAR CHART ──
export function RadarChart({ dims }: { dims: { name: string; value: number; target: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({
        animation: true,
        legend: {
          data: ['Explorer Candidates', 'ATS-Only'],
          top: 4, right: 4, orient: 'vertical',
          itemWidth: 16, itemHeight: 8,
          textStyle: { fontSize: 9, color: MUTED, fontFamily: F }
        },
        radar: {
          indicator: dims.map(d => ({ name: d.name, max: 100 })),
          center: ['46%', '54%'],
          shape: 'polygon', splitNumber: 4, radius: '65%',
          axisName: { fontSize: 10, color: MUTED, fontFamily: F },
          splitLine: { lineStyle: { color: BORDER } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: BORDER } },
        },
        series: [{
          type: 'radar',
          data: [
            { value: dims.map(d => d.value), name: 'Explorer Candidates', lineStyle: { color: TEAL, width: 2 }, areaStyle: { color: 'rgba(29,158,117,.1)' }, itemStyle: { color: TEAL } },
            { value: dims.map(d => d.target), name: 'ATS-Only', lineStyle: { color: BLUE, width: 1.5, type: 'dashed' }, areaStyle: { color: 'rgba(37,99,235,.05)' }, itemStyle: { color: BLUE } },
          ]
        }]
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 260 }} />;
}

// ── PARETO CHART ──
export function ParetoChart({ data }: { data: { name: string; count: number; cumPct: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({
        animation: true,
        legend: { data: ['Count', 'Cumulative %'], bottom: 0, textStyle: { fontSize: 10, color: MUTED, fontFamily: F }, itemWidth: 12, itemHeight: 2 },
        grid: { top: 15, right: 55, bottom: 45, left: 35 },
        xAxis: {
          type: 'category', data: data.map(d => d.name),
          axisLabel: { fontSize: 9, color: MUTED, rotate: 20, fontFamily: F },
          axisLine: { lineStyle: { color: BORDER } }, splitLine: { show: false }
        },
        yAxis: [
          { type: 'value', axisLabel: { fontSize: 9, color: MUTED }, splitLine: { show: false }, axisLine: { show: false } },
          { type: 'value', min: 0, max: 100, axisLabel: { fontSize: 9, color: MUTED, formatter: '{value}%' }, splitLine: { show: false }, axisLine: { show: false } },
        ],
        series: [
          { name: 'Count', type: 'bar', data: data.map(d => d.count), itemStyle: { color: '#E85B3A' }, barMaxWidth: 36 },
          { name: 'Cumulative %', type: 'line', yAxisIndex: 1, data: data.map(d => d.cumPct), lineStyle: { color: BLUE, width: 2 }, itemStyle: { color: BLUE }, symbol: 'circle', symbolSize: 5 },
        ]
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 240 }} />;
}

// ── CONVERSION RATE GAUGE ──
export function ConversionGauge({ value }: { value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({
        animation: true,
        series: [{
          type: 'gauge', startAngle: 180, endAngle: 0, min: 0, max: 100,
          radius: '92%', center: ['50%', '82%'],
          axisLine: { lineStyle: { width: 10, color: [[1, '#E8E8E5']] } },
          progress: { show: true, width: 10, itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#F5A623' }, { offset: 1, color: TEAL }] } } },
          pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { show: false },
          detail: { valueAnimation: true, fontSize: 30, fontWeight: 300, color: DARK, offsetCenter: [0, '-12%'], formatter: '{value}%', fontFamily: F },
          title: { show: true, offsetCenter: [0, '22%'], fontSize: 9, color: MUTED, fontFamily: F, fontWeight: 400 },
          data: [{ value, name: 'Conversion Rate' }]
        }]
      });
    });
    return () => { chart?.dispose(); };
  }, [value]);
  return <div ref={ref} style={{ width: '100%', height: 200 }} />;
}

// ── MATCH DISTRIBUTION ──
export function MatchDistribution({ data }: { data: number[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      const colors = ['#DC2626', '#EA580C', '#D97706', '#2563eb', '#1D9E75', '#15803d'];
      chart.setOption({
        animation: true,
        grid: { top: 15, right: 5, bottom: 22, left: 5 },
        xAxis: {
          type: 'category', data: ['0-20', '21-40', '41-60', '61-80', '81-90', '91-100'],
          axisLabel: { fontSize: 9, color: MUTED, fontFamily: F },
          axisLine: { lineStyle: { color: BORDER } }, splitLine: { show: false }
        },
        yAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false }, axisLine: { show: false } },
        series: [{
          type: 'bar', data: data.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
          barMaxWidth: 30,
          label: { show: true, position: 'top', fontSize: 9, color: MID, fontFamily: F }
        }]
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 220 }} />;
}

// ── STAGE VELOCITY ──
export function StageVelocityChart({ data }: { data: { stage: string; target: number; actual: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({
        animation: true,
        grid: { top: 5, right: 70, bottom: 5, left: 10, containLabel: true },
        xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false }, axisLine: { show: false } },
        yAxis: {
          type: 'category', data: data.map(d => d.stage),
          axisLabel: { fontSize: 10, color: MID, fontFamily: F }, axisLine: { show: false }, axisTick: { show: false }
        },
        series: [
          {
            type: 'bar', data: data.map(d => d.target), itemStyle: { color: TEAL }, barMaxWidth: 7, z: 2, name: 'Target',
          },
          {
            type: 'bar', data: data.map(d => d.actual), itemStyle: { color: '#E8E8E5' }, barMaxWidth: 7, z: 1, name: 'Actual',
            label: { show: true, position: 'right', fontSize: 10, color: MID, fontFamily: F, formatter: (p: any) => p.value + ' days' }
          },
        ],
        barGap: '-100%'
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 220 }} />;
}

// ── PIPELINE TREND ──
export function PipelineTrend() {
  const ref = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<'W' | 'M' | 'Y'>('W');
  const chartRef = useRef<any>(null);

  const DATA = {
    W: { cats: ['W1', 'W2', 'W3', 'W4'], applied: [28, 34, 41, 47], screened: [19, 25, 30, 38], offered: [3, 4, 5, 6] },
    M: { cats: ['Jan', 'Feb', 'Mar', 'Apr'], applied: [89, 104, 97, 121], screened: [62, 78, 71, 94], offered: [8, 12, 9, 14] },
    Y: { cats: ['Q1', 'Q2', 'Q3', 'Q4'], applied: [310, 380, 420, 490], screened: [220, 280, 310, 370], offered: [28, 35, 42, 51] },
  };

  const updateChart = (r: 'W' | 'M' | 'Y') => {
    if (!chartRef.current) return;
    const d = DATA[r];
    chartRef.current.setOption({
      xAxis: { data: d.cats },
      series: [{ data: d.applied }, { data: d.screened }, { data: d.offered }]
    });
  };

  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chartRef.current = chart;
      const d = DATA['W'];
      chart.setOption({
        animation: true,
        grid: { top: 10, right: 10, bottom: 32, left: 10 },
        xAxis: { type: 'category', data: d.cats, axisLabel: { fontSize: 9, color: MUTED, fontFamily: F }, axisLine: { lineStyle: { color: BORDER } }, splitLine: { show: false } },
        yAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false }, axisLine: { show: false } },
        legend: { bottom: 0, textStyle: { fontSize: 9, color: MUTED, fontFamily: F }, itemWidth: 14, itemHeight: 2 },
        series: [
          { name: 'Applied', type: 'line', data: d.applied, lineStyle: { color: '#F5A623', width: 1.5 }, itemStyle: { color: '#F5A623' }, symbol: 'circle', symbolSize: 4, smooth: true },
          { name: 'Screened', type: 'line', data: d.screened, lineStyle: { color: BLUE, width: 1.5 }, itemStyle: { color: BLUE }, symbol: 'circle', symbolSize: 4, smooth: true },
          { name: 'Offered', type: 'line', data: d.offered, lineStyle: { color: TEAL, width: 1.5 }, itemStyle: { color: TEAL }, symbol: 'circle', symbolSize: 4, smooth: true },
        ]
      });
    });
    return () => { chart?.dispose(); };
  }, []);

  const handleRange = (r: 'W' | 'M' | 'Y') => {
    setRange(r);
    updateChart(r);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 4 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
        <span style={{ fontSize: 9, color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 400, fontFamily: F, flex: 1 }}>Pipeline Trend</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {(['W', 'M', 'Y'] as const).map(r => (
            <button key={r} onClick={() => handleRange(r)}
              style={{ fontSize: 9, padding: '2px 8px', border: `1px solid ${range === r ? BLUE : BORDER}`, background: range === r ? BLUE : 'none', color: range === r ? '#fff' : MUTED, cursor: 'pointer', fontFamily: F }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ width: '100%', height: 220 }} />
    </div>
  );
}

// ── ROLE VELOCITY CHART ──
export function RoleVelocityChart({ roles }: { roles: { role: string; avgDays: number; status: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [search, setSearch] = useState('');

  const filtered = roles.filter(r => r.role.toLowerCase().includes(search.toLowerCase()));
  const h = Math.max(220, filtered.length * 32);

  useEffect(() => {
    if (!ref.current) return;
    let chart: any;
    import('echarts').then(echarts => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chartRef.current = chart;
      renderChart(chart, filtered);
    });
    return () => { chart?.dispose(); };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    ref.current!.style.height = h + 'px';
    chartRef.current.resize();
    renderChart(chartRef.current, filtered);
  }, [search]);

  function renderChart(chart: any, data: typeof roles) {
    chart.setOption({
      animation: true,
      grid: { top: 5, right: 80, bottom: 5, left: 10, containLabel: true },
      xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false }, axisLine: { show: false } },
      yAxis: { type: 'category', data: data.map(r => r.role), axisLabel: { fontSize: 10, color: MID, fontFamily: F }, axisLine: { show: false }, axisTick: { show: false } },
      series: [{
        type: 'bar',
        data: data.map(r => ({ value: r.avgDays, itemStyle: { color: r.status === 'fast' ? TEAL : r.status === 'slow' ? '#D97706' : BLUE } })),
        barMaxWidth: 10,
        label: { show: true, position: 'right', fontSize: 10, color: MID, fontFamily: F, formatter: (p: any) => p.value + ' days' }
      }]
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles..."
            style={{ width: '100%', padding: '4px 8px 4px 26px', border: '1px solid ' + BORDER, fontSize: 11, fontFamily: F, color: DARK, outline: 'none', background: '#fff' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {[{ col: TEAL, label: 'Fast' }, { col: BLUE, label: 'OK' }, { col: '#D97706', label: 'Slow' }].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.col }} />
              <span style={{ fontSize: 9, color: MUTED, fontFamily: F }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={ref} style={{ width: '100%', height: h, transition: 'height .2s' }} />
    </div>
  );
}
