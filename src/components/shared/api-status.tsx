// @ts-nocheck
'use client';

import { useApiHealth, type ApiHealth } from '@/lib/data-provider';

/** Inline badge: shows LIVE (green) or MOCK (amber) next to any section header */
export function DataSourceBadge({ fromApi, label }: { fromApi: boolean; label?: string }) {
  return (
    <span className="font-mono text-[7.5px] px-[5px] py-[1px] rounded-[3px] ml-[6px] inline-flex items-center gap-[3px] flex-shrink-0"
      style={{
        background: fromApi ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
        color: fromApi ? 'var(--green)' : 'var(--gold)',
        border: `1px solid ${fromApi ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}`,
        letterSpacing: '.05em',
        fontWeight: 600,
      }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: fromApi ? 'var(--green)' : 'var(--gold)' }} />
      {label || (fromApi ? 'API' : 'MOCK')}
    </span>
  );
}

/** Full API status panel — used in Settings and as a debug overlay */
export function ApiStatusPanel() {
  const health = useApiHealth();

  const statusColor = (s: string) => s === 'connected' ? 'var(--green)' : s === 'offline' ? 'var(--red)' : 'var(--blue)';

  return (
    <div style={{ padding: '16px 18px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-[8px] mb-[12px]">
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: statusColor(health.overall),
          animation: health.overall === 'checking' ? 'pulse 1.5s infinite' : 'none',
        }} />
        <span className="font-mono text-[10px] uppercase tracking-[.06em]" style={{
          color: statusColor(health.overall),
          fontWeight: 600,
        }}>
          {health.overall === 'connected' ? 'All APIs Connected' :
           health.overall === 'partial' ? 'Partial Connection' :
           health.overall === 'checking' ? 'Checking…' :
           'Offline — Using Mock Data'}
        </span>
      </div>

      <div className="font-mono text-[9px] mb-[8px]" style={{ color: 'var(--muted)' }}>
        Base URL: {typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_API_URL || 'https://api.taltas.ai/api/v1' : 'https://api.taltas.ai/api/v1'}
      </div>

      <div className="flex flex-col gap-[4px]">
        {health.endpoints.map(ep => (
          <div key={ep.key} className="flex items-center justify-between py-[4px]" style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <div className="text-[11px]" style={{ color: 'var(--text)' }}>{ep.label}</div>
              <div className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{ep.endpoint}</div>
            </div>
            <div className="flex items-center gap-[6px]">
              {ep.latencyMs !== undefined && (
                <span className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>{ep.latencyMs}ms</span>
              )}
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor(ep.status) }} />
              <span className="font-mono text-[9px]" style={{ color: statusColor(ep.status) }}>
                {ep.status === 'checking' ? '…' : ep.status === 'connected' ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

