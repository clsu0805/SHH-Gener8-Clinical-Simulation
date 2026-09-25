(()=>{'use strict';

let apiSessionId=null;

function base(){ return window.GENER8_API_BASE || ''; }
function enabled(){ return !!base(); }

async function request(path, options={}){
  if(!enabled()) return null;
  const res=await fetch(base()+path,{
    headers:{'Content-Type':'application/json',...(options.headers||{})},
    ...options
  });
  if(!res.ok){
    const text=await res.text();
    throw new Error('Gener8 API '+res.status+': '+text);
  }
  const type=res.headers.get('content-type')||'';
  return type.includes('application/json')?res.json():res;
}

async function startSession(meta){
  if(!enabled()) return null;
  const payload={
    session_code:meta.code,
    scenario_code:'AECOPD',
    scenario_version:'v1.0',
    mode:'team',
    performance_unit:'team',
    participant_count:meta.count,
    participants:(meta.members||[]).map(m=>({
      member_no:m.memberNo,
      profession:m.profession,
      role:m.role
    }))
  };
  const data=await request('/api/v1/sessions',{method:'POST',body:JSON.stringify(payload)});
  apiSessionId=data?.id||null;
  if(apiSessionId)localStorage.setItem('gener8ApiSessionId',apiSessionId);
  return data;
}

async function recordEvent(event){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  return request('/api/v1/sessions/'+sid+'/events',{method:'POST',body:JSON.stringify(event)});
}

async function saveSatisfaction(answers){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  return request('/api/v1/sessions/'+sid+'/satisfaction',{method:'POST',body:JSON.stringify({answers})});
}

async function completeSession(durationSeconds,totalScore=null){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  return request('/api/v1/sessions/'+sid+'/complete',{
    method:'POST',
    body:JSON.stringify({duration_seconds:durationSeconds,total_score:totalScore})
  });
}

window.Gener8API={enabled,startSession,recordEvent,saveSatisfaction,completeSession,getSessionId:()=>apiSessionId};
})();
