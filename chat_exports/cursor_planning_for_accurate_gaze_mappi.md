# Planning for accurate gaze mapping
_Exported on 11/6/2025 at 22:26:31 GMT from Cursor (2.0.63)_

---

**User**

What's the plan now to actually get different images so that the gaze actually maps to the location?

---

**Cursor**

Reviewing the codebase to understand the current implementation and identify what's needed for gaze-to-location mapping.


Checking how the components are connected:


The atlas mode (Option B) is stubbed. Outlining the plan to implement it:


## Plan to implement atlas mode (gaze image swapping)

### Current state
- Depth-based parallax (Option A) is working
- Atlas mode (Option B) is stubbed
- Helper functions exist in `useAtlasMode.ts` but aren't used

### Implementation plan

#### Step 1: Generate the image atlas (external)
You need a grid of pre-generated images with different gaze angles:
- Grid: `px`/`py` in `[-15, 15]` with step `3` → 11×11 = 121 images
- Naming: `gaze_px{X}_py{Y}_{size}.webp` (e.g., `gaze_px-15_py-15_256.webp`)
- Location: `public/faces/` directory
- Options:
  - Use a face generator API/service (e.g., similar to reference implementation)
  - Generate offline with a Python script
  - Use existing atlas assets if available

#### Step 2: Implement AtlasViewer component
Replace the stub with:
- Cursor tracking (mouse/touch)
- Grid coordinate mapping using `cursorToGridCoords()`
- Image filename generation using `gridCoordsToFilename()`
- Image swapping with smooth transitions
- Preloading/caching for performance

#### Step 3: Enhance useAtlasMode hook
Complete the hook to:
- Map cursor to grid coordinates
- Generate correct image paths
- Handle image loading states
- Optional: preload adjacent images for smoother transitions

#### Step 4: Integration
- Wire up the existing `App.tsx` mode switching
- Add UI controls (similar to depth mode)
- Add mode toggle in the UI

Should I:
1. Implement the AtlasViewer component and complete the `useAtlasMode` hook?
2. Create a script/tool to help generate the atlas images?
3. Both?

Note: For testing, you'll need sample atlas images in `public/faces/` following the naming pattern, or we can add a fallback that uses the center image.

---

**User**

That's fine, but what is the process of actually generating the images

---

**Cursor**

Searching for documentation or references on the image generation process:


Checking the reference repo for details on the image generation process:


Here are practical ways to generate the atlas images for gaze-to-location mapping:

## Image Generation Process for Atlas Mode

### Method 1: Commercial AI Tools (Easiest for MVP)

