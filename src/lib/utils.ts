import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function formatRelative(date: string | Date): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export const AGENT_TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  explorer:    { icon: 'dna',       label: 'Explorer',    color: 'blue' },
  monitor:     { icon: 'activity',  label: 'Monitor',     color: 'purple' },
  application: { icon: 'clipboard', label: 'Application', color: 'green' },
  market:      { icon: 'chart',     label: 'Market',      color: 'orange' },
  network:     { icon: 'globe',     label: 'Network',     color: 'gold' },
};

export const SNAP_PHASE_ORDER = ['discovery', 'probing', 'constraints', 'convergence', 'human_gate', 'complete'] as const;

export const SNAP_PHASE_META: Record<string, { label: string; color: string }> = {
  discovery:    { label: 'Discovery',    color: 'blue' },
  probing:      { label: 'Probing',      color: 'purple' },
  constraints:  { label: 'Constraints',  color: 'orange' },
  convergence:  { label: 'Convergence',  color: 'green' },
  human_gate:   { label: 'Human Gate',   color: 'gold' },
  complete:     { label: 'Complete',      color: 'green' },
};

export const MATCH_META: Record<string, { label: string; color: string }> = {
  match:     { label: 'Match',     color: 'green' },
  near_miss: { label: 'Near Miss', color: 'orange' },
  no_match:  { label: 'No Match',  color: 'red' },
  pending:   { label: 'Pending',   color: 'gray' },
};

export const STATUS_META: Record<string, { label: string; color: string }> = {
  active:   { label: 'Active',   color: 'green' },
  idle:     { label: 'Idle',     color: 'blue' },
  paused:   { label: 'Paused',   color: 'orange' },
  archived: { label: 'Archived', color: 'gray' },
  error:    { label: 'Error',    color: 'red' },
};
