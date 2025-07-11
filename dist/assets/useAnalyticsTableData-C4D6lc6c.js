import{u as K,s as E}from"./index-D-bTE5z8.js";const j=p=>K({queryKey:["analytics-table-data",p],queryFn:async()=>{console.log("Fetching analytics data for organization:",p);const{data:m,error:y}=await E.from("questions").select(`
          id,
          question_text,
          question_type,
          category,
          is_active,
          created_at
        `).eq("organization_id",p).eq("is_active",!0).order("created_at",{ascending:!1});if(y)throw console.error("Error fetching questions:",y),y;const{data:f,error:q}=await E.from("feedback_responses").select(`
          id,
          question_id,
          score,
          response_time_ms,
          created_at,
          question_category,
          session_id,
          response_value
        `).eq("organization_id",p);if(q)throw console.error("Error fetching responses:",q),q;const{data:i,error:w}=await E.from("feedback_sessions").select(`
          id,
          status,
          total_score,
          created_at,
          completed_at,
          started_at,
          user_id
        `).eq("organization_id",p).order("created_at",{ascending:!1});if(w)throw console.error("Error fetching sessions:",w),w;console.log("Raw data fetched:",{questions:(m==null?void 0:m.length)||0,responses:(f==null?void 0:f.length)||0,sessions:(i==null?void 0:i.length)||0});const d=(i||[]).length,D=(i||[]).filter(e=>e.status==="completed").length,T=(i||[]).filter(e=>e.status==="in_progress").length,P=d-D-T,W=d>0?Math.round(D/d*100):0,u=(i||[]).filter(e=>e.status==="completed"&&e.total_score!==null),k=u.length>0?u.reduce((e,t)=>e+(t.total_score||0),0)/u.length:0,C=u.filter(e=>(e.total_score||0)>=4).length,F=u.length>0?Math.round(C/u.length*100):0,v=new Date;v.setDate(v.getDate()-30);const M=new Date;M.setDate(M.getDate()-60);const G=(i||[]).filter(e=>new Date(e.created_at)>=v).length,R=(i||[]).filter(e=>new Date(e.created_at)>=M&&new Date(e.created_at)<v).length,L=R>0?Math.round((G-R)/R*100):0,_=(m||[]).map(e=>{const t=(f||[]).filter(a=>a.question_id===e.id),n=t.length,h=new Set(t.map(a=>a.session_id)),c=d>0?Math.round(h.size/d*100):0,g=t.filter(a=>a.score!==null),s=g.length>0?g.reduce((a,b)=>a+(b.score||0),0)/g.length:0,o=t.filter(a=>a.response_time_ms!==null),r=o.length>0?o.reduce((a,b)=>a+(b.response_time_ms||0),0)/o.length:0,l=[];return c>90&&l.push("High engagement - users complete this question consistently"),c<70&&l.push("Low completion - consider simplifying or repositioning"),s>4&&l.push("Positive sentiment - high satisfaction scores"),s<2.5&&l.push("Negative sentiment - requires attention"),r>3e4&&l.push("Long response time - may indicate complexity"),{id:e.id,question_text:e.question_text,question_type:e.question_type||"text",category:e.category||"General",total_responses:n,completion_rate:c,avg_score:Math.round(s*100)/100,avg_response_time_ms:Math.round(r),response_distribution:{},insights:l,trend:s>3.5?"positive":s<2.5?"negative":"neutral"}}),S=new Map;_.forEach(e=>{const t=e.category||"General";S.has(t)||S.set(t,[]),S.get(t).push(e)});const H=Array.from(S.entries()).map(([e,t])=>{const n=t.reduce((s,o)=>s+o.total_responses,0),h=t.length>0?t.reduce((s,o)=>s+o.completion_rate,0)/t.length:0,c=t.length>0?t.reduce((s,o)=>s+o.avg_score,0)/t.length:0,g=t.length>0?t.reduce((s,o)=>s+(o.avg_response_time_ms||0),0)/t.length:0;return{category:e,total_questions:t.length,total_responses:n,completion_rate:Math.round(h),questions:t,avg_score:Math.round(c*100)/100,avg_response_time_ms:Math.round(g)}}),x=[];Array.from({length:30},(e,t)=>{const n=new Date;return n.setDate(n.getDate()-t),n}).reverse().forEach(e=>{const t=e.toISOString().split("T")[0],n=(i||[]).filter(r=>r.created_at.startsWith(t)),h=n.length,c=n.filter(r=>r.status==="completed").length,g=h>0?c/h*100:0,s=n.filter(r=>r.status==="completed"&&r.total_score!==null),o=s.length>0?s.reduce((r,l)=>r+(l.total_score||0),0)/s.length:0;x.push({date:t,total_sessions:h,completed_sessions:c,completion_rate:Math.round(g),avg_score:Math.round(o*100)/100})});const A={questions:_,categories:H,summary:{total_questions:_.length,total_responses:_.reduce((e,t)=>e+t.total_responses,0),overall_completion_rate:W,total_sessions:d,completed_sessions:D,avg_score:Math.round(k*100)/100,user_satisfaction_rate:F,growth_rate:L,abandoned_sessions:P,response_rate:_.length>0?Math.round(_.reduce((e,t)=>e+t.total_responses,0)/(_.length*d)*100):0},trendData:x};return console.log("Analytics result:",A),A},enabled:!!p,staleTime:5*60*1e3,refetchInterval:10*60*1e3});export{j as u};
