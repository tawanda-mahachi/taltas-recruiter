// Mock data matching the 9,179-line HTML mockup for rich UI display

export interface MockCandidate {
  id: string; name: string; title: string; company: string; stage: string;
  fitLabel: string; score: number; source: string; tags: string[];
  avatar: string; sentiment: number; sentimentTrend: string; lastActivity: string;
  deepMatch?: { technical: number; culture: number; leadership: number; growth: number; communication: number; behavioural: number };
}

export const MOCK_CANDIDATES: MockCandidate[] = [
  { id:'sara-kim', name:'Sara Kim', title:'Senior Product Manager', company:'Figma', stage:'Offer Extended', fitLabel:'Deep Match', score:96, source:'Taltas Network', tags:['B2B SaaS','PLG','0→1'], avatar:'https://randomuser.me/api/portraits/women/44.jpg', sentiment:92, sentimentTrend:'+4', lastActivity:'2h ago', deepMatch:{technical:94,culture:98,leadership:96,growth:92,communication:97,behavioural:95} },
  { id:'marcus-p', name:'Marcus Peterson', title:'Engineering Manager', company:'Stripe', stage:'Hiring Mgr Review', fitLabel:'Strong Fit', score:88, source:'LinkedIn', tags:['Distributed','Fintech','Scaling'], avatar:'https://randomuser.me/api/portraits/men/32.jpg', sentiment:78, sentimentTrend:'+2', lastActivity:'4h ago', deepMatch:{technical:90,culture:85,leadership:92,growth:84,communication:86,behavioural:88} },
  { id:'aiko-j', name:'Aiko Jansson', title:'Staff ML Engineer', company:'OpenAI', stage:'Recruiter Review', fitLabel:'Deep Match', score:94, source:'Taltas Network', tags:['LLMs','RLHF','Research'], avatar:'https://randomuser.me/api/portraits/women/68.jpg', sentiment:88, sentimentTrend:'+6', lastActivity:'1h ago', deepMatch:{technical:98,culture:90,leadership:88,growth:96,communication:92,behavioural:94} },
  { id:'reza-o', name:'Reza Okafor', title:'Head of Growth', company:'Notion', stage:'Deep Dive', fitLabel:'Strong Fit', score:85, source:'Greenhouse', tags:['PLG','B2B','Retention'], avatar:'https://randomuser.me/api/portraits/men/55.jpg', sentiment:74, sentimentTrend:'-1', lastActivity:'6h ago', deepMatch:{technical:78,culture:88,leadership:90,growth:86,communication:82,behavioural:80} },
  { id:'tara-l', name:'Tara Lindström', title:'UX Research Lead', company:'Airbnb', stage:'Sourced', fitLabel:'Potential Fit', score:72, source:'Indeed', tags:['Mixed Methods','Design Systems','B2C'], avatar:'https://randomuser.me/api/portraits/women/12.jpg', sentiment:65, sentimentTrend:'0', lastActivity:'1d ago', deepMatch:{technical:70,culture:74,leadership:68,growth:76,communication:72,behavioural:70} },
  { id:'jae-w', name:'Jae Woo', title:'Product Designer', company:'Spotify', stage:'Deep Dive', fitLabel:'Strong Fit', score:83, source:'Dribbble', tags:['Systems Design','Audio UX','Mobile'], avatar:'https://randomuser.me/api/portraits/men/41.jpg', sentiment:81, sentimentTrend:'+3', lastActivity:'3h ago', deepMatch:{technical:82,culture:86,leadership:78,growth:84,communication:88,behavioural:80} },
  { id:'lin-n', name:'Lin Nakamura', title:'Data Scientist', company:'Databricks', stage:'Recruiter Review', fitLabel:'Strong Fit', score:80, source:'LinkedIn', tags:['ML Ops','Analytics','Python'], avatar:'https://randomuser.me/api/portraits/women/29.jpg', sentiment:76, sentimentTrend:'+1', lastActivity:'5h ago', deepMatch:{technical:84,culture:78,leadership:74,growth:82,communication:76,behavioural:80} },
  { id:'wei-chen', name:'Wei Chen', title:'Backend Engineer', company:'Shopify', stage:'Sourced', fitLabel:'Potential Fit', score:70, source:'GitHub', tags:['Go','Microservices','Commerce'], avatar:'https://randomuser.me/api/portraits/men/77.jpg', sentiment:68, sentimentTrend:'0', lastActivity:'2d ago', deepMatch:{technical:76,culture:68,leadership:62,growth:72,communication:66,behavioural:70} },
  { id:'priya-s', name:'Priya Sharma', title:'Chief of Staff', company:'Scale AI', stage:'Offer Extended', fitLabel:'Strong Fit', score:87, source:'Referral', tags:['Ops','Strategy','AI'], avatar:'https://randomuser.me/api/portraits/women/55.jpg', sentiment:82, sentimentTrend:'+2', lastActivity:'30m ago', deepMatch:{technical:80,culture:90,leadership:94,growth:86,communication:88,behavioural:86} },
  { id:'elena-v', name:'Elena Vasquez', title:'Staff Product Manager', company:'Figma', stage:'Interview', fitLabel:'Deep Match', score:91, source:'Taltas Network', tags:['B2B','0→1','Product Ops'], avatar:'https://randomuser.me/api/portraits/women/33.jpg', sentiment:88, sentimentTrend:'+5', lastActivity:'1h ago', deepMatch:{technical:88,culture:94,leadership:92,growth:90,communication:96,behavioural:90} },
  { id:'dmitri-k', name:'Dmitri Kovacs', title:'Principal Software Engineer', company:'Cloudflare', stage:'Recruiter Review', fitLabel:'Good Fit', score:83, source:'LinkedIn', tags:['Edge Computing','Rust','Networking'], avatar:'https://randomuser.me/api/portraits/men/21.jpg', sentiment:74, sentimentTrend:'+1', lastActivity:'8h ago', deepMatch:{technical:92,culture:76,leadership:78,growth:80,communication:74,behavioural:82} },
  { id:'amara-o', name:'Amara Osei', title:'ML Research Engineer', company:'Google DeepMind', stage:'Final Round', fitLabel:'Deep Match', score:96, source:'Taltas Network', tags:['Reinforcement Learning','Python','Research'], avatar:'https://randomuser.me/api/portraits/women/61.jpg', sentiment:93, sentimentTrend:'+8', lastActivity:'45m ago', deepMatch:{technical:98,culture:92,leadership:90,growth:96,communication:94,behavioural:96} },
  { id:'soren-b', name:'Soren Brandt', title:'Engineering Manager', company:'Linear', stage:'Hiring Mgr Review', fitLabel:'Good Fit', score:78, source:'Referral', tags:['Developer Tools','Team Building','TypeScript'], avatar:'https://randomuser.me/api/portraits/men/47.jpg', sentiment:72, sentimentTrend:'+1', lastActivity:'12h ago', deepMatch:{technical:80,culture:78,leadership:82,growth:74,communication:76,behavioural:78} },
  { id:'maria-g', name:'Maria Gonzalez', title:'Senior DevOps Engineer', company:'Datadog', stage:'Explorer Screen', fitLabel:'Good Fit', score:79, source:'LinkedIn', tags:['K8s','Terraform','Observability'], avatar:'https://randomuser.me/api/portraits/women/22.jpg', sentiment:70, sentimentTrend:'0', lastActivity:'3h ago', deepMatch:{technical:84,culture:76,leadership:72,growth:78,communication:74,behavioural:80} },
  { id:'alex-t', name:'Alex Torres', title:'Frontend Architect', company:'Vercel', stage:'Interview', fitLabel:'Strong Fit', score:86, source:'GitHub', tags:['React','Next.js','Performance'], avatar:'https://randomuser.me/api/portraits/men/36.jpg', sentiment:84, sentimentTrend:'+3', lastActivity:'2h ago', deepMatch:{technical:90,culture:84,leadership:80,growth:86,communication:82,behavioural:88} },
  { id:'nina-r', name:'Nina Rossi', title:'VP of Engineering', company:'Plaid', stage:'Final Round', fitLabel:'Deep Match', score:93, source:'Referral', tags:['Fintech','Leadership','Scale'], avatar:'https://randomuser.me/api/portraits/women/48.jpg', sentiment:91, sentimentTrend:'+6', lastActivity:'1h ago', deepMatch:{technical:90,culture:94,leadership:98,growth:92,communication:94,behavioural:92} },
  { id:'kenji-m', name:'Kenji Murakami', title:'Staff SRE', company:'Netflix', stage:'Explorer Screen', fitLabel:'Good Fit', score:81, source:'Taltas Network', tags:['Chaos Eng','Java','Distributed'], avatar:'https://randomuser.me/api/portraits/men/62.jpg', sentiment:77, sentimentTrend:'+2', lastActivity:'5h ago', deepMatch:{technical:86,culture:78,leadership:76,growth:80,communication:78,behavioural:82} },
  { id:'chloe-d', name:'Chloe Dubois', title:'Product Analyst', company:'Stripe', stage:'Recruiter Review', fitLabel:'Alignment', score:76, source:'Indeed', tags:['SQL','Analytics','Fintech'], avatar:'https://randomuser.me/api/portraits/women/15.jpg', sentiment:69, sentimentTrend:'0', lastActivity:'1d ago', deepMatch:{technical:74,culture:78,leadership:68,growth:80,communication:76,behavioural:74} },
  { id:'omar-h', name:'Omar Hassan', title:'Security Engineer', company:'CrowdStrike', stage:'Deep Dive', fitLabel:'Good Fit', score:82, source:'LinkedIn', tags:['AppSec','Zero Trust','Cloud'], avatar:'https://randomuser.me/api/portraits/men/52.jpg', sentiment:75, sentimentTrend:'+1', lastActivity:'7h ago', deepMatch:{technical:88,culture:76,leadership:74,growth:82,communication:78,behavioural:80} },
  { id:'yuki-t', name:'Yuki Tanaka', title:'ML Platform Engineer', company:'Uber', stage:'Interview', fitLabel:'Strong Fit', score:85, source:'Greenhouse', tags:['MLOps','Ray','Python'], avatar:'https://randomuser.me/api/portraits/women/71.jpg', sentiment:80, sentimentTrend:'+3', lastActivity:'4h ago', deepMatch:{technical:88,culture:82,leadership:80,growth:86,communication:84,behavioural:82} },
];