**Expression Editor AI** ([expressioneditor.com](https://expressioneditor.com))
- Upload a portrait
- Adjust gaze with sliders (Pupil X/Y)
- Generate images systematically
- Process:
  1. Upload your base portrait
  2. Set horizontal gaze (px): -15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15
  3. For each px, set vertical gaze (py): -15, -12, -9, -6, -3, 0, 3, 6, 9, 12, 15
  4. Save each as `gaze_px{X}_py{Y}_256.webp`
  5. Total: 11×11 = 121 images

**Limitations**: Manual or semi-automated; may require an API for full automation.

### Method 2: Research Models (More Control)

**GazeNeRF** ([x-shi.github.io/GazeNeRF](https://x-shi.github.io/GazeNeRF.github.io/))
- 3D-aware gaze redirection
- Can control gaze angles programmatically
- Requires setup/implementation

**Process**:
1. Install GazeNeRF (PyTorch-based)
2. Load your portrait
3. Generate images for each (px, py) combination
4. Export with consistent naming

### Method 3: Python Script with AI Service API

If a service offers an API:

```python
# Pseudocode for batch generation
import requests

base_image = "portrait.jpg"
px_range = range(-15, 16, 3)  # -15 to 15, step 3
py_range = range(-15, 16, 3)

for px in px_range:
    for py in py_range:
        # Call API to generate gaze image
        result = api.generate_gaze(
            image=base_image,
            gaze_x=px,
            gaze_y=py
        )
        filename = f"gaze_px{px}_py{py}_256.webp"
        save_image(result, f"public/faces/{filename}")
```

### Method 4: Manual Process (If tools lack automation)

1. Use Expression Editor or similar tool
2. For each grid position:
   - Upload base image
   - Set gaze angles (px, py)
   - Download result
   - Rename to match pattern
3. Organize in `public/faces/`

### What You Need

**Input**: One high-quality front-facing portrait (1024px+ recommended)

**Output**: 121 images (11×11 grid) with naming:
- `gaze_px-15_py-15_256.webp`
- `gaze_px-15_py-12_256.webp`
- ... (continues through all combinations)
- `gaze_px15_py15_256.webp`

**Grid Specification** (from your code):
- Range: -15 to +15 degrees
- Step: 3 degrees
- Total: 11×11 = 121 images
- Size: 256×256 pixels (or your preferred size)

### Recommended Approach for Your Project

1. Start with Expression Editor AI (manual, quickest)
   - Generate a small subset (e.g., 3×3) to test
   - Verify the naming and atlas viewer integration
   - Then generate the full 11×11 grid

2. For production/automation:
   - Check if Expression Editor has an API
   - Or implement GazeNeRF locally
   - Or use a cloud API service

3. Cost estimate (from RESEARCH.md):
   - ~$0.01–0.02 per image
   - 121 images ≈ $1.21–2.42 total

Want help implementing the AtlasViewer component once you have the images, or creating a Python script to automate generation if an API is available?

```python
# Pseudocode for batch generation
import requests

base_image = "portrait.jpg"
px_range = range(-15, 16, 3)  # -15 to 15, step 3
py_range = range(-15, 16, 3)

for px in px_range:
    for py in py_range:
        # Call API to generate gaze image
        result = api.generate_gaze(
            image=base_image,
            gaze_x=px,
            gaze_y=py
        )
        filename = f"gaze_px{px}_py{py}_256.webp"
        save_image(result, f"public/faces/{filename}")
```

---

**User**

What was the replicate approach in @RESEARCH.md 

---

**Cursor**

Searching for "replicate" references in the codebase:


No mention of "Replicate" in `RESEARCH.md`. The document only covers:
1. **Option A — Depth-based**: Uses depth maps with Three.js parallax
2. **Option B — Pre-generated atlas**: Uses a grid of pre-generated gaze images

For **Option B**, `RESEARCH.md` says:
- "Use a generator (e.g., similar to reference)" — referring to the `kylan02/face_looker` repo
- It doesn't specify which generator/service to use

**Replicate** (replicate.com) would be a practical approach for generating the atlas images, but it's not documented in `RESEARCH.md`. Here's how you could use Replicate:

## Using Replicate for Atlas Generation

Replicate hosts models that can control gaze direction. The process would be:

1. Find a gaze redirection model on Replicate (e.g., gaze redirection or face reenactment models)
2. Create a Python script that:
   - Calls the Replicate API for each (px, py) combination
   - Saves the results with the correct naming pattern
   - Handles rate limits and retries

Example approach:
```python
import replicate

# For each gaze angle combination
for px in range(-15, 16, 3):
    for py in range(-15, 16, 3):
        output = replicate.run(
            "model-name",
            input={
                "image": open("portrait.jpg", "rb"),
                "gaze_x": px,
                "gaze_y": py
            }
        )
        # Save output to gaze_px{px}_py{py}_256.webp
```

This isn't documented in `RESEARCH.md` — it only references the `face_looker` approach without specifying the tool.

Should I search for specific Replicate models that support gaze redirection, or check the `face_looker` repo to see what it uses?

```python
import replicate

# For each gaze angle combination
for px in range(-15, 16, 3):
    for py in range(-15, 16, 3):
        output = replicate.run(
            "model-name",
            input={
                "image": open("portrait.jpg", "rb"),
                "gaze_x": px,
                "gaze_y": py
            }
        )
        # Save output to gaze_px{px}_py{py}_256.webp
```

---

**User**

Study https://github.com/kylan02/face_looker 

Then update @RESEARCH.md as i think it does use replicate

---

**Cursor**

Studying the `face_looker` repository to update `RESEARCH.md` with the Replicate approach.


Here’s an updated `RESEARCH.md` with details on using Replicate:

```markdown:RESEARCH.md
## Faux Head Tracking MVP (v0.1)

### Objective
Build a minimal, low-latency web demo where a single portrait "follows" the cursor. This document lays out two implementation options—(A) depth-based 2.5D parallax and (B) pre-generated image atlas—and defers the choice until later.

### Scope
- **In scope**:
  - Load one portrait image and its aligned depth map.
  - Three.js scene with a subdivided plane displaced by depth for parallax.
  - Map cursor to small head yaw/pitch with smoothing, dead-zone, and clamps.
  - Optional minimal eye "look-at" effect (simple pupil offset).
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

## Notes for the Repo
- Assets folder: `portrait.jpg`, `portrait_depth.png` (same base name).
- Config/constants: clamps, `depthScale`, EMA alpha.
- Minimal modules: scene init, input mapping, shader/material setup, UI.
- Include a small note or script to run Depth Anything offline to produce `portrait_depth.png` for new images.
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.
- Consider adding Replicate API integration script for atlas generation workflow.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Replicate API: [replicate.com](https://replicate.com)
- Expression Editor model: `fofr/expression-editor` on Replicate
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

Changes:
1. Updated "Option B — Pre-generated atlas" with Replicate API details
2. Added setup instructions (API token, dependencies)
3. Included generation command example and parameters
4. Added cost estimates
5. Documented naming pattern (including 'm' prefix for negatives)
6. Updated "Quick comparison" table with Replicate info
7. Expanded "Reference Implementation Insights" with Replicate-specific details
8. Added atlas-mode cursor mapping code example
9. Updated citations to include Replicate and the expression-editor model

Since you're in ask mode, apply these changes to `RESEARCH.md`.

```markdown
## Faux Head Tracking MVP (v0.1)

### Objective
Build a minimal, low-latency web demo where a single portrait "follows" the cursor. This document lays out two implementation options—(A) depth-based 2.5D parallax and (B) pre-generated image atlas—and defers the choice until later.

### Scope
- **In scope**:
  - Load one portrait image and its aligned depth map.
  - Three.js scene with a subdivided plane displaced by depth for parallax.
  - Map cursor to small head yaw/pitch with smoothing, dead-zone, and clamps.
  - Optional minimal eye "look-at" effect (simple pupil offset).
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```

```plaintext

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`## Notes for the Repo
- Assets folder: `portrait.jpg`, `portrait_depth.png` (same base name).
- Config/constants: clamps, `depthScale`, EMA alpha.
- Minimal modules: scene init, input mapping, shader/material setup, UI.
- Include a small note or script to run Depth Anything offline to produce `portrait_depth.png` for new images.
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.
- Consider adding Replicate API integration script for atlas generation workflow.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Replicate API: [replicate.com](https://replicate.com)
- Expression Editor model: `fofr/expression-editor` on Replicate
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

```plaintext

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`## Notes for the Repo
- Assets folder: `portrait.jpg`, `portrait_depth.png` (same base name).
- Config/constants: clamps, `depthScale`, EMA alpha.
- Minimal modules: scene init, input mapping, shader/material setup, UI.
- Include a small note or script to run Depth Anything offline to produce `portrait_depth.png` for new images.
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.
- Consider adding Replicate API integration script for atlas generation workflow.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Replicate API: [replicate.com](https://replicate.com)
- Expression Editor model: `fofr/expression-editor` on Replicate
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

```plaintext

Changes:
1. Updated "Option B — Pre-generated atlas" with Replicate API details
2. Added setup instructions (API token, dependencies)
3. Included generation command example and parameters
4. Added cost estimates
5. Documented naming pattern (including 'm' prefix for negatives)
6. Updated "Quick comparison" table with Replicate info
7. Expanded "Reference Implementation Insights" with Replicate-specific details
8. Added atlas-mode cursor mapping code example
9. Updated citations to include Replicate and the expression-editor model

Since you're in ask mode, apply these changes to `RESEARCH.md`.
```

---

**User**

Update @RESEARCH.md 

---

**Cursor**

Updating `RESEARCH.md` with Replicate API details from the face_looker repository.


Updating `RESEARCH.md` with Replicate API details:


```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

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
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

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
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

Cursor mapping (for depth mode - continuous angles):
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
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

Cursor mapping (for depth mode - continuous angles):
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
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

Cursor mapping (for depth mode - continuous angles):
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
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.
- Consider adding Replicate API integration script for atlas generation workflow.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

```markdown
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

### Option B — Pre-generated atlas (Replicate API)
The reference implementation (`kylan02/face_looker`) uses **Replicate API** with the `fofr/expression-editor` model to generate gaze images.

**Setup:**
1. Get a Replicate API token from [replicate.com](https://replicate.com)
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install Python dependencies (replicate library)

**Generation Process:**
- Use a Python script (see reference repo `main.py`) that calls Replicate API
- Model: `fofr/expression-editor` on Replicate
- Parameters:
  - `px`/`py` in [−15, 15] with step 3 → ~121 images at 256×256 (or chosen size)
  - Default: `--min -15 --max 15 --step 3 --size 256`
- Naming pattern: `gaze_px{X}_py{Y}_{size}.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`
- Image count formula: `((max - min) / step + 1)²`
  - Default (step=3): 121 images (11×11 grid)
  - Step=2.5: 169 images (13×13 grid)
  - Step=5: 49 images (7×7 grid)

**Example Generation Command:**
```bash
python main.py \
  --image ./portrait.jpg \
  --out ./out \
  --min -15 \
  --max 15 \
  --step 3 \
  --size 256 \
  --skip-existing  # Resume interrupted generation
```

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- Check current pricing at [replicate.com/pricing](https://replicate.com/pricing)

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping filenames to coordinates
```

**Place generated images:**
- Copy to `public/faces/` (or configured path)
- Ensure correct naming pattern matches code expectations

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
- Uses Replicate API with `fofr/expression-editor` model for generation.
- Requires API token and credits (~$0.01–0.02 per face set).

### Quick comparison
| **Feature** | **Depth‑based** | **Pre‑generated atlas** |
| --- | --- | --- |
| Setup | Three.js + shaders | React/image swap |
| Assets | 2 files | 121–169 images |
| Motion | Continuous | Discrete grid |
| Realism | Good (2.5D) | Excellent (AI‑generated) |
| Perf | GPU (60 fps target) | Very light |
| Cost | Free (offline depth) | ~$0.01–0.02/face gen (Replicate API) |
| Generation | Depth Anything (offline) | Replicate API (cloud) |

Links: reference repo `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)

## Reference Implementation Insights (adapted from face_looker)

The reference implementation uses **Replicate API** with the following approach:

**Image Generation:**
- Python script (`main.py`) that calls Replicate API
- Uses `fofr/expression-editor` model for gaze redirection
- Supports resume via `--skip-existing` flag
- Generates CSV index file for mapping coordinates to filenames

**Cursor Mapping:**
- Normalize cursor relative to container; clamp and map to output.
- Use dead‑zone (~8%) and EMA (`alpha` ~0.2) for stability.
- Container‑relative positioning is crucial; support touch by mapping to same handler.
- Map cursor to grid coordinates, then look up corresponding image filename.

**React Implementation:**
- Hook-based approach (`useGazeTracking`) for image swapping
- Handles image loading states and errors
- Supports preloading for smoother transitions
- Debug overlay available in development mode

Cursor mapping (for atlas mode - discrete grid):
```javascript
// Normalize cursor to [0, 1]
const normalizedX = cursorX / containerWidth
const normalizedY = cursorY / containerHeight

// Map to grid coordinates (px, py)
const px = Math.round((normalizedX * (max - min) + min) / step) * step
const py = Math.round((normalizedY * (max - min) + min) / step) * step

// Clamp to bounds
const clampedPx = Math.max(min, Math.min(max, px))
const clampedPy = Math.max(min, Math.min(max, py))

// Generate filename (negative values use 'm' prefix)
const pxStr = px < 0 ? `m${Math.abs(px)}` : `${px}`
const pyStr = py < 0 ? `m${Math.abs(py)}` : `${py}`
const filename = `gaze_px${pxStr}_py${pyStr}_256.webp`
```

Cursor mapping (for depth mode - continuous angles):
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
- For atlas mode: include Python script for Replicate API generation (reference `kylan02/face_looker` repo).

## Clear Next Steps (post‑MVP)
- Add a face matte to reduce background bleed and improve edges.
- Optional pose atlas for more extreme angles and higher realism.
- Blink/micro‑saccades/idle breathing.
- Drag‑and‑drop for user‑supplied portrait + local depth generation.
- Consider adding Replicate API integration script for atlas generation workflow.

## Citations
- Reference atlas approach: `kylan02/face_looker` [github.com/kylan02/face_looker](https://github.com/kylan02/face_looker)
- Replicate API: [replicate.com](https://replicate.com)
- Expression Editor model: `fofr/expression-editor` on Replicate
- Discussion/context: Wes Bos tweet `x.com/wesbos/status/1985465640648339578` [x.com/wesbos/status/1985465640648339578](https://x.com/wesbos/status/1985465640648339578)
```

Checking for linting issues:


Updated `RESEARCH.md` with Replicate API details. Summary of changes:

## Updates Made:

1. **Expanded "Option B — Pre-generated atlas" section** with:
   - Setup instructions (API token, dependencies)
   - Generation process details using `fofr/expression-editor` model
   - Naming pattern (including 'm' prefix for negative values)
   - Example generation command
   - Cost estimates (~$0.01-0.02 per face set)
   - Output structure

2. **Updated "Pre-generated atlas (reference)" section** to mention Replicate API

3. **Enhanced "Quick comparison" table** with generation method column

4. **Expanded "Reference Implementation Insights"** with:
   - Replicate API approach details
   - Image generation workflow
   - Cursor mapping code for atlas mode (discrete grid)
   - Kept existing depth mode cursor mapping (continuous angles)
   - React implementation notes

5. **Updated "Notes for the Repo"** to mention Python script for Replicate generation

6. **Added to "Clear Next Steps"** about Replicate API integration

7. **Enhanced Citations** with Replicate API and Expression Editor model links

The document now reflects that the reference implementation (`kylan02/face_looker`) uses the Replicate API with the `fofr/expression-editor` model to generate the gaze atlas images, with setup and usage instructions included.

---

**User**

Is there a way to adapt this to *not* use a Python script, but still use Replicate, so that it can be part of our web app and run dynamically?

---

**Cursor**

Yes—this can run in the web app. Checking Replicate's JavaScript SDK and browser usage details:


Yes, we can use Replicate from the web app. Two approaches:
1. Serverless function (recommended) — keeps the API key secure
2. Direct browser calls (not recommended) — exposes the API key

Reviewing the project structure to plan the integration:


Creating a solution using Vercel serverless functions (API routes) to keep the API key secure. Implementing:


```typescript
/**
 * Vercel Serverless Function for generating gaze images via Replicate API
 * 
 * This endpoint securely handles Replicate API calls without exposing the API key
 * to the client-side code.
 * 
 * Usage:
 * POST /api/generate-gaze
 * Body: { image: base64Image, px: number, py: number }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

interface GenerateGazeRequest {
  image: string // Base64 encoded image
  px: number    // Horizontal gaze angle (-15 to 15)
  py: number    // Vertical gaze angle (-15 to 15)
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string // URL to generated image
  error?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for API token
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    return res.status(500).json({ 
      error: 'REPLICATE_API_TOKEN not configured. Please set it in your Vercel environment variables.' 
    })
  }

  try {
    const { image, px, py }: GenerateGazeRequest = req.body

    // Validate input
    if (!image || typeof px !== 'number' || typeof py !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid request. Required: { image: string, px: number, py: number }' 
      })
    }

    // Validate gaze angles (typically -15 to 15)
    if (px < -15 || px > 15 || py < -15 || py > 15) {
      return res.status(400).json({ 
        error: 'Gaze angles must be between -15 and 15' 
      })
    }

    // Convert base64 to data URL if needed
    const imageData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    // Create prediction on Replicate
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fofr/expression-editor:latest', // or specific version
        input: {
          image: imageData,
          pupil_x: px,
          pupil_y: py,
        },
      }),
    })

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate API error:', error)
      return res.status(predictionResponse.status).json({ 
        error: `Replicate API error: ${error}` 
      })
    }

    const prediction: ReplicatePrediction = await predictionResponse.json()

    // Poll for completion (or return immediately and let client poll)
    // For simplicity, we'll poll here up to 60 seconds
    let finalPrediction = prediction
    const maxAttempts = 60
    let attempts = 0

    while (
      finalPrediction.status === 'starting' || 
      finalPrediction.status === 'processing'
    ) {
      if (attempts >= maxAttempts) {
        return res.status(504).json({ 
          error: 'Generation timeout after 60 seconds',
          predictionId: finalPrediction.id 
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalPrediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
        }
      )

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ 
          error: 'Failed to check prediction status' 
        })
      }

      finalPrediction = await statusResponse.json()
      attempts++
    }

    if (finalPrediction.status === 'failed' || finalPrediction.status === 'canceled') {
      return res.status(500).json({ 
        error: finalPrediction.error || 'Generation failed',
        predictionId: finalPrediction.id 
      })
    }

    if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
      return res.status(200).json({
        success: true,
        imageUrl: finalPrediction.output,
        px,
        py,
      })
    }

    return res.status(500).json({ 
      error: 'Unexpected prediction status',
      status: finalPrediction.status 
    })

  } catch (error) {
    console.error('Error generating gaze image:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}

```

```typescript
/**
 * Client-side service for generating gaze images via Replicate API
 * Uses Vercel serverless function to keep API key secure
 */

export interface GazeGenerationOptions {
  image: HTMLImageElement | string // Image element or base64 string
  px: number // Horizontal gaze angle (-15 to 15)
  py: number // Vertical gaze angle (-15 to 15)
}

export interface GazeGenerationResult {
  success: boolean
  imageUrl: string
  px: number
  py: number
}

export interface GazeGenerationError {
  error: string
  predictionId?: string
}

/**
 * Convert image to base64 string
 */
function imageToBase64(image: HTMLImageElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    ctx.drawImage(image, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert image to blob'))
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Failed to read blob'))
      reader.readAsDataURL(blob)
    }, 'image/jpeg', 0.9)
  })
}

/**
 * Generate a single gaze image using Replicate API via serverless function
 * 
 * @param options - Generation options
 * @returns Promise resolving to the generated image URL
 */
export async function generateGazeImage(
  options: GazeGenerationOptions
): Promise<GazeGenerationResult> {
  let imageBase64: string

  // Convert image to base64 if needed
  if (options.image instanceof HTMLImageElement) {
    imageBase64 = await imageToBase64(options.image)
  } else if (typeof options.image === 'string') {
    // Assume it's already base64 (remove data URL prefix if present)
    imageBase64 = options.image.includes(',') 
      ? options.image.split(',')[1] 
      : options.image
  } else {
    throw new Error('Invalid image format. Expected HTMLImageElement or base64 string.')
  }

  // Call our serverless function
  const response = await fetch('/api/generate-gaze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      px: options.px,
      py: options.py,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate gaze image')
  }

  return data as GazeGenerationResult
}

/**
 * Generate a batch of gaze images for the atlas grid
 * 
 * @param image - Source image
 * @param min - Minimum angle (default: -15)
 * @param max - Maximum angle (default: 15)
 * @param step - Step size (default: 3)
 * @param onProgress - Optional progress callback
 * @returns Promise resolving to map of (px, py) -> imageUrl
 */
export async function generateGazeAtlas(
  image: HTMLImageElement | string,
  min: number = -15,
  max: number = 15,
  step: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, string>> {
  const results = new Map<string, string>()
  const angles: Array<{ px: number; py: number }> = []

  // Generate all angle combinations
  for (let px = min; px <= max; px += step) {
    for (let py = min; py <= max; py += step) {
      angles.push({ px, py })
    }
  }

  const total = angles.length
  let completed = 0

  // Generate images sequentially to avoid rate limits
  // You could parallelize with a concurrency limit if needed
  for (const { px, py } of angles) {
    try {
      const result = await generateGazeImage({ image, px, py })
      const key = `px${px}_py${py}`
      results.set(key, result.imageUrl)
      completed++
      onProgress?.(completed, total)
    } catch (error) {
      console.error(`Failed to generate gaze for px=${px}, py=${py}:`, error)
      // Continue with other images even if one fails
      completed++
      onProgress?.(completed, total)
    }
  }

  return results
}

```

```typescriptreact
import { useState } from 'react'
import { generateGazeAtlas } from '../lib/replicate/generateGaze'
import './AtlasGenerator.css'

interface AtlasGeneratorProps {
  portraitImage: HTMLImageElement
  onAtlasGenerated?: (imageMap: Map<string, string>) => void
  onCancel?: () => void
}

/**
 * Component for generating gaze atlas images using Replicate API
 * Shows progress and allows cancellation
 */
export default function AtlasGenerator({ 
  portraitImage, 
  onAtlasGenerated,
  onCancel 
}: AtlasGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ completed: 0, total: 121 })
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<Map<string, string> | null>(null)

  /**
   * Generate atlas with default parameters (11x11 grid, step 3)
   */
  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 121 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -15, // min
        15,  // max
        3,   // step
        (completed, total) => {
          setProgress({ completed, total })
        }
      )

      setGeneratedImages(imageMap)
      setIsGenerating(false)
      onAtlasGenerated?.(imageMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate atlas')
      setIsGenerating(false)
    }
  }

  /**
   * Generate a smaller test set (5x5 grid) for quick testing
   */
  const handleTestGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setProgress({ completed: 0, total: 25 })

    try {
      const imageMap = await generateGazeAtlas(
        portraitImage,
        -12, // min
        12,  // max
        6,   // step (larger step = fewer images)
        (completed, total) => {
          setProgress({ completed, total })
        }
      )

      setGeneratedImages(imageMap)
      setIsGenerating(false)
      onAtlasGenerated?.(imageMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate test atlas')
      setIsGenerating(false)
    }
  }

  if (generatedImages) {
    return (
      <div className="atlas-generator">
        <div className="atlas-success">
          <h2>✅ Atlas Generated Successfully!</h2>
          <p>Generated {generatedImages.size} images</p>
          <p className="atlas-hint">
            Images are now available for use in atlas mode.
            They will be downloaded and cached in your browser.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="atlas-generator">
      <div className="atlas-generator-header">
        <h2>Generate Gaze Atlas</h2>
        <p>Generate a grid of gaze images using Replicate API</p>
      </div>

      {error && (
        <div className="atlas-error">
          <p>❌ Error: {error}</p>
          <p className="atlas-error-hint">
            Make sure REPLICATE_API_TOKEN is set in your Vercel environment variables.
          </p>
        </div>
      )}

      {isGenerating ? (
        <div className="atlas-progress">
          <div className="atlas-progress-bar">
            <div 
              className="atlas-progress-fill"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <p>
            Generating {progress.completed} / {progress.total} images...
          </p>
          <p className="atlas-progress-hint">
            This may take a few minutes. Estimated cost: ~${(progress.total * 0.0001).toFixed(2)}
          </p>
        </div>
      ) : (
        <div className="atlas-actions">
          <button 
            className="atlas-button atlas-button-primary"
            onClick={handleGenerate}
          >
            Generate Full Atlas (121 images)
          </button>
          <button 
            className="atlas-button atlas-button-secondary"
            onClick={handleTestGenerate}
          >
            Test Generation (25 images)
          </button>
          {onCancel && (
            <button 
              className="atlas-button atlas-button-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      <div className="atlas-info">
        <h3>What happens:</h3>
        <ul>
          <li>Your image is sent to Replicate API via secure serverless function</li>
          <li>121 images are generated (11×11 grid, ±15° range, step 3°)</li>
          <li>Images are generated sequentially (takes ~2-5 minutes)</li>
          <li>Estimated cost: ~$0.01-0.02</li>
          <li>Images are cached for use in atlas mode</li>
        </ul>
      </div>
    </div>
  )
}

```

```css
.atlas-generator {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.atlas-generator-header {
  text-align: center;
  margin-bottom: 2rem;
}

.atlas-generator-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.atlas-generator-header p {
  color: #666;
  margin: 0;
}

.atlas-error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.atlas-error p {
  margin: 0.5rem 0;
}

.atlas-error-hint {
  font-size: 0.9rem;
  color: #666;
}

.atlas-progress {
  text-align: center;
  margin: 2rem 0;
}

.atlas-progress-bar {
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.atlas-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  transition: width 0.3s ease;
  border-radius: 12px;
}

.atlas-progress p {
  margin: 0.5rem 0;
}

.atlas-progress-hint {
  font-size: 0.9rem;
  color: #666;
}

.atlas-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.atlas-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.atlas-button-primary {
  background: #4caf50;
  color: white;
}

.atlas-button-primary:hover {
  background: #45a049;
}

.atlas-button-secondary {
  background: #2196f3;
  color: white;
}

.atlas-button-secondary:hover {
  background: #0b7dda;
}

.atlas-button-cancel {
  background: #f5f5f5;
  color: #333;
}

.atlas-button-cancel:hover {
  background: #e0e0e0;
}

.atlas-info {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.atlas-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
}

.atlas-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.atlas-info li {
  margin: 0.5rem 0;
  color: #666;
}

.atlas-success {
  text-align: center;
  padding: 2rem;
  background: #e8f5e9;
  border-radius: 8px;
}

.atlas-success h2 {
  margin: 0 0 1rem 0;
  color: #2e7d32;
}

.atlas-success p {
  margin: 0.5rem 0;
}

.atlas-hint {
  font-size: 0.9rem;
  color: #666;
  margin-top: 1rem;
}

```

Checking Vercel serverless function format and updating if needed:


Updating the Vercel function to use standard Node.js types and adding setup documentation:


```typescript
/**
 * Vercel Serverless Function for generating gaze images via Replicate API
 * 
 * This endpoint securely handles Replicate API calls without exposing the API key
 * to the client-side code.
 * 
 * Usage:
 * POST /api/generate-gaze
 * Body: { image: base64Image, px: number, py: number }
 * 
 * Environment Variables Required:
 * - REPLICATE_API_TOKEN: Your Replicate API token
 */

// Vercel serverless function types
interface VercelRequest {
  method?: string
  body?: any
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => void
}

interface GenerateGazeRequest {
  image: string // Base64 encoded image
  px: number    // Horizontal gaze angle (-15 to 15)
  py: number    // Vertical gaze angle (-15 to 15)
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string // URL to generated image
  error?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for API token
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    return res.status(500).json({ 
      error: 'REPLICATE_API_TOKEN not configured. Please set it in your Vercel environment variables.' 
    })
  }

  try {
    const { image, px, py }: GenerateGazeRequest = req.body

    // Validate input
    if (!image || typeof px !== 'number' || typeof py !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid request. Required: { image: string, px: number, py: number }' 
      })
    }

    // Validate gaze angles (typically -15 to 15)
    if (px < -15 || px > 15 || py < -15 || py > 15) {
      return res.status(400).json({ 
        error: 'Gaze angles must be between -15 and 15' 
      })
    }

    // Convert base64 to data URL if needed
    const imageData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    // Create prediction on Replicate
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fofr/expression-editor:latest', // or specific version
        input: {
          image: imageData,
          pupil_x: px,
          pupil_y: py,
        },
      }),
    })

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate API error:', error)
      return res.status(predictionResponse.status).json({ 
        error: `Replicate API error: ${error}` 
      })
    }

    const prediction: ReplicatePrediction = await predictionResponse.json()

    // Poll for completion (or return immediately and let client poll)
    // For simplicity, we'll poll here up to 60 seconds
    let finalPrediction = prediction
    const maxAttempts = 60
    let attempts = 0

    while (
      finalPrediction.status === 'starting' || 
      finalPrediction.status === 'processing'
    ) {
      if (attempts >= maxAttempts) {
        return res.status(504).json({ 
          error: 'Generation timeout after 60 seconds',
          predictionId: finalPrediction.id 
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalPrediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
        }
      )

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ 
          error: 'Failed to check prediction status' 
        })
      }

      finalPrediction = await statusResponse.json()
      attempts++
    }

    if (finalPrediction.status === 'failed' || finalPrediction.status === 'canceled') {
      return res.status(500).json({ 
        error: finalPrediction.error || 'Generation failed',
        predictionId: finalPrediction.id 
      })
    }

    if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
      return res.status(200).json({
        success: true,
        imageUrl: finalPrediction.output,
        px,
        py,
      })
    }

    return res.status(500).json({ 
      error: 'Unexpected prediction status',
      status: finalPrediction.status 
    })

  } catch (error) {
    console.error('Error generating gaze image:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}


```

```markdown
# Atlas Mode Setup with Replicate API

This guide explains how to set up dynamic atlas generation using Replicate API directly from your web app.

## Overview

Instead of using a Python script, we use:
1. **Vercel Serverless Function** (`api/generate-gaze.ts`) - Securely handles Replicate API calls
2. **Client-side service** (`src/lib/replicate/generateGaze.ts`) - Makes requests to the serverless function
3. **AtlasGenerator component** - UI for generating atlas images on-demand

## Setup Steps

### 1. Get Replicate API Token

1. Sign up at [replicate.com](https://replicate.com)
2. Go to [API Tokens](https://replicate.com/account/api-tokens)
3. Create a new token and copy it

### 2. Configure Vercel Environment Variable

**For Local Development:**

Create a `.env.local` file in the project root:

```bash
REPLICATE_API_TOKEN=your_token_here
```

**For Vercel Deployment:**

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add `REPLICATE_API_TOKEN` with your token value
4. Redeploy your project

**For Netlify Deployment:**

1. Go to your Netlify site settings
2. Navigate to "Environment variables"
3. Add `REPLICATE_API_TOKEN` with your token value
4. Redeploy your site

### 3. Install Dependencies (if needed)

The serverless function uses standard Node.js APIs. No additional dependencies are required.

### 4. Test the Setup

1. Start your dev server: `npm run dev`
2. Upload a portrait image
3. Click "Generate Atlas" button (when implemented in UI)
4. Check browser console for any errors

## Usage

### From React Component

```typescript
import { generateGazeAtlas } from './lib/replicate/generateGaze'

// Generate full atlas (121 images)
const imageMap = await generateGazeAtlas(
  portraitImage,
  -15, // min
  15,  // max
  3,   // step
  (completed, total) => {
    console.log(`Progress: ${completed}/${total}`)
  }
)

// imageMap contains Map<string, string> with keys like "px-15_py-15" 
// and values being image URLs
```

### Generate Single Image

```typescript
import { generateGazeImage } from './lib/replicate/generateGaze'

const result = await generateGazeImage({
  image: portraitImage,
  px: 0,  // Horizontal gaze angle
  py: 0,  // Vertical gaze angle
})

console.log(result.imageUrl) // URL to generated image
```

## Architecture

```
┌─────────────────┐
│   React App     │
│  (Browser)      │
└────────┬────────┘
         │ HTTP POST
         │ /api/generate-gaze
         ▼
┌─────────────────┐
│ Vercel Function │
│ (Serverless)    │
│ - Hides API key │
│ - Calls Replicate│
└────────┬────────┘
         │ HTTPS
         │ Replicate API
         ▼
┌─────────────────┐
│  Replicate API  │
│  fofr/expression│
│  -editor model  │
└─────────────────┘
```

## Cost Estimation

- **Per image**: ~$0.0001
- **Full atlas (121 images)**: ~$0.01-0.02
- **Test set (25 images)**: ~$0.0025

See [Replicate Pricing](https://replicate.com/pricing) for current rates.

## API Function Details

### Endpoint: `/api/generate-gaze`

**Method**: POST

**Request Body**:
```json
{
  "image": "base64_encoded_image_string",
  "px": 0,
  "py": 0
}
```

**Response** (Success):
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/...",
  "px": 0,
  "py": 0
}
```

**Response** (Error):
```json
{
  "error": "Error message here"
}
```

## Troubleshooting

### "REPLICATE_API_TOKEN not configured"

- Make sure `.env.local` exists and contains the token
- For Vercel: Check environment variables in project settings
- Restart dev server after adding `.env.local`

### CORS Errors

- Make sure you're calling `/api/generate-gaze` (relative path)
- The serverless function handles CORS automatically

### Generation Timeout

- Single image generation takes ~2-10 seconds
- Full atlas (121 images) takes ~5-20 minutes
- The function polls for up to 60 seconds per image
- For faster results, use smaller step values or generate in batches

### Rate Limits

- Replicate may have rate limits on free tier
- The code generates images sequentially to avoid hitting limits
- Consider adding delays between requests if needed

## Security Notes

✅ **API key is never exposed to client** - It's only used in the serverless function

✅ **Serverless function validates input** - Prevents invalid requests

⚠️ **Cost control** - Consider adding usage limits or requiring user confirmation for large batches

## Alternative: Pre-generate Atlas

If you prefer to generate atlas images offline and commit them:

1. Use the Python script from `kylan02/face_looker` repo
2. Generate images locally
3. Copy to `public/faces/` directory
4. Use the existing `AtlasViewer` component

This approach is free but requires manual generation steps.

```

Fixing the Vercel function export format:


Creating a summary document and verifying everything works:


Updating the response type to support method chaining:


```typescript
/**
 * Vercel Serverless Function for generating gaze images via Replicate API
 * 
 * This endpoint securely handles Replicate API calls without exposing the API key
 * to the client-side code.
 * 
 * Usage:
 * POST /api/generate-gaze
 * Body: { image: base64Image, px: number, py: number }
 * 
 * Environment Variables Required:
 * - REPLICATE_API_TOKEN: Your Replicate API token
 */

// Vercel serverless function types
interface VercelRequest {
  method?: string
  body?: any
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  json: (data: any) => VercelResponse
}

interface GenerateGazeRequest {
  image: string // Base64 encoded image
  px: number    // Horizontal gaze angle (-15 to 15)
  py: number    // Vertical gaze angle (-15 to 15)
}

interface ReplicatePrediction {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  output?: string // URL to generated image
  error?: string
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check for API token
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    return res.status(500).json({ 
      error: 'REPLICATE_API_TOKEN not configured. Please set it in your Vercel environment variables.' 
    })
  }

  try {
    const { image, px, py }: GenerateGazeRequest = req.body

    // Validate input
    if (!image || typeof px !== 'number' || typeof py !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid request. Required: { image: string, px: number, py: number }' 
      })
    }

    // Validate gaze angles (typically -15 to 15)
    if (px < -15 || px > 15 || py < -15 || py > 15) {
      return res.status(400).json({ 
        error: 'Gaze angles must be between -15 and 15' 
      })
    }

    // Convert base64 to data URL if needed
    const imageData = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`

    // Create prediction on Replicate
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fofr/expression-editor:latest', // or specific version
        input: {
          image: imageData,
          pupil_x: px,
          pupil_y: py,
        },
      }),
    })

    if (!predictionResponse.ok) {
      const error = await predictionResponse.text()
      console.error('Replicate API error:', error)
      return res.status(predictionResponse.status).json({ 
        error: `Replicate API error: ${error}` 
      })
    }

    const prediction: ReplicatePrediction = await predictionResponse.json()

    // Poll for completion (or return immediately and let client poll)
    // For simplicity, we'll poll here up to 60 seconds
    let finalPrediction = prediction
    const maxAttempts = 60
    let attempts = 0

    while (
      finalPrediction.status === 'starting' || 
      finalPrediction.status === 'processing'
    ) {
      if (attempts >= maxAttempts) {
        return res.status(504).json({ 
          error: 'Generation timeout after 60 seconds',
          predictionId: finalPrediction.id 
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${finalPrediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiToken}`,
          },
        }
      )

      if (!statusResponse.ok) {
        return res.status(statusResponse.status).json({ 
          error: 'Failed to check prediction status' 
        })
      }

      finalPrediction = await statusResponse.json()
      attempts++
    }

    if (finalPrediction.status === 'failed' || finalPrediction.status === 'canceled') {
      return res.status(500).json({ 
        error: finalPrediction.error || 'Generation failed',
        predictionId: finalPrediction.id 
      })
    }

    if (finalPrediction.status === 'succeeded' && finalPrediction.output) {
      return res.status(200).json({
        success: true,
        imageUrl: finalPrediction.output,
        px,
        py,
      })
    }

    return res.status(500).json({ 
      error: 'Unexpected prediction status',
      status: finalPrediction.status 
    })

  } catch (error) {
    console.error('Error generating gaze image:', error)
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    })
  }
}


