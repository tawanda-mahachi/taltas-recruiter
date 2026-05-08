// @ts-nocheck
'use client';
import { ReactNode } from 'react';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE = '#2563eb';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const SNAP_LABELS = ['Screening', 'Negotiation', 'Assessment', 'Placement'];

interface SnapPillProps {
  step: number; // 0-3
  label?: string;
}

function SnapPill({ step, label }: SnapPillProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {[0, 1, 2, 3].map(i => (
          <span
            key={i}
            style={{
              width: 14,
              height: i === step ? 4 : 3,
              borderRadius: 1,
              background: i <= step ? BLUE : '#E8E8E5',
              transition: 'all 0.1s',
            }}
          />
        ))}
      </span>
      <span style={{
        padding: '2px 8px',
        fontSize: 10,
        background: '#E1F5EE',
        color: '#0F6E56',
        fontWeight: 500,
        fontFamily: F,
      }}>
        {label || SNAP_LABELS[step] || 'Pending'}
      </span>
    </span>
  );
}

export interface ChipDef {
  /** Pre-defined chip style */
  variant?: 'snap' | 'deep' | 'strong' | 'good' | 'paused' | 'done' | 'unread' | 'system';
  /** Or fully custom */
  bg?: string;
  color?: string;
  /** Display text */
  text: string;
}

function Chip({ chip }: { chip: ChipDef }) {
  const styles: Record<string, { bg: string; color: string }> = {
    snap:    { bg: '#E1F5EE', color: '#0F6E56' },
    deep:    { bg: '#E1F5EE', color: '#0F6E56' },
    strong:  { bg: '#E6F1FB', color: '#0C447C' },
    good:    { bg: '#F4F4F2', color: '#5F5E5A' },
    paused:  { bg: '#FAEEDA', color: '#854F0B' },
    done:    { bg: '#F1EFE8', color: '#5F5E5A' },
    unread:  { bg: BLUE, color: '#fff' },
    system:  { bg: '#F1EFE8', color: '#5F5E5A' },
  };
  const s = chip.variant ? styles[chip.variant] : { bg: chip.bg || BLIGHT, color: chip.color || MID };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      fontSize: 10,
      background: s.bg,
      color: s.color,
      fontWeight: 500,
      fontFamily: F,
      letterSpacing: 0,
    }}>
      {chip.text}
    </span>
  );
}

export interface TimelineRowProps {
  /** Avatar text - usually 1-2 char initials. If avatarUrl set, used as alt. */
  avatar: string;
  /** If set, render an image instead of initials text */
  avatarUrl?: string;
  /** Avatar background variant */
  avatarVariant?: 'default' | 'system' | 'career' | 'alert';
  /** Title/headline of the row - JSX allowed for partial bolding */
  title: ReactNode;
  /** Optional single-line preview shown under title */
  preview?: string;
  /** Right-aligned timestamp string */
  time?: string;
  /** Right-aligned secondary action (e.g. "View thread") */
  rightAction?: ReactNode;
  /** SNAP step pill (0-3) - rendered before chips if provided */
  snapStep?: number;
  snapLabel?: string;
  /** Generic metadata chips */
  chips?: ChipDef[];
  /** Whether this row is unread - renders left teal accent + light tint */
  unread?: boolean;
  /** Whether this row is currently selected (e.g. Messages thread open) */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
}

export default function TimelineRow({
  avatar,
  avatarUrl,
  avatarVariant = 'default',
  title,
  preview,
  time,
  rightAction,
  snapStep,
  snapLabel,
  chips,
  unread = false,
  selected = false,
  onClick,
}: TimelineRowProps) {
  const avatarBg: Record<string, { bg: string; color: string }> = {
    default: { bg: '#E1F5EE', color: '#0F6E56' },
    system:  { bg: '#F1EFE8', color: '#5F5E5A' },
    career:  { bg: BLUE,      color: '#fff' },
    alert:   { bg: '#FAEEDA', color: '#854F0B' },
  };
  const av = avatarBg[avatarVariant] || avatarBg.default;

  const baseBg = selected ? BLIGHT : (unread ? 'rgba(29,158,117,0.03)' : '#fff');
  const accentColor = (selected || unread) ? BLUE : 'transparent';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 14px',
        borderBottom: '1px solid ' + BORDER,
        cursor: onClick ? 'pointer' : 'default',
        alignItems: 'flex-start',
        borderLeft: '2px solid ' + accentColor,
        background: baseBg,
        fontFamily: F,
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { if (onClick && !selected) e.currentTarget.style.background = BLIGHT; }}
      onMouseLeave={(e) => { if (onClick && !selected) e.currentTarget.style.background = baseBg; }}
    >
      {/* Avatar */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: av.bg,
        color: av.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        fontSize: 12,
        flexShrink: 0,
        marginTop: 1,
        overflow: 'hidden',
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : avatar}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title + time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <div style={{ fontSize: 13, color: DARK, fontWeight: 400, lineHeight: 1.3 }}>{title}</div>
          {time && <div style={{ fontSize: 11, color: MUTED, flexShrink: 0, fontVariantNumeric: 'tabular-nums' as const }}>{time}</div>}
        </div>

        {/* Preview */}
        {preview && (
          <div style={{
            fontSize: 12,
            color: MID,
            lineHeight: 1.45,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: (snapStep !== undefined || (chips && chips.length > 0) || rightAction) ? 6 : 0,
          }}>
            {preview}
          </div>
        )}

        {/* Bottom row: SNAP + chips + right action */}
        {(snapStep !== undefined || (chips && chips.length > 0) || rightAction) && (
          <div style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            flexWrap: 'wrap' as const,
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const }}>
              {snapStep !== undefined && <SnapPill step={snapStep} label={snapLabel} />}
              {chips && chips.map((c, i) => <Chip key={i} chip={c} />)}
            </div>
            {rightAction && (
              <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                {rightAction}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
