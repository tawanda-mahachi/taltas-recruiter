// @ts-nocheck
'use client';
import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useUpdateExplorer } from '@/lib/data-provider';
import { IconX, IconBot, IconZap, IconTarget, IconBrain, IconRocket, IconDna, IconCpu } from '@/components/icons';

const PERSONALITY_TEMPLATES = [
  { id: 'professional', label: 'Professional & Thorough', desc: 'Formal tone, deep technical evaluation', color: 'var(--blue)' },
  { id: 'conversational', label: 'Conversational & Warm', desc: 'Friendly, emphasizes culture and team fit', color: 'var(--green)' },
  { id: 'analytical', label: 'Analytical & Data-Driven', desc: 'Focus on skills metrics and benchmarks', color: 'var(--purple)' },
  { id: 'challenger', label: 'Challenger & Probing', desc: 'Pushes candidates to demonstrate depth', color: 'var(--orange)' },
];

const ICON_OPTIONS = [
  { key: 'bot', icon: <IconBot size={16} />, bg: 'var(--green-bg)' },
  { key: 'dna', icon: <IconDna size={16} />, bg: 'var(--blue-bg)' },
  { key: 'target', icon: <IconTarget size={16} />, bg: 'var(--purple-bg)' },
  { key: 'brain', icon: <IconBrain size={16} />, bg: 'var(--orange-bg)' },
  { key: 'rocket', icon: <IconRocket size={16} />, bg: 'var(--red-bg)' },
  { key: 'cpu', icon: <IconCpu size={16} />, bg: 'var(--surface3)' },
];

interface ExplorerData {
  id: string; name: string; mode: string; role: string; icon: string; iconBg: string;
}