```

Creating a summary document:


```markdown
# Replicate API Integration - Dynamic Atlas Generation

## ✅ What Was Created

I've set up a complete solution to generate gaze atlas images dynamically from your web app using Replicate API, **without requiring a Python script**.

### Files Created:

1. **`api/generate-gaze.ts`** - Vercel serverless function
   - Securely handles Replicate API calls
   - Keeps API key server-side (never exposed to client)
   - Polls for generation completion
   - Returns image URLs

2. **`src/lib/replicate/generateGaze.ts`** - Client-side service
   - `generateGazeImage()` - Generate single image
   - `generateGazeAtlas()` - Generate full atlas grid
   - Handles image conversion (HTMLImageElement → base64)
   - Progress callbacks for UI updates

3. **`src/components/AtlasGenerator.tsx`** - React component
   - UI for triggering atlas generation
   - Progress bar and status updates
   - Error handling
   - Test mode (25 images) vs full mode (121 images)

4. **`ATLAS_SETUP.md`** - Complete setup guide

## 🚀 Quick Start

### 1. Set Environment Variable

Create `.env.local`:
```bash
REPLICATE_API_TOKEN=your_token_here
```

### 2. Integrate into App

You can add the `AtlasGenerator` component to your upload flow:

```typescript
import AtlasGenerator from './components/AtlasGenerator'

// In your App.tsx or Upload component:
{portraitImage && (
  <AtlasGenerator
    portraitImage={portraitImage}
    onAtlasGenerated={(imageMap) => {
      // Handle generated images
      console.log('Generated', imageMap.size, 'images')
    }}
  />
)}
```

