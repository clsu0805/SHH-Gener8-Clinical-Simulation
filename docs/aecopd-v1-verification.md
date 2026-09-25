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

## Local playable-package verification

A complete local package containing the original embedded media was verified before repository-media upload.

Results:

- Static regression test: **PASS**
- Local HTTP scenario page: **200**
- All nine MP4 files: **valid and HTTP 200**
- Respiratory M4A: **valid and HTTP 200**
- No PNG/JPG patient mapping in media manifest
- HTML/JS uses active HTML5 video elements for patient states

Verified durations:
- media1.mp4 — 10.005 s
- media2.mp4 — 10.005 s
- media3.mp4 — 10.000 s
- media5.mp4 — 8.000 s
- media6.mp4 — 6.000 s
- media7.mp4 — 8.000 s
- media8.mp4 — 6.000 s
- media9.mp4 — 7.000 s
- media10.mp4 — 6.000 s
- media4.m4a — 16.597 s

SHA-256 source-media fingerprints:
- media1.mp4 — 6fe5a25591e88d825b54d0ec2e701a7ac0574c44fb0df866cf6211a87906ffd8
- media2.mp4 — 2e9429327dab8780c8c144e8e7a951e656ab073231ae9ae8850b219b5aa3276b
- media3.mp4 — e0c7842dacc3d7b6199d5df41973d8effd8764d4c4aca02e9f231359e9eee9ac
- media4.m4a — f3d34752907814be320717a8e61aa8234fcd7577781d1c2da492b6a155063bfc
- media5.mp4 — 49bc31976bc844c442967d8c01ee41158e7ae71180ecb06a0b66c0b083911cec
- media6.mp4 — d13c2b48803debac4b9369f10fe93a037d9bfd98c1fcc6d50020754f17e726ae
- media7.mp4 — 407e007f90c2630ead622c71f050d7355d68db3b650d96d49c207a78d2e6e4cb
- media8.mp4 — 21c9fe39f437d37ff7b66bed62a57ce6eb40d5f4d0dc6d1ec2948bdd923b6ebb
- media9.mp4 — 14014d9538859727c96a24670448410d71dc1db09251f9a01d02308959bd72b5
- media10.mp4 — 30131c10fda4d629c28b9840a01133a4f14c6c8588bd7c9cb165958c96f32ed1

## GitHub-hosted asset verification

Status: **PASS for repository media placement and binary integrity**

Verified on `main`:

- `scenarios/aecopd/assets/audio/media4.m4a` exists.
- All nine MP4 files exist under `scenarios/aecopd/assets/video/`.
- No root-level duplicate MP4/M4A files remain.
- Git blob SHAs for all uploaded media match the verified local source package.
- All nine MP4 files decode successfully end-to-end with FFmpeg.
- The M4A respiratory audio decodes successfully end-to-end with FFmpeg.
- Video streams are H.264 at 1280×720.
- Audio-bearing source videos use AAC where present.
- `media-manifest.js` points to the exact repository paths now present on `main`.

## Browser playback verification limitation

A headless Chromium playback check was attempted from the execution environment, but navigation to both local HTTP and `file://` URLs is blocked by an administrator policy in this environment (`ERR_BLOCKED_BY_ADMINISTRATOR`).

Therefore the following browser-only checks still require one real browser launch from the user's environment or an accessible deployed site URL:

- visible motion on the center-wall patient video
- visible motion on the right-wall monitor video
- audible lung-sound playback after user click
- fullscreen interaction in the actual teaching browser

This is an environment-access limitation, not a detected media or code failure. Repository paths, media integrity, codecs, durations, and decodeability are verified.
