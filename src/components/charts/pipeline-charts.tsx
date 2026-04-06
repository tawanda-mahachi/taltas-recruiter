'use client';
import { useEffect, useRef } from 'react';

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
        tooltip: { trigger: 'item' },
        legend: {
          data: ['Explorer Candidates', 'ATS-Only'],
          bottom: 0,
          textStyle: { fontSize: 10, color: '#AAAAAA', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }
        },
        radar: {
          indicator: dims.map(d => ({ name: d.name, max: 100 })),
          shape: 'polygon',
          splitNumber: 4,
          axisName: { fontSize: 10, color: '#AAAAAA', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" },
          splitLine: { lineStyle: { color: '#E8E8E5' } },
          splitArea: { show: false },
          axisLine: { lineStyle: { color: '#E8E8E5' } },
        },
        series: [{
          type: 'radar',
          data: [
            {
              value: dims.map(d => d.value),
              name: 'Explorer Candidates',
              lineStyle: { color: '#1D9E75', width: 2 },
              areaStyle: { color: 'rgba(29,158,117,.1)' },
              itemStyle: { color: '#1D9E75' }
            },
            {
              value: dims.map(d => d.target),
              name: 'ATS-Only',
              lineStyle: { color: '#2563eb', width: 1.5, type: 'dashed' },
              areaStyle: { color: 'rgba(37,99,235,.05)' },
              itemStyle: { color: '#2563eb' }
            },
          ]
        }]
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 280 }} />;
}

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
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: {
          data: ['Count', 'Cumulative %'],
          bottom: 0,
          textStyle: { fontSize: 10, color: '#AAAAAA', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" }
        },
        grid: { top: 20, right: 60, bottom: 50, left: 40 },
        xAxis: {
          type: 'category',
          data: data.map(d => d.name),
          axisLabel: { fontSize: 9, color: '#AAAAAA', rotate: 20, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif" },
          axisLine: { lineStyle: { color: '#E8E8E5' } },
          splitLine: { show: false }
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: { fontSize: 9, color: '#AAAAAA' },
            splitLine: { lineStyle: { color: '#F4F4F2' } }
          },
          {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { fontSize: 9, color: '#AAAAAA', formatter: '{value}%' },
            splitLine: { show: false }
          },
        ],
        series: [
          {
            name: 'Count',
            type: 'bar',
            data: data.map(d => d.count),
            itemStyle: { color: '#E85B3A' },
            barMaxWidth: 40
          },
          {
            name: 'Cumulative %',
            type: 'line',
            yAxisIndex: 1,
            data: data.map(d => d.cumPct),
            lineStyle: { color: '#D97706', width: 2 },
            itemStyle: { color: '#D97706' },
            symbol: 'circle',
            symbolSize: 6
          },
        ]
      });
    });
    return () => { chart?.dispose(); };
  }, []);
  return <div ref={ref} style={{ width: '100%', height: 280 }} />;
}