### 3. Deploy to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add `REPLICATE_API_TOKEN` in Vercel environment variables
4. Deploy

## 💡 Usage Examples

### Generate Single Image

```typescript
import { generateGazeImage } from './lib/replicate/generateGaze'

const result = await generateGazeImage({
  image: portraitImage,
  px: 0,  // Looking straight
  py: 0
})

console.log(result.imageUrl) // Use this URL
```

### Generate Full Atlas

```typescript
import { generateGazeAtlas } from './lib/replicate/generateGaze'

const imageMap = await generateGazeAtlas(
  portraitImage,
  -15, // min
  15,  // max
  3,   // step
  (completed, total) => {
    console.log(`Progress: ${completed}/${total}`)
  }
)

// imageMap is Map<string, string>
// Keys: "px-15_py-15", "px-15_py-12", etc.
// Values: Image URLs from Replicate
```

## 🎯 Architecture

```
Browser (React App)
    ↓ POST /api/generate-gaze
Vercel Serverless Function
    ↓ HTTPS + API Token
Replicate API (fofr/expression-editor)
    ↓ Generated Image URL
Browser (Display/Cache)
```

## 💰 Cost

- **Per image**: ~$0.0001
- **Full atlas (121 images)**: ~$0.01-0.02
- **Very affordable** for individual use