export interface MockRole { id:string; title:string; department:string; location:string; salary:string; urgency:'HOT'|'WARM'|'NORMAL'; atsSource:string; candidateCount:number }
export const MOCK_ROLES: MockRole[] = [
  { id:'role-staff-ml', title:'Staff ML Engineer', department:'Engineering', location:'Remote', salary:'$220–280K', urgency:'HOT', atsSource:'Greenhouse', candidateCount:47 },
  { id:'role-principal-eng', title:'Principal Engineer, Platform', department:'Platform', location:'SF/Remote', salary:'$260–320K', urgency:'HOT', atsSource:'Greenhouse', candidateCount:31 },
  { id:'role-devrel-eng', title:'DevRel Engineer', department:'Developer Relations', location:'Remote', salary:'$160–200K', urgency:'WARM', atsSource:'Lever', candidateCount:19 },
  { id:'role-staff-ai', title:'Staff Engineer, AI Systems', department:'AI', location:'NYC/Remote', salary:'$240–300K', urgency:'WARM', atsSource:'Lever', candidateCount:28 },
  { id:'role-senior-data', title:'Senior Data Engineer', department:'Data', location:'Remote', salary:'$190–240K', urgency:'NORMAL', atsSource:'Workday', candidateCount:14 },
  { id:'role-founding-eng', title:'Founding Engineer, Product', department:'Product Eng', location:'SF', salary:'Equity-heavy', urgency:'NORMAL', atsSource:'Bullhorn', candidateCount:9 },
];

