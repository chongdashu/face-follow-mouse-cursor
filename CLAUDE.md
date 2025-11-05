# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Face Follow Mouse Cursor** is a React + TypeScript proof-of-concept web application that creates a depth-based 2.5D parallax effect on portrait images, making them appear to "follow" the cursor. The application runs entirely in the browser with no backend dependencies.

**Key Technologies:**
- React 18 with TypeScript (strict mode)
- Vite for building and development
- Three.js for 3D rendering with custom WebGL shaders
- ONNX Runtime for on-device ML depth inference (WASM/WebGL/WebGPU)

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start Vite dev server with HMR (http://localhost:5173)
npm run build            # TypeScript compilation + Vite production build
npm run preview          # Preview production build locally
npm run lint             # Run ESLint (strict TypeScript + React hooks rules)
```

### Development Workflow
1. Run `npm install` once to set up dependencies
2. `npm run dev` starts the dev server with hot module reload
3. Edit files and see changes instantly in the browser
4. `npm run lint` to check for issues before committing
5. `npm run build` to verify production build works

## Project Architecture

### High-Level Data Flow

```
User Uploads Image
    ↓
Upload Component (drag-drop or file input)
    ↓
App Component manages state (portraitImage, depthMap, controls)
    ↓
Viewer Component orchestrates:
    ├─ OnnxDepthRunner → ONNX depth inference with fallback
    ├─ createScene() → Three.js scene with custom shaders
    ├─ CursorMapper → Convert cursor position to rotation angles
    └─ Animation loop → Real-time parallax rendering
    ↓
Controls Component → UI sliders for intensity, smoothing, rotation ranges
```

### Directory Structure

```
src/
├── components/
│   ├── Upload.tsx           # Image upload with drag-drop (169 lines)
│   ├── Upload.css
│   ├── Viewer.tsx           # Main scene orchestrator (517 lines)
│   ├── Viewer.css
│   ├── Controls.tsx         # UI sliders and debug panel (141 lines)
│   └── Controls.css
├── lib/
│   ├── cursor/
│   │   └── mapInput.ts      # CursorMapper class: cursor → rotation angles
│   ├── depth/
│   │   ├── onnxRunner.ts    # ONNX inference wrapper with providers fallback
│   │   └── normalize.ts     # Depth post-processing (smoothing, normalization)
│   ├── three/
│   │   └── createScene.ts   # Three.js scene setup with custom vertex/fragment shaders
│   └── atlas/
│       └── useAtlasMode.ts  # Stub for future atlas rendering
├── workers/
│   └── depthWorker.ts       # Web Worker for depth processing (unused stub)
├── App.tsx                  # Root component: upload → viewer flow
├── App.css
├── main.tsx                 # React entry point
├── index.css                # Global styles
└── config.ts                # Configuration constants (angles, smoothing, thresholds)
```

### Key Components

**Viewer.tsx (517 lines - Core component)**
- Manages state: portraitImage, depthMap, intensity, smoothing, rotation angles
- Three effects:
  1. Depth inference via ONNX model or fallback radial gradient
  2. Three.js scene initialization with portrait and depth textures
  3. Animation loop with cursor tracking and FPS monitoring
- Handles window resize, scene cleanup, and error states
- Debug panel shows real-time yaw/pitch angles and frame rate

**createScene.ts (175 lines)**
- Initializes Three.js scene, camera, renderer
- Creates PlaneGeometry with configurable subdivisions (128 default)
- Implements custom vertex shader: samples depth map, displaces vertices based on yaw/pitch
- Implements custom fragment shader: texture pass-through
- Uniforms: portraitMap, depthMap, depthScale, yaw, pitch
- Handles aspect ratio, window resize, resource cleanup

**CursorMapper (mapInput.ts - 103 lines)**
- Converts screen coordinates to rotation angles
- Algorithm: normalize cursor → apply dead zone → map to angles → EMA smoothing → clamp
- Config: yawRange ±12°, pitchRange ±8°, emaAlpha 0.1-0.35, deadZone 8%

**OnnxDepthRunner (onnxRunner.ts - 136 lines)**
- Wraps ONNX Runtime inference
- Provider fallback: WebGPU → WebGL → WASM → CPU
- Input preprocessing: RGBA→RGB, normalization to [0,1], NCHW tensor format
- Post-processing: normalization, bilateral smoothing
- Methods: initialize(modelPath), infer(imageData, smoothing), dispose()

## Configuration (src/config.ts)

All tunable parameters are centralized. Key values:
- `yawRange: 12` - Horizontal rotation limit (±12°)
- `pitchRange: 8` - Vertical rotation limit (±8°)
- `emaAlpha: 0.2` - Default smoothing factor (configurable 0.1-0.35)
- `deadZone: 0.08` - Dead zone size (8% of viewport)
- `depthScale: 0.015` - Parallax intensity (configurable 0.01-0.025)
- `meshSubdivisions: 128` - Vertex density (lower on weak devices)
- `maxImageWidth: 1024` - Input image resize limit

Adjust these values to fine-tune behavior without touching component code.

## Depth Model Setup

The application expects an ONNX depth estimation model. If not provided, it gracefully falls back to a radial gradient depth map.

**Expected Model:**
- Path: `/public/models/depth-anything-v2-small.onnx`
- Input: RGBA image data
- Output: Depth map (single or multi-channel)
- Input format: NCHW tensor `[1, 3, H, W]` with values [0, 1]

**Recommended Model:**
Download `model_q4f16.onnx` (235 MB) from Hugging Face and place in `public/models/`:
```bash
mkdir -p public/models
# Download model_q4f16.onnx (235 MB)
# https://huggingface.co/onnx-community/depth-anything-v2-large/resolve/main/onnx/model_q4f16.onnx
mv model_q4f16.onnx public/models/depth-anything-v2-small.onnx
```

See README.md for model download links and alternatives.

## Special Patterns & Conventions

**Reference-Based State:**
- Uses `useRef` for mutable scene state (sceneStateRef, cursorMapperRef) to avoid unnecessary re-renders
- Proper cleanup in effect return functions
- Resource disposal pattern with `dispose()` methods

**Effect Dependency Management:**
- Viewer uses multiple focused `useEffect` hooks
- Careful dependency arrays to avoid infinite loops
- Depth inference depends on portraitImage
- Scene setup depends on portraitImage + depthMap
- Animation loop depends on sceneReady

**Error Handling & Fallbacks:**
- Model loading fails gracefully with fallback depth
- Detailed console logging for debugging
- Error banners displayed to users
- Multiple ONNX execution providers as fallback chain

**Performance Optimization:**
- Configurable mesh subdivisions for lower-end devices
- Real-time FPS monitoring
- Automatic complexity reduction if frame time exceeds threshold
- Provider fallback ensures compatibility across browsers

**TypeScript Strictness:**
- Strict mode enabled in tsconfig.json
- No implicit `any` types
- ESLint enforces react-hooks/recommended rules

## Common Tasks

**Adjust Parallax Effect:**
1. Edit `src/config.ts`: Change `depthScale` or `yawRange`/`pitchRange`
2. Or use UI sliders in Controls component for runtime testing

**Change Model Path:**
1. Update `/public/models/` directory structure
2. Modify model path in `Viewer.tsx` around line 47: `const modelPath = '/models/your-model.onnx'`
3. Ensure model format matches ONNX depth estimation spec

**Add New Control:**
1. Add state variable in `Viewer.tsx`
2. Create slider in `Controls.tsx`
3. Use state to modify scene behavior (uniforms, geometry, etc.)
4. Update `config.ts` if it's a tunable parameter

**Debug 3D Rendering:**
1. Use browser DevTools: Three.js inspector extension
2. Enable debug panel in Controls (shows yaw/pitch/FPS)
3. Check console for shader compilation errors
4. Adjust `meshSubdivisions` in config if performance drops

## Deployment

**Vercel:**
- Connected via `vercel.json`
- Build command: `npm run build`
- Output directory: `dist/`

**Netlify:**
- Connected via `netlify.toml`
- Build command: `npm run build`
- SPA routing configured (all requests → `/index.html`)

Both platforms serve static files from `dist/` directory after build.

## Important Implementation Notes

**Depth Model Inference Performance:**
- Model loading is the bottleneck (235+ MB download)
- Inference time is acceptable on most devices (~100-500ms)
- Use quantized models (q4f16) for production, not full precision
- Execution provider fallback ensures cross-browser compatibility

**Shader Vertex Displacement:**
- Vertex shader samples depth map and applies sine-wave displacement based on yaw/pitch
- Displacement magnitude: `(depth - 0.5) * depthScale`
- Rotation applied as: `sin(yaw) * displacement` and `sin(pitch) * displacement`
- Results in convincing parallax illusion when following cursor

**Three.js Resource Cleanup:**
- Renderer, geometry, material, textures all explicitly disposed
- Effect cleanup functions prevent memory leaks
- Important for long-lived applications (e.g., browser tabs)

**Cursor Mapping with Dead Zone:**
- Cursor position normalized to [-1, 1] screen coordinates
- Dead zone creates hysteresis: rotations decay to zero in center
- EMA smoothing interpolates angle changes across frames
- Result: smooth, natural-feeling cursor tracking

## Testing & Quality

- **No automated tests** - Project is MVP phase
- Run `npm run lint` to check code quality
- `npm run build` includes TypeScript type checking
- Browser DevTools console shows detailed error logs

## Browser Compatibility

- Requires **WebGL support** (Three.js requirement)
- ONNX Runtime supports modern browsers (Chrome, Firefox, Safari, Edge)
- WebGPU available in newer browsers (Chrome 113+, Edge 113+, Safari 18+)
- Fallback chain ensures graceful degradation

## References

- **Research & Design Details:** See `RESEARCH.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`
- **README:** Overview, model setup, deployment instructions
