## Faux Head Tracking MVP (v0.1)

### Objective
Build a minimal, low-latency web demo where a single portrait “follows” the cursor. This document lays out two implementation options—(A) depth-based 2.5D parallax and (B) pre-generated image atlas—and defers the choice until later.

### Scope
- **In scope**:
  - Load one portrait image and its aligned depth map.
  - Three.js scene with a subdivided plane displaced by depth for parallax.
  - Map cursor to small head yaw/pitch with smoothing, dead-zone, and clamps.
  - Optional minimal eye “look-at” effect (simple pupil offset).
  - Basic UI: intensity slider, smoothing slider, toggle eyes.
- Additionally supported (alternative approach): pre-generated image atlas with grid-based gaze.
- **Out of scope**:
  - Expression-editor head synthesis, pose atlases, live neural gen.
  - Complex occlusion, background replacement, advanced relighting.
  - Full mobile/perf hardening beyond basic safeguards.

### Assumptions
- Existing or trivial setup for a basic Three.js/Web build.
- Depth maps can be generated offline (Depth Anything V1/V2) and committed as static assets.
- Target browsers: desktop Chrome/Edge/Safari on mid-tier laptops.

## Preprocessing (offline, once per portrait)
### Option A — Depth-based
- Pick a clean, front-facing portrait (≥1024 px width).
- Generate a single-channel depth map with Depth Anything; normalize to [0,1].
- Export and align assets:
  - `portrait.jpg` (or `.webp`) at ~1024 px width.
  - `portrait_depth.png` 8‑bit grayscale, same dimensions and alignment.

### Option B — Pre-generated atlas
- Use a generator (e.g., similar to reference) to produce a gaze grid:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size).
  - Naming pattern `gaze_px{X}_py{Y}_{size}.webp`.
- Place images under `public/faces/` (or configured path); include index if needed.

## Implementation Plan (1–2 days)
### Option A — Depth-based (Three.js)
- Scene: renderer, perspective (or ortho) camera, single scene.
- Geometry: plane with ~128×128 subdivisions.
- Shaders: vertex displacement by `depth * depthScale`; preserve UVs.
- Input mapping: cursor → yaw/pitch with dead-zone, EMA smoothing, clamps.
- UI: intensity and smoothing sliders; toggle eyes.
- Polish: vignette/feather; perf checks; fallback sample.

### Option B — Pre-generated atlas (vanilla/React)
- Copy generated images to `public/faces/` and ensure correct paths.
- Normalize cursor relative to container; map to nearest grid `(px, py)`.
- Compute filename from `(px, py)` and update `<img src>`.
- Optional: preload images; add debug overlay; touch support.

## Functional Requirements
- Load one portrait (≥1024 px) and matching single-channel depth map.
- Motion mapping:
  - Dead‑zone around center ≈ 8% of min viewport dimension.
  - EMA smoothing for input (alpha ≈ 0.18–0.25).
  - Clamps: yaw ±12°, pitch ±8°.
- Rendering:
  - Subdivided plane (~128×128) with vertex displacement from depth.
  - Depth scale tuned so near‑to‑far displacement ≈ 1–1.5% of plane size.
- UI Controls: Intensity (0–100%), Smoothing (0–100%), Toggle Eyes.
- Performance target: 60 fps on mid‑tier laptop GPU; acceptable fallback 30 fps.

## Non‑Functional Requirements
- Load time < 2 s for a 1K portrait + depth assets.
- Clean, minimal code structure ready for Option B/C upgrades.

## Constraints and Defaults
- Angle clamps: yaw ±12°, pitch ±8°, roll 0° (omit roll in MVP).
- Smoothing: EMA alpha 0.2 (range 0.1–0.35 via slider).
- Depth scale: near‑to‑far ≈ 1–1.5% of plane size.
- Mesh: 128×128 (drop to 64×64 if perf dips).
- Textures: 1024 px WebP/JPEG for color; 8‑bit PNG for depth.

## Performance Guardrails
- If frame time > 16.7 ms, drop mesh to 64×64.
- Cap textures at 1024 px (downscale to 768 px on low‑end devices).
- Keep `depthScale` conservative; avoid per‑frame allocations; reuse uniforms.

## Acceptance Criteria
- Smooth at rest (dead‑zone + EMA prevent jitter).
- Plausible motion up to ±12° yaw, ±8° pitch without glaring artifacts.
- ≥60 fps at 1024 px textures and 128×128 mesh on a mid‑tier laptop.
- Loads in < 2 s with sample assets on broadband.

## Risks and Mitigations
- Silhouette/hair/ears warping → conservative clamps, vignette, limit depth scale.
- Depth noise → use V2 or post‑normalize/smooth; clamp outliers in shader.
- Performance dips → reduce subdivisions, downscale textures, disable eyes.

## Approaches and When to Use Them

### Depth‑based parallax
- Single portrait + single depth map; smooth, continuous motion; requires WebGL.

### Pre‑generated atlas (reference)
- ~121–169 images (11×11 or 13×13 grid) swapped as cursor moves; simple to ship; larger assets.

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.

Cursor mapping (continuous angles):

```javascript
// Normalize cursor to [-1, 1]
const nx = ((x - left) / width) * 2 - 1;
const ny = ((y - top) / height) * 2 - 1;

// Dead‑zone and clamps
const yaw = clamp(nx * 12, -12, 12);
const pitch = clamp(ny * 8, -8, 8);

// EMA smoothing
state.yaw = lerp(state.yaw, yaw, 0.2);
state.pitch = lerp(state.pitch, pitch, 0.2);
```

## Notes for the Repo
- Assets folder: `portrait.jpg`, `portrait_depth.png` (same base name).
- Config/constants: clamps, `depthScale`, EMA alpha.
- Minimal modules: scene init, input mapping, shader/material setup, UI.
- Include a small note or script to run Depth Anything offline to produce `portrait_depth.png` for new images.

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)