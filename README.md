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

## Depth Model

The app expects an ONNX depth estimation model at `/public/models/depth-anything-v2-small.onnx`.

**Note**: For the PoC, you'll need to:

1. Download a compatible depth estimation model (e.g., Depth Anything V2 Small)
2. Convert it to ONNX format if needed
3. Place it in `public/models/`

Alternatively, the app will use a fallback radial gradient depth map if the model is not found.

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

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

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

