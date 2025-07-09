import{u as H,s as y}from"./index-C6kZba6T.js";const O=u=>H({queryKey:["analytics-table-data",u],queryFn:async()=>{const{data:x,error:w}=await y.from("questions").select(`
          id,
          question_text,
          question_type,
          category,
          is_active,
          created_at
        `).eq("organization_id",u).eq("is_active",!0).order("created_at",{ascending:!1});if(w)throw w;const{data:A,error:M}=await y.from("feedback_responses").select(`
          id,
          question_id,
          score,
          response_time_ms,
          created_at,
          question_category,
          session_id,
          response_value
        `).eq("organization_id",u);if(M)throw M;const{data:i,error:R}=await y.from("feedback_sessions").select(`
          id,
          status,
          total_score,
          created_at,
          completed_at,
          started_at,
          user_id
        `).eq("organization_id",u).order("created_at",{ascending:!1});if(R)throw R;const c=(i||[]).length,v=(i||[]).filter(e=>e.status==="completed").length,E=(i||[]).filter(e=>e.status==="in_progress").length,T=c-v-E,P=c>0?Math.round(v/c*100):0,p=(i||[]).filter(e=>e.status==="completed"&&e.total_score!==null),k=p.length>0?p.reduce((e,t)=>e+(t.total_score||0),0)/p.length:0,C=p.filter(e=>(e.total_score||0)>=4).length,G=p.length>0?Math.round(C/p.length*100):0,g=new Date;g.setDate(g.getDate()-30);const S=new Date;S.setDate(S.getDate()-60);const L=(i||[]).filter(e=>new Date(e.created_at)>=g).length,q=(i||[]).filter(e=>new Date(e.created_at)>=S&&new Date(e.created_at)<g).length,W=q>0?Math.round((L-q)/q*100):0,l=(x||[]).map(e=>{const t=(A||[]).filter(a=>a.question_id===e.id),n=t.length,_=new Set(t.map(a=>a.session_id)),r=c>0?Math.round(_.size/c*100):0,d=t.filter(a=>a.score!==null),o=d.length>0?d.reduce((a,D)=>a+(D.score||0),0)/d.length:0,s=t.filter(a=>a.response_time_ms!==null),f=s.length>0?s.reduce((a,D)=>a+(D.response_time_ms||0),0)/s.length:0,h=[];return r>90&&h.push("High engagement - users complete this question consistently"),r<70&&h.push("Low completion - consider simplifying or repositioning"),o>4&&h.push("Positive sentiment - high satisfaction scores"),o<2.5&&h.push("Negative sentiment - requires attention"),f>3e4&&h.push("Long response time - may indicate complexity"),{id:e.id,question_text:e.question_text,question_type:e.question_type||"text",category:e.category||"General",total_responses:n,completion_rate:r,avg_score:Math.round(o*100)/100,avg_response_time_ms:Math.round(f),response_distribution:{},insights:h,trend:o>3.5?"positive":o<2.5?"negative":"neutral"}}),m=new Map;l.forEach(e=>{const t=e.category||"General";m.has(t)||m.set(t,[]),m.get(t).push(e)});const F=Array.from(m.entries()).map(([e,t])=>{const n=t.reduce((o,s)=>o+s.total_responses,0),_=t.length>0?t.reduce((o,s)=>o+s.completion_rate,0)/t.length:0,r=t.length>0?t.reduce((o,s)=>o+s.avg_score,0)/t.length:0,d=t.length>0?t.reduce((o,s)=>o+(s.avg_response_time_ms||0),0)/t.length:0;return{category:e,total_questions:t.length,total_responses:n,completion_rate:Math.round(_),questions:t,avg_score:Math.round(r*100)/100,avg_response_time_ms:Math.round(d)}}),b=[];return Array.from({length:30},(e,t)=>{const n=new Date;return n.setDate(n.getDate()-t),n}).reverse().forEach(e=>{const t=e.toISOString().split("T")[0],n=(i||[]).filter(s=>s.created_at.startsWith(t)),_=n.length,r=n.filter(s=>s.status==="completed").length,d=_>0?r/_*100:0,o=n.length>0?n.reduce((s,f)=>s+(f.total_score||0),0)/n.length:0;b.push({date:t,total_sessions:_,completed_sessions:r,completion_rate:Math.round(d),avg_score:Math.round(o*100)/100})}),{questions:l,categories:F,summary:{total_questions:l.length,total_responses:l.reduce((e,t)=>e+t.total_responses,0),overall_completion_rate:P,total_sessions:c,completed_sessions:v,avg_score:Math.round(k*100)/100,user_satisfaction_rate:G,growth_rate:W,abandoned_sessions:T,response_rate:l.length>0?Math.round(l.reduce((e,t)=>e+t.total_responses,0)/(l.length*c)*100):0},trendData:b}},enabled:!!u,staleTime:5*60*1e3,refetchInterval:10*60*1e3});export{O as u};