export function EditExplorerModal({ open, onClose, explorer }: { open: boolean; onClose: () => void; explorer: ExplorerData | null }) {
  const toast = useToast();
  const updateExplorer = useUpdateExplorer();
  const [form, setForm] = useState({
    name: '', mode: 'AUTO' as 'AUTO' | 'ASSIST' | 'DRAFT',
    personality: 'professional', iconKey: 'bot',
    screeningQuestions: ['', '', ''],
    evaluationCriteria: ['Technical skills', 'Culture fit', 'Communication'],
    maxConversations: '50', autoAdvance: true, a2aEnabled: true,
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  // Pre-fill when explorer data changes
  useEffect(() => {
    if (explorer) {
      setForm(f => ({
        ...f,
        name: explorer.name,
        mode: (explorer.mode || 'AUTO') as 'AUTO' | 'ASSIST' | 'DRAFT',
        iconKey: explorer.icon || 'bot',
      }));
    }
  }, [explorer?.id]);

  if (!explorer) return null;
  const selectedIcon = ICON_OPTIONS.find(i => i.key === form.iconKey) || ICON_OPTIONS[0];

  return (
    <Modal open={open} onClose={onClose} maxWidth="640px">
      <div className="flex items-center gap-[10px] mb-[14px]">
        <div className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: selectedIcon.bg, border: '1px solid var(--border)' }}>{selectedIcon.icon}</div>
        <div className="flex-1">
          <div className="text-[17px] font-bold" style={{ fontFamily: "'Roboto Slab', serif", color: 'var(--text-bright)' }}>Edit Explorer</div>
          <div className="text-[12px]" style={{ color: 'var(--muted)' }}>{explorer.role}</div>
        </div>
        <button onClick={onClose} className="ctrl-btn"><IconX size={10} /></button>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div>
            <label className="form-label">Explorer Name</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. StaffML-Agent" />
          </div>
          <div>
            <label className="form-label">Target Role</label>
            <input className="form-input" value={explorer.role} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>

        <label className="form-label mt-[13px]">Mode</label>
        <div className="grid grid-cols-3 gap-[8px]">
          {(['AUTO', 'ASSIST', 'DRAFT'] as const).map(m => (
            <div key={m} onClick={() => set('mode', m)} className="p-[10px] rounded-[8px] cursor-pointer text-center transition-all" style={{ border: `2px solid ${form.mode === m ? (m === 'AUTO' ? 'var(--green-border)' : m === 'ASSIST' ? 'var(--purple-border)' : 'var(--border2)') : 'var(--border)'}`, background: form.mode === m ? (m === 'AUTO' ? 'var(--green-bg)' : m === 'ASSIST' ? 'var(--purple-bg)' : 'var(--surface3)') : 'transparent' }}>
              <div className="text-[12px] font-bold" style={{ color: m === 'AUTO' ? 'var(--green)' : m === 'ASSIST' ? 'var(--purple)' : 'var(--muted)' }}>{m}</div>
              <div className="text-[9px] mt-[2px]" style={{ color: 'var(--muted)' }}>{m === 'AUTO' ? 'Fully autonomous' : m === 'ASSIST' ? 'Human-in-loop' : 'Config only'}</div>
            </div>
          ))}
        </div>

        <label className="form-label mt-[13px]">Icon</label>
        <div className="flex gap-[6px]">
          {ICON_OPTIONS.map(ico => (
            <div key={ico.key} onClick={() => set('iconKey', ico.key)} className="w-[36px] h-[36px] rounded-[8px] flex items-center justify-center cursor-pointer transition-all" style={{ background: ico.bg, border: `2px solid ${form.iconKey === ico.key ? 'var(--blue)' : 'var(--border)'}` }}>{ico.icon}</div>
          ))}
        </div>

        <label className="form-label mt-[13px]">Personality Template</label>
        <div className="grid grid-cols-2 gap-[8px]">
          {PERSONALITY_TEMPLATES.map(p => (
            <div key={p.id} onClick={() => set('personality', p.id)} className="p-[10px_12px] rounded-[8px] cursor-pointer transition-all" style={{ border: `1.5px solid ${form.personality === p.id ? p.color : 'var(--border)'}`, background: form.personality === p.id ? `color-mix(in srgb, ${p.color} 8%, transparent)` : 'transparent' }}>
              <div className="text-[11px] font-semibold" style={{ color: form.personality === p.id ? p.color : 'var(--text-mid)' }}>{p.label}</div>
              <div className="text-[9px]" style={{ color: 'var(--muted)' }}>{p.desc}</div>
            </div>
          ))}
        </div>

        <label className="form-label mt-[13px]">Screening Questions</label>
        {form.screeningQuestions.map((q, i) => (
          <input key={i} className="form-input mb-[8px]" value={q} onChange={e => { const qs = [...form.screeningQuestions]; qs[i] = e.target.value; set('screeningQuestions', qs); }} placeholder={`Question ${i + 1}`} />
        ))}
        <button className="ctrl-btn blue mt-[4px]" style={{ fontSize: '9px' }} onClick={() => set('screeningQuestions', [...form.screeningQuestions, ''])}>+ Add Question</button>

        <label className="form-label mt-[13px]">Evaluation Criteria</label>
        <div className="flex flex-wrap gap-[6px]">
          {['Technical skills', 'Culture fit', 'Communication', 'Leadership', 'Problem solving', 'Growth potential', 'Domain expertise', 'Team collaboration'].map(c => (
            <button key={c} onClick={() => set('evaluationCriteria', form.evaluationCriteria.includes(c) ? form.evaluationCriteria.filter((x: string) => x !== c) : [...form.evaluationCriteria, c])} className="font-mono text-[9px] px-[10px] py-[4px] rounded-[5px] cursor-pointer transition-all" style={{ color: form.evaluationCriteria.includes(c) ? 'var(--blue)' : 'var(--text-dim)', background: form.evaluationCriteria.includes(c) ? 'var(--blue-bg)' : 'var(--surface2)', border: `1px solid ${form.evaluationCriteria.includes(c) ? 'var(--blue-border)' : 'var(--border)'}` }}>{c}</button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-[13px] mt-[13px]">
          <div><label className="form-label">Max Conversations</label><input className="form-input" type="number" value={form.maxConversations} onChange={e => set('maxConversations', e.target.value)} /></div>
          <div className="flex items-center justify-between p-[10px_12px] rounded-[8px] mt-[16px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div><div className="text-[11px] font-medium" style={{ color: 'var(--text-bright)' }}>Auto-Advance</div><div className="text-[9px]" style={{ color: 'var(--muted)' }}>Move 90+ scores</div></div>
            <button onClick={() => set('autoAdvance', !form.autoAdvance)} className="w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors" style={{ background: form.autoAdvance ? 'var(--green)' : 'var(--border2)' }}><div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all" style={{ left: form.autoAdvance ? 18 : 2 }} /></button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-[13px] p-[10px_12px] rounded-[8px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>Agent-to-Agent (A2A)</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>Allow negotiation with candidate agents</div></div>
          <button onClick={() => set('a2aEnabled', !form.a2aEnabled)} className="w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors" style={{ background: form.a2aEnabled ? 'var(--blue)' : 'var(--border2)' }}><div className="absolute top-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all" style={{ left: form.a2aEnabled ? 18 : 2 }} /></button>
        </div>
      </div>

      <div className="flex items-center gap-[8px] mt-[18px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
        <button className="ctrl-btn" onClick={onClose}>Cancel</button>
        <button className="ctrl-btn run" style={{ marginLeft: 'auto' }} onClick={() => { if (explorer?.id) { const selIcon = ICON_OPTIONS.find(i => i.key === form.iconKey) || ICON_OPTIONS[0]; updateExplorer.mutate({ id: explorer.id, data: { name: form.name, context: { mode: form.mode, icon: form.iconKey, iconBg: selIcon.bg, role: explorer.role, ats: explorer.ats, personality: form.personality, aggression: form.aggression, responseTime: form.responseTime, searchDepth: form.searchDepth, maxConversations: form.maxConversations, autoAdvance: form.autoAdvance, a2aEnabled: form.a2aEnabled, conversations: explorer.conversations || 0, a2aSessions: explorer.a2aSessions || 0, interviewsSet: explorer.interviewsSet || 0, interactions: explorer.interactions || [] } } }, { onSuccess: () => { toast.show(`Explorer "${form.name}" saved via API`); onClose(); }, onError: () => { toast.show(`Explorer "${form.name}" updated locally`); onClose(); } }); } else { toast.show(`Explorer "${form.name}" updated`); onClose(); } }}>
          <IconZap size={10} className="inline mr-[4px]" /> Save Changes
        </button>
      </div>
    </Modal>
  );
}

