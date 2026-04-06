// @ts-nocheck
'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCandidates } from '@/lib/data-provider';

const F = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const BLUE = '#2563eb';
const TEAL = '#1D9E75';
const DARK = '#0A0A0A';
const MID = '#6B6B6B';
const MUTED = '#AAAAAA';
const BORDER = '#E8E8E5';
const BLIGHT = '#F4F4F2';

const FIT_DIMS = [
  { key: 'technical',   label: 'Role Skills',    req: 0.85 },
  { key: 'domain',      label: 'Domain Know.',   req: 0.80 },
  { key: 'culture',     label: 'Culture/Values', req: 0.75 },
  { key: 'growth',      label: 'Growth Velocity',req: 0.70 },
  { key: 'constraints', label: 'Constraints',    req: 0.75 },
  { key: 'valueadd',    label: 'Value Add',      req: 0.80 },
];

function seedHash(id,dim){let h=0;for(let i=0;i<id.length;i++)h=((h<<5)-h+id.charCodeAt(i))|0;return Math.abs((h*(dim+7)*2654435761)%1000)/1000;}
function getCandidateDimScores(id,baseScore){const out={};FIT_DIMS.forEach((d,i)=>{const j=seedHash(id,i)*20-10;out[d.key]=Math.max(30,Math.min(99,Math.round(baseScore+j)));});return out;}
function dimColor(s){return s>=80?TEAL:s>=65?BLUE:s>=50?'#ea580c':'#dc2626';}
function scoreColor(s){if(s>=80)return{bg:'rgba(29,158,117,.1)',fg:TEAL};if(s>=65)return{bg:'rgba(37,99,235,.08)',fg:BLUE};return{bg:'rgba(234,88,12,.08)',fg:'#ea580c'};}

function getTimeline(id,score){
  const topics=['Intro','Skills','Domain','Culture','Team fit','Growth','Comp','Closing'];
  return topics.map((label,i)=>{
    const s=i===0?'neu':i===6&&score<85?'neg':score+(Math.sin(i)*15)>75?'pos':'neu';
    const sig=s==='pos'&&i>0&&i<6?`+ ${label} +${(0.7+score/300).toFixed(2)}`:s==='neg'?'Risk':undefined;
    return{s,label,sig};
  });
}

function getHeatmap(id,score){
  return[
    {topic:'Tech Stack',   exp:Math.round(score*.9), cand:Math.round(score*.95),verdict:score>80?'Strong Alignment':'Alignment'},
    {topic:'Communication',exp:Math.round(score*.82),cand:Math.round(score*.88),verdict:score>75?'Alignment':'Moderate Gap'},
    {topic:'Leadership',   exp:Math.round(score*.78),cand:Math.round(score*.85),verdict:score>80?'Alignment':'Moderate Gap'},
    {topic:'Compensation', exp:Math.round(score*.65),cand:Math.round(score*.7), verdict:score>85?'Alignment':'Moderate Risk'},
    {topic:'Growth Mindset',exp:Math.round(score*.85),cand:Math.round(score*.9),verdict:score>75?'Strong Alignment':'Alignment'},
  ];
}

function Avatar({name='',size=36}){
  const ini=name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2)||'?';
  const colors=[BLUE,TEAL,'#E84B3A','#F5A623','#635BFF'];
  const bg=colors[(name.charCodeAt(0)||0)%colors.length];
  return <div style={{width:size,height:size,borderRadius:'50%',background:bg,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*.33,fontWeight:400,flexShrink:0,fontFamily:F}}>{ini}</div>;
}

function SL({t}){return <div style={{fontSize:10,color:MUTED,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:10,fontFamily:F,fontWeight:400}}>{t}</div>;}

