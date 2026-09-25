(()=>{'use strict';
const D=window.AECOPD_DATA,M=window.MEDIA_MANIFEST;
const left=document.getElementById('left-wall'),center=document.getElementById('center-wall'),right=document.getElementById('right-wall'),stage=document.getElementById('stage');
let state=D.states.ACT1_START,evidence=new Set(),act1Orders=new Set(),txSelected=new Set();
let sessionMeta=null;
const satisfactionQuestionSets={
  A:[
    '我能辨識 AECOPD 病人惡化警訊。',
    '我能整合臨床資料進行判斷。',
    '我能判斷治療處置的優先順序。',
    '沉浸式情境有助於提升學習投入。',
    '我對本次教案整體感到滿意。'
  ],
  B:[
    '我能辨識 AECOPD 病人惡化警訊。',
    '我能整合生命徵象、呼吸音、CXR 與 ABG 進行判斷。',
    '我能判斷治療處置的優先順序。',
    '三面牆情境與病人影音有助於學習。',
    '我對 AECOPD Gener8 教案整體感到滿意。'
  ]
};
let selectedSurveyVersion='A';
let lungAudio=null;
let patientSoundEnabled=localStorage.getItem('gener8PatientSound')==='on';
const sensitivityLevels=['low','normal','high'];
const sensitivitySettings={
  low:{label:'Low',cooldown:420},
  normal:{label:'Normal',cooldown:240},
  high:{label:'High',cooldown:100}
};
let sensitivity=localStorage.getItem('gener8InteractionSensitivity')||'normal';
if(!sensitivitySettings[sensitivity]) sensitivity='normal';
let lastInteractionAt=0;
const mediaForState={ACT1_START:M.act1InitialPatient,ACT1_VITALS:M.act1VitalsPatient,ACT1_ABG:M.act1EvidencePatient,ACT1_OXYGEN:M.act1EvidencePatient,ACT1_LUNG_SOUND:M.act1EvidencePatient,ACT1_CXR:M.act1EvidencePatient,ACT1_TREATMENT:M.act1EvidencePatient,ACT1_TX_MEDICATION:M.act1EvidencePatient,ACT1_TX_OXYGEN:M.act1EvidencePatient,ACT1_TX_REASSESS:M.act1EvidencePatient,ACT1_TREATMENT_SUMMARY:M.act1PostTreatmentPatient,ACT2_OVERVIEW:M.act2IntroPatient,ACT2_LUNG_SOUND:M.act2Patient,ACT2_ABG:M.act2Patient,ACT2_TREATMENT:M.act2Patient,ACT2_TREATMENT_CONFIRMED:M.act2Patient,ACT2_NIV_RESPONSE:M.nivPatient};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function createVideo(src,cls='patient-video'){const v=document.createElement('video');v.className=cls;v.src=src;v.autoplay=true;v.loop=true;v.muted=!patientSoundEnabled;v.playsInline=true;v.preload='auto';v.addEventListener('error',()=>{const e=document.createElement('div');e.className='media-error';e.textContent='Media unavailable: '+src.split('/').pop();v.replaceWith(e);});v.play().catch(()=>{});return v;}
function updatePatientSoundUI(){
  const b=document.getElementById('patient-sound-btn');
  if(b){b.dataset.on=patientSoundEnabled?'true':'false';b.textContent='Patient Sound: '+(patientSoundEnabled?'On':'Off');}
  document.querySelectorAll('video.patient-video').forEach(v=>{v.muted=!patientSoundEnabled;if(patientSoundEnabled)v.play().catch(()=>{});});
  const o=document.getElementById('patient-sound-overlay');
  if(o){o.classList.toggle('on',patientSoundEnabled);o.textContent=patientSoundEnabled?'🔊 病人聲音已開啟':'🔇 點此開啟病人聲音';}
}
function togglePatientSound(){
  patientSoundEnabled=!patientSoundEnabled;
  localStorage.setItem('gener8PatientSound',patientSoundEnabled?'on':'off');
  updatePatientSoundUI();
}
function renderCenter(){center.innerHTML='';const b=document.createElement('div');b.className='patient-box';b.appendChild(createVideo(mediaForState[state]||M.act1InitialPatient));const o=document.createElement('button');o.id='patient-sound-overlay';o.className='patient-sound-overlay';o.onclick=togglePatientSound;b.appendChild(o);center.appendChild(b);updatePatientSoundUI();}
function patientBackground(){return '<div class="eyebrow">Act 1｜Initial Assessment</div><h1>病人背景</h1><div class="card"><p>'+D.patient.background.map(esc).join('<br>')+'</p></div>';}
function act1Controls(){const x=[['Vital Signs','ACT1_VITALS'],['ABG','ACT1_ABG'],['Oxygen Therapy','ACT1_OXYGEN'],['Lung Sound','ACT1_LUNG_SOUND'],['CXR','ACT1_CXR'],['Main Treatment','ACT1_TREATMENT']];return '<div class="controls">'+x.map(([l,s])=>'<button class="btn '+(state===s?'active':'')+'" data-state="'+s+'">'+l+'</button>').join('')+'</div>';}
function evidenceCards(){const order=['vitals','abg','oxygen','lung','cxr'];return '<div class="eyebrow">Clinical Evidence Board</div><h2>Clinical Evidence Board</h2><p class="muted small">出現過的資料不消失；評估後持續累積。</p><div class="evidence-grid">'+order.filter(k=>evidence.has(k)).map(k=>{const x=D.act1.evidence[k];return '<div class="evidence-card"><h3>'+esc(x.title)+'</h3><p>'+x.lines.map(esc).join('\n')+'</p></div>';}).join('')+'</div>';}
function addEvidence(s){const m={ACT1_VITALS:'vitals',ACT1_ABG:'abg',ACT1_OXYGEN:'oxygen',ACT1_CXR:'cxr'};if(m[s])evidence.add(m[s]);}
function bindStates(){document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>setState(b.dataset.state));}
function renderAct1(){
  left.innerHTML=patientBackground()+act1Controls();
  if(['ACT1_TREATMENT','ACT1_TX_MEDICATION','ACT1_TX_OXYGEN','ACT1_TX_REASSESS','ACT1_TREATMENT_SUMMARY'].includes(state))renderAct1Treatment(); else right.innerHTML=evidenceCards();

  if(state==='ACT1_LUNG_SOUND'){
    left.innerHTML+=`<div class="question-panel"><h3>呼吸音題</h3><p class="small muted">請聽病人的呼吸音，選擇最符合的呼吸音。</p><div class="lung-audio-controls"><button id="play-act1-lung" class="btn dark">▶ 播放呼吸音</button><button id="pause-act1-lung" class="btn dark">⏸ 暫停</button></div><div class="option-grid" style="margin-top:12px">
      <button class="btn dark" data-a1lung="0">Unilateral decreased breath sounds</button>
      <button class="btn dark" data-a1lung="1">Bilateral expiratory wheezing</button>
      <button class="btn dark" data-a1lung="2">Bilateral basal crackles</button>
      <button class="btn dark" data-a1lung="3">Inspiratory stridor</button>
    </div><div id="a1lung-feedback" class="question-feedback">請先播放呼吸音再作答。</div></div>`;
    right.innerHTML=evidenceCards()+'<div id="a1lung-right-feedback" class="lung-right-feedback" aria-live="polite"></div>';
    document.getElementById('play-act1-lung').onclick=()=>playLungAudio('a1lung-feedback');document.getElementById('pause-act1-lung').onclick=pauseLungAudio;
    document.querySelectorAll('[data-a1lung]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.a1lung==='1';
      b.classList.add(ok?'correct':'wrong');
      if(ok){
        evidence.add('lung');
        document.getElementById('a1lung-feedback').textContent='✓ Bilateral expiratory wheezing';
        right.innerHTML=evidenceCards()+'<div id="a1lung-right-feedback" class="lung-right-feedback correct-feedback">✓ 正確呼吸音已加入 Clinical Evidence Board</div>';
      }else{
        document.getElementById('a1lung-feedback').textContent='✕ 請重新聽診並判斷。';
        const rf=document.getElementById('a1lung-right-feedback');
        if(rf) rf.innerHTML='<div class="wrong-feedback-item">✕ '+esc(b.textContent)+'</div>';
      }
    });
  }

  if(state==='ACT1_CXR'){
    left.innerHTML+=`<div class="question-panel"><h3>CXR 判讀題</h3><img class="cxr-image" src="assets/images/cxr-source.webp" alt="Chest X-ray"><p class="small muted">Please select the finding that best describes this chest X-ray.</p><div class="option-grid">
      <button class="btn dark" data-a1cxr="0">Bilateral perihilar edema</button>
      <button class="btn dark" data-a1cxr="1">Hyperinflation with RLL infiltrates</button>
      <button class="btn dark" data-a1cxr="2">LLL partial lung collapse</button>
      <button class="btn dark" data-a1cxr="3">Right-sided pleural effusion</button>
    </div><div id="a1cxr-feedback" class="question-feedback">請選擇最符合的影像描述。</div></div>`;
    document.querySelectorAll('[data-a1cxr]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.a1cxr==='1';b.classList.add(ok?'correct':'wrong');
      document.getElementById('a1cxr-feedback').textContent=ok?'✓ Hyperinflation with RLL infiltrates':'✕ 請重新觀察胸部 X 光。';
    });
  }
  bindStates();
}

