# AECOPD Scenario v1.0 Design Specification

## Purpose

Upgrade the existing Gener8 AECOPD prototype into **AECOPD Scenario v1.0**, a formal teaching version that faithfully reproduces the approved AECOPD V4 Final Readable teaching deck as an interactive web-based Gener8 scenario.

The website may improve presentation, interaction flow, stability, and media handling, but it must not silently rewrite the clinical scenario.

## Source of Truth

The authoritative teaching source is the user-provided PowerPoint:

**V5 AECOPD_Gener8_DirectPlay_V4_Final_Readable(1).pptx**

All clinical facts, option wording, correct answers, scenario sequence, media intent, and instructional logic must follow this deck.

If the source deck does not support a value or statement, the implementation must not invent one.

## Product Identity

Scenario label:

**AECOPD Scenario v1.0**

Platform:

**Gener8 Clinical Simulation & Situation Awareness Platform**

Chinese subtitle:

**沉浸式臨床情境覺察教案平台**

## Core Design Principle

The implementation uses option B approved by the user:

- Preserve the same clinical content as the source deck.
- Preserve the same patient and approved scenario media.
- Preserve the same questions and correct answers.
- Preserve the same instructional sequence.
- Preserve the three-wall Gener8 teaching concept.
- Replace slide-by-slide PowerPoint navigation with a stable state-driven web interaction.
- Do not alter clinical content merely to simplify coding or presentation.

## Display Architecture

The scenario runs as a single 5760 × 1080 web stage:

- Left wall: 1920 × 1080
- Center wall: 1920 × 1080
- Right wall: 1920 × 1080

The browser scales the full stage proportionally to the available display without changing the logical wall dimensions.

### Left Wall

Purpose:

- Patient background
- Current patient status
- Available assessment or treatment controls
- Prior treatment or progression information when appropriate

### Center Wall

Purpose:

- Approved virtual patient media from the source deck
- Patient state changes
- First-act patient appearance
- Worsening patient state
- NIV/improvement patient state

Placeholder emoji or generic replacement patients must not appear in the formal v1.0 teaching version.

### Right Wall

Purpose:

- Clinical Evidence Board in Act 1
- Reassessment content in Act 2
- Dynamic vital-sign monitor
- Question options and feedback
- Confirmed treatment selections
- NIV response information

## Scenario Structure

### Act 1 — Initial Assessment and Evidence Gathering

Act 1 must preserve the approved first-act teaching flow from the source deck.

The learner retains access to the source-deck assessment categories, including:

- Vital Signs
- ABG
- Oxygen Therapy
- Lung Sound
- CXR
- Main Treatment

The right-side Clinical Evidence Board accumulates or reveals the corresponding source-deck evidence without requiring a new PowerPoint slide for every state.

The first-act patient media and embedded expiratory wheeze audio are retained from the source deck.

The exact first-act clinical values, wording, choices, and answer logic are transcribed from the approved deck during implementation; they are not replaced with model-generated values.

### Transition to Act 2

After completion of the approved first-act sequence, the scenario progresses to the source-deck deterioration state at six hours.

### Act 2 — Six-Hour Deterioration

The following source-deck state is preserved:

- Alert but fatigued and anxious
- Able to speak only in short sentences
- Increased work of breathing with accessory muscle use
- Venturi Mask 28%
- SpO2 83%

Previously completed treatment remains displayed:

- Airway clearance
- Combivent nebulization
- Ceftriaxone 1 g IV q24h
- Venturi Mask 28%

The scenario emphasizes persistent deterioration despite controlled oxygen.

### Act 2 Reassessment — Lung Sound

The learner evaluates lung sounds.

The answer choices remain:

1. Bilateral basal crackles
2. Bilateral expiratory wheezing with decreased air entry
3. Unilateral absent breath sound
4. Inspiratory stridor

Correct answer:

**Bilateral expiratory wheezing with decreased air entry**

The approved worsened wheeze audio from the source deck must be used.

Incorrect choices show a clear red-X style response. The correct selection shows a positive confirmation.

