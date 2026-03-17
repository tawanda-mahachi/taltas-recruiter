// @ts-nocheck
'use client';

/**
 * Claude-like shape-shifting animated blob.
 * - Green animated morphing when `live` is true.
 * - Gray static circle when `live` is false.
 */
export function AgentBlob({ live, size = 14 }: { live: boolean; size?: number }) {
  const inner = size - 2;
  return (
    <span className="claude-blob" style={{ width: size, height: size }}>
      <span className={`claude-blob-shape ${live ? 'live' : 'static'}`} style={{ width: inner, height: inner }} />
    </span>
  );
}

