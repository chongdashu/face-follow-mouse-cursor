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

#### 1. Dynamic Generation via Replicate API (Recommended)

Generate gaze image grids on-demand using the Replicate API. This serverless approach keeps your API key secure and generates images at runtime.

**Overview:**
- **Vercel Serverless Function** (`api/generate-gaze.ts`) - Securely handles Replicate API calls
- **Client-side service** (`src/lib/replicate/generateGaze.ts`) - Makes requests to the serverless function
- **AtlasGenerator component** - UI for generating atlas images on-demand
- No need to pre-generate images; generate as needed

**Setup Steps:**

1. **Get Replicate API Token:**
   - Sign up at [replicate.com](https://replicate.com)
   - Go to [API Tokens](https://replicate.com/account/api-tokens)
   - Create and copy your token

2. **Configure Environment Variable:**

   **For Local Development:**
   Create `.env.local` in project root:
   ```bash
   REPLICATE_API_TOKEN=your_token_here
   ```

   **For Vercel Deployment:**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `REPLICATE_API_TOKEN` with your token value
   - Redeploy your project

   **For Netlify Deployment:**
   - Go to your Netlify site settings
   - Navigate to "Environment variables"
   - Add `REPLICATE_API_TOKEN` with your token value
   - Redeploy your site

3. **Install Dependencies:**
   The serverless function uses standard Node.js APIs. No additional dependencies required.

4. **Test the Setup:**
   ```bash
   npm run dev
   ```
   Then upload a portrait image and click "Generate Atlas" button

**Usage Examples:**

Generate single image:
```typescript
import { generateGazeImage } from './lib/replicate/generateGaze'

const result = await generateGazeImage({
  image: portraitImage,
  px: 0,  // Horizontal gaze angle
  py: 0,  // Vertical gaze angle
})

console.log(result.imageUrl) // URL to generated image
```

Generate full atlas:
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

**Architecture:**

```
React App (Browser)
    ↓ HTTP POST /api/generate-gaze
Vercel Serverless Function
    ↓ HTTPS + API Token
Replicate API (fofr/expression-editor)
    ↓ Generated Image URL
Display/Cache in Browser
```

**API Function Details:**

**Endpoint:** `POST /api/generate-gaze`

**Request Body:**
```json
{
  "image": "base64_encoded_image_string",
  "px": 0,
  "py": 0
}
```

**Success Response:**
```json
{
  "success": true,
  "imageUrl": "https://replicate.delivery/...",
  "px": 0,
  "py": 0
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

**Cost Estimation:**
- Per image: ~$0.0001
- Full atlas (121 images): ~$0.01-0.02
- Test set (25 images): ~$0.0025

See [Replicate Pricing](https://replicate.com/pricing) for current rates.

**Security Notes:**
- ✅ API key never exposed to client - only used in serverless function
- ✅ Serverless function validates all input
- ✅ Error handling with graceful failures
- ⚠️ Consider adding usage limits or user confirmation for large batches

**Troubleshooting:**

**"REPLICATE_API_TOKEN not configured"**
- Make sure `.env.local` exists and contains the token
- For Vercel: Check environment variables in project settings
- Restart dev server after adding `.env.local`

**CORS Errors**
- Make sure you're calling `/api/generate-gaze` (relative path)
- The serverless function handles CORS automatically

**Generation Timeout**
- Single image generation takes ~2-10 seconds
- Full atlas (121 images) takes ~5-20 minutes
- Function polls for up to 60 seconds per image
- For faster results, use smaller step values or generate in batches

**Rate Limits**
- Replicate may have rate limits on free tier
- Code generates images sequentially to avoid limits
- Consider adding delays between requests if needed

#### 2. Offline Generation via Python Script

Pre-generate atlas images locally using the Python script from the reference implementation.

**Overview:**
- Use the Python script from [kylan02/face_looker](https://github.com/kylan02/face_looker) repo
- Uses `fofr/expression-editor` model on Replicate
- Requires: Python, Replicate API token
- Supports resume via `--skip-existing` flag

**Setup:**

1. Clone or reference the [kylan02/face_looker](https://github.com/kylan02/face_looker) repository
2. Set environment variable: `export REPLICATE_API_TOKEN=your_token_here`
3. Install dependencies: `pip install replicate`

**Generation:**

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

**Parameters:**
- `px`/`py` in [-15, 15] with configurable step → ~121 images at 256×256 (11×11 grid with step=3)
- Naming pattern: `gaze_px{X}_py{Y}_256.webp`
  - Negative values use 'm' prefix: `gaze_pxm15_pym15_256.webp`
  - Positive values: `gaze_px15_py15_256.webp`
  - Zero/center: `gaze_px0_py0_256.webp`

**Output Structure:**
```
out/
  ├── gaze_px-15_py-15_256.webp
  ├── gaze_px-15_py-12_256.webp
  ├── ...
  ├── gaze_px15_py15_256.webp
  └── index.csv  # Optional CSV mapping
```

**Deployment:**
1. Generate images locally
2. Copy to `public/faces/` directory
3. Use existing `AtlasViewer` component

**When to Use:**
- Free (after initial cost of generation)
- All images pre-generated and ready
- Requires manual generation steps before deployment
- Good for static hosting where you want predictable costs

**Cost:**
- ~$0.0001 per image on Replicate
- 121 images (default): ~$0.01
- 169 images (step=2.5): ~$0.02
- One-time cost; free to deploy

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

