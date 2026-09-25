# AECOPD Scenario v1.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Upgrade the current AECOPD prototype into **AECOPD Scenario v1.0**, preserving the approved PowerPoint clinical content and using the original patient video, respiratory audio, and monitor media.

**Architecture:** Keep the Gener8 homepage as the scenario library. Refactor `scenarios/aecopd/` into a self-contained static web package with separate HTML, CSS, JavaScript, scenario data, a media manifest, and extracted source media. The scenario remains one 5760×1080 three-wall stage controlled by explicit scenario states.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, HTML5 video/audio, Node built-in static tests, GitHub repository hosting, local web-server compatibility.

**Spec:** `docs/superpowers/specs/2026-09-25-aecopd-scenario-v1-design.md`

## Global Constraints

- The approved PowerPoint is the clinical source of truth.
- Final learner-visible label is exactly **AECOPD Scenario v1.0**.
- v0.2 and v0.3 are development milestones only and remain in Git history.
- Stage size remains 5760×1080 with three 1920×1080 walls.
- Original embedded MP4 patient media must be used. PNG/JPG screenshots, extracted frames, emoji, or generic substitutes do not satisfy v1.0.
- Relative paths only; no CDN dependency.
- No real patient identifiers or PHI.
- Do not invent first-act values not supported by the source deck.

## Review Focus

1. Patient-video regression to still images.
2. Browser autoplay restrictions hiding patient video.
3. Missing media paths producing blank walls.
4. Lung Sound / ABG / treatment answer-key drift.
5. Three-wall scaling errors.

---

### Task 1: Refactor the AECOPD package and add a static test harness

**Files**
- Modify: `scenarios/aecopd/index.html`
- Create: `scenarios/aecopd/scenario.css`
- Create: `scenarios/aecopd/scenario.js`
- Create: `scenarios/aecopd/data/scenario-data.js`
- Create: `tests/aecopd-static-check.mjs`

**Interfaces**
- Produces `window.AECOPD_DATA` and `window.Gener8AECOPD`.
- Keeps wall IDs `left-wall`, `center-wall`, `right-wall`.

- [ ] Write a failing Node test that reads the static files and asserts:
  - `index.html` links `scenario.css`
  - `index.html` loads `data/scenario-data.js`
  - `index.html` loads `scenario.js`
  - all three wall IDs exist
  - `AECOPD Scenario v1.0` is present
- [ ] Run `node tests/aecopd-static-check.mjs`; expected FAIL.
- [ ] Split monolithic HTML into focused files.
- [ ] Re-run the test; expected PASS.
- [ ] Commit: `refactor: structure AECOPD scenario package`.

---

### Task 2: Implement v0.2 — complete Act 1

**Files**
- Modify: `scenarios/aecopd/data/scenario-data.js`
- Modify: `scenarios/aecopd/scenario.js`
- Modify: `scenarios/aecopd/scenario.css`
- Modify: `tests/aecopd-static-check.mjs`

**Interfaces**
- Produces Act 1 states:
  - `ACT1_START`
  - `ACT1_VITALS`
  - `ACT1_ABG`
  - `ACT1_OXYGEN`
  - `ACT1_LUNG_SOUND`
  - `ACT1_CXR`
  - `ACT1_TREATMENT`

- [ ] Extend the test to require the six approved categories: Vital Signs, ABG, Oxygen Therapy, Lung Sound, CXR, Main Treatment.
- [ ] Run the test; expected FAIL.
- [ ] Transcribe exact first-act content, values, options, evidence, and answer logic from the approved deck.
- [ ] Build the Clinical Evidence Board so evidence appears/accumulates on the right wall without PowerPoint-style page switching.
- [ ] Preserve source-approved progression to Main Treatment and Act 2.
- [ ] Run the test; expected PASS.
- [ ] Commit milestone: `feat: complete AECOPD Act 1 milestone v0.2`.

---

### Task 3: Extract and map original PowerPoint media

**Files**
- Create: `scenarios/aecopd/assets/video/`
- Create: `scenarios/aecopd/assets/audio/`
- Create: `scenarios/aecopd/data/media-manifest.js`
- Modify: `tests/aecopd-static-check.mjs`

**Interfaces**
- Produces media manifest keys:
  - `act1Patient`
  - `act2Patient`
  - `nivPatient`
  - monitor mappings
  - `lungSound`

- [ ] Add failing tests requiring all patient mappings to end in `.mp4`, the respiratory sound to exist, and all referenced files to exist.
- [ ] Extract the verified source assets from the PowerPoint:
  - `media1.mp4` — slides 2–3
  - `media2.mp4` — slides 4–5
  - `media3.mp4` — slides 6–11
  - `media4.m4a` — slide 6 respiratory audio
  - `media5.mp4` — slide 12
  - `media6.mp4` — slides 13–17
  - `media7.mp4` — slide 13
  - `media8.mp4` — slides 14–17
  - `media9.mp4` — slide 18
  - `media10.mp4` — slide 18
- [ ] Visually inspect each MP4 and record whether it is patient-state video or monitor-state video.
- [ ] Store the mapping in `media-manifest.js`.
- [ ] Run tests; expected PASS only when every media path exists.
- [ ] Commit: `feat: map original AECOPD media assets`.