### Act 2 Reassessment — ABG

The following values are preserved:

- pH 7.30
- PaCO2 68
- PaO2 52
- HCO3- 34
- SaO2 83%

The interpretation options remain those in the approved deck.

Correct interpretation:

**Acute-on-chronic hypercapnic respiratory failure with respiratory acidosis**

### Act 2 — Main Treatment Decision

The approved treatment options are preserved, including:

- Second bronchodilator treatment
- EKG / BNP evaluation option
- Airway clearance
- Follow-up ABG
- Non-Rebreathing Mask
- Non-invasive Ventilation
- High-Flow Oxygen nasal cannula
- Prednisolone 40 mg PO once daily × 5 days

Core correct selections remain:

- Second bronchodilator treatment
- Airway clearance
- Non-invasive Ventilation
- Prednisolone 40 mg PO once daily × 5 days

Follow-up ABG remains a reassessment step after NIV rather than being presented as one of the four core immediate selections.

Incorrect distractors use the source-approved wrong-answer feedback behavior.

### Act 2 — NIV Response

After correct treatment selection, the scenario progresses to the NIV response state.

The source-deck improvement state is preserved:

- Respiratory rate improves to 18–20/min
- SpO2 improves to 90–93%
- Work of breathing decreases
- Patient appears more comfortable and able to rest

Treatment summary remains:

- NIV ventilatory support
- Repeat bronchodilator
- Airway clearance
- Repeat ABG / close monitoring
- Prednisolone 40 mg PO daily × 5 days

The final center-wall media uses the approved NIV patient state from the source deck.

The right wall shows the improved dynamic monitor and confirmed orders.

## Media Architecture

Media extracted from the approved PowerPoint is stored within the AECOPD scenario package.

Recommended structure:

```text
scenarios/aecopd/
├── index.html
├── scenario.css
├── scenario.js
├── data/
│   └── scenario-data.js
└── assets/
    ├── video/
    ├── audio/
    └── image/
```

The implementation must prefer the original approved embedded assets over generated substitutes.

Media requirements:

- First-act patient video/state
- First-act expiratory wheeze
- Second-act worsened patient video/state
- Second-act worsened wheeze
- Dynamic monitor media/state where present
- Final NIV patient/improvement media

All media paths must be relative so the scenario can run from GitHub Pages and from a local web server.

## State Model

The scenario is implemented as a state-driven web application rather than a slide deck.

Minimum logical states:

```text
ACT1_START
ACT1_VITALS
ACT1_ABG
ACT1_OXYGEN
ACT1_LUNG_SOUND
ACT1_CXR
ACT1_TREATMENT
ACT2_OVERVIEW
ACT2_LUNG_SOUND
ACT2_ABG
ACT2_TREATMENT
ACT2_TREATMENT_CONFIRMED
ACT2_NIV_RESPONSE
```

Act 1 evidence states may be visited in the same interaction pattern used by the source deck.

Act 2 follows the approved deterioration and escalation sequence.

## Interaction Rules

- Correct answers produce clear confirmation.
- Incorrect answers produce clear feedback without changing the source answer key.
- Media playback must not require an external CDN.
- Scenario state changes must not open new browser tabs.
- Full-screen teaching mode must remain available.
- Refreshing the page returns to the scenario start unless a future persistence feature is explicitly added.
- No real patient identifiers or protected health information are stored in the public teaching package.

## Version Milestones

Development history is recorded as:

### v0.2
Complete Act 1 conversion from the approved deck into the Gener8 state-driven web flow.

### v0.3
Integrate approved patient video, respiratory audio, and monitor media.

### v1.0
Formal teaching version with:

- Complete Act 1
- Complete Act 2
- Original approved media
- Three-wall 5760 × 1080 layout
- Stable interactive flow
- Correct/incorrect response behavior
- AECOPD Scenario v1.0 label
- Homepage card pointing to the scenario
- Local-browser and GitHub-hosted compatibility

Only the final scenario label needs to be visible to learners:

**AECOPD Scenario v1.0**