export interface MockIntegration { name:string; category:string; icon:string; iconBg:string; connected:boolean; needsAttention:boolean; records:number; lastSync:string }
export const MOCK_INTEGRATIONS: MockIntegration[] = [
  { name:'Greenhouse', category:'ATS · Core', icon:'seedling', iconBg:'#f0fdf4', connected:true, needsAttention:false, records:1204, lastSync:'2m ago' },
  { name:'Lever', category:'ATS · Core', icon:'flashlight', iconBg:'#eff6ff', connected:true, needsAttention:false, records:873, lastSync:'2m ago' },
  { name:'LinkedIn Recruiter', category:'Sourcing', icon:'briefcase', iconBg:'#eff6ff', connected:true, needsAttention:false, records:2841, lastSync:'5m ago' },
  { name:'Indeed', category:'Job Board', icon:'target', iconBg:'#f5f3ff', connected:true, needsAttention:false, records:612, lastSync:'15m ago' },
  { name:'Workday', category:'HRIS', icon:'settings', iconBg:'#fff7ed', connected:true, needsAttention:false, records:445, lastSync:'8m ago' },
  { name:'BambooHR', category:'HRIS', icon:'leaf', iconBg:'#f0fdf4', connected:true, needsAttention:false, records:218, lastSync:'12m ago' },
  { name:'Bullhorn', category:'CRM', icon:'bull', iconBg:'#fffbeb', connected:true, needsAttention:false, records:340, lastSync:'6m ago' },
  { name:'Rippling', category:'HRIS', icon:'waves', iconBg:'#eff6ff', connected:true, needsAttention:false, records:189, lastSync:'20m ago' },
  { name:'iCIMS', category:'ATS', icon:'clipboard', iconBg:'#f5f3ff', connected:false, needsAttention:true, records:0, lastSync:'Token expired' },
  { name:'Google Calendar', category:'Scheduling', icon:'calendar', iconBg:'#eff6ff', connected:true, needsAttention:false, records:156, lastSync:'1m ago' },
  { name:'Slack', category:'Notifications', icon:'slack', iconBg:'#f5f3ff', connected:true, needsAttention:false, records:0, lastSync:'30s ago' },
  { name:'Ashby', category:'ATS', icon:'diamond', iconBg:'#eff6ff', connected:false, needsAttention:true, records:0, lastSync:'Not configured' },
];

