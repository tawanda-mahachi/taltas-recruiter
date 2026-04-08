'use client';
import { useEffect, useRef } from 'react';

const BLUE='#2563eb',TEAL='#1D9E75',DARK='#0A0A0A',MID='#6B6B6B',MUTED='#AAAAAA',BORDER='#E8E8E5',BLIGHT='#F4F4F2',RED='#CC3300',AMBER='#D97706',PURPLE='#7C3AED';
const F="'Helvetica Neue',Helvetica,Arial,sans-serif";

function useEChart(fn: ()=>any, deps: any[]=[]){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!ref.current) return;
    let chart: any;
    import('echarts').then(echarts=>{
      if(!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption(fn());
      const ro = new ResizeObserver(()=>chart?.resize());
      ro.observe(ref.current);
      return ()=>{ ro.disconnect(); chart?.dispose(); };
    });
    return ()=>{ chart?.dispose(); };
  }, deps);
  return ref;
}

export function PipelineVolumeChart(){
  const ref = useEChart(()=>({
    grid:{top:20,right:12,bottom:24,left:32},
    tooltip:{trigger:'axis',backgroundColor:'#fff',borderColor:BORDER,borderWidth:1,textStyle:{fontFamily:F,fontSize:11,color:DARK}},
    legend:{top:0,right:0,textStyle:{fontFamily:F,fontSize:10,color:MUTED},itemWidth:14,itemHeight:2},
    xAxis:{type:'category',data:['Sep','Oct','Nov','Dec','Jan','Feb'],axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:F,fontSize:10,color:MUTED},splitLine:{show:false}},
    yAxis:{type:'value',axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{fontFamily:F,fontSize:9,color:MUTED}},
    series:[
      {name:'Applied', type:'line',data:[22,28,31,35,24,22],smooth:.5,symbol:'circle',symbolSize:5,lineStyle:{color:BLUE,width:2},itemStyle:{color:BLUE},areaStyle:{color:'rgba(37,99,235,.07)'}},
      {name:'Screened',type:'line',data:[16,21,24,27,18,17],smooth:.5,symbol:'circle',symbolSize:5,lineStyle:{color:TEAL,width:2},itemStyle:{color:TEAL},areaStyle:{color:'rgba(29,158,117,.05)'}},
      {name:'Offered', type:'line',data:[3,4,5,6,4,3],smooth:.5,symbol:'circle',symbolSize:5,lineStyle:{color:'#F5A623',width:2},itemStyle:{color:'#F5A623'},areaStyle:{color:'rgba(245,166,35,.05)'}},
    ],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function MonthlyTrendChart(){
  const ref = useEChart(()=>({
    grid:{top:20,right:50,bottom:24,left:40},
    tooltip:{trigger:'axis',backgroundColor:'#fff',borderColor:BORDER,borderWidth:1,textStyle:{fontFamily:F,fontSize:11,color:DARK}},
    legend:{top:0,right:0,textStyle:{fontFamily:F,fontSize:10,color:MUTED},itemWidth:14,itemHeight:2},
    xAxis:{type:'category',data:['Sep','Oct','Nov','Dec','Jan','Feb'],axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:F,fontSize:10,color:MUTED},splitLine:{show:false}},
    yAxis:[
      {type:'value',axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{fontFamily:F,fontSize:9,color:MUTED,formatter:'{value}d'},max:30},
      {type:'value',axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{fontFamily:F,fontSize:9,color:MUTED,formatter:'{value}%'},max:100},
    ],
    series:[
      {name:'Time-to-Fill',  type:'bar', data:[24,22,20,19,18,18],barMaxWidth:18,itemStyle:{color:'rgba(37,99,235,.2)'}},
      {name:'Offer Accept %',type:'line',data:[68,71,72,75,78,79],smooth:.5,symbol:'circle',symbolSize:5,lineStyle:{color:TEAL,width:2},itemStyle:{color:TEAL},yAxisIndex:1},
    ],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function SourceChart(){
  const ref = useEChart(()=>({
    grid:{top:8,right:40,bottom:8,left:90},
    tooltip:{trigger:'axis',axisPointer:{type:'none'},backgroundColor:'#fff',borderColor:BORDER,borderWidth:1,textStyle:{fontFamily:F,fontSize:11,color:DARK}},
    xAxis:{type:'value',show:false,max:100},
    yAxis:{type:'category',data:['GitHub','Indeed','Greenhouse','LinkedIn','Referral','Taltas'],axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:F,fontSize:11,color:MID}},
    series:[{
      type:'bar',data:[76,64,82,78,88,91],barMaxWidth:7,
      itemStyle:{color:(p:any)=>{const v=[76,64,82,78,88,91][p.dataIndex];return v>=85?TEAL:v>=75?BLUE:AMBER;}},
      label:{show:true,position:'right',fontSize:10,fontFamily:F,color:MID,fontWeight:500,formatter:(p:any)=>p.value},
    }],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function ReportsRadarChart(){
  const ref = useEChart(()=>({
    tooltip:{backgroundColor:'#fff',borderColor:BORDER,borderWidth:1,textStyle:{fontFamily:F,fontSize:11,color:DARK}},
    legend:{bottom:4,left:'center',textStyle:{fontFamily:F,fontSize:10,color:MUTED},itemWidth:14,itemHeight:2},
    radar:{center:['50%','46%'],radius:'55%',
      indicator:[{name:'Technical',max:100},{name:'Culture',max:100},{name:'Leadership',max:100},{name:'Growth',max:100},{name:'Communication',max:100},{name:'Behavioural',max:100}],
      axisName:{fontFamily:F,fontSize:9,color:MUTED},
      splitLine:{lineStyle:{color:BORDER}},splitArea:{show:false},axisLine:{lineStyle:{color:BORDER}},
    },
    series:[{type:'radar',data:[
      {name:'Explorer',value:[88,92,85,78,90,86],lineStyle:{color:TEAL,width:2},itemStyle:{color:TEAL},areaStyle:{color:'rgba(29,158,117,.1)'}},
      {name:'ATS Only',value:[64,58,70,65,55,62],lineStyle:{color:'#CCCCCC',width:1.5,type:'dashed'},itemStyle:{color:'#CCCCCC'},areaStyle:{color:'rgba(0,0,0,.03)'}},
    ]}],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function ReportsParetoChart(){
  const ref = useEChart(()=>({
    grid:{top:16,right:44,bottom:36,left:12},
    tooltip:{trigger:'axis',backgroundColor:'#fff',borderColor:BORDER,borderWidth:1,textStyle:{fontFamily:F,fontSize:11,color:DARK}},
    legend:{top:0,right:0,textStyle:{fontFamily:F,fontSize:10,color:MUTED},itemWidth:14,itemHeight:2},
    xAxis:{type:'category',data:['Skill','Exp Gap','Culture','Salary','Location','Timeline','Other'],axisLine:{show:false},axisTick:{show:false},axisLabel:{fontFamily:F,fontSize:9,color:MUTED,interval:0,rotate:20},splitLine:{show:false}},
    yAxis:[
      {type:'value',axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false}},
      {type:'value',max:100,axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{fontFamily:F,fontSize:9,color:MUTED,formatter:'{value}%'}},
    ],
    series:[
      {name:'Count',type:'bar',data:[42,28,18,12,8,6,4],barMaxWidth:28,itemStyle:{color:(p:any)=>p.dataIndex<3?RED:'#E8E8E5'}},
      {name:'Cumulative %',type:'line',data:[35,58,73,83,90,95,100],symbol:'circle',symbolSize:4,lineStyle:{color:BLUE,width:1.5},itemStyle:{color:BLUE},yAxisIndex:1},
    ],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function GenderBar(){
  const ref = useEChart(()=>({
    grid:{top:0,right:0,bottom:0,left:0},
    xAxis:{type:'value',show:false,max:100},
    yAxis:{type:'category',data:[''],show:false},
    series:[
      {type:'bar',data:[48],stack:'g',barMaxWidth:18,itemStyle:{color:BLUE}},
      {type:'bar',data:[44],stack:'g',barMaxWidth:18,itemStyle:{color:PURPLE}},
      {type:'bar',data:[8], stack:'g',barMaxWidth:18,itemStyle:{color:TEAL}},
    ],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}

export function EthnicBar(){
  const ref = useEChart(()=>({
    grid:{top:0,right:0,bottom:0,left:0},
    xAxis:{type:'value',show:false,max:100},
    yAxis:{type:'category',data:[''],show:false},
    series:[
      {type:'bar',data:[38],stack:'e',barMaxWidth:18,itemStyle:{color:BLUE}},
      {type:'bar',data:[32],stack:'e',barMaxWidth:18,itemStyle:{color:TEAL}},
      {type:'bar',data:[15],stack:'e',barMaxWidth:18,itemStyle:{color:PURPLE}},
      {type:'bar',data:[10],stack:'e',barMaxWidth:18,itemStyle:{color:'#F5A623'}},
      {type:'bar',data:[5], stack:'e',barMaxWidth:18,itemStyle:{color:'#CCCCCC'}},
    ],
  }), []);
  return <div ref={ref} style={{width:'100%',height:'100%'}}/>;
}
