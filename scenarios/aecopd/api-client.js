(()=>{'use strict';

let apiSessionId=null;

function endpoint(){ return window.GENER8_SHEETS_ENDPOINT || ''; }
function enabled(){ return !!endpoint(); }

async function postSheet(payload){
  if(!enabled()) return null;
  // Google Apps Script web apps are easiest to call from GitHub Pages as a
  // simple no-cors POST. The request is still delivered and written to Sheets.
  await fetch(endpoint(),{
    method:'POST',
    mode:'no-cors',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload),
    keepalive:true
  });
  return {ok:true};
}

async function startSession(meta){
  if(!enabled()) return null;
  apiSessionId=meta.code;
  localStorage.setItem('gener8ApiSessionId',apiSessionId);

  await postSheet({
    type:'session',
    session_id:apiSessionId,
    team_code:meta.code,
    started_at:meta.startedAt || new Date().toISOString(),
    completed_at:'',
    participant_count:meta.count,
    score:'',
    duration_sec:''
  });

  for(const m of (meta.members||[])){
    await postSheet({
      type:'participant',
      session_id:apiSessionId,
      member_no:m.memberNo,
      profession:m.profession,
      role:m.role
    });
  }
  return {id:apiSessionId};
}

async function recordEvent(event){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  return postSheet({
    type:'event',
    session_id:sid,
    step:event.step||'',
    question_id:event.question_id||'',
    selected_option:event.selected_option??'',
    is_correct:typeof event.is_correct==='boolean'?event.is_correct:'',
    attempt_number:event.attempt_number||'',
    elapsed_ms:event.elapsed_ms||''
  });
}

async function saveSatisfaction(answers){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  const vals=(answers||[]).map(Number);
  const avg=vals.length?Number((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)):'';
  return postSheet({
    type:'satisfaction',
    session_id:sid,
    q1:vals[0]||'',
    q2:vals[1]||'',
    q3:vals[2]||'',
    q4:vals[3]||'',
    q5:vals[4]||'',
    average:avg,
    submitted_at:new Date().toISOString()
  });
}

async function completeSession(durationSeconds,totalScore=null){
  // The first Google-Sheets version keeps one session row at login.
  // Completion time/score can be added later with an Apps Script upsert.
  return {id:apiSessionId||localStorage.getItem('gener8ApiSessionId'),duration_seconds:durationSeconds,total_score:totalScore};
}

window.Gener8API={enabled,startSession,recordEvent,saveSatisfaction,completeSession,getSessionId:()=>apiSessionId};
})();