export interface MockExplorer {
  id:string; name:string; mode:'AUTO'|'ASSIST'|'DRAFT'; role:string; ats:string;
  icon:string; iconBg:string; conversations:number; a2aSessions:number; interviewsSet:number; blobVariant:number;
  interactions: Array<{ name:string; avatar:string; via:string; sentiment:string; sentimentColor:string }>;
}
export const MOCK_EXPLORERS: MockExplorer[] = [
  { id:'jbot0', name:'StaffML-Agent', mode:'AUTO', role:'Staff ML Engineer', ats:'Greenhouse', icon:'bot', iconBg:'var(--green-bg)', conversations:47, a2aSessions:12, interviewsSet:9, blobVariant:1, interactions:[
    { name:'Sara Kim', avatar:'https://randomuser.me/api/portraits/women/44.jpg', via:'ArchitectBot', sentiment:'Positive', sentimentColor:'green' },
    { name:'Tara Lindström', avatar:'https://randomuser.me/api/portraits/women/68.jpg', via:'MLPlatformBot', sentiment:'Cautious', sentimentColor:'orange' },
    { name:'Jae Woo', avatar:'https://randomuser.me/api/portraits/men/41.jpg', via:'StartupBot', sentiment:'Interested', sentimentColor:'blue' },
  ]},
  { id:'jbot1', name:'PrincipalEng-Agent', mode:'AUTO', role:'Principal Engineer, Platform', ats:'Greenhouse', icon:'dna', iconBg:'var(--blue-bg)', conversations:31, a2aSessions:8, interviewsSet:6, blobVariant:2, interactions:[
    { name:'Marcus Peterson', avatar:'https://randomuser.me/api/portraits/men/32.jpg', via:'CTOBot', sentiment:'Cautious', sentimentColor:'orange' },
    { name:'Lin Nakamura', avatar:'https://randomuser.me/api/portraits/women/22.jpg', via:'ArchitectBot', sentiment:'Positive', sentimentColor:'green' },
  ]},
  { id:'jbot2', name:'DevRel-Agent', mode:'ASSIST', role:'DevRel Engineer', ats:'Lever', icon:'target', iconBg:'var(--purple-bg)', conversations:19, a2aSessions:5, interviewsSet:3, blobVariant:3, interactions:[
    { name:'Aiko Jansson', avatar:'https://randomuser.me/api/portraits/women/65.jpg', via:'DevRelBot', sentiment:'Interested', sentimentColor:'blue' },
  ]},
  { id:'jbot3', name:'DataEng-Agent', mode:'DRAFT', role:'Senior Data Engineer', ats:'Workday', icon:'chart', iconBg:'var(--surface3)', conversations:0, a2aSessions:0, interviewsSet:0, blobVariant:0, interactions:[] },
];