function act1TreatmentMenu(){
  const items=[
    ['維持呼吸道暢通，必要時抽痰','airway'],
    ['藥物治療','medication'],
    ['調整氧氣並密切監測 SpO₂','oxygen'],
    ['心電圖檢查','ekg'],
    ['先給予利尿劑 20 mg IV','diuretic'],
    ['30 分鐘內重新評估呼吸狀況','reassess'],
    ['電腦斷層檢查','ct']
  ];
  const active=state==='ACT1_TX_MEDICATION'?'medication':state==='ACT1_TX_OXYGEN'?'oxygen':state==='ACT1_TX_REASSESS'?'reassess':'';
  return '<div class="eyebrow">左牆｜主要處置</div><h1>主要處置</h1><p class="muted small">選擇目前優先處置，逐步建立 Medical Order Wall。</p><div class="tx-menu">'+items.map(([label,key])=>'<button class="btn '+(active===key?'active ':'')+(key==='airway'?'correct ':'')+'" data-a1tx="'+key+'">'+esc(label)+'</button>').join('')+'</div>';
}
function act1OrderWall(){
  const base=['維持呼吸道暢通，必要時協助清除分泌物'];
  return '<div class="eyebrow">右牆｜Medical Order Wall</div><h2>Medical Order Wall</h2><div class="order-wall">'+base.concat([...act1Orders]).map(x=>'<div class="order">'+esc(x)+'</div>').join('')+'</div>';
}
function renderAct1Treatment(){
  left.innerHTML=act1TreatmentMenu();
  right.innerHTML=act1OrderWall();
  document.querySelectorAll('[data-a1tx]').forEach(b=>b.onclick=()=>handleAct1TxMenu(b.dataset.a1tx));

  if(state==='ACT1_TREATMENT'){
    right.innerHTML+= '<div class="feedback">請依序完成：藥物治療 → 氧氣治療 → 30 分鐘重新評估。</div>';
  }

  if(state==='ACT1_TX_MEDICATION'){
    right.innerHTML+= '<h3>Medication Orders</h3><img class="teaching-image" src="assets/images/medication-options.webp" alt="Medication option photos"><div class="option-grid">'+D.act1.treatment.medicationOptions.map((o,i)=>'<button class="btn dark '+(act1Orders.has(o.label)&&o.correct?'correct':'')+'" data-med="'+i+'">'+esc(o.label)+'</button>').join('')+'</div><div id="act1-feedback" class="feedback">選擇本情境中正確的藥物處置。</div>';
    document.querySelectorAll('[data-med]').forEach(b=>b.onclick=()=>selectAct1(b,D.act1.treatment.medicationOptions[+b.dataset.med]));
  }

  if(state==='ACT1_TX_OXYGEN'){
    right.innerHTML+= '<h3>Oxygen Therapy</h3><img class="teaching-image" src="assets/images/oxygen-options.webp" alt="Oxygen therapy option photos"><div class="option-grid">'+D.act1.treatment.oxygenOptions.map((o,i)=>'<button class="btn dark '+(act1Orders.has(o.label)&&o.correct?'correct':'')+'" data-o2="'+i+'">'+esc(o.label)+'</button>').join('')+'</div><div id="act1-feedback" class="feedback">選擇 controlled oxygen，目標 SpO₂ 88–92%。</div>';
    document.querySelectorAll('[data-o2]').forEach(b=>b.onclick=()=>selectAct1(b,D.act1.treatment.oxygenOptions[+b.dataset.o2]));
  }

  if(state==='ACT1_TX_REASSESS'){
    if(!act1Orders.has(D.act1.treatment.reassessment)) act1Orders.add(D.act1.treatment.reassessment);
    right.innerHTML=act1OrderWall()+'<div class="feedback">✓ '+esc(D.act1.treatment.reassessment)+'</div><button id="show-act1-summary" class="btn dark next-major">查看治療重點 →</button>';
    document.getElementById('show-act1-summary').onclick=()=>setState('ACT1_TREATMENT_SUMMARY');
  }

  if(state==='ACT1_TREATMENT_SUMMARY'){
    const correctMainTreatments=[
      '維持呼吸道暢通，必要時抽痰',
      '藥物治療',
      '調整氧氣並密切監測 SpO₂',
      '30 分鐘內重新評估呼吸狀況'
    ];
    const summary=[
      'Venturi Mask 28%：controlled oxygen，目標 SpO₂ 88–92%',
      'Combivent 2.5 mL via nebulization：短效支氣管擴張',
      'Prednisolone 40 mg PO once daily × 5 days',
      'Ceftriaxone 1 g IV q24h',
      'Airway clearance：鼓勵咳痰，必要時清除分泌物',
      '30 分鐘內重新評估並 repeat ABG'
    ];
    left.innerHTML='<div class="eyebrow">左牆｜主要處置</div><h1>正確主要處置</h1><div class="correct-treatment-list">'+correctMainTreatments.map(x=>'<div class="correct-treatment-item">✓ '+esc(x)+'</div>').join('')+'</div><div class="summary-panel"><h2>治療重點</h2><ul>'+summary.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div>';
    right.innerHTML=act1OrderWall()+'<div class="selected-treatment-grid"><img src="assets/images/medication-options.webp" alt="Selected medication reference"><img src="assets/images/oxygen-options.webp" alt="Selected oxygen reference"></div><button id="to-act2" class="btn dark next-major">6 小時後：進入第二幕 →</button>';
    document.getElementById('to-act2').onclick=()=>setState('ACT2_OVERVIEW');
  }
}
function handleAct1TxMenu(key){
  if(key==='medication') return setState('ACT1_TX_MEDICATION');
  if(key==='oxygen') return setState('ACT1_TX_OXYGEN');
  if(key==='reassess') return setState('ACT1_TX_REASSESS');
  if(key==='airway') return;
  const note=document.querySelector('.feedback');
  if(note) note.textContent='✕ 此項不是附件簡報中的優先處置。';
}
function selectAct1(btn,opt){
  const feedback=document.getElementById('act1-feedback');
  btn.classList.add(opt.correct?'correct':'wrong');
  if(opt.correct){
    act1Orders.add(opt.label);
    if(feedback)feedback.textContent='✓ Correct order added to Medical Order Wall.';
  }else{
    if(feedback)feedback.textContent='✕ This order is not selected in the approved scenario.';
  }
  if(opt.correct){
    setTimeout(()=>renderAct1Treatment(),120);
  }
}
function act2Left(done=false){if(done)return '<div class="eyebrow">Treatment Response</div><h1>NIV 後病人逐步改善</h1><div class="card"><ul class="status-list">'+D.act2.response.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><h3>Treatment Summary</h3><div class="card"><p>'+D.act2.confirmed.map(esc).join('<br>')+'</p></div>';return '<div class="eyebrow">Act 2｜6 hours later</div><h1>病況改變｜6 小時後</h1><div class="card"><ul class="status-list">'+D.act2.status.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><h3>已完成治療</h3><div class="card"><p>'+D.act2.completed.map(esc).join('<br>')+'</p></div><div class="card warning"><h3>持續惡化警訊</h3><p>SpO₂ 83%<br>已在 controlled oxygen 下，仍明顯呼吸費力</p></div>';}
function monitor(src){return '<div class="eyebrow">Dynamic Vital Monitor</div><div id="monitor-slot"></div>';}
function mountMonitor(src){const s=document.getElementById('monitor-slot');if(s)s.appendChild(createVideo(src,'monitor-video'));}
function overview(){right.innerHTML=monitor(M.act2Monitor)+'<h2>重新評估</h2><div class="option-grid"><button class="btn dark" data-state="ACT2_LUNG_SOUND">Lung Sound</button><button class="btn dark" data-state="ACT2_ABG">ABG</button><button class="btn dark" data-state="ACT2_TREATMENT">Main Treatment</button></div>';mountMonitor(M.act2Monitor);bindStates();}
function lung(){right.innerHTML=monitor(M.act2Monitor)+'<h2>Lung Sound</h2><div class="lung-audio-controls"><button id="play-lung" class="btn dark">▶ Play respiratory sound</button><button id="pause-lung" class="btn dark">⏸ Pause</button></div><div class="option-grid" style="margin-top:14px">'+D.act2.lungOptions.map((x,i)=>'<button class="btn dark" data-lung="'+i+'">'+esc(x)+'</button>').join('')+'</div><div id="feedback" class="feedback">Select the best description.</div>';mountMonitor(M.act2Monitor);document.getElementById('play-lung').onclick=()=>playLungAudio('feedback');document.getElementById('pause-lung').onclick=pauseLungAudio;document.querySelectorAll('[data-lung]').forEach(b=>b.onclick=()=>{const ans=D.act2.lungOptions[+b.dataset.lung],ok=ans===D.act2.lungCorrect;b.classList.add(ok?'correct':'wrong');document.getElementById('feedback').textContent=ok?'✓ '+D.act2.lungCorrect:'✕ Reassess airflow limitation in worsening AECOPD.';});}
function abg(){right.innerHTML=monitor(M.act2Monitor)+'<h2>ABG</h2><div class="badge-row">'+D.act2.abg.map(x=>'<span class="badge">'+esc(x)+'</span>').join('')+'</div><div class="option-grid" style="margin-top:16px">'+D.act2.abgOptions.map((x,i)=>'<button class="btn dark" data-abg="'+i+'">'+esc(x)+'</button>').join('')+'</div><div id="feedback" class="feedback">Interpret the ABG.</div>';mountMonitor(M.act2Monitor);document.querySelectorAll('[data-abg]').forEach(b=>b.onclick=()=>{const ans=D.act2.abgOptions[+b.dataset.abg],ok=ans===D.act2.abgCorrect;b.classList.add(ok?'correct':'wrong');document.getElementById('feedback').textContent=ok?'✓ '+D.act2.abgCorrect:'✕ Re-integrate pH, PaCO₂ and HCO₃⁻.';});}
function treatment(){txSelected.clear();right.innerHTML=monitor(M.act2Monitor)+'<h2>Main Treatment</h2><p class="small muted">請選擇目前優先處置。</p><div class="option-grid">'+D.act2.treatmentOptions.map((x,i)=>'<button class="btn dark" data-tx="'+i+'">'+esc(x.label)+'</button>').join('')+'</div><div id="feedback" class="feedback">Select the four core immediate treatments.</div>';mountMonitor(M.act2Monitor);document.querySelectorAll('[data-tx]').forEach(b=>b.onclick=()=>selectTx(b,+b.dataset.tx));}
function selectTx(btn,i){const o=D.act2.treatmentOptions[i];if(o.correct===true){txSelected.add(i);btn.classList.add('correct');}else if(o.correct==='followup'){btn.classList.add('active');document.getElementById('feedback').textContent='Follow-up ABG is an important reassessment step after NIV.';return;}else btn.classList.add('wrong');if(txSelected.size===4){document.getElementById('feedback').textContent='✓ Core treatment selections confirmed. Preparing NIV.';setTimeout(()=>setState('ACT2_TREATMENT_CONFIRMED'),900);}}
function confirmed(){const correct=D.act2.treatmentOptions.filter(o=>o.correct===true);right.innerHTML=monitor(M.act2Monitor)+'<h2>主要處置｜正確處置確認</h2><div class="order-wall">'+correct.map(o=>'<div class="order correct-order">✓ '+esc(o.label)+'</div>').join('')+'</div><div class="feedback">正確處置確認：準備啟動 NIV</div><button id="start-niv" class="btn dark next-major">▶ 啟動 NIV → 查看治療後狀態</button>';mountMonitor(M.act2Monitor);document.getElementById('start-niv').onclick=()=>setState('ACT2_NIV_RESPONSE');}
function niv(){right.innerHTML='<div class="eyebrow">NIV 後動態監測</div>'+monitor(M.nivMonitor)+'<h2>Confirmed orders</h2><div class="order-wall">'+D.act2.confirmed.map(x=>'<div class="order">✓ '+esc(x)+'</div>').join('')+'</div><div class="completion-banner">AECOPD Scenario v1.0｜NIV initiated｜病人安靜休息，呼吸逐步平穩</div><button id="open-survey" class="btn dark next-major">完成教案｜填寫 5 題學習滿意度 →</button>';mountMonitor(M.nivMonitor);document.getElementById('open-survey').onclick=openSatisfactionSurvey;}
function setState(s){pauseLungAudio();state=s;addEvidence(s);renderCenter();if(s.startsWith('ACT1_'))renderAct1();else{left.innerHTML=act2Left(s==='ACT2_NIV_RESPONSE');if(s==='ACT2_OVERVIEW')overview();if(s==='ACT2_LUNG_SOUND')lung();if(s==='ACT2_ABG')abg();if(s==='ACT2_TREATMENT')treatment();if(s==='ACT2_TREATMENT_CONFIRMED')confirmed();if(s==='ACT2_NIV_RESPONSE')niv();}updateStepUI();}