The v0.2 and v0.3 milestones remain in Git/GitHub history.

## Homepage Integration

The Gener8 homepage continues to function as a Clinical Scenario Library.

The AECOPD card shows:

**Acute Exacerbation of COPD (AECOPD)**

**Situation Awareness: Recognizing Deterioration in Respiratory Failure**

Version badge:

**AECOPD Scenario v1.0**

The card opens:

`scenarios/aecopd/index.html`

Future scenarios such as Sepsis and CHF are added as separate scenario packages and do not require changes to the AECOPD scenario internals.

## Reliability Requirements

Before v1.0 is considered complete:

- All scenario links load correctly.
- All approved media files load.
- No missing relative asset paths.
- Lung-sound answer logic matches the source deck.
- ABG values and answer logic match the source deck.
- Treatment-answer logic matches the source deck.
- NIV response matches the source deck.
- 5760 × 1080 stage scales correctly.
- No placeholder emoji remains.
- Scenario works without a third-party JavaScript or CSS CDN.
- Scenario can run from a local web server.
- Scenario can run from the intended GitHub-hosted site configuration.

## Out of Scope for AECOPD v1.0

The following are not required for this release:

- User login
- Learner scoring database
- Cloud analytics
- AI-generated assessment
- Multi-user synchronization
- Remote teacher-control console
- Sepsis implementation
- CHF implementation

These can be added later without changing the approved AECOPD clinical content.


## Mandatory Video Fidelity Requirement

The formal teaching version must use the original embedded MP4 media from the approved PowerPoint.

This requirement is non-negotiable:

- Center-wall patient states must render with HTML `<video>` elements backed by the extracted MP4 assets.
- A still image, extracted video frame, PNG/JPG screenshot, emoji, or generic substitute does **not** satisfy the v1.0 requirement.
- If a video fails to load, the application must show a visible media-load error for the instructor rather than silently falling back to a still image.
- Videos must use relative asset paths and work from both the intended GitHub-hosted site and a local web server.
- Looping/autoplay/mute behavior is configured per source-media role. Browser autoplay restrictions must not cause the patient video to disappear.
- Audio-bearing source videos remain available as source assets; audio playback behavior is controlled intentionally to avoid duplicate sound with dedicated lung-sound playback.

### Verified Source Media Inventory

The approved PowerPoint contains these embedded media assets:

- `media1.mp4` — 1280×720, H.264, ~10 s, used in slides 2–3
- `media2.mp4` — 1280×720, H.264, ~10 s, used in slides 4–5
- `media3.mp4` — 1280×720, H.264, ~10 s, used in slides 6–11
- `media4.m4a` — AAC audio, ~16.6 s, embedded first-act respiratory audio
- `media5.mp4` — 1280×720, H.264, ~8 s, used in slide 12
- `media6.mp4` — 1280×720, H.264, ~6 s, used in slides 13–17
- `media7.mp4` — 1280×720, H.264, ~8 s, used in slide 13
- `media8.mp4` — 1280×720, H.264, ~6 s, used in slides 14–17
- `media9.mp4` — 1280×720, H.264, ~7 s, used in slide 18
- `media10.mp4` — 1280×720, H.264, ~6 s, used in slide 18

During implementation, slide relationships and visual inspection determine whether each source MP4 is the patient-state video or monitor-state video. The mapping must be documented in the scenario manifest before v0.3 is accepted.

### Video Acceptance Tests

AECOPD Scenario v1.0 is not complete unless all of the following pass:

1. At least one original MP4 is actively rendered on the center wall in Act 1.
2. An original worsening-state MP4 is actively rendered on the center wall in Act 2.
3. An original NIV/improvement MP4 is actively rendered in the final state.
4. The DOM contains active `<video>` elements for patient video states, not still-image substitutes.
5. Every referenced MP4 returns successfully from its relative path.
6. Video playback can loop continuously during a teaching state.
7. No source-media failure is hidden by a screenshot fallback.
8. The first-act respiratory sound uses the extracted audio asset where required by the approved source deck.