export const PIPELINE_STAGES = [
  { key:'Applied', count:89 }, { key:'Explorer Screen', count:71 }, { key:'Recruiter Review', count:54 },
  { key:'Interview', count:47 }, { key:'Hiring Mgr', count:28 }, { key:'Final Round', count:20 }, { key:'Offer', count:9 },
];

export const PIPELINE_FUNNEL = [
  { stage:'Applied', count:89, height:130, gradient:['#3b82f6','#2563eb'], conversion:'—', convColor:'var(--muted)' },
  { stage:'Explorer Screen', count:71, height:104, gradient:['#06b6d4','#0891b2'], conversion:'80%', convColor:'var(--blue)' },
  { stage:'Recruiter Review', count:54, height:79, gradient:['#8b5cf6','#7c3aed'], conversion:'76%', convColor:'var(--purple)' },
  { stage:'Interview', count:47, height:69, gradient:['#a855f7','#9333ea'], conversion:'87%', convColor:'var(--purple)' },
  { stage:'Hiring Mgr', count:28, height:41, gradient:['#f59e0b','#d97706'], conversion:'60%', convColor:'var(--gold)' },
  { stage:'Final Round', count:20, height:29, gradient:['#f97316','#ea580c'], conversion:'71%', convColor:'var(--orange)' },
  { stage:'Offer', count:9, height:13, gradient:['#22c55e','#16a34a'], conversion:'45%', convColor:'var(--green)' },
];

export const BOTTLENECKS = [
  { stage:'Applied', desc:'Initial Review & Screen', days:'2.1d avg', pct:40, color:'var(--green)', status:'On Track', statusColor:'green' },
  { stage:'Explorer Screen', desc:'AI Conversation & Scoring', days:'1.3d avg', pct:25, color:'var(--green)', status:'On Track', statusColor:'green' },
  { stage:'Recruiter Review', desc:'Shortlisting & Outreach', days:'4.5d avg', pct:90, color:'var(--orange)', status:'Bottleneck', statusColor:'orange' },
  { stage:'Interview', desc:'Scheduling & Conducting', days:'3.5d avg', pct:70, color:'var(--blue)', status:'Monitor', statusColor:'blue' },
  { stage:'Hiring Mgr', desc:'Executive Review', days:'7.2d avg', pct:100, color:'var(--red)', status:'Critical', statusColor:'red' },
  { stage:'Final Round', desc:'Panel & Decision', days:'3.2d avg', pct:65, color:'var(--orange)', status:'Bottleneck', statusColor:'orange' },
  { stage:'Offer', desc:'Negotiation & Sign', days:'1.5d avg', pct:30, color:'var(--green)', status:'On Track', statusColor:'green' },
];

export function fitBadgeClass(label: string): string {
  const map: Record<string,string> = { 'Deep Match':'fit-deep', 'Strong Fit':'fit-good', 'Good Fit':'fit-good', 'Alignment':'fit-align', 'High Potential':'fit-potential', 'Potential Fit':'fit-potential', 'Not a Fit':'fit-notfit' };
  return map[label] || 'fit-deep';
}

export function stageBadgeClass(stage: string): string {
  const map: Record<string,string> = { 'Explorer Screen':'sb-screen', 'Recruiter Review':'sb-screen', 'Interview':'sb-interview', 'Hiring Mgr Review':'sb-hiring', 'Hiring Mgr':'sb-hiring', 'Final Round':'sb-final', 'Offer Extended':'sb-offer', 'Offer':'sb-offer', 'On Hold':'sb-onhold', 'Applied':'sb-applied', 'Sourced':'sb-applied', 'Deep Dive':'sb-interview' };
  return map[stage] || 'sb-applied';
}

export function urgencyClass(urg: string): string {
  return urg === 'HOT' ? 'urg-hot' : urg === 'WARM' ? 'urg-warm' : 'urg-normal';
}
