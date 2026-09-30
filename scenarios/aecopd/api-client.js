(()=>{'use strict';

let apiSessionId=null;
const correctByQuestion=new Map();
const wrongByQuestion=new Set();
const requiredCorrectCounts={
  act1_lung_sound:1,
  act1_cxr:1,
  act1_medication:2,
  act1_oxygen:1,
  act2_lung_sound:1,
  act2_abg:1,
  act2_treatment:4
};

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
  correctByQuestion.clear();
  wrongByQuestion.clear();
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
  if(event.question_id){
    if(event.is_correct===false){
      // Once a wrong option has been selected, this whole scored question
      // is counted as a miss even if the team later corrects the answer.
      wrongByQuestion.add(event.question_id);
    }
    if(event.is_correct===true){
      if(!correctByQuestion.has(event.question_id)) correctByQuestion.set(event.question_id,new Set());
      correctByQuestion.get(event.question_id).add(String(event.selected_option??'correct'));
    }
  }
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

function calculatedScore(){
  const questionIds=Object.keys(requiredCorrectCounts);
  let passed=0;
  for(const qid of questionIds){
    const count=correctByQuestion.get(qid)?.size||0;
    const hadWrongAttempt=wrongByQuestion.has(qid);
    if(!hadWrongAttempt&&count>=requiredCorrectCounts[qid]) passed++;
  }
  return Number(((passed/questionIds.length)*100).toFixed(2));
}

async function completeSession(durationSeconds,totalScore=null){
  const sid=apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid)return null;
  const score=totalScore==null?calculatedScore():Number(totalScore);
  return postSheet({
    type:'complete',
    session_id:sid,
    completed_at:new Date().toISOString(),
    score:score,
    duration_sec:durationSeconds
  });
}

function getRanking(sessionId=null){
  const sid=sessionId||apiSessionId||localStorage.getItem('gener8ApiSessionId');
  if(!enabled()||!sid) return Promise.resolve(null);
  return new Promise((resolve,reject)=>{
    const cb='gener8Rank_'+Date.now()+'_'+Math.floor(Math.random()*100000);
    const script=document.createElement('script');
    const timer=setTimeout(()=>{
      cleanup();
      reject(new Error('Ranking request timeout'));
    },8000);
    function cleanup(){
      clearTimeout(timer);
      try{delete window[cb];}catch(e){window[cb]=undefined;}
      script.remove();
    }
    window[cb]=data=>{
      cleanup();
      if(data&&data.success!==false) resolve(data);
      else reject(new Error(data?.error||'Ranking unavailable'));
    };
    const sep=endpoint().includes('?')?'&':'?';
    script.src=endpoint()+sep+'action=ranking&session_id='+encodeURIComponent(sid)+'&callback='+encodeURIComponent(cb);
    script.onerror=()=>{
      cleanup();
      reject(new Error('Ranking request failed'));
    };
    document.head.appendChild(script);
  });
}

async function getRankingWithRetry(sessionId=null,retries=3){
  let lastError=null;
  for(let i=0;i<retries;i++){
    try{
      const result=await getRanking(sessionId);
      if(result?.rank&&result?.total) return result;
      lastError=new Error('Ranking not ready');
    }catch(err){
      lastError=err;
    }
    await new Promise(resolve=>setTimeout(resolve,700*(i+1)));
  }
  throw lastError||new Error('Ranking unavailable');
}

window.Gener8API={enabled,startSession,recordEvent,saveSatisfaction,completeSession,getRanking:getRankingWithRetry,getSessionId:()=>apiSessionId,getCalculatedScore:calculatedScore};
})();
