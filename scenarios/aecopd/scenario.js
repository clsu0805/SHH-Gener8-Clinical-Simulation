(()=>{'use strict';
const D=window.AECOPD_DATA,M=window.MEDIA_MANIFEST;
const left=document.getElementById('left-wall'),center=document.getElementById('center-wall'),right=document.getElementById('right-wall'),stage=document.getElementById('stage');
let state=D.states.ACT1_START,evidence=new Set(),act1Orders=new Set(),txSelected=new Set();
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
const mediaForState={ACT1_START:M.act1InitialPatient,ACT1_VITALS:M.act1VitalsPatient,ACT1_ABG:M.act1EvidencePatient,ACT1_OXYGEN:M.act1EvidencePatient,ACT1_LUNG_SOUND:M.act1EvidencePatient,ACT1_CXR:M.act1EvidencePatient,ACT1_TREATMENT:M.act1EvidencePatient,ACT2_OVERVIEW:M.act2IntroPatient,ACT2_LUNG_SOUND:M.act2Patient,ACT2_ABG:M.act2Patient,ACT2_TREATMENT:M.act2Patient,ACT2_TREATMENT_CONFIRMED:M.act2Patient,ACT2_NIV_RESPONSE:M.nivPatient};
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
function addEvidence(s){const m={ACT1_VITALS:'vitals',ACT1_ABG:'abg',ACT1_OXYGEN:'oxygen',ACT1_LUNG_SOUND:'lung',ACT1_CXR:'cxr'};if(m[s])evidence.add(m[s]);}
function bindStates(){document.querySelectorAll('[data-state]').forEach(b=>b.onclick=()=>setState(b.dataset.state));}
function renderAct1(){
  left.innerHTML=patientBackground()+act1Controls();
  if(state==='ACT1_TREATMENT')renderAct1Treatment(); else right.innerHTML=evidenceCards();

  if(state==='ACT1_LUNG_SOUND'){
    left.innerHTML+=`<div class="question-panel"><h3>呼吸音題</h3><p class="small muted">請聽病人的呼吸音，選擇最符合的呼吸音。</p><button id="play-act1-lung" class="btn dark">▶ 播放呼吸音</button><div class="option-grid" style="margin-top:12px">
      <button class="btn dark" data-a1lung="0">Unilateral decreased breath sounds</button>
      <button class="btn dark" data-a1lung="1">Bilateral expiratory wheezing</button>
      <button class="btn dark" data-a1lung="2">Bilateral basal crackles</button>
      <button class="btn dark" data-a1lung="3">Inspiratory stridor</button>
    </div><div id="a1lung-feedback" class="question-feedback">請先播放呼吸音再作答。</div></div>`;
    document.getElementById('play-act1-lung').onclick=()=>new Audio(M.lungSound).play().catch(()=>{document.getElementById('a1lung-feedback').textContent='音訊被瀏覽器阻擋，請再點一次播放。';});
    document.querySelectorAll('[data-a1lung]').forEach(b=>b.onclick=()=>{
      const ok=b.dataset.a1lung==='1';b.classList.add(ok?'correct':'wrong');
      document.getElementById('a1lung-feedback').textContent=ok?'✓ Bilateral expiratory wheezing':'✕ 請重新聽診並判斷。';
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
function renderAct1Treatment(){right.innerHTML='<div class="eyebrow">Medical Order Wall</div><h2>Medical Order Wall</h2><div class="order-wall"><div class="order">'+esc(D.act1.treatment.airway)+'</div>'+[...act1Orders].map(x=>'<div class="order">'+esc(x)+'</div>').join('')+'</div><h3>Medication Orders</h3><img class="teaching-image" src="assets/images/medication-options.webp" alt="Medication option photos"><div class="option-grid">'+D.act1.treatment.medicationOptions.map((o,i)=>'<button class="btn dark" data-med="'+i+'">'+esc(o.label)+'</button>').join('')+'</div><h3>Oxygen Therapy</h3><img class="teaching-image" src="assets/images/oxygen-options.webp" alt="Oxygen therapy option photos"><div class="option-grid">'+D.act1.treatment.oxygenOptions.map((o,i)=>'<button class="btn dark" data-o2="'+i+'">'+esc(o.label)+'</button>').join('')+'</div><div id="act1-feedback" class="feedback">'+esc(D.act1.treatment.instruction)+'</div><button id="act1-complete" class="btn dark disabled" style="margin-top:14px">30-min reassessment → Act 2</button>';
document.querySelectorAll('[data-med]').forEach(b=>b.onclick=()=>selectAct1(b,D.act1.treatment.medicationOptions[+b.dataset.med]));
document.querySelectorAll('[data-o2]').forEach(b=>b.onclick=()=>selectAct1(b,D.act1.treatment.oxygenOptions[+b.dataset.o2]));updateAct1Complete();}
function selectAct1(btn,opt){btn.classList.add(opt.correct?'correct':'wrong');if(opt.correct){act1Orders.add(opt.label);document.getElementById('act1-feedback').textContent='✓ Correct order added to Medical Order Wall.';}else document.getElementById('act1-feedback').textContent='✕ This order is not selected in the approved scenario.';renderAct1Treatment();}
function updateAct1Complete(){const need=['Combivent 2.5 mL via nebulization Q6h PRN','Ceftriaxone 1 g IV q24h','Venturi Mask 28% — controlled oxygen, target SpO₂ 88–92%'];const ok=need.every(x=>act1Orders.has(x)),b=document.getElementById('act1-complete');if(ok){b.classList.remove('disabled');b.textContent=D.act1.treatment.reassessment+' → 6 hours later';b.onclick=()=>{mediaForState.ACT1_TREATMENT=M.act1PostTreatmentPatient;renderCenter();setTimeout(()=>setState('ACT2_OVERVIEW'),300);};}}
function act2Left(done=false){if(done)return '<div class="eyebrow">Treatment Response</div><h1>NIV 後病人逐步改善</h1><div class="card"><ul class="status-list">'+D.act2.response.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><h3>Treatment Summary</h3><div class="card"><p>'+D.act2.confirmed.map(esc).join('<br>')+'</p></div>';return '<div class="eyebrow">Act 2｜6 hours later</div><h1>病況改變｜6 小時後</h1><div class="card"><ul class="status-list">'+D.act2.status.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><h3>已完成治療</h3><div class="card"><p>'+D.act2.completed.map(esc).join('<br>')+'</p></div><div class="card warning"><h3>持續惡化警訊</h3><p>SpO₂ 83%<br>已在 controlled oxygen 下，仍明顯呼吸費力</p></div>';}
function monitor(src){return '<div class="eyebrow">Dynamic Vital Monitor</div><div id="monitor-slot"></div>';}
function mountMonitor(src){const s=document.getElementById('monitor-slot');if(s)s.appendChild(createVideo(src,'monitor-video'));}
function overview(){right.innerHTML=monitor(M.act2Monitor)+'<h2>重新評估</h2><div class="option-grid"><button class="btn dark" data-state="ACT2_LUNG_SOUND">Lung Sound</button><button class="btn dark" data-state="ACT2_ABG">ABG</button><button class="btn dark" data-state="ACT2_TREATMENT">Main Treatment</button></div>';mountMonitor(M.act2Monitor);bindStates();}
function lung(){right.innerHTML=monitor(M.act2Monitor)+'<h2>Lung Sound</h2><button id="play-lung" class="btn dark">▶ Play respiratory sound</button><div class="option-grid" style="margin-top:14px">'+D.act2.lungOptions.map((x,i)=>'<button class="btn dark" data-lung="'+i+'">'+esc(x)+'</button>').join('')+'</div><div id="feedback" class="feedback">Select the best description.</div>';mountMonitor(M.act2Monitor);document.getElementById('play-lung').onclick=()=>new Audio(M.lungSound).play().catch(()=>document.getElementById('feedback').textContent='Audio playback blocked. Click Play again.');document.querySelectorAll('[data-lung]').forEach(b=>b.onclick=()=>{const ans=D.act2.lungOptions[+b.dataset.lung],ok=ans===D.act2.lungCorrect;b.classList.add(ok?'correct':'wrong');document.getElementById('feedback').textContent=ok?'✓ '+D.act2.lungCorrect:'✕ Reassess airflow limitation in worsening AECOPD.';});}
function abg(){right.innerHTML=monitor(M.act2Monitor)+'<h2>ABG</h2><div class="badge-row">'+D.act2.abg.map(x=>'<span class="badge">'+esc(x)+'</span>').join('')+'</div><div class="option-grid" style="margin-top:16px">'+D.act2.abgOptions.map((x,i)=>'<button class="btn dark" data-abg="'+i+'">'+esc(x)+'</button>').join('')+'</div><div id="feedback" class="feedback">Interpret the ABG.</div>';mountMonitor(M.act2Monitor);document.querySelectorAll('[data-abg]').forEach(b=>b.onclick=()=>{const ans=D.act2.abgOptions[+b.dataset.abg],ok=ans===D.act2.abgCorrect;b.classList.add(ok?'correct':'wrong');document.getElementById('feedback').textContent=ok?'✓ '+D.act2.abgCorrect:'✕ Re-integrate pH, PaCO₂ and HCO₃⁻.';});}
function treatment(){txSelected.clear();right.innerHTML=monitor(M.act2Monitor)+'<h2>Main Treatment</h2><p class="small muted">請選擇目前優先處置。</p><div class="option-grid">'+D.act2.treatmentOptions.map((x,i)=>'<button class="btn dark" data-tx="'+i+'">'+esc(x.label)+'</button>').join('')+'</div><div id="feedback" class="feedback">Select the four core immediate treatments.</div>';mountMonitor(M.act2Monitor);document.querySelectorAll('[data-tx]').forEach(b=>b.onclick=()=>selectTx(b,+b.dataset.tx));}
function selectTx(btn,i){const o=D.act2.treatmentOptions[i];if(o.correct===true){txSelected.add(i);btn.classList.add('correct');}else if(o.correct==='followup'){btn.classList.add('active');document.getElementById('feedback').textContent='Follow-up ABG is an important reassessment step after NIV.';return;}else btn.classList.add('wrong');if(txSelected.size===4){document.getElementById('feedback').textContent='✓ Core treatment selections confirmed. Preparing NIV.';setTimeout(()=>setState('ACT2_TREATMENT_CONFIRMED'),900);}}
function confirmed(){right.innerHTML=monitor(M.act2Monitor)+'<h2>Main Treatment</h2><div class="order-wall">'+D.act2.treatmentOptions.map(o=>'<div class="order">'+(o.correct===true?'✓ ':o.correct===false?'✕ ':'↻ ')+esc(o.label)+'</div>').join('')+'</div><button id="start-niv" class="btn dark" style="margin-top:15px">Initiate NIV</button>';mountMonitor(M.act2Monitor);document.getElementById('start-niv').onclick=()=>setState('ACT2_NIV_RESPONSE');}
function niv(){right.innerHTML=monitor(M.nivMonitor)+'<h2>Confirmed Orders</h2><div class="order-wall">'+D.act2.confirmed.map(x=>'<div class="order">✓ '+esc(x)+'</div>').join('')+'</div>';mountMonitor(M.nivMonitor);}
function setState(s){state=s;addEvidence(s);renderCenter();if(s.startsWith('ACT1_'))renderAct1();else{left.innerHTML=act2Left(s==='ACT2_NIV_RESPONSE');if(s==='ACT2_OVERVIEW')overview();if(s==='ACT2_LUNG_SOUND')lung();if(s==='ACT2_ABG')abg();if(s==='ACT2_TREATMENT')treatment();if(s==='ACT2_TREATMENT_CONFIRMED')confirmed();if(s==='ACT2_NIV_RESPONSE')niv();}}
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
document.querySelectorAll('#toolbar [data-jump]').forEach(b=>b.onclick=()=>setState(b.dataset.jump));document.getElementById('patient-sound-btn').onclick=togglePatientSound;document.getElementById('sensitivity-btn').onclick=cycleSensitivity;document.getElementById('fullscreen-btn').onclick=fullscreen;addEventListener('resize',scale);addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='1')setState('ACT1_START');if(k==='2')setState('ACT2_OVERVIEW');if(k==='f')fullscreen();if(k==='s')cycleSensitivity();});
window.Gener8AECOPD={setState,getState:()=>state,setSensitivity:applySensitivity,getSensitivity:()=>sensitivity,togglePatientSound};applySensitivity(sensitivity);updatePatientSoundUI();scale();setState(D.states.ACT1_START);
})();