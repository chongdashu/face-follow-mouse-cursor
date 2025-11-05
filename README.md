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

