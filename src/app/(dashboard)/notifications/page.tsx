// @ts-nocheck
'use client';

import { useState } from 'react';
import { IconBell, IconBot, IconZap, IconCheck, IconCalendar, IconTarget, IconActivity } from '@/components/icons';
import { useNotifications } from '@/lib/data-provider';
import { DataSourceBadge } from '@/components/shared/api-status';

type NotifType = 'agent' | 'pipeline' | 'system' | 'team';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  action?: string;
}

const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'agent', title: 'StaffML-Agent completed screening', body: 'Sara Kim scored 94 — auto-advanced to Recruiter Review. Deep Match flagged exceptional technical depth and culture alignment.', time: '12 min ago', read: false, action: 'View Candidate' },
  { id: 'n2', type: 'pipeline', title: 'Marcus Peterson — competing offer', body: 'PrincipalEng-Agent detected a competing FAANG offer with Friday deadline. Recommend expediting Hiring Manager review.', time: '28 min ago', read: false, action: 'View Pipeline' },
  { id: 'n3', type: 'agent', title: 'A2A session completed', body: 'PrincipalEng-Agent ↔ CTOBot negotiation for Marcus Peterson concluded. Both sides aligned on timeline and compensation range. Summary ready.', time: '1 hr ago', read: false, action: 'View Transcript' },
  { id: 'n4', type: 'system', title: 'Greenhouse sync completed', body: '14 new candidates imported, 3 stage updates synced. All data reconciled successfully.', time: '2 hrs ago', read: true },
  { id: 'n5', type: 'pipeline', title: 'Interview scheduled', body: 'Priya Sharma — Staff AI Systems Engineer interview scheduled for Feb 25, 2:00 PM EST with hiring panel.', time: '3 hrs ago', read: true, action: 'View Calendar' },
  { id: 'n6', type: 'agent', title: 'DevRel-Agent weekly summary', body: 'Screened 8 candidates this week. 3 advanced to review (avg score: 82). Recommended adjusting culture-fit weighting.', time: '5 hrs ago', read: true },
  { id: 'n7', type: 'team', title: 'New team member added', body: 'Jordan Lee was added as a Recruiter with access to Pipeline, Candidates, and Explorers.', time: '6 hrs ago', read: true },
  { id: 'n8', type: 'system', title: 'Explorer API usage alert', body: "You've used 78% of your monthly API budget ($42.80 / $55.00). Consider upgrading for additional capacity.", time: '8 hrs ago', read: true, action: 'View Billing' },
  { id: 'n9', type: 'pipeline', title: 'Offer accepted', body: 'Alex Chen accepted the Staff ML Engineer offer! Start date confirmed for March 15, 2026.', time: '1 day ago', read: true },
  { id: 'n10', type: 'agent', title: 'FoundingEng-Agent activated', body: 'New Explorer deployed in AUTO mode for Founding Engineer role. Ready to begin screening.', time: '1 day ago', read: true },
  { id: 'n11', type: 'system', title: 'Scheduled report delivered', body: 'Weekly Pipeline Health Report has been generated and sent to your email.', time: '2 days ago', read: true },
  { id: 'n12', type: 'pipeline', title: 'Bottleneck detected', body: 'Hiring Manager Review stage averaging 6.2 days — exceeds 4-day threshold. 5 candidates waiting.', time: '2 days ago', read: true, action: 'View Pipeline' },
];

const TYPE_META: Record<NotifType, { icon: any; color: string; bg: string; label: string }> = {
  agent: { icon: IconBot, color: 'var(--green)', bg: 'var(--green-bg)', label: 'Agent' },
  pipeline: { icon: IconActivity, color: 'var(--blue)', bg: 'var(--blue-bg)', label: 'Pipeline' },
  system: { icon: IconZap, color: 'var(--purple)', bg: 'var(--purple-bg)', label: 'System' },
  team: { icon: IconTarget, color: 'var(--orange)', bg: 'var(--orange-bg)', label: 'Team' },
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | NotifType>('all');
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const notifsQuery = useNotifications();
  const fromApi = !!notifsQuery.data?.fromApi;

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifs(ns => ns.map(n => ({ ...n, read: true })));

  return (
    <div className="flex flex-col gap-[13px]">
      {/* Header */}
      <div className="card" style={{ padding: '14px 20px' }}>
        <div className="flex items-center justify-between flex-wrap gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <IconBell size={14} color="var(--text-bright)" />
            <span className="text-[16px] font-semibold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Notifications<DataSourceBadge fromApi={fromApi} /></span>
            {unreadCount > 0 && (
              <span className="font-mono text-[9px] px-[7px] py-[2px] rounded-full font-bold" style={{ background: 'var(--red)', color: '#fff' }}>{unreadCount} new</span>
            )}
          </div>
          <div className="flex gap-[6px] items-center">
            <button className="ctrl-btn" onClick={markAllRead} style={{ fontSize: '9px' }}><IconCheck size={9} /> Mark all read</button>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-[2px] p-[3px] rounded-[8px]" style={{ background: 'var(--surface3)', width: 'fit-content' }}>
        {([['all', 'All'], ['agent', 'Agents'], ['pipeline', 'Pipeline'], ['system', 'System'], ['team', 'Team']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k as any)} className="font-mono text-[9.5px] px-[12px] py-[5px] rounded-[6px] transition-all" style={{
            color: filter === k ? 'var(--blue)' : 'var(--text-dim)',
            background: filter === k ? 'var(--surface)' : 'transparent',
            fontWeight: filter === k ? 600 : 400,
            boxShadow: filter === k ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
          }}>{l}</button>
        ))}
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-[6px]">
        {filtered.map(n => {
          const meta = TYPE_META[n.type];
          const Icon = meta.icon;
          return (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)} style={{ animation: 'fadeUp .3s ease both' }}>
              {!n.read && <div className="notif-dot" />}
              <div className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: meta.bg, border: '1px solid var(--border)' }}>
                <Icon size={14} color={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[6px] mb-[2px]">
                  <span className="text-[12.5px] font-semibold" style={{ color: 'var(--text-bright)' }}>{n.title}</span>
                  <span className="font-mono text-[8px] px-[6px] py-[1px] rounded" style={{ color: meta.color, background: meta.bg, border: `1px solid var(--border)` }}>{meta.label}</span>
                </div>
                <div className="text-[11.5px] leading-[1.5]" style={{ color: 'var(--text-mid)' }}>{n.body}</div>
                <div className="flex items-center gap-[10px] mt-[5px]">
                  <span className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{n.time}</span>
                  {n.action && <button className="ctrl-btn blue" style={{ fontSize: '8px', padding: '2px 8px' }}>{n.action}</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