const instructorSteps=['ACT1_START','ACT1_VITALS','ACT1_ABG','ACT1_OXYGEN','ACT1_LUNG_SOUND','ACT1_CXR','ACT1_TREATMENT','ACT1_TX_MEDICATION','ACT1_TX_OXYGEN','ACT1_TX_REASSESS','ACT1_TREATMENT_SUMMARY','ACT2_OVERVIEW','ACT2_LUNG_SOUND','ACT2_ABG','ACT2_TREATMENT','ACT2_TREATMENT_CONFIRMED','ACT2_NIV_RESPONSE'];
function updateStepUI(){
  const i=instructorSteps.indexOf(state),label=document.getElementById('step-label');
  if(label)label.textContent=i>=0?'Step '+(i+1)+' / '+instructorSteps.length:'Step';
  const p=document.getElementById('prev-step-btn'),n=document.getElementById('next-step-btn');
  if(p)p.disabled=i<=0;if(n)n.disabled=i<0||i>=instructorSteps.length-1;
}
function moveStep(delta){const i=instructorSteps.indexOf(state);if(i<0)return;const ni=Math.max(0,Math.min(instructorSteps.length-1,i+delta));setState(instructorSteps[ni]);}
function generateSessionCode(){
  const d=new Date(),mm=String(d.getMonth()+1).padStart(2,'0'),dd=String(d.getDate()).padStart(2,'0');
  const n=Math.floor(100+Math.random()*900);
  return 'G8-AECOPD-'+mm+dd+'-'+n;
}
function renderSurveyQuestions(){
  const root=document.getElementById('survey-questions');
  if(!root)return;
  const questions=satisfactionQuestionSets[selectedSurveyVersion];
  root.innerHTML=questions.map((q,i)=>'<div class="survey-question"><div class="qtext">'+(i+1)+'. '+esc(q)+'</div><div class="likert-row">'+[1,2,3,4,5].map(v=>'<label class="likert-option"><input type="radio" name="q'+(i+1)+'" value="'+v+'"><span>'+v+'</span></label>').join('')+'</div></div>').join('');
}
function initSessionForm(){
  const code=document.getElementById('session-code');
  if(code&&!code.value)code.value=generateSessionCode();
  document.getElementById('regen-code').onclick=()=>{code.value=generateSessionCode();};
  document.getElementById('session-form').onsubmit=e=>{
    e.preventDefault();
    const professions=[...document.querySelectorAll('input[name="profession"]:checked')].map(x=>x.value);
    const role=document.getElementById('participant-role').value;
    const count=Number(document.getElementById('participant-count').value);
    const err=document.getElementById('login-error');
    if(!professions.length){err.textContent='請至少選擇 1 個參與職類。';return;}
    if(!role){err.textContent='請選擇身份。';return;}
    if(!Number.isFinite(count)||count<1||count>5){err.textContent='參與人數請選擇 1–5 人。';return;}
    err.textContent='';
    sessionMeta={code:code.value,count,professions,role,startedAt:new Date().toISOString()};
    localStorage.setItem('gener8AECOPDSession',JSON.stringify(sessionMeta));
    document.getElementById('login-overlay').classList.add('hidden');
    document.body.classList.remove('prelogin');
  };
}
function openSatisfactionSurvey(){
  renderSurveyQuestions();
  document.getElementById('survey-overlay').classList.remove('hidden');
}
function initSurvey(){
  document.querySelectorAll('[data-survey-version]').forEach(b=>b.onclick=()=>{
    selectedSurveyVersion=b.dataset.surveyVersion;
    document.querySelectorAll('[data-survey-version]').forEach(x=>x.classList.toggle('active',x===b));
    renderSurveyQuestions();
    document.getElementById('survey-error').textContent='';
  });
  document.getElementById('survey-form').onsubmit=e=>{
    e.preventDefault();
    const questions=satisfactionQuestionSets[selectedSurveyVersion];const answers=questions.map((_,i)=>Number(document.querySelector('input[name="q'+(i+1)+'"]:checked')?.value||0));
    const err=document.getElementById('survey-error');
    if(answers.some(v=>!v)){err.textContent='請完成 5 題後再送出。';return;}
    err.textContent='';
    const average=answers.reduce((a,b)=>a+b,0)/answers.length;
    const payload={session:sessionMeta||JSON.parse(localStorage.getItem('gener8AECOPDSession')||'null'),surveyVersion:selectedSurveyVersion,questions,answers,average:Number(average.toFixed(2)),submittedAt:new Date().toISOString()};
    localStorage.setItem('gener8AECOPDLastSurvey',JSON.stringify(payload));
    document.getElementById('survey-overlay').classList.add('hidden');
    document.getElementById('survey-summary').innerHTML='<strong>參加代號：</strong>'+esc(payload.session?.code||'—')+'<br><strong>問卷版本：</strong>'+esc(payload.surveyVersion)+'<br><strong>5 題平均：</strong>'+payload.average+' / 5';
    document.getElementById('survey-thankyou').classList.remove('hidden');
  };
  document.getElementById('close-thankyou').onclick=()=>document.getElementById('survey-thankyou').classList.add('hidden');
}
function applySensitivity(level){
  sensitivity=level;
  document.body.dataset.sensitivity=level;
  localStorage.setItem('gener8InteractionSensitivity',level);
  const b=document.getElementById('sensitivity-btn');
  if(b){
    b.dataset.level=level;
    b.textContent='Sensitivity: '+sensitivitySettings[level].label;
    b.title='Gener8 interaction sensitivity — '+sensitivitySettings[level].label;
  }
}
function cycleSensitivity(){
  const i=sensitivityLevels.indexOf(sensitivity);
  applySensitivity(sensitivityLevels[(i+1)%sensitivityLevels.length]);
}
document.addEventListener('click',e=>{
  const interactive=e.target.closest('.btn,#toolbar button');
  if(!interactive||interactive.id==='sensitivity-btn') return;
  const now=performance.now();
  const wait=sensitivitySettings[sensitivity].cooldown;
  if(now-lastInteractionAt<wait){
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  lastInteractionAt=now;
},true);
document.addEventListener('pointerenter',e=>{
  const b=e.target.closest('.btn');
  if(b) b.classList.add('sensor-focus');
},true);
document.addEventListener('pointerleave',e=>{
  const b=e.target.closest('.btn');
  if(b) b.classList.remove('sensor-focus');
},true);
function scale(){stage.style.transform='scale('+Math.min(innerWidth/5760,innerHeight/1080)+')';}function fullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();}
document.querySelectorAll('#toolbar [data-jump]').forEach(b=>b.onclick=()=>setState(b.dataset.jump));document.getElementById('prev-step-btn').onclick=()=>moveStep(-1);document.getElementById('next-step-btn').onclick=()=>moveStep(1);document.getElementById('patient-sound-btn').onclick=togglePatientSound;document.getElementById('sensitivity-btn').onclick=cycleSensitivity;document.getElementById('fullscreen-btn').onclick=fullscreen;addEventListener('resize',scale);addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='1')setState('ACT1_START');if(k==='2')setState('ACT2_OVERVIEW');if(k==='f')fullscreen();if(k==='s')cycleSensitivity();if(e.key==='ArrowLeft')moveStep(-1);if(e.key==='ArrowRight')moveStep(1);});
window.Gener8AECOPD={setState,getState:()=>state,setSensitivity:applySensitivity,getSensitivity:()=>sensitivity,togglePatientSound,openSatisfactionSurvey};initSessionForm();initSurvey();applySensitivity(sensitivity);updatePatientSoundUI();scale();setState(D.states.ACT1_START);
})();