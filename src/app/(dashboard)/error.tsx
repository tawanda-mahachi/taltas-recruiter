// @ts-nocheck
'use client';
export default function Error({ error, reset }) {
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F4F4F2',fontFamily:'Helvetica Neue,Helvetica,Arial,sans-serif',flexDirection:'column',gap:16,padding:32,textAlign:'center'}}>
      <div style={{fontSize:18,fontWeight:300,color:'#0A0A0A'}}>Something went wrong</div>
      <pre style={{fontSize:11,color:'#CC3300',background:'#fff',border:'1px solid #E8E8E5',padding:'12px 16px',maxWidth:600,wordBreak:'break-all',whiteSpace:'pre-wrap',textAlign:'left'}}>{error?.message}</pre>
      <pre style={{fontSize:10,color:'#AAAAAA',maxWidth:600,wordBreak:'break-all',whiteSpace:'pre-wrap',textAlign:'left'}}>{error?.stack?.slice(0,800)}</pre>
      <button onClick={reset} style={{padding:'10px 20px',background:'#0033FF',color:'#fff',border:'none',fontSize:13,cursor:'pointer'}}>Try again</button>
    </div>
  );
}