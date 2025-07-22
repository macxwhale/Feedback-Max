import{u as H,s as A}from"./index-3gg4rzqD.js";const K=(s,o,c=100)=>{if(o===0||o===null||o===void 0)return s>0?c:0;if(s==null)return 0;const m=(s-o)/Math.abs(o)*100;return Math.max(-c,Math.min(c,Math.round(m)))},E=(s,o=5)=>s==null||isNaN(s)?0:s>=1&&s<=o?s:s>=0&&s<=100?Math.max(1,Math.min(5,s/100*4+1)):Math.max(1,Math.min(o,s)),O=(s,o,c=5)=>o<c?s>o?10:0:K(s,o,100),B=s=>Array.isArray(s)?s.filter(o=>!o||typeof o!="object"?!1:(o.total_score!==null&&o.total_score!==void 0&&(o.total_score=E(o.total_score)),!0)):[],X=s=>H({queryKey:["analytics-table-data",s],queryFn:async()=>{console.log("Fetching analytics data for organization:",s);const{data:o,error:c}=await A.from("questions").select(`
          id,
          question_text,
          question_type,
          category,
          is_active,
          created_at
        `).eq("organization_id",s).eq("is_active",!0).order("created_at",{ascending:!1});if(c)throw console.error("Error fetching questions:",c),c;const{data:m,error:M}=await A.from("feedback_responses").select(`
          id,
          question_id,
          score,
          response_time_ms,
          created_at,
          question_category,
          session_id,
          response_value
        `).eq("organization_id",s);if(M)throw console.error("Error fetching responses:",M),M;const{data:S,error:w}=await A.from("feedback_sessions").select(`
          id,
          status,
          total_score,
          created_at,
          completed_at,
          started_at,
          user_id
        `).eq("organization_id",s).order("created_at",{ascending:!1});if(w)throw console.error("Error fetching sessions:",w),w;console.log("Raw data fetched:",{questions:(o==null?void 0:o.length)||0,responses:(m==null?void 0:m.length)||0,sessions:(S==null?void 0:S.length)||0});const _=B(S||[]),d=_.length,D=_.filter(e=>e.status==="completed").length,T=_.filter(e=>e.status==="in_progress").length,W=d-D-T,N=d>0?Math.round(D/d*100):0,f=_.filter(e=>e.status==="completed"&&e.total_score!==null).map(e=>E(e.total_score)),z=f.length>0?f.reduce((e,t)=>e+t,0)/f.length:0,G=f.filter(e=>e>=4).length,k=f.length>0?Math.round(G/f.length*100):0,y=new Date;y.setDate(y.getDate()-30);const R=new Date;R.setDate(R.getDate()-60);const F=_.filter(e=>new Date(e.created_at)>=y).length,L=_.filter(e=>new Date(e.created_at)>=R&&new Date(e.created_at)<y).length,j=O(F,L),u=(o||[]).map(e=>{const t=(m||[]).filter(i=>i.question_id===e.id),l=t.length,g=new Set(t.map(i=>i.session_id)),h=d>0?Math.round(g.size/d*100):0,p=t.filter(i=>i.score!==null),r=p.length>0?p.reduce((i,b)=>i+(b.score||0),0)/p.length:0,a=t.filter(i=>i.response_time_ms!==null),q=a.length>0?a.reduce((i,b)=>i+(b.response_time_ms||0),0)/a.length:0,n=[];return h>90&&n.push("High engagement - users complete this question consistently"),h<70&&n.push("Low completion - consider simplifying or repositioning"),r>4&&n.push("Positive sentiment - high satisfaction scores"),r<2.5&&n.push("Negative sentiment - requires attention"),q>3e4&&n.push("Long response time - may indicate complexity"),{id:e.id,question_text:e.question_text,question_type:e.question_type||"text",category:e.category||"General",total_responses:l,completion_rate:h,avg_score:Math.round(r*100)/100,avg_response_time_ms:Math.round(q),response_distribution:{},insights:n,trend:r>3.5?"positive":r<2.5?"negative":"neutral"}}),v=new Map;u.forEach(e=>{const t=e.category||"General";v.has(t)||v.set(t,[]),v.get(t).push(e)});const C=Array.from(v.entries()).map(([e,t])=>{const l=t.reduce((r,a)=>r+a.total_responses,0),g=t.length>0?t.reduce((r,a)=>r+a.completion_rate,0)/t.length:0,h=t.length>0?t.reduce((r,a)=>r+a.avg_score,0)/t.length:0,p=t.length>0?t.reduce((r,a)=>r+(a.avg_response_time_ms||0),0)/t.length:0;return{category:e,total_questions:t.length,total_responses:l,completion_rate:Math.round(g),questions:t,avg_score:Math.round(h*100)/100,avg_response_time_ms:Math.round(p)}}),x=[];Array.from({length:30},(e,t)=>{const l=new Date;return l.setDate(l.getDate()-t),l}).reverse().forEach(e=>{const t=e.toISOString().split("T")[0],l=_.filter(n=>n.created_at.startsWith(t)),g=l.length,h=l.filter(n=>n.status==="completed").length,p=g>0?Math.round(h/g*100):0,a=l.filter(n=>n.status==="completed"&&n.total_score!==null).map(n=>E(n.total_score)),q=a.length>0?a.reduce((n,i)=>n+i,0)/a.length:0;x.push({date:t,total_sessions:g,completed_sessions:h,completion_rate:p,avg_score:Math.round(q*100)/100})});const P={questions:u,categories:C,summary:{total_questions:u.length,total_responses:u.reduce((e,t)=>e+t.total_responses,0),overall_completion_rate:N,total_sessions:d,completed_sessions:D,avg_score:Math.round(z*100)/100,user_satisfaction_rate:k,growth_rate:j,abandoned_sessions:W,response_rate:u.length>0&&d>0?Math.round(u.reduce((e,t)=>e+t.total_responses,0)/(u.length*d)*100):0},trendData:x};return console.log("Analytics result with safe calculations:",P),P},enabled:!!s,staleTime:5*60*1e3,refetchInterval:10*60*1e3});export{X as u};