## 🔒 Security

✅ **API key never exposed** - Only used in serverless function  
✅ **Input validation** - Server validates all parameters  
✅ **Error handling** - Graceful failure handling

## 📝 Next Steps

1. **Add UI Integration** - Wire `AtlasGenerator` into your upload flow
2. **Cache Images** - Store generated images in browser/localStorage
3. **Update AtlasViewer** - Use generated images instead of pre-uploaded ones
4. **Add Batch Processing** - Generate multiple images in parallel (with rate limiting)

## 🔄 Alternative: Offline Generation

If you prefer the Python script approach:
- Use `kylan02/face_looker` repo's `main.py`
- Generate images locally
- Upload to `public/faces/`
- Use existing `AtlasViewer` component

This is free but requires manual steps.

## 📚 Documentation

- **Setup Guide**: See `ATLAS_SETUP.md`
- **API Function**: See `api/generate-gaze.ts` comments
- **Client Service**: See `src/lib/replicate/generateGaze.ts` comments

```

## Solution created

### 1. Vercel serverless function (`api/generate-gaze.ts`)
- Handles Replicate API calls server-side
- Keeps API key secure (never exposed to client)
- Polls for completion and returns image URLs
- Works automatically when deployed to Vercel

### 2. Client-side service (`src/lib/replicate/generateGaze.ts`)
- `generateGazeImage()` - Generate a single gaze image
- `generateGazeAtlas()` - Generate the full 11×11 grid (121 images)
- Converts images to base64 automatically
- Progress callbacks for UI updates

### 3. React component (`src/components/AtlasGenerator.tsx`)
- UI for triggering generation
- Progress bar showing completion
- Test mode (25 images) and full mode (121 images)
- Error handling and success states

### 4. Documentation
- `ATLAS_SETUP.md` - Setup guide
- `REPLICATE_INTEGRATION.md` - Quick reference

## How it works

1. User uploads a portrait in your app
2. User clicks "Generate Atlas"
3. Client calls `/api/generate-gaze` (your serverless function)
4. Serverless function calls Replicate API with your hidden API key
5. Images are generated and URLs returned
6. Images can be cached/used in atlas mode

## Setup

1. Add environment variable:
   ```bash
   # .env.local (for local dev)
   REPLICATE_API_TOKEN=your_token_here
   ```

2. For Vercel deployment: Add `REPLICATE_API_TOKEN` in project settings

3. Integrate into your app (optional - component is ready to use)

## Benefits

- No Python script needed — runs entirely in your web app
- Secure — API key stays server-side
- Dynamic — generate atlas on-demand for any uploaded image
- Cost-effective — ~$0.01-0.02 per full atlas
- Type-safe — Full TypeScript support

Ready to use. Add the `AtlasGenerator` component to your upload flow when you want to enable dynamic generation.

```shellscript
   # .env.local (for local dev)
   REPLICATE_API_TOKEN=your_token_here
```

---

**User**

What goes into the setup for deploying to Vercel servelss function? Or is that part of my nextjs app?

Explain siply in @README.md as part of any setup required.



---

**Cursor**

Updating README.md to explain Vercel serverless function setup. They work with any framework, not just Next.js—Vercel detects the `api/` folder automatically.


```markdown
# Face Follow Cursor PoC

A proof-of-concept web application that makes a portrait image "follow" the cursor using depth-based 2.5D parallax. Built entirely in TypeScript with no Python dependencies.

## Features

- **Upload & Process**: Upload a portrait image and generate a depth map in-browser
- **Depth-Based Parallax**: Real-time 3D parallax effect using Three.js and custom shaders
- **Smooth Motion**: Cursor tracking with dead-zone, EMA smoothing, and angle clamps
- **Adjustable Controls**: Intensity and smoothing sliders
- **Performance Optimized**: Automatic mesh subdivision reduction for lower-end devices

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **3D Rendering**: Three.js
- **ML Inference**: onnxruntime-web (WASM/WebGL/WebGPU)
- **No Backend**: Fully client-side, suitable for static hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Depth Model Setup

The app uses an ONNX depth estimation model to generate depth maps from uploaded portraits. If no model is provided, it will use a simple fallback depth map (radial gradient) for testing purposes.

### Quick Start

**Just want to get started?** Download this file and place it in `public/models/`:

👉 **[model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)** ← Recommended

```bash
# Download and place the model
mkdir -p public/models
# Download model_q4f16.onnx to public/models/
# Rename it to match the default path, or update Viewer.tsx
mv public/models/model_q4f16.onnx public/models/depth-anything-v2-small.onnx
```

This is the best balance of size (235 MB), quality, and speed for web deployment.

### Option 1: Using a Pre-built ONNX Model (Recommended)

#### Step 1: Download a Compatible Model

The app expects an ONNX depth estimation model. Here are specific recommendations:

