# AECOPD Scenario v1.0 Verification Record

## Current status

**Release status: NOT YET READY TO MERGE**

The AECOPD v1.0 application code, clinical data model, state engine, homepage version label, media manifest, and regression tests are present on `feature/aecopd-v1`.

The GitHub branch is intentionally **not** marked as a completed v1.0 release yet because the required MP4/M4A binary assets have not been committed to the repository.

## Verified source-media inventory

The approved PowerPoint contains the following original media assets:

| Source asset | Intended role | Source relationship |
| --- | --- | --- |
| media1.mp4 | Act 1 initial patient | Slides 2–3 |
| media2.mp4 | Act 1 patient / vital-sign state | Slides 4–5 |
| media3.mp4 | Act 1 evidence-gathering patient | Slides 6–11 |
| media4.m4a | First-act respiratory sound | Slide 6 |
| media5.mp4 | Act 1 post-treatment patient | Slide 12 |
| media6.mp4 | Act 2 dynamic monitor | Slides 13–17 |
| media7.mp4 | Act 2 deterioration intro patient | Slide 13 |
| media8.mp4 | Act 2 worsening patient | Slides 14–17 |
| media9.mp4 | NIV/improvement patient | Slide 18 |
| media10.mp4 | NIV/improvement monitor | Slide 18 |

## Static regression checks

Local static regression test:

`node tests/aecopd-static-check.mjs`

Result during implementation: **PASS**

The test verifies:

- three-wall DOM structure
- learner-visible `AECOPD Scenario v1.0`
- Act 1 assessment categories and states
- exact Act 1 evidence values
- exact Act 2 ABG values and correct interpretation
- approved Lung Sound answer
- approved treatment logic
- media manifest patient entries use MP4 paths
- scenario engine creates HTML5 `<video>` elements
- no emoji patient placeholder
- no PNG/JPG patient mapping

## Video-fidelity gate

The release must not be approved until all of these are verified from the GitHub-hosted/local-site package:

- [ ] Act 1 center wall shows moving MP4 patient video.
- [ ] Act 1 respiratory M4A plays on user action.
- [ ] Act 2 worsening state shows moving MP4 patient video.
- [ ] Act 2 dynamic monitor shows moving monitor video.
- [ ] NIV response shows moving MP4 patient video.
- [ ] NIV response shows improved monitor video.
- [ ] No patient video state silently falls back to PNG/JPG or an extracted video frame.
- [ ] Failed media load shows an instructor-visible error.
- [ ] Every manifest path returns an existing file.

## Clinical-content checks

- [x] Act 1 categories: Vital Signs, ABG, Oxygen Therapy, Lung Sound, CXR, Main Treatment.
- [x] Act 1 evidence values follow the approved teaching deck.
- [x] Act 2 deterioration state follows the approved teaching deck.
- [x] Lung Sound correct answer: Bilateral expiratory wheezing with decreased air entry.
- [x] ABG: pH 7.30 / PaCO2 68 / PaO2 52 / HCO3 34 / SaO2 83%.
- [x] ABG correct interpretation: Acute-on-chronic hypercapnic respiratory failure with respiratory acidosis.
- [x] Core treatment selections remain second bronchodilator, airway clearance, NIV, and Prednisolone.
- [x] Follow-up ABG remains a post-NIV reassessment step.
- [x] NIV response retains RR 18–20/min and SpO2 90–93%.

## Browser verification

Browser verification remains **pending** until the required media assets are present in the repository/package served to the browser.

Do not merge this feature branch to `main` or tag `v1.0` until the media-fidelity gate is fully checked.