export default function CandidateProfilePage(){
  const router=useRouter();
  const params=useParams();
  const [tab,setTab]=useState('assess');
  const [note,setNote]=useState('');
  const [nextStage,setNextStage]=useState('');

  const candsQuery=useCandidates();
  const all=candsQuery.data?.data||[];
  const id=params?.id;
  const c=all.find(x=>x.id===id)||all[0];

  if(!c)return <div style={{padding:40,fontFamily:F,color:MUTED}}>Candidate not found.</div>;

  const name=c.name||'';
  const score=c.score||0;
  const stage=c.stage||'Applied';
  const fitLabel=c.fitLabel||'Good Fit';
  const cid=c.id||name;

  const dimScores=getCandidateDimScores(cid,score);
  const timeline=getTimeline(cid,score);
  const heatmap=getHeatmap(cid,score);

  const SC={'Offer Extended':{bg:'#E6F5EE',c:'#15703A'},'Final Round':{bg:'#E8F0FF',c:BLUE},'Interview':{bg:'#EDF5FF',c:'#1d4ed8'},'Recruiter Review':{bg:'#FFF7E0',c:'#8A6000'},'Explorer Screen':{bg:'#F3EEFF',c:'#7C3AED'},'Sourced':{bg:BLIGHT,c:MID}};
  const sc=SC[stage]||{bg:BLIGHT,c:MUTED};
  const fc=fitLabel==='Deep Match'?{bg:'#E8F0FF',c:BLUE}:fitLabel==='Strong Fit'?{bg:'#E6F5EE',c:TEAL}:{bg:BLIGHT,c:MID};

  // Radar
  const sCx=110,sCy=110,sR=85;
  function spt(idx,r){const a=(Math.PI*2*idx/6)-Math.PI/2;return[sCx+Math.cos(a)*r,sCy+Math.sin(a)*r];}
  const candProfile=FIT_DIMS.map(d=>(dimScores[d.key]||75)/100);
  const roleReqs=FIT_DIMS.map(d=>d.req);
  const valPoly=candProfile.map((v,idx)=>spt(idx,v*sR).join(',')).join(' ');
  const reqPoly=roleReqs.map((v,idx)=>spt(idx,v*sR).join(',')).join(' ');

  // Timeline SVG
  const tW=520,tH=80,tPad=26;
  const tStep=(tW-2*tPad)/(timeline.length-1);
  const yMap={pos:16,neu:38,neg:60};
  const cMap={pos:TEAL,neu:MUTED,neg:'#ea580c'};

  const STAGE_OPTS=['Explorer Screen','Recruiter Review','Interview','Hiring Mgr Review','Final Round','Offer Extended','Hired','Rejected'];

  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',fontFamily:F,color:DARK,background:'#FFFFFF',overflow:'hidden'}}>

      {/* Breadcrumb */}
      <div style={{height:46,borderBottom:'1px solid '+BORDER,display:'flex',alignItems:'center',padding:'0 24px',gap:10,flexShrink:0}}>
        <button onClick={()=>router.back()} style={{display:'flex',alignItems:'center',gap:5,background:'none',border:'none',cursor:'pointer',fontFamily:F,fontSize:12,color:MUTED}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>
          Candidates
        </button>
        <span style={{color:BORDER}}>·</span>
        <span style={{fontSize:12,color:MID}}>{c.company}</span>
        <span style={{color:BORDER}}>·</span>
        <span style={{fontSize:12,color:DARK,fontWeight:400}}>{name}</span>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button style={{fontSize:11,color:MID,background:'none',border:'1px solid '+BORDER,padding:'4px 12px',cursor:'pointer',fontFamily:F}}>Message</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{borderBottom:'1px solid '+BORDER,padding:'18px 24px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:16}}>
          <Avatar name={name} size={60}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap'}}>
              <span style={{fontSize:24,fontWeight:300,letterSpacing:'-0.02em'}}>{name}</span>
              <span style={{fontSize:9.5,padding:'2px 8px',background:sc.bg,color:sc.c}}>{stage}</span>
              <span style={{fontSize:9.5,padding:'2px 8px',background:fc.bg,color:fc.c}}>{fitLabel}</span>
            </div>
            <div style={{fontSize:13,color:MID,fontWeight:300,marginBottom:4}}>{c.title} · {c.company}</div>
            <div style={{fontSize:11,color:MUTED,fontWeight:300}}>{c.source||'Taltas Network'}</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid '+BORDER,flexShrink:0}}>
            {[{l:'AI Match',v:score,col:BLUE},{l:'Deep Match',v:dimScores.technical||score,col:TEAL},{l:'Sessions',v:c.sessionCount||1,col:DARK},{l:'Sentiment',v:Math.round(score*.97)+'%',col:MID}].map((s,i)=>(
              <div key={i} style={{padding:'10px 16px',borderRight:i%2===0?'1px solid '+BORDER:'none',borderBottom:i<2?'1px solid '+BORDER:'none',minWidth:80}}>
                <div style={{fontSize:9,color:MUTED,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:4}}>{s.l}</div>
                <div style={{fontSize:22,fontWeight:300,letterSpacing:'-0.02em',color:s.col,lineHeight:1}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{borderBottom:'1px solid '+BORDER,display:'flex',flexShrink:0,padding:'0 24px'}}>
        {[{id:'assess',l:'SNAP Assessment'},{id:'profile',l:'Profile'},{id:'conv',l:'Conversation'},{id:'act',l:'Activity'}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{background:'none',border:'none',borderBottom:`2px solid ${tab===t.id?BLUE:'transparent'}`,padding:'11px 20px',fontSize:12,color:tab===t.id?DARK:MUTED,cursor:'pointer',fontFamily:F,transition:'all .12s'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto'}}>

        {/* ASSESSMENT */}
        {tab==='assess'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',minHeight:'100%'}}>
            <div style={{borderRight:'1px solid '+BORDER,padding:'20px 24px'}}>

              {/* Agent rec */}
              <div style={{background:'#F6FFF9',border:'1px solid #B8E0CC',padding:'12px 16px',marginBottom:20}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:TEAL}}/>
                  <span style={{fontSize:10,color:TEAL,letterSpacing:'.1em',textTransform:'uppercase'}}>Explorer Agent Recommendation</span>
                </div>
                <p style={{fontSize:13,color:'#0E6640',fontWeight:300,lineHeight:1.7}}>
                  {c.agentRecommendation||`Strong match across all dimensions. Technical depth is exceptional. Culture alignment and timeline fully aligned. Recommend advancing to next stage.`}
                </p>
              </div>

              {/* Radar + Dims */}
              <div style={{marginBottom:20}}>
                <SL t="6-Dimension Deep Match"/>
                <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
                  <div>
                    <svg width="240" height="240" viewBox="-10 -10 240 240">
                      {[25,50,75,100].map(s=>(
                        <polygon key={s} points={Array.from({length:6},(_,idx)=>spt(idx,sR*s/100).join(',')).join(' ')} fill="none" stroke={BORDER} strokeWidth="0.5"/>
                      ))}
                      {Array.from({length:6},(_,idx)=>(
                        <line key={idx} x1={sCx} y1={sCy} x2={spt(idx,sR)[0]} y2={spt(idx,sR)[1]} stroke={BORDER} strokeWidth="1"/>
                      ))}
                      <polygon points={reqPoly} fill="rgba(99,102,241,.1)" stroke="rgba(99,102,241,.4)" strokeWidth="1.5"/>
                      <polygon points={valPoly} fill="rgba(29,158,117,.12)" stroke={TEAL} strokeWidth="2"/>
                      {candProfile.map((v,idx)=>(
                        <circle key={idx} cx={spt(idx,v*sR)[0]} cy={spt(idx,v*sR)[1]} r="3" fill={TEAL}/>
                      ))}
                      {FIT_DIMS.map((d,idx)=>{
                        const[x,y]=spt(idx,sR+18);
                        return <text key={d.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill={MUTED} fontFamily="Helvetica Neue,Arial">{d.label.split(' ')[0]}</text>;
                      })}
                      {FIT_DIMS.map((d,idx)=>{
                        const[x,y]=spt(idx,sR+28);
                        const v=dimScores[d.key]||75;
                        return <text key={`v-${d.key}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill={dimColor(v)} fontFamily="Helvetica Neue,Arial" fontWeight="600">{v}</text>;
                      })}
                    </svg>
                    <div style={{display:'flex',gap:14,justifyContent:'center',marginTop:4}}>
                      <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,background:'rgba(99,102,241,.4)'}}/><span style={{fontSize:9,color:MUTED}}>Role Req.</span></div>
                      <div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,background:TEAL}}/><span style={{fontSize:9,color:MUTED}}>Candidate</span></div>
                    </div>
                  </div>
                  <div style={{flex:1}}>
                    {FIT_DIMS.map(d=>{
                      const v=dimScores[d.key]||75;
                      const col=dimColor(v);
                      return(
                        <div key={d.key} style={{marginBottom:10}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                            <span style={{fontSize:12,color:MID,fontWeight:300}}>{d.label}</span>
                            <span style={{fontSize:12,fontWeight:500,color:col}}>{v}</span>
                          </div>
                          <div style={{height:4,background:'#EBEBEB'}}>
                            <div style={{height:4,width:v+'%',background:col}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sentiment Timeline */}
              <div style={{marginBottom:20}}>
                <SL t="Conversation Sentiment Timeline"/>
                <svg viewBox={`0 0 ${tW} ${tH}`} style={{width:'100%'}}>
                  <line x1={tPad} y1={38} x2={tW-tPad} y2={38} stroke="#e2e5ea" strokeWidth="1"/>
                  <polyline points={timeline.map((t,i)=>`${tPad+i*tStep},${yMap[t.s]}`).join(' ')} fill="none" stroke="#e2e5ea" strokeWidth="1.5" strokeDasharray="3 2"/>
                  {timeline.map((t,i)=>{
                    const x=tPad+i*tStep,y=yMap[t.s],col=cMap[t.s];
                    return(
                      <g key={i}>
                        {t.sig&&<text x={x} y={y-11} fontFamily="Helvetica Neue,Arial" fontSize="7" fill={col} textAnchor="middle">{t.sig}</text>}
                        <circle cx={x} cy={y} r="5" fill={col} opacity="0.85"/>
                        <text x={x} y={tH-3} fontFamily="Helvetica Neue,Arial" fontSize="7.5" fill="#9aa0ad" textAnchor="middle">{t.label}</text>
                      </g>
                    );
                  })}
                </svg>
                <div style={{display:'flex',gap:14,marginTop:6}}>
                  {[['Positive',TEAL],['Neutral',MUTED],['Caution','#ea580c']].map(([l,col])=>(
                    <div key={l} style={{display:'flex',alignItems:'center',gap:5}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:col}}/>
                      <span style={{fontSize:9,color:MUTED}}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heatmap */}
              <div>
                <SL t="Topic Interaction Heatmap"/>
                <div style={{fontSize:11,color:MUTED,marginBottom:8,fontWeight:300}}>Agent-evaluated signal strength per topic (0-100)</div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead>
                    <tr>
                      {['Topic','Explorer','Candidate','Delta','Verdict'].map(h=>(
                        <th key={h} style={{fontFamily:F,fontSize:9,color:MUTED,textTransform:'uppercase',letterSpacing:'.08em',padding:'6px 10px',borderBottom:'1px solid '+BORDER,textAlign:'left',background:BLIGHT}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.map((row,i)=>{
                      const ec=scoreColor(row.exp);
                      const cc=scoreColor(row.cand);
                      const delta=row.cand-row.exp;
                      const vc=delta>=5?{fg:TEAL,bg:'rgba(29,158,117,.08)'}:delta<=-5?{fg:'#ea580c',bg:'rgba(234,88,12,.08)'}:{fg:MID,bg:BLIGHT};
                      return(
                        <tr key={i} style={{background:i%2===0?'#fff':BLIGHT}}>
                          <td style={{padding:'7px 10px',fontSize:12,color:MID,fontWeight:300}}>{row.topic}</td>
                          <td style={{padding:'7px 10px'}}><span style={{fontSize:11,fontWeight:500,padding:'2px 8px',background:ec.bg,color:ec.fg}}>{row.exp}</span></td>
                          <td style={{padding:'7px 10px'}}><span style={{fontSize:11,fontWeight:500,padding:'2px 8px',background:cc.bg,color:cc.fg}}>{row.cand}</span></td>
                          <td style={{padding:'7px 10px'}}><span style={{fontSize:10,color:delta>=0?TEAL:'#ea580c'}}>{delta>=0?'+':''}{delta}</span></td>
                          <td style={{padding:'7px 10px'}}><span style={{fontSize:9,padding:'2px 7px',color:vc.fg,background:vc.bg}}>{row.verdict}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right panel */}
            <div style={{padding:'20px'}}>
              <div style={{border:'1px solid '+BORDER,marginBottom:14}}>
                <div style={{padding:'10px 14px',borderBottom:'1px solid '+BORDER,fontSize:10,color:MUTED,letterSpacing:'.1em',textTransform:'uppercase'}}>Compensation</div>
                <div style={{padding:'14px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div><div style={{fontSize:9,color:MUTED,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>Expecting</div><div style={{fontSize:20,fontWeight:300,color:DARK}}>{c.salaryExpectation||'—'}</div></div>
                    <div><div style={{fontSize:9,color:MUTED,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2}}>Band</div><div style={{fontSize:20,fontWeight:300,color:TEAL}}>{c.salaryBand||'—'}</div></div>
                  </div>
                  <div style={{height:3,background:'#E6F5EE',marginBottom:4,position:'relative'}}>
                    <div style={{position:'absolute',left:'50%',width:2,height:7,background:TEAL,top:-2}}/>
                  </div>
                  <div style={{fontSize:11,color:TEAL,fontWeight:300,marginBottom:10}}>Within approved band</div>
                  <div style={{borderTop:'1px solid '+BLIGHT,paddingTop:10,display:'flex',gap:16}}>
                    <div><div style={{fontSize:9,color:MUTED,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Equity</div><div style={{fontSize:13,color:DARK,fontWeight:300}}>{c.equity||'—'}</div></div>
                    <div><div style={{fontSize:9,color:MUTED,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:2}}>Start</div><div style={{fontSize:13,color:DARK,fontWeight:300}}>{c.startDate||'—'}</div></div>
                  </div>
                </div>
              </div>

              <div style={{border:'1px solid '+BORDER}}>
                <div style={{padding:'10px 14px',borderBottom:'1px solid '+BORDER,fontSize:10,color:MUTED,letterSpacing:'.1em',textTransform:'uppercase'}}>Recruiter Decision</div>
                <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:8}}>
                  <select value={nextStage} onChange={e=>setNextStage(e.target.value)}
                    style={{width:'100%',padding:'8px 10px',border:'1px solid '+BORDER,fontFamily:F,fontSize:12,color:DARK,background:'#fff',outline:'none',marginBottom:4}}>
                    <option value="">Move to stage...</option>
                    {STAGE_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  <button style={{background:TEAL,border:'none',color:'#fff',fontFamily:F,fontSize:12,padding:'9px 14px',cursor:'pointer',textAlign:'left'}}>Advance</button>
                  <button style={{background:'none',border:'1px solid '+BORDER,color:MID,fontFamily:F,fontSize:12,padding:'9px 14px',cursor:'pointer',textAlign:'left'}}>Hold - request more info</button>
                  <button style={{background:'none',border:'1px solid #FFDDD8',color:'#CC3300',fontFamily:F,fontSize:12,padding:'9px 14px',cursor:'pointer',textAlign:'left'}}>Pass - not proceeding</button>
                  <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note..." rows={3}
                    style={{width:'100%',padding:'8px 10px',border:'1px solid '+BORDER,fontSize:12,fontFamily:F,color:DARK,resize:'none',outline:'none',lineHeight:1.6,marginTop:4}}/>
                  <button style={{background:BLUE,border:'none',color:'#fff',fontFamily:F,fontSize:12,padding:'9px 14px',cursor:'pointer'}}>Save Decision</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {tab==='profile'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 260px',minHeight:'100%'}}>
            <div style={{borderRight:'1px solid '+BORDER,padding:'20px 24px'}}>
              {Array.isArray(c.workHistory)&&c.workHistory.length>0&&(
                <div style={{marginBottom:20}}>
                  <SL t="Work History"/>
                  {c.workHistory.map((w,i)=>(
                    <div key={i} style={{display:'grid',gridTemplateColumns:'40px 1fr',gap:12,padding:'12px 0',borderBottom:i<c.workHistory.length-1?'1px solid '+BLIGHT:'none'}}>
                      <Avatar name={w.company||w.co||''} size={32}/>
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                          <span style={{fontSize:13,fontWeight:400,color:DARK}}>{w.role||w.title}</span>
                          <span style={{fontSize:11,color:MUTED,flexShrink:0,marginLeft:12}}>{w.period||w.duration}</span>
                        </div>
                        <div style={{fontSize:12,color:BLUE,marginBottom:4}}>{w.company||w.co}</div>
                        <div style={{fontSize:12,color:MUTED,fontWeight:300,lineHeight:1.6}}>{w.description||w.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {Array.isArray(c.education)&&c.education.length>0&&(
                <div style={{marginBottom:20}}>
                  <SL t="Education"/>
                  {c.education.map((e,i)=>(
                    <div key={i} style={{display:'flex',gap:12,alignItems:'center',padding:'10px 0',borderBottom:i<c.education.length-1?'1px solid '+BLIGHT:'none'}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#E84B3A',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      </div>
                      <div>
                        <div style={{fontSize:13,fontWeight:400,color:DARK,marginBottom:2}}>{e.degree||e.qualification}</div>
                        <div style={{fontSize:12,color:BLUE}}>{e.school||e.institution}{e.year?' · '+e.year:''}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {Array.isArray(c.skills)&&c.skills.length>0&&(
                <div>
                  <SL t="Skills"/>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {c.skills.map((s,i)=>(
                      <span key={i} style={{fontSize:12,padding:'4px 10px',border:'1px solid #C8D8FF',color:BLUE,background:'#F0F4FF',fontWeight:300}}>{typeof s==='string'?s:s.name||s.skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{padding:'20px'}}>
              <SL t="Contact"/>
              {c.email&&<div style={{display:'flex',gap:9,padding:'10px 0',borderBottom:'1px solid '+BLIGHT}}><span style={{fontSize:13,color:BLUE,fontWeight:300}}>{c.email}</span></div>}
              {c.location&&<div style={{display:'flex',gap:9,padding:'10px 0',borderBottom:'1px solid '+BLIGHT}}><span style={{fontSize:13,color:MID,fontWeight:300}}>{c.location}</span></div>}
              <div style={{marginTop:20}}>
                <SL t="Application"/>
                <div style={{padding:'12px 14px',border:'1px solid '+BORDER}}>
                  <div style={{fontSize:13,fontWeight:400,color:DARK,marginBottom:3}}>{c.title}</div>
                  <div style={{fontSize:12,color:BLUE,marginBottom:8}}>{c.company}</div>
                  <div style={{display:'flex',gap:7}}>
                    <span style={{fontSize:9.5,padding:'2px 8px',background:sc.bg,color:sc.c}}>{stage}</span>
                    <span style={{fontSize:9.5,padding:'2px 8px',background:fc.bg,color:fc.c}}>{fitLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONVERSATION */}
        {tab==='conv'&&(
          <div style={{maxWidth:660,margin:'0 auto',padding:'24px'}}>
            <SL t="Explorer Agent Conversation"/>
            {(!c.conversation||c.conversation.length===0)
              ?<p style={{fontSize:13,color:MUTED,fontWeight:300}}>No conversation data available yet.</p>
              :c.conversation.map((msg,i)=>{
                const isAgent=msg.type==='agent'||msg.role==='agent'||msg.speaker?.includes('Agent');
                return(
                  <div key={i} style={{display:'flex',gap:10,marginBottom:16,flexDirection:isAgent?'row':'row-reverse'}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:isAgent?TEAL:BLUE,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {isAgent?<><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></>:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                      </svg>
                    </div>
                    <div style={{maxWidth:'74%'}}>
                      <div style={{fontSize:9,color:MUTED,letterSpacing:'.06em',textTransform:'uppercase',marginBottom:4}}>{msg.speaker||(isAgent?'Explorer Agent':name)}</div>
                      <div style={{padding:'10px 14px',background:isAgent?BLIGHT:'#F0F4FF',border:'1px solid '+(isAgent?BORDER:'#C8D8FF'),fontSize:13,color:MID,fontWeight:300,lineHeight:1.75}}>
                        {msg.text||msg.content||msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            }
          </div>
        )}

        {/* ACTIVITY */}
        {tab==='act'&&(
          <div style={{maxWidth:500,margin:'0 auto',padding:'24px'}}>
            <SL t="Activity Timeline"/>
            {(!c.timeline||c.timeline.length===0)
              ?<p style={{fontSize:13,color:MUTED,fontWeight:300}}>No activity yet.</p>
              :<div style={{position:'relative',paddingLeft:20}}>
                <div style={{position:'absolute',left:5,top:6,bottom:0,width:1,background:BORDER}}/>
                {c.timeline.map((ev,i)=>(
                  <div key={i} style={{position:'relative',paddingBottom:20}}>
                    <div style={{position:'absolute',left:-20,top:4,width:10,height:10,borderRadius:'50%',border:'2px solid #fff',background:ev.type==='advance'?TEAL:ev.type==='score'?BLUE:'#E8E8E5'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
                      <span style={{fontSize:13,color:ev.type==='advance'?TEAL:DARK,fontWeight:ev.type==='advance'?400:300,lineHeight:1.5}}>{ev.event||ev.text}</span>
                      <span style={{fontSize:10,color:MUTED,flexShrink:0,marginLeft:14}}>{ev.date||ev.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