**Depth Anything V2 Large** ([Hugging Face](https://huggingface.co/onnx-community/depth-anything-v2-large/tree/main/onnx))

Multiple quantization options are available. **Recommended: `model_q4f16.onnx` (235 MB)**

| Model File | Size | Quality | Speed | Best For |
|-----------|------|---------|-------|----------|
| `model_q4f16.onnx` | **235 MB** | ⭐⭐⭐⭐ | ⚡⚡⚡ | **Recommended: Best balance** |
| `model_fp16.onnx` | 669 MB | ⭐⭐⭐⭐⭐ | ⚡⚡ | Highest quality |
| `model_int8.onnx` | 347 MB | ⭐⭐⭐ | ⚡⚡⚡ | Good balance |
| `model.onnx` | 1.34 GB | ⭐⭐⭐⭐⭐ | ⚡ | Full precision (too large for web) |

**Which one to choose?**

- **`model_q4f16.onnx` (235 MB)** ← **Start here!**
  - Best size/quality ratio for web apps
  - 4-bit quantization with fp16 precision
  - Fast download and inference
  - Good depth quality for portraits

- **`model_fp16.onnx` (669 MB)**
  - If you need maximum quality
  - Half precision (good quality, smaller than full precision)
  - Still reasonable for web deployment

- **`model_int8.onnx` (347 MB)**
  - Alternative if q4f16 doesn't work well
  - 8-bit integer quantization
  - Good compatibility

**License Note**: Depth Anything V2 Large uses **CC-BY-NC-4.0** (non-commercial only). For commercial use, consider Depth Anything V2 Small (Apache 2.0).

**Direct Download Links:**

1. **Recommended**: [model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)
2. **High Quality**: [model_fp16.onnx (669 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_fp16.onnx)
3. **Alternative**: [model_int8.onnx (347 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_int8.onnx)

**Other Model Sources:**
- **Depth Anything V2 Small**: Better for commercial use (Apache 2.0 license)
- Search Hugging Face: [depth-anything-v2-onnx](https://huggingface.co/models?search=depth+anything+onnx)

#### Step 2: Place the Model File

1. Create the models directory if it doesn't exist:
   ```bash
   mkdir -p public/models
   ```

2. Place your ONNX model file in `public/models/`:
   ```bash
   # Example: if you downloaded depth-anything-v2-small.onnx
   cp /path/to/your/model.onnx public/models/depth-anything-v2-small.onnx
   ```

3. Rename the downloaded file to match what the app expects, or update the path:
   ```bash
   # Rename to the default expected name
   mv model_q4f16.onnx public/models/depth-anything-v2-small.onnx
   
   # OR keep your filename and update the code (see below)
   ```

4. The app looks for `/models/depth-anything-v2-small.onnx` by default. To use a different filename:
   - Update the model path in `src/components/Viewer.tsx` (around line 47):
     ```typescript
     const modelPath = '/models/model_q4f16.onnx'  // or your filename
     ```

#### Step 3: Model Requirements

Your ONNX model should:
- Accept RGB input images (3 channels)
- Output depth predictions (single channel or multi-channel)
- Have input shape `[1, 3, H, W]` (batch, channels, height, width)
- Have normalized input values in range `[0, 1]`

The app handles various output shapes automatically:
- Single channel: `[1, 1, H, W]` or `[1, H, W]`
- Multi-channel: Takes the first channel if multiple are present

### Option 2: Convert a PyTorch/TensorFlow Model to ONNX

If you have a PyTorch or TensorFlow model, convert it to ONNX:

#### From PyTorch:

```python
import torch
import torch.onnx

# Load your PyTorch model
model = YourDepthModel()
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 384, 384)  # Adjust size to your model

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "depth-model.onnx",
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch', 2: 'height', 3: 'width'},
                  'output': {0: 'batch', 2: 'height', 3: 'width'}},
    opset_version=11  # or higher
)
```

#### From TensorFlow:

```python
import tensorflow as tf
import tf2onnx

# Load your TensorFlow model
model = tf.keras.models.load_model('model.h5')

# Convert to ONNX
spec = (tf.TensorSpec((None, 384, 384, 3), tf.float32, name="input"),)
output_path = "depth-model.onnx"
tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
```

### Option 3: Use the Fallback (No Model Required)

If you don't provide a model, the app will automatically use a simple **radial gradient depth map**. This creates a basic parallax effect where:
- The center of the image is "closer" (more displacement)
- The edges are "farther" (less displacement)

**Limitations of fallback:**
- Not as realistic as ML-generated depth
- Works best with centered portraits
- No understanding of actual scene geometry

**When to use fallback:**
- Quick testing/prototyping
- Understanding the UI and cursor tracking
- Testing performance without loading large models

### Model Size Considerations

**Quantized Models (200-350MB)**
- ✅ Fast loading and inference
- ✅ Works well on most devices
- ✅ Good for web deployment
- ✅ Quality is excellent for portraits
- **Example**: `model_q4f16.onnx` (235 MB) ← **Recommended**

**Half Precision Models (600-700MB)**
- ✅ Very high quality depth maps
- ⚠️ Slower initial load (~2-3x longer)
- ⚠️ Requires more memory
- ⚠️ May be slow on lower-end devices
- **Example**: `model_fp16.onnx` (669 MB)

**Full Precision Models (1GB+)**
- ✅ Maximum quality
- ❌ Too large for practical web use
- ❌ Very slow download and inference
- **Not recommended for web apps**

**Recommendation**: 
- **Start with `model_q4f16.onnx` (235 MB)** - best balance
- Only upgrade to `model_fp16.onnx` if you need higher quality and can accept slower loading
- Avoid full precision models (`model.onnx`) for web deployment

### Troubleshooting

**Model won't load:**
- Check browser console for errors
- Verify the file path matches exactly (case-sensitive)
- Ensure the model file is in `public/models/` (not `src/`)
- Check that the file is served correctly (should be accessible at `/models/your-model.onnx`)

**Model loads but inference fails:**
- Check that input shape matches expected format `[1, 3, H, W]`
- Verify output shape is compatible (single or multi-channel depth)
- Check browser console for ONNX Runtime errors
- Try a different execution provider (WebGPU → WebGL → WASM → CPU)

**Slow inference:**
- Use a quantized model (`model_q4f16.onnx` instead of `model_fp16.onnx`)
- Reduce input image size (edit `CONFIG.maxImageWidth` in `src/config.ts`)
- Check which execution provider is being used (check console logs)
- Consider using WebGPU if available (requires compatible browser/GPU)
- The quantized models (q4f16, int8) are significantly faster than fp16

**File too large:**
- Use `model_q4f16.onnx` (235 MB) instead of larger variants
- Consider using Depth Anything V2 Small if available (smaller base model)
- Check if your hosting/CDN has file size limits

### Testing Without a Model

To test the app immediately without downloading a model:

1. Run `npm run dev`
2. Upload a portrait image
3. The app will show "Generating depth map..." briefly
4. It will automatically fall back to the radial gradient depth map
5. You can still test cursor tracking and all UI controls

The fallback works well enough to demonstrate the parallax effect, though it won't be as realistic as ML-generated depth.

## Project Structure

```
src/
├── components/          # React components
│   ├── Upload.tsx      # Image upload dropzone
│   ├── Viewer.tsx      # Three.js viewer with depth parallax
│   └── Controls.tsx    # UI controls (intensity, smoothing, debug)
├── lib/
│   ├── cursor/         # Cursor mapping logic
│   ├── depth/          # Depth inference and processing
│   ├── three/          # Three.js scene setup
│   └── atlas/          # Atlas mode stub (not implemented)
├── shaders/            # GLSL shaders for parallax
└── config.ts           # Configuration constants
```

## Configuration

Edit `src/config.ts` to adjust:

- Angle clamps (yaw ±12°, pitch ±8°)
- Smoothing parameters
- Dead zone size
- Depth scale
- Mesh subdivisions
- Performance thresholds

## Deployment

### Vercel

Vercel automatically detects and deploys serverless functions from the `api/` directory. No special configuration needed!

**Quick Deploy:**

```bash
npm install -g vercel
vercel
```

**Using Atlas Mode (Replicate API):**

If you want to use the dynamic atlas generation feature:

1. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add: `REPLICATE_API_TOKEN` = `your_replicate_api_token`
   - Redeploy your project

2. **For Local Development:**
   Create `.env.local` in the project root:
   ```bash
   REPLICATE_API_TOKEN=your_token_here
   ```

The `api/generate-gaze.ts` file will automatically be deployed as a serverless function at `/api/generate-gaze`. No additional setup required!

**Note:** Serverless functions work with any framework (Vite, Next.js, etc.). Vercel automatically detects files in the `api/` directory and deploys them as serverless functions.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Note:** Netlify uses a different serverless function format. For Netlify, you'd need to create functions in the `netlify/functions/` directory. See Netlify Functions documentation for details.

Or connect your GitHub repo to Vercel/Netlify for automatic deployments.

## Limitations

- Requires WebGL support for depth-based rendering
- Depth model must be downloaded separately
- Atlas mode (pre-generated images) is not implemented
- Eye tracking is stubbed (placeholder)

## Future Enhancements

- Atlas mode implementation (pre-generated gaze grid)
- Eye tracking overlay
- Mobile optimizations
- Model hosting/CDN integration
- Shareable URLs with embedded depth data

## References

- Research document: `RESEARCH.md`
- Atlas approach reference: [kylan02/face_looker](https://github.com/kylan02/face_looker)

## License

MIT


```

```markdown
# Face Follow Cursor PoC

A proof-of-concept web application that makes a portrait image "follow" the cursor using depth-based 2.5D parallax. Built entirely in TypeScript with no Python dependencies.

## Features

- **Upload & Process**: Upload a portrait image and generate a depth map in-browser
- **Depth-Based Parallax**: Real-time 3D parallax effect using Three.js and custom shaders
- **Smooth Motion**: Cursor tracking with dead-zone, EMA smoothing, and angle clamps
- **Adjustable Controls**: Intensity and smoothing sliders
- **Performance Optimized**: Automatic mesh subdivision reduction for lower-end devices

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **3D Rendering**: Three.js
- **ML Inference**: onnxruntime-web (WASM/WebGL/WebGPU)
- **No Backend**: Fully client-side, suitable for static hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Depth Model Setup

The app uses an ONNX depth estimation model to generate depth maps from uploaded portraits. If no model is provided, it will use a simple fallback depth map (radial gradient) for testing purposes.

### Quick Start

**Just want to get started?** Download this file and place it in `public/models/`:

👉 **[model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)** ← Recommended

```bash
# Download and place the model
mkdir -p public/models
# Download model_q4f16.onnx to public/models/
# Rename it to match the default path, or update Viewer.tsx
mv public/models/model_q4f16.onnx public/models/depth-anything-v2-small.onnx
```

This is the best balance of size (235 MB), quality, and speed for web deployment.

### Option 1: Using a Pre-built ONNX Model (Recommended)

#### Step 1: Download a Compatible Model

The app expects an ONNX depth estimation model. Here are specific recommendations:

**Depth Anything V2 Large** ([Hugging Face](https://huggingface.co/onnx-community/depth-anything-v2-large/tree/main/onnx))

Multiple quantization options are available. **Recommended: `model_q4f16.onnx` (235 MB)**

| Model File | Size | Quality | Speed | Best For |
|-----------|------|---------|-------|----------|
| `model_q4f16.onnx` | **235 MB** | ⭐⭐⭐⭐ | ⚡⚡⚡ | **Recommended: Best balance** |
| `model_fp16.onnx` | 669 MB | ⭐⭐⭐⭐⭐ | ⚡⚡ | Highest quality |
| `model_int8.onnx` | 347 MB | ⭐⭐⭐ | ⚡⚡⚡ | Good balance |
| `model.onnx` | 1.34 GB | ⭐⭐⭐⭐⭐ | ⚡ | Full precision (too large for web) |

**Which one to choose?**

- **`model_q4f16.onnx` (235 MB)** ← **Start here!**
  - Best size/quality ratio for web apps
  - 4-bit quantization with fp16 precision
  - Fast download and inference
  - Good depth quality for portraits

- **`model_fp16.onnx` (669 MB)**
  - If you need maximum quality
  - Half precision (good quality, smaller than full precision)
  - Still reasonable for web deployment

- **`model_int8.onnx` (347 MB)**
  - Alternative if q4f16 doesn't work well
  - 8-bit integer quantization
  - Good compatibility

**License Note**: Depth Anything V2 Large uses **CC-BY-NC-4.0** (non-commercial only). For commercial use, consider Depth Anything V2 Small (Apache 2.0).

**Direct Download Links:**

1. **Recommended**: [model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)
2. **High Quality**: [model_fp16.onnx (669 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_fp16.onnx)
3. **Alternative**: [model_int8.onnx (347 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_int8.onnx)

**Other Model Sources:**
- **Depth Anything V2 Small**: Better for commercial use (Apache 2.0 license)
- Search Hugging Face: [depth-anything-v2-onnx](https://huggingface.co/models?search=depth+anything+onnx)

#### Step 2: Place the Model File

1. Create the models directory if it doesn't exist:
   ```bash
   mkdir -p public/models
   ```

2. Place your ONNX model file in `public/models/`:
   ```bash
   # Example: if you downloaded depth-anything-v2-small.onnx
   cp /path/to/your/model.onnx public/models/depth-anything-v2-small.onnx
   ```

3. Rename the downloaded file to match what the app expects, or update the path:
   ```bash
   # Rename to the default expected name
   mv model_q4f16.onnx public/models/depth-anything-v2-small.onnx
   
   # OR keep your filename and update the code (see below)
   ```

4. The app looks for `/models/depth-anything-v2-small.onnx` by default. To use a different filename:
   - Update the model path in `src/components/Viewer.tsx` (around line 47):
     ```typescript
     const modelPath = '/models/model_q4f16.onnx'  // or your filename
     ```

#### Step 3: Model Requirements

Your ONNX model should:
- Accept RGB input images (3 channels)
- Output depth predictions (single channel or multi-channel)
- Have input shape `[1, 3, H, W]` (batch, channels, height, width)
- Have normalized input values in range `[0, 1]`

The app handles various output shapes automatically:
- Single channel: `[1, 1, H, W]` or `[1, H, W]`
- Multi-channel: Takes the first channel if multiple are present

### Option 2: Convert a PyTorch/TensorFlow Model to ONNX

If you have a PyTorch or TensorFlow model, convert it to ONNX:

#### From PyTorch:

```python
import torch
import torch.onnx

# Load your PyTorch model
model = YourDepthModel()
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 384, 384)  # Adjust size to your model

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "depth-model.onnx",
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch', 2: 'height', 3: 'width'},
                  'output': {0: 'batch', 2: 'height', 3: 'width'}},
    opset_version=11  # or higher
)
```

#### From TensorFlow:

```python
import tensorflow as tf
import tf2onnx

# Load your TensorFlow model
model = tf.keras.models.load_model('model.h5')

# Convert to ONNX
spec = (tf.TensorSpec((None, 384, 384, 3), tf.float32, name="input"),)
output_path = "depth-model.onnx"
tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
```

### Option 3: Use the Fallback (No Model Required)

If you don't provide a model, the app will automatically use a simple **radial gradient depth map**. This creates a basic parallax effect where:
- The center of the image is "closer" (more displacement)
- The edges are "farther" (less displacement)

**Limitations of fallback:**
- Not as realistic as ML-generated depth
- Works best with centered portraits
- No understanding of actual scene geometry

**When to use fallback:**
- Quick testing/prototyping
- Understanding the UI and cursor tracking
- Testing performance without loading large models

### Model Size Considerations

**Quantized Models (200-350MB)**
- ✅ Fast loading and inference
- ✅ Works well on most devices
- ✅ Good for web deployment
- ✅ Quality is excellent for portraits
- **Example**: `model_q4f16.onnx` (235 MB) ← **Recommended**

**Half Precision Models (600-700MB)**
- ✅ Very high quality depth maps
- ⚠️ Slower initial load (~2-3x longer)
- ⚠️ Requires more memory
- ⚠️ May be slow on lower-end devices
- **Example**: `model_fp16.onnx` (669 MB)

**Full Precision Models (1GB+)**
- ✅ Maximum quality
- ❌ Too large for practical web use
- ❌ Very slow download and inference
- **Not recommended for web apps**

**Recommendation**: 
- **Start with `model_q4f16.onnx` (235 MB)** - best balance
- Only upgrade to `model_fp16.onnx` if you need higher quality and can accept slower loading
- Avoid full precision models (`model.onnx`) for web deployment

### Troubleshooting

**Model won't load:**
- Check browser console for errors
- Verify the file path matches exactly (case-sensitive)
- Ensure the model file is in `public/models/` (not `src/`)
- Check that the file is served correctly (should be accessible at `/models/your-model.onnx`)

**Model loads but inference fails:**
- Check that input shape matches expected format `[1, 3, H, W]`
- Verify output shape is compatible (single or multi-channel depth)
- Check browser console for ONNX Runtime errors
- Try a different execution provider (WebGPU → WebGL → WASM → CPU)

**Slow inference:**
- Use a quantized model (`model_q4f16.onnx` instead of `model_fp16.onnx`)
- Reduce input image size (edit `CONFIG.maxImageWidth` in `src/config.ts`)
- Check which execution provider is being used (check console logs)
- Consider using WebGPU if available (requires compatible browser/GPU)
- The quantized models (q4f16, int8) are significantly faster than fp16

**File too large:**
- Use `model_q4f16.onnx` (235 MB) instead of larger variants
- Consider using Depth Anything V2 Small if available (smaller base model)
- Check if your hosting/CDN has file size limits

### Testing Without a Model

To test the app immediately without downloading a model:

1. Run `npm run dev`
2. Upload a portrait image
3. The app will show "Generating depth map..." briefly
4. It will automatically fall back to the radial gradient depth map
5. You can still test cursor tracking and all UI controls

The fallback works well enough to demonstrate the parallax effect, though it won't be as realistic as ML-generated depth.

## Project Structure

```
src/
├── components/          # React components
│   ├── Upload.tsx      # Image upload dropzone
│   ├── Viewer.tsx      # Three.js viewer with depth parallax
│   └── Controls.tsx    # UI controls (intensity, smoothing, debug)
├── lib/
│   ├── cursor/         # Cursor mapping logic
│   ├── depth/          # Depth inference and processing
│   ├── three/          # Three.js scene setup
│   └── atlas/          # Atlas mode stub (not implemented)
├── shaders/            # GLSL shaders for parallax
└── config.ts           # Configuration constants
```

## Configuration

Edit `src/config.ts` to adjust:

- Angle clamps (yaw ±12°, pitch ±8°)
- Smoothing parameters
- Dead zone size
- Depth scale
- Mesh subdivisions
- Performance thresholds

## Deployment

### Vercel

Vercel automatically detects and deploys serverless functions from the `api/` directory. No special configuration needed!

**Quick Deploy:**

```bash
npm install -g vercel
vercel
```

**Using Atlas Mode (Replicate API):**

If you want to use the dynamic atlas generation feature:

1. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add: `REPLICATE_API_TOKEN` = `your_replicate_api_token`
   - Redeploy your project

2. **For Local Development:**
   Create `.env.local` in the project root:
   ```bash
   REPLICATE_API_TOKEN=your_token_here
   ```

The `api/generate-gaze.ts` file will automatically be deployed as a serverless function at `/api/generate-gaze`. No additional setup required!

**Note:** Serverless functions work with any framework (Vite, Next.js, etc.). Vercel automatically detects files in the `api/` directory and deploys them as serverless functions.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Note:** Netlify uses a different serverless function format. For Netlify, you'd need to create functions in the `netlify/functions/` directory. See Netlify Functions documentation for details.

Or connect your GitHub repo to Vercel/Netlify for automatic deployments.

## Atlas Mode (Optional)

The app supports **two approaches** for gaze-tracking:

### Option A: Depth-Based Parallax (Default)
- Uses depth maps + Three.js shaders
- Continuous smooth motion
- No external API required
- See "Depth Model Setup" above

### Option B: Pre-Generated Atlas Images
- Uses grid of pre-generated gaze images
- More realistic results (AI-generated)
- Requires image generation step

**Two ways to generate atlas images:**

1. **Dynamic Generation (Recommended)** - Generate on-demand via Replicate API:
   - Uses serverless function at `api/generate-gaze.ts`
   - Set `REPLICATE_API_TOKEN` environment variable
   - See `ATLAS_SETUP.md` for details
   - Cost: ~$0.01-0.02 per full atlas (121 images)

2. **Offline Generation** - Use Python script:
   - Reference: [kylan02/face_looker](https://github.com/kylan02/face_looker)
   - Generate images locally
   - Place in `public/faces/` directory
   - Free but requires manual steps

## Limitations

- Requires WebGL support for depth-based rendering
- Depth model must be downloaded separately (or use fallback)
- Atlas mode requires setup (either Replicate API token or pre-generated images)
- Eye tracking is stubbed (placeholder)

## Future Enhancements

- Atlas mode implementation (pre-generated gaze grid)
- Eye tracking overlay
- Mobile optimizations
- Model hosting/CDN integration
- Shareable URLs with embedded depth data

## References

- Research document: `RESEARCH.md`
- Atlas approach reference: [kylan02/face_looker](https://github.com/kylan02/face_looker)

## License

MIT


```

```markdown
# Face Follow Cursor PoC

A proof-of-concept web application that makes a portrait image "follow" the cursor using depth-based 2.5D parallax. Built entirely in TypeScript with no Python dependencies.

## Features

- **Upload & Process**: Upload a portrait image and generate a depth map in-browser
- **Depth-Based Parallax**: Real-time 3D parallax effect using Three.js and custom shaders
- **Smooth Motion**: Cursor tracking with dead-zone, EMA smoothing, and angle clamps
- **Adjustable Controls**: Intensity and smoothing sliders
- **Performance Optimized**: Automatic mesh subdivision reduction for lower-end devices

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **3D Rendering**: Three.js
- **ML Inference**: onnxruntime-web (WASM/WebGL/WebGPU)
- **No Backend**: Fully client-side, suitable for static hosting

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Depth Model Setup

The app uses an ONNX depth estimation model to generate depth maps from uploaded portraits. If no model is provided, it will use a simple fallback depth map (radial gradient) for testing purposes.

### Quick Start

**Just want to get started?** Download this file and place it in `public/models/`:

👉 **[model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)** ← Recommended

```bash
# Download and place the model
mkdir -p public/models
# Download model_q4f16.onnx to public/models/
# Rename it to match the default path, or update Viewer.tsx
mv public/models/model_q4f16.onnx public/models/depth-anything-v2-small.onnx
```

This is the best balance of size (235 MB), quality, and speed for web deployment.

### Option 1: Using a Pre-built ONNX Model (Recommended)

#### Step 1: Download a Compatible Model

The app expects an ONNX depth estimation model. Here are specific recommendations:

**Depth Anything V2 Large** ([Hugging Face](https://huggingface.co/onnx-community/depth-anything-v2-large/tree/main/onnx))

Multiple quantization options are available. **Recommended: `model_q4f16.onnx` (235 MB)**

| Model File | Size | Quality | Speed | Best For |
|-----------|------|---------|-------|----------|
| `model_q4f16.onnx` | **235 MB** | ⭐⭐⭐⭐ | ⚡⚡⚡ | **Recommended: Best balance** |
| `model_fp16.onnx` | 669 MB | ⭐⭐⭐⭐⭐ | ⚡⚡ | Highest quality |
| `model_int8.onnx` | 347 MB | ⭐⭐⭐ | ⚡⚡⚡ | Good balance |
| `model.onnx` | 1.34 GB | ⭐⭐⭐⭐⭐ | ⚡ | Full precision (too large for web) |

**Which one to choose?**

- **`model_q4f16.onnx` (235 MB)** ← **Start here!**
  - Best size/quality ratio for web apps
  - 4-bit quantization with fp16 precision
  - Fast download and inference
  - Good depth quality for portraits

- **`model_fp16.onnx` (669 MB)**
  - If you need maximum quality
  - Half precision (good quality, smaller than full precision)
  - Still reasonable for web deployment

- **`model_int8.onnx` (347 MB)**
  - Alternative if q4f16 doesn't work well
  - 8-bit integer quantization
  - Good compatibility

**License Note**: Depth Anything V2 Large uses **CC-BY-NC-4.0** (non-commercial only). For commercial use, consider Depth Anything V2 Small (Apache 2.0).

**Direct Download Links:**

1. **Recommended**: [model_q4f16.onnx (235 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx)
2. **High Quality**: [model_fp16.onnx (669 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_fp16.onnx)
3. **Alternative**: [model_int8.onnx (347 MB)](https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_int8.onnx)

**Other Model Sources:**
- **Depth Anything V2 Small**: Better for commercial use (Apache 2.0 license)
- Search Hugging Face: [depth-anything-v2-onnx](https://huggingface.co/models?search=depth+anything+onnx)

#### Step 2: Place the Model File

1. Create the models directory if it doesn't exist:
   ```bash
   mkdir -p public/models
   ```

2. Place your ONNX model file in `public/models/`:
   ```bash
   # Example: if you downloaded depth-anything-v2-small.onnx
   cp /path/to/your/model.onnx public/models/depth-anything-v2-small.onnx
   ```

3. Rename the downloaded file to match what the app expects, or update the path:
   ```bash
   # Rename to the default expected name
   mv model_q4f16.onnx public/models/depth-anything-v2-small.onnx
   
   # OR keep your filename and update the code (see below)
   ```

4. The app looks for `/models/depth-anything-v2-small.onnx` by default. To use a different filename:
   - Update the model path in `src/components/Viewer.tsx` (around line 47):
     ```typescript
     const modelPath = '/models/model_q4f16.onnx'  // or your filename
     ```

#### Step 3: Model Requirements

Your ONNX model should:
- Accept RGB input images (3 channels)
- Output depth predictions (single channel or multi-channel)
- Have input shape `[1, 3, H, W]` (batch, channels, height, width)
- Have normalized input values in range `[0, 1]`

The app handles various output shapes automatically:
- Single channel: `[1, 1, H, W]` or `[1, H, W]`
- Multi-channel: Takes the first channel if multiple are present

### Option 2: Convert a PyTorch/TensorFlow Model to ONNX

If you have a PyTorch or TensorFlow model, convert it to ONNX:

#### From PyTorch:

```python
import torch
import torch.onnx

# Load your PyTorch model
model = YourDepthModel()
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 384, 384)  # Adjust size to your model

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "depth-model.onnx",
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch', 2: 'height', 3: 'width'},
                  'output': {0: 'batch', 2: 'height', 3: 'width'}},
    opset_version=11  # or higher
)
```

#### From TensorFlow:

```python
import tensorflow as tf
import tf2onnx

# Load your TensorFlow model
model = tf.keras.models.load_model('model.h5')

# Convert to ONNX
spec = (tf.TensorSpec((None, 384, 384, 3), tf.float32, name="input"),)
output_path = "depth-model.onnx"
tf2onnx.convert.from_keras(model, input_signature=spec, output_path=output_path)
```

### Option 3: Use the Fallback (No Model Required)

If you don't provide a model, the app will automatically use a simple **radial gradient depth map**. This creates a basic parallax effect where:
- The center of the image is "closer" (more displacement)
- The edges are "farther" (less displacement)

**Limitations of fallback:**
- Not as realistic as ML-generated depth
- Works best with centered portraits
- No understanding of actual scene geometry

**When to use fallback:**
- Quick testing/prototyping
- Understanding the UI and cursor tracking
- Testing performance without loading large models

### Model Size Considerations

**Quantized Models (200-350MB)**
- ✅ Fast loading and inference
- ✅ Works well on most devices
- ✅ Good for web deployment
- ✅ Quality is excellent for portraits
- **Example**: `model_q4f16.onnx` (235 MB) ← **Recommended**

**Half Precision Models (600-700MB)**
- ✅ Very high quality depth maps
- ⚠️ Slower initial load (~2-3x longer)
- ⚠️ Requires more memory
- ⚠️ May be slow on lower-end devices
- **Example**: `model_fp16.onnx` (669 MB)

**Full Precision Models (1GB+)**
- ✅ Maximum quality
- ❌ Too large for practical web use
- ❌ Very slow download and inference
- **Not recommended for web apps**

**Recommendation**: 
- **Start with `model_q4f16.onnx` (235 MB)** - best balance
- Only upgrade to `model_fp16.onnx` if you need higher quality and can accept slower loading
- Avoid full precision models (`model.onnx`) for web deployment

### Troubleshooting

**Model won't load:**
- Check browser console for errors
- Verify the file path matches exactly (case-sensitive)
- Ensure the model file is in `public/models/` (not `src/`)
- Check that the file is served correctly (should be accessible at `/models/your-model.onnx`)

**Model loads but inference fails:**
- Check that input shape matches expected format `[1, 3, H, W]`
- Verify output shape is compatible (single or multi-channel depth)
- Check browser console for ONNX Runtime errors
- Try a different execution provider (WebGPU → WebGL → WASM → CPU)

**Slow inference:**
- Use a quantized model (`model_q4f16.onnx` instead of `model_fp16.onnx`)
- Reduce input image size (edit `CONFIG.maxImageWidth` in `src/config.ts`)
- Check which execution provider is being used (check console logs)
- Consider using WebGPU if available (requires compatible browser/GPU)
- The quantized models (q4f16, int8) are significantly faster than fp16

**File too large:**
- Use `model_q4f16.onnx` (235 MB) instead of larger variants
- Consider using Depth Anything V2 Small if available (smaller base model)
- Check if your hosting/CDN has file size limits

### Testing Without a Model

To test the app immediately without downloading a model:

1. Run `npm run dev`
2. Upload a portrait image
3. The app will show "Generating depth map..." briefly
4. It will automatically fall back to the radial gradient depth map
5. You can still test cursor tracking and all UI controls

The fallback works well enough to demonstrate the parallax effect, though it won't be as realistic as ML-generated depth.

## Project Structure

```
src/
├── components/          # React components
│   ├── Upload.tsx      # Image upload dropzone
│   ├── Viewer.tsx      # Three.js viewer with depth parallax
│   └── Controls.tsx    # UI controls (intensity, smoothing, debug)
├── lib/
│   ├── cursor/         # Cursor mapping logic
│   ├── depth/          # Depth inference and processing
│   ├── three/          # Three.js scene setup
│   └── atlas/          # Atlas mode stub (not implemented)
├── shaders/            # GLSL shaders for parallax
└── config.ts           # Configuration constants
```

## Configuration

Edit `src/config.ts` to adjust:

- Angle clamps (yaw ±12°, pitch ±8°)
- Smoothing parameters
- Dead zone size
- Depth scale
- Mesh subdivisions
- Performance thresholds

## Deployment

### Vercel

Vercel automatically detects and deploys serverless functions from the `api/` directory. No special configuration needed!

**Quick Deploy:**

```bash
npm install -g vercel
vercel
```

**Using Atlas Mode (Replicate API):**

If you want to use the dynamic atlas generation feature:

1. **Set Environment Variable in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add: `REPLICATE_API_TOKEN` = `your_replicate_api_token`
   - Redeploy your project

2. **For Local Development:**
   Create `.env.local` in the project root:
   ```bash
   REPLICATE_API_TOKEN=your_token_here
   ```

The `api/generate-gaze.ts` file will automatically be deployed as a serverless function at `/api/generate-gaze`. No additional setup required!

**Note:** Serverless functions work with any framework (Vite, Next.js, etc.). Vercel automatically detects files in the `api/` directory and deploys them as serverless functions.

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Note:** Netlify uses a different serverless function format. For Netlify, you'd need to create functions in the `netlify/functions/` directory. See Netlify Functions documentation for details.

Or connect your GitHub repo to Vercel/Netlify for automatic deployments.

## Atlas Mode (Optional)

The app supports **two approaches** for gaze-tracking:

### Option A: Depth-Based Parallax (Default)
- Uses depth maps + Three.js shaders
- Continuous smooth motion
- No external API required
- See "Depth Model Setup" above

### Option B: Pre-Generated Atlas Images
- Uses grid of pre-generated gaze images
- More realistic results (AI-generated)
- Requires image generation step

**Two ways to generate atlas images:**

1. **Dynamic Generation (Recommended)** - Generate on-demand via Replicate API:
   - Uses serverless function at `api/generate-gaze.ts`
   - Set `REPLICATE_API_TOKEN` environment variable
   - See `ATLAS_SETUP.md` for details
   - Cost: ~$0.01-0.02 per full atlas (121 images)

2. **Offline Generation** - Use Python script:
   - Reference: [kylan02/face_looker](https://github.com/kylan02/face_looker)
   - Generate images locally
   - Place in `public/faces/` directory
   - Free but requires manual steps

## Limitations

- Requires WebGL support for depth-based rendering
- Depth model must be downloaded separately (or use fallback)
- Atlas mode requires setup (either Replicate API token or pre-generated images)
- Eye tracking is stubbed (placeholder)

## Future Enhancements

- Atlas mode implementation (pre-generated gaze grid)
- Eye tracking overlay
- Mobile optimizations
- Model hosting/CDN integration
- Shareable URLs with embedded depth data

## References

- Research document: `RESEARCH.md`
- Atlas setup guide: `ATLAS_SETUP.md`
- Replicate integration: `REPLICATE_INTEGRATION.md`
- Atlas approach reference: [kylan02/face_looker](https://github.com/kylan02/face_looker)

## License

MIT


```

Updated `README.md` with a clear explanation. Summary:

## Serverless functions: not Next.js-specific

**This is a Vite + React app, not Next.js.** Vercel serverless functions work with any framework.

### How it works

1. Vercel detects files in the `api/` directory
2. Any `.ts`/`.js` file in `api/` becomes a serverless function
3. No framework-specific setup needed — works with Vite, Next.js, or plain HTML

### Your setup

- File: `api/generate-gaze.ts`
- Automatically deployed as: `/api/generate-gaze`
- Framework: Vite + React (not Next.js)
- No config changes needed

### What you need to do

1. Deploy to Vercel (they detect the `api/` folder automatically)
2. Add environment variable: `REPLICATE_API_TOKEN` in Vercel dashboard
3. Done

The README now includes:
- Explanation that Vercel auto-detects `api/` directory
- Step-by-step environment variable setup
- Note that it works with any framework (not just Next.js)
- Atlas mode documentation

Serverless functions are framework-agnostic—just put files in `api/` and Vercel handles the rest.

---

**User**

Create the PLAN for this next phase of implementation

Where are the generated images stored?

---

**Cursor**

- Dynamic (Replicate): They’re hosted on Replicate’s CDN; the serverless function returns a URL. The app only keeps those URLs in memory (and the browser may cache them); nothing is written to your repo or `public/`.

```150:154:api/generate-gaze.ts
return res.status(200).json({
  success: true,
  imageUrl: finalPrediction.output,
  px,
  py,
})
```

- Offline (pre-gen): If you generate with a script, files are created locally (e.g., `out/`) and you copy them into `public/faces/` for serving.

```73:81:RESEARCH.md
**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── ...
  └── index.csv
```
```

```typescript
return res.status(200).json({
  success: true,
  imageUrl: finalPrediction.output,
  px,
  py,
})
```

```plaintext
**Output Structure:**
```

---

**User**

Think carefully and explain.

A user uses my site.

It uses the function via Vercel -> Replicate

Are the images persisted?

---

**Cursor**

```plaintext
150:154:api/generate-gaze.ts
```

Short answer: Not by your app.

- In our setup, images generated via Vercel → Replicate are hosted on Replicate’s CDN. The serverless function just returns the URL; we don’t save files to your repo, `public/`, or any storage.
```150:154:api/generate-gaze.ts
return res.status(200).json({
  success: true,
  imageUrl: finalPrediction.output,
  px,
  py,
})
```
- Persistence details:
  - In your app/Vercel: not persisted; stateless.
  - In the browser: may be cached temporarily; we don’t store beyond memory unless you add localStorage/IndexedDB.
  - On Replicate: files live at their CDN URLs; retention is controlled by Replicate and not guaranteed permanent. For long‑term use, you should copy the image to your own storage (e.g., S3/R2/Supabase).

- Offline/pre-gen alternative: if you generate locally, you place the files into `public/faces/` and they are then persisted with your build.

```typescript
return res.status(200).json({
  success: true,
  imageUrl: finalPrediction.output,
  px,
  py,
})
```

