# Atlas Mode (Dynamic Replicate) – Implementation Plan

### Goal

Add an optional Atlas Mode that generates a gaze image grid using Replicate at runtime (via `/api/generate-gaze`) and swaps images based on cursor position. Keep the existing depth-based mode as default.

### Key Files to Modify/Create

- `src/App.tsx`: Mode selection and flow wiring
- `src/components/AtlasViewer.tsx`: Implement viewer (currently stub)
- `src/lib/atlas/useAtlasMode.ts`: Finish hook to map cursor → grid image
- `src/components/Controls.tsx`: Add simple mode toggle (Depth / Atlas)
- `src/components/AtlasGenerator.tsx`: Use the generator UI (already added) when a portrait is uploaded
- `src/lib/replicate/generateGaze.ts`: Use single/batch generation helpers
- `api/generate-gaze.ts`: Serverless function already scaffolded (ensure env + model params)

### Implementation Steps

1. UI and State Wiring

- Add a Mode toggle (Depth / Atlas) in `Controls.tsx` and surface mode state in `App.tsx`.
- When in Atlas mode and a portrait is uploaded, show `AtlasGenerator` to produce the atlas (full or test set) and store the image map in state.

2. Atlas Viewer

- Replace `src/components/AtlasViewer.tsx` with an `<img>` based viewer:
- Track mouse/touch within container; map to `(px, py)` using `cursorToGridCoords()`.
- Resolve current image src from: (a) generated image map (if present), else (b) `gridCoordsToFilename()` under `public/faces/`.
- Optional cross-fade when swapping images.

3. Hook Finalization

- Implement `useAtlasMode` to:
- Accept `config`, cursor, container dims, and either a generated `imageMap` or base path.
- Return `{ currentImage, isLoading, error }` and handle simple preloading of adjacent grid cells.

4. Generation UX & Guardrails

- In `AtlasGenerator`, keep sequential generation (avoids rate limits), show progress and total cost estimate, allow cancel (disable button + stop loop), and expose errors clearly.
- Cache generated URLs in memory and optionally persist to `localStorage` keyed by a hash of the portrait (future enhancement).

5. Serverless Function Validation

- Confirm `REPLICATE_API_TOKEN` is required; return 500 if missing.
- Validate `px/py` ∈ [−15, 15]; coerce/return 400 on invalid input.
- Use the correct model + version for `fofr/expression-editor`; return prediction URL(s).

6. Performance & Fallbacks

- Add small debounce (e.g., 16 ms) in cursor handler to reduce swaps.
- Preload the 4 nearest neighbor images to current grid cell.
- If an image is missing (404), fall back to center `px0_py0`.

7. Testing

- Local: set `.env.local` with `REPLICATE_API_TOKEN`; verify `/api/generate-gaze` works.
- UI: test 3×3 (test set) and 11×11 (full) generations; verify grid mapping matches filenames and movement feels discrete but responsive.
- Edge cases: container resize, touch input, slow network, partial generation.

8. Docs

- README already updated with Vercel setup; ensure `ATLAS_SETUP.md` and `RESEARCH.md` reflect runtime generation and usage.

### Acceptance Criteria

- Mode toggle switches between Depth and Atlas without reloads.
- In Atlas mode, cursor swaps among generated (or static) images; minimal flicker.
- Generation via Replicate works locally and on Vercel with env var set.
- Errors are surfaced; app continues to function with fallbacks.
- Documentation is accurate and concise.