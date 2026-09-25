window.AECOPD_DATA=Object.freeze({
version:'AECOPD Scenario v1.0',
states:{ACT1_START:'ACT1_START',ACT1_VITALS:'ACT1_VITALS',ACT1_ABG:'ACT1_ABG',ACT1_OXYGEN:'ACT1_OXYGEN',ACT1_LUNG_SOUND:'ACT1_LUNG_SOUND',ACT1_CXR:'ACT1_CXR',ACT1_TREATMENT:'ACT1_TREATMENT',ACT2_OVERVIEW:'ACT2_OVERVIEW',ACT2_LUNG_SOUND:'ACT2_LUNG_SOUND',ACT2_ABG:'ACT2_ABG',ACT2_TREATMENT:'ACT2_TREATMENT',ACT2_TREATMENT_CONFIRMED:'ACT2_TREATMENT_CONFIRMED',ACT2_NIV_RESPONSE:'ACT2_NIV_RESPONSE'},
patient:{background:['68 歲男性','170 cm / 60 kg','AECOPD','昨天住急診入院','今日頻咳、痰黃']},
act1:{categories:['Vital Signs','ABG','Oxygen Therapy','Lung Sound','CXR','Main Treatment'],evidence:{
vitals:{title:'Vital Signs',lines:['T 37.0°C','BP 136/82','HR 110/min','RR 23/min','SpO₂ 90%','Consciousness: Alert']},
abg:{title:'ABG – ED admission',lines:['pH 7.39','PaCO₂ 55 mmHg','PaO₂ 65 mmHg','HCO₃⁻ 30 mEq/L','SaO₂ 91%']},
oxygen:{title:'Oxygen',lines:['Nasal cannula 2 LPM','SpO₂ 89%']},
lung:{title:'Breathing Sound',lines:['Bilateral expiratory wheezing']},
cxr:{title:'CXR',lines:['Hyperinflation with RLL infiltrates']}},
treatment:{instruction:'Only correct treatment orders are added to the Medical Order Wall.',airway:'維持呼吸道通暢，必要時協助清除分泌物',
medicationOptions:[{label:'Furosemide',correct:false},{label:'Combivent 2.5 mL via nebulization Q6h PRN',correct:true},{label:'Fluticasone',correct:false},{label:'Ceftriaxone 1 g IV q24h',correct:true},{label:'Inderal',correct:false},{label:'Aminophylline',correct:false}],
oxygenOptions:[{label:'NC 1 LPM',correct:false},{label:'Venturi Mask 28% — controlled oxygen, target SpO₂ 88–92%',correct:true},{label:'Aerosol Mask 35%',correct:false},{label:'Non-rebreathing Mask 10–15 LPM',correct:false}],reassessment:'30 分鐘內重新評估呼吸狀況'}},
act2:{status:['Alert，但疲倦、焦慮','只能說短句','呼吸費力，使用 accessory muscles','Venturi Mask 28%，SpO₂ 83%'],completed:['Airway clearance','Combivent nebulization','Ceftriaxone 1 g IV q24h','Venturi Mask 28%'],
lungOptions:['Bilateral basal crackles','Bilateral expiratory wheezing with decreased air entry','Unilateral absent breath sound','Inspiratory stridor'],lungCorrect:'Bilateral expiratory wheezing with decreased air entry',
abg:['pH 7.30','PaCO₂ 68','PaO₂ 52','HCO₃⁻ 34','SaO₂ 83%'],abgOptions:['Compensated chronic respiratory acidosis','Acute-on-chronic hypercapnic respiratory failure with respiratory acidosis','Acute hypoxemic respiratory failure','Compensated chronic metabolic acidosis'],abgCorrect:'Acute-on-chronic hypercapnic respiratory failure with respiratory acidosis',
treatmentOptions:[{label:'Second bronchodilator treatment',correct:true},{label:'EKG / BNP evaluation',correct:false},{label:'Airway clearance',correct:true},{label:'Follow-up ABG',correct:'followup'},{label:'Non-Rebreathing Mask',correct:false},{label:'Non-invasive Ventilation',correct:true},{label:'High-Flow Oxygen nasal cannula',correct:false},{label:'Prednisolone 40 mg PO once daily × 5 days',correct:true}],
response:['Respiratory rate improves to 18–20/min','SpO₂ improves to 90–93%','Work of breathing decreases','Patient appears more comfortable and able to rest'],confirmed:['Initiate NIV','Repeat bronchodilator','Airway clearance','Follow-up ABG / close monitoring','Prednisolone 40 mg PO daily × 5 days']}});