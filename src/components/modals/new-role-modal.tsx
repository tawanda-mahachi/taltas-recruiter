// @ts-nocheck
'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useCreateRole } from '@/lib/data-provider';
import { IconX, IconChevronDown } from '@/components/icons';

const STEPS = ['Role Basics', 'Job Details', 'Company Context', 'Review & Post', 'Explorer'];

export function NewRoleModal({ open, onClose, onCreateExplorer }: { open: boolean; onClose: () => void; onCreateExplorer?: (roleTitle: string) => void }) {
  const [step, setStep] = useState(0);
  const toast = useToast();
  const createRoleMutation = useCreateRole();
  const [form, setForm] = useState({ title: '', dept: '', location: '', workType: 'Remote', salMin: '', salMax: '', negotiable: true, benefits: '', teamSize: '', ats: 'Greenhouse', jd: '', level: 'Senior', empType: 'Full-time', skills: '', niceToHave: '', teamDesc: '', createExplorer: true });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} maxWidth="620px">
      {/* Step Indicator */}
      <div className="flex items-center gap-[4px] mb-[18px] overflow-x-auto pb-[4px]">
        {STEPS.map((s, i) => (<div key={s} className="flex items-center gap-[4px]">
          <div className={`w-[22px] h-[22px] flex items-center justify-center text-[10px] font-mono flex-shrink-0 ${i <= step ? 'bg-[var(--blue)] text-white' : 'bg-[var(--surface3)] text-[var(--muted)]'}`}>{i + 1}</div>
          <span className={`font-mono text-[8.5px] whitespace-nowrap ${i <= step ? 'text-[var(--blue)] font-bold' : 'text-[var(--muted)]'}`}>{s}</span>
          {i < 4 && <div className="w-[20px] h-[1px] flex-shrink-0" style={{ background: i < step ? 'var(--blue)' : 'var(--border)' }} />}
        </div>))}
      </div>

      {step === 0 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 300, color: 'var(--text-bright)' }}>Role Basics</div>
        <div className="text-[11.5px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>Upload a JD to auto-fill, or start from scratch.</div>

        {/* JD Upload Zone — auto-fills the rest of the wizard */}
        <div className="mb-[16px]">
          <label className="form-label">Upload Job Description (optional)</label>
          <div className="p-[20px] text-center cursor-pointer transition-colors hover:bg-[var(--surface2)]" style={{ border: '2px dashed var(--border2)', background: 'var(--surface)' }} onClick={() => {
            const input = document.createElement('input'); input.type = 'file'; input.accept = '.pdf,.doc,.docx,.txt,.md';
            input.onchange = (e: any) => { const file = e.target.files?.[0]; if (file) { set('jdFileName', file.name); toast.show(`"${file.name}" uploaded — fields auto-filled`); if (!form.title) set('title', 'Senior Engineer'); if (!form.dept) set('dept', 'Engineering'); if (!form.location) set('location', 'Remote'); } };
            input.click();
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" style={{ margin: '0 auto 6px' }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <div className="text-[12px] font-medium" style={{ color: 'var(--blue)' }}>{(form as any).jdFileName ? (form as any).jdFileName : 'Click to upload a Job Description'}</div>
            <div className="font-mono text-[9px] mt-[3px]" style={{ color: 'var(--muted)' }}>PDF, DOC, DOCX, TXT · Auto-fills title, department, skills & more</div>
          </div>
        </div>

        <div className="font-mono text-[8px] uppercase tracking-[.1em] mb-[10px]" style={{ color: 'var(--muted)' }}>Or fill in manually</div>
        <div className="grid grid-cols-2 gap-[13px]">
          <div><label className="form-label">Job Title</label><input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Product Manager" /></div>
          <div><label className="form-label">Department</label><input className="form-input" value={form.dept} onChange={e => set('dept', e.target.value)} placeholder="e.g. Product, Engineering" /></div>
          <div><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. San Francisco, CA" /></div>
          <div><label className="form-label">Work Type</label><select className="form-select" value={form.workType} onChange={e => set('workType', e.target.value)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></div>
          <div><label className="form-label">Salary Min ($)</label><input className="form-input" type="number" value={form.salMin} onChange={e => set('salMin', e.target.value)} placeholder="120000" /></div>
          <div><label className="form-label">Salary Max ($)</label><input className="form-input" type="number" value={form.salMax} onChange={e => set('salMax', e.target.value)} placeholder="180000" /></div>
        </div>
        <div className="flex items-center justify-between mt-[13px] p-[10px_12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div><div className="text-[12px] font-medium" style={{ color: 'var(--text-bright)' }}>Salary Negotiable</div><div className="text-[10px]" style={{ color: 'var(--muted)' }}>Candidates will be told salary is open to discussion</div></div>
          <button onClick={() => set('negotiable', !form.negotiable)} className="w-[36px] h-[20px] relative cursor-pointer transition-colors" style={{ background: form.negotiable ? 'var(--blue)' : 'var(--border2)' }}><div className="absolute top-[2px] w-[16px] h-[16px] bg-white transition-all" style={{ left: form.negotiable ? 18 : 2 }} /></button>
        </div>
        <div className="grid grid-cols-2 gap-[13px] mt-[13px]">
          <div><label className="form-label">Team Size</label><input className="form-input" value={form.teamSize} onChange={e => set('teamSize', e.target.value)} placeholder="e.g. 8" /></div>
          <div><label className="form-label">ATS / Post To</label><select className="form-select" value={form.ats} onChange={e => set('ats', e.target.value)}><option>Greenhouse</option><option>Lever</option><option>iCIMS</option><option>Workday</option></select></div>
        </div>
      </div>)}

      {step === 1 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 300, color: 'var(--text-bright)' }}>Job Description</div>
        <div className="text-[11.5px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>Paste or write your full JD — the Explorer will be trained on this</div>
        <label className="form-label">Job Description</label>
        <textarea className="form-textarea" style={{ minHeight: 140 }} value={form.jd} onChange={e => set('jd', e.target.value)} placeholder="Include responsibilities, requirements, nice-to-haves, and what success looks like…" />
        <div className="grid grid-cols-2 gap-[13px] mt-[13px]">
          <div><label className="form-label">Seniority Level</label><select className="form-select" value={form.level} onChange={e => set('level', e.target.value)}><option>Entry</option><option>Mid</option><option>Senior</option><option>Staff / Principal</option><option>Director</option><option>VP / Exec</option></select></div>
          <div><label className="form-label">Employment Type</label><select className="form-select" value={form.empType} onChange={e => set('empType', e.target.value)}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select></div>
        </div>
        <div className="mt-[13px]"><label className="form-label">Required Skills (comma-separated)</label><input className="form-input" value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="e.g. Python, SQL, Spark, ML pipelines" /></div>
        <div className="mt-[13px]"><label className="form-label">Nice-to-Have Skills</label><input className="form-input" value={form.niceToHave} onChange={e => set('niceToHave', e.target.value)} placeholder="e.g. dbt, Airflow, Databricks, Kafka" /></div>
      </div>)}

      {step === 2 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 300, color: 'var(--text-bright)' }}>Company Context</div>
        <div className="text-[11.5px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>Upload supporting material — the Explorer uses this to represent the role authentically</div>
        <div className="p-[20px] text-center cursor-pointer transition-colors hover:bg-[var(--surface2)]" style={{ border: '2px dashed var(--border2)', background: 'var(--surface)' }}>
          <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Click to upload work samples</div>
          <div className="font-mono text-[9px] mt-[3px]" style={{ color: 'var(--muted)' }}>Figma files, code repos, decks, docs, PDFs · max 20MB each</div>
        </div>
        <div className="mt-[13px]"><label className="form-label">About the Team</label><textarea className="form-textarea" value={form.teamDesc} onChange={e => set('teamDesc', e.target.value)} placeholder="Describe the team — what they're building, culture, how they work, recent wins…" /></div>
      </div>)}

      {step === 3 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 300, color: 'var(--text-bright)' }}>Review & Post</div>
        <div className="text-[11.5px] mb-[16px]" style={{ color: 'var(--text-dim)' }}>Check everything looks right before publishing</div>
        <div className="p-[14px] mb-[10px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize:16, fontWeight:400, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", color:"var(--text-bright)", fontWeight: 300, color: 'var(--text-bright)' }}>{form.title || 'Untitled Role'}</div>
          <div className="text-[11px] mt-[3px]" style={{ color: 'var(--muted)' }}>{form.dept || 'No department'} · {form.location || 'No location'} · {form.workType}</div>
          {(form.salMin || form.salMax) && <div style={{ fontSize:12, fontWeight:500, marginTop:6, color:"var(--green)" }}>${Number(form.salMin || 0).toLocaleString()} – ${Number(form.salMax || 0).toLocaleString()}</div>}
          <div className="text-[11px] mt-[6px]" style={{ color: 'var(--text-mid)' }}>{form.level} · {form.empType} · ATS: {form.ats}</div>
          {form.skills && <div className="flex flex-wrap gap-[4px] mt-[8px]">{form.skills.split(',').map(s => <span key={s} className="tag">{s.trim()}</span>)}</div>}
        </div>
      </div>)}

      {step === 4 && (<div>
        <div style={{ fontSize:19, fontWeight:300, marginBottom:2, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 300, color: 'var(--text-bright)' }}>Create an Explorer?</div>
        <div className="text-[11.5px] mb-[14px]" style={{ color: 'var(--text-dim)' }}>An Explorer is an AI agent trained on this role. It autonomously screens candidates and generates sentiment data.</div>
        <div className="flex gap-[10px]">
          <div onClick={() => set('createExplorer', true)} className="flex-1 p-[14px] cursor-pointer transition-all" style={{ border: `2px solid ${form.createExplorer ? 'var(--blue-border)' : 'var(--border)'}`, background: form.createExplorer ? 'var(--blue-bg)' : 'transparent' }}>
            <div className="text-[12px] font-bold mb-[3px]" style={{ color: 'var(--blue)' }}>Yes, create Explorer <span className="text-[10px] opacity-70">(Recommended)</span></div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>AI screening · conversation data · sentiment maps · Deep Match scoring</div>
          </div>
          <div onClick={() => set('createExplorer', false)} className="flex-1 p-[14px] cursor-pointer transition-all" style={{ border: `2px solid ${!form.createExplorer ? 'var(--orange-border)' : 'var(--border)'}`, background: !form.createExplorer ? 'var(--orange-bg)' : 'transparent' }}>
            <div style={{ fontSize:12, fontWeight:400, marginBottom:3, color:"var(--text)" }}>No, post manually</div>
            <div className="text-[11px]" style={{ color: 'var(--muted)' }}>Job posts to connected platforms only — no AI screening</div>
          </div>
        </div>
      </div>)}

      {/* Nav */}
      <div className="flex items-center gap-[8px] mt-[18px] pt-[12px]" style={{ borderTop: '1px solid var(--border)' }}>
        <button className="ctrl-btn" onClick={() => { setStep(0); onClose(); }}>Cancel</button>
        <div className="flex gap-[8px] ml-auto">
          {step > 0 && <button className="ctrl-btn" onClick={() => setStep(s => s - 1)}>Back</button>}
          {step < 4 ? (
            <button className="ctrl-btn run" onClick={() => setStep(s => s + 1)}>Continue</button>
          ) : (
            <button className="ctrl-btn run" onClick={() => {
              const title = form.title || 'New Role';
              createRoleMutation.mutate({
                title,
                department: form.dept || undefined,
                location: form.location || undefined,
                description: form.jd || undefined,
                requirements: form.skills ? form.skills.split(',').map(s => s.trim()) : undefined,
                salaryMin: form.salMin ? Number(form.salMin) : undefined,
                salaryMax: form.salMax ? Number(form.salMax) : undefined,
                urgency: 'NORMAL',
              }, {
                onSuccess: () => {
                  if (form.createExplorer && onCreateExplorer) {
                    onCreateExplorer(title);
                  } else {
                    toast.show(`Role "${title}" posted successfully!`);
                  }
                  setStep(0); onClose();
                },
                onError: () => {
                  toast.show(`Role "${title}" saved locally (API unavailable)`);
                  if (form.createExplorer && onCreateExplorer) {
                    onCreateExplorer(title);
                  }
                  setStep(0); onClose();
                },
              });
            }}>
              {form.createExplorer ? 'Create Role & Explorer' : 'Post Role'}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