---

### Task 4: Implement v0.3 — actual video/audio/monitor playback

**Files**
- Modify: `scenarios/aecopd/index.html`
- Modify: `scenarios/aecopd/scenario.js`
- Modify: `scenarios/aecopd/scenario.css`
- Modify: `tests/aecopd-static-check.mjs`

**Interfaces**
- Consumes the media manifest.
- Produces active HTML5 video/audio playback.

- [ ] Add failing tests asserting:
  - scenario code creates or uses `<video>`
  - patient media comes from the media manifest
  - no emoji patient placeholder remains
  - no patient-state PNG/JPG fallback exists
- [ ] Implement center-wall patient video with `autoplay`, `loop`, `playsinline`, and muted looping where required for browser compatibility.
- [ ] On video `error`, display a visible instructor-facing media error and **do not** substitute a screenshot.
- [ ] Implement user-triggered playback of the approved respiratory audio.
- [ ] Implement original monitor video/state playback where mapped from the deck.
- [ ] Run tests; expected PASS.
- [ ] Commit milestone: `feat: integrate original AECOPD video audio and monitor v0.3`.

---

### Task 5: Finalize Act 2 clinical logic

**Files**
- Modify: `scenarios/aecopd/data/scenario-data.js`
- Modify: `scenarios/aecopd/scenario.js`
- Modify: `tests/aecopd-static-check.mjs`

**Interfaces**
- Produces `ACT2_OVERVIEW`, `ACT2_LUNG_SOUND`, `ACT2_ABG`, `ACT2_TREATMENT`, `ACT2_TREATMENT_CONFIRMED`, `ACT2_NIV_RESPONSE`.

- [ ] Add exact regression checks for:
  - pH 7.30
  - PaCO2 68
  - PaO2 52
  - HCO3 34
  - SaO2 83%
  - Bilateral expiratory wheezing with decreased air entry
  - Acute-on-chronic hypercapnic respiratory failure with respiratory acidosis
- [ ] Require the four core treatments:
  - second bronchodilator
  - airway clearance
  - non-invasive ventilation
  - Prednisolone 40 mg PO once daily × 5 days
- [ ] Keep follow-up ABG as a post-NIV reassessment step.
- [ ] Preserve NIV improvement:
  - RR 18–20/min
  - SpO2 90–93%
  - reduced work of breathing
  - improved comfort/rest
- [ ] Run regression tests; expected PASS.
- [ ] Commit: `feat: finalize AECOPD Act 2 clinical logic`.

---

### Task 6: Apply learner-facing v1.0 labeling and homepage integration

**Files**
- Modify: `index.html`
- Modify: `scenarios/aecopd/index.html`
- Modify: `scenarios/aecopd/scenario.css`
- Modify: `README.md`
- Modify: `tests/aecopd-static-check.mjs`

- [ ] Add failing checks requiring `AECOPD Scenario v1.0` on homepage and scenario page.
- [ ] Assert learner-facing pages do not show v0.2 or v0.3.
- [ ] Keep homepage card text:
  - Acute Exacerbation of COPD (AECOPD)
  - Situation Awareness: Recognizing Deterioration in Respiratory Failure
- [ ] Add the version badge `AECOPD Scenario v1.0`.
- [ ] Preserve fullscreen and instructor keyboard controls.
- [ ] Run tests; expected PASS.
- [ ] Commit: `feat: brand AECOPD Scenario v1.0 formal teaching version`.

---

### Task 7: Browser and media verification

**Files**
- Create: `docs/aecopd-v1-verification.md`
- Modify: `tests/aecopd-static-check.mjs` if regression coverage is missing

- [ ] Run `node tests/aecopd-static-check.mjs`; expected PASS.
- [ ] Start local server with `python3 -m http.server 8000`.
- [ ] Open `http://localhost:8000/scenarios/aecopd/`.
- [ ] Verify Act 1 center wall is **moving video**, not a static image.
- [ ] Confirm Act 1 video loops for at least two cycles.
- [ ] Confirm no emoji or screenshot fallback appears.
- [ ] Confirm first-act respiratory sound plays.
- [ ] Verify Act 2 uses the mapped worsening MP4.
- [ ] Verify monitor media/state is active.
- [ ] Verify Lung Sound, ABG, and treatment answers match source.
- [ ] Verify final NIV state uses the mapped NIV/improvement MP4 and loops.
- [ ] Verify three-wall scaling at 5760×1080, 1920×1080 preview, and laptop viewport.
- [ ] Record tested commit SHA, media mapping, browser, and pass/fail results in `docs/aecopd-v1-verification.md`.
- [ ] Commit: `test: verify AECOPD Scenario v1.0 teaching release`.

---

### Task 8: Mark formal v1.0 release state

**Files**
- Modify: `README.md`
- Modify: `docs/aecopd-v1-verification.md`

- [ ] Re-run all static checks.
- [ ] Reconfirm every patient-state path ends in `.mp4`.
- [ ] Reconfirm every referenced media file exists.
- [ ] Update README current status to `AECOPD Scenario v1.0 — Formal Teaching Version`.
- [ ] Commit: `release: AECOPD Scenario v1.0`.
- [ ] Create a Git tag/release only after user review of the verified scenario.
