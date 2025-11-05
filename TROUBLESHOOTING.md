# Troubleshooting Guide

## Common Console Errors and Solutions

### 1. "Model file not found" or 404 Error

**Error Message:**
```
Model file not found at /models/depth-anything-v2-small.onnx. Using fallback depth map.
```

**What it means:**
- The ONNX model file is missing from `public/models/`
- The app will automatically use a fallback depth map (radial gradient)

**Solution:**
- This is **normal** if you haven't downloaded a model yet
- The app will still work with the fallback depth map
- To use a real model: Download `model_q4f16.onnx` and place it in `public/models/`
- See README.md for download instructions

**How to verify:**
- Check if `public/models/depth-anything-v2-small.onnx` exists
- Or check browser Network tab for 404 on `/models/depth-anything-v2-small.onnx`

---

### 2. ONNX Runtime Initialization Errors

**Error Messages:**
```
Failed to initialize with webgpu: ...
Failed to initialize with webgl: ...
Failed to initialize ONNX Runtime with any execution provider
```

**What it means:**
- ONNX Runtime is trying different execution providers (WebGPU → WebGL → WASM → CPU)
- None of them are working

**Solutions:**

**Option A: Missing ONNX Runtime Package**
```bash
npm install onnxruntime-web
```

**Option B: Browser Compatibility**
- Ensure you're using a modern browser (Chrome, Firefox, Edge, Safari)
- WebGL requires GPU support
- Try a different browser

**Option C: Use Fallback Only (For Testing)**
Edit `src/config.ts`:
```typescript
useFallbackOnly: true,  // Skip ONNX entirely
```

---

### 3. "Could not get canvas context" Error

**Error Message:**
```
Could not get canvas context
```

**What it means:**
- Failed to create 2D canvas context for image processing

**Solutions:**
- Check browser console for other errors
- Try refreshing the page
- Ensure the uploaded image is valid (JPG, PNG, or WebP)

---

### 4. Blank Canvas After Page Refresh or Reset

**Symptoms:**
- Image loads briefly on first upload, then canvas goes blank
- Refreshing the page breaks the app
- Works on first load but fails on reload

**Root Cause:**
- React Strict Mode in development runs effects twice: mount → cleanup → mount
- Animation loop wasn't properly synchronized with scene initialization
- Texture loading was asynchronous, causing timing issues
- Scene was disposed before animation loop could start

**Solution:**
This has been fixed in the latest version. The following changes resolved it:
1. **Use CanvasTexture for immediate availability** - textures are now ready immediately instead of async loading
2. **Track scene readiness** - animation loop only starts after scene is fully initialized
3. **Render first frame immediately** - ensures the canvas isn't blank even if animation loop hasn't started
4. **Proper cleanup** - scene disposal is centralized and complete
5. **Fix texture orientation** - textures are flipped correctly

If you're still experiencing this issue:
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS)
- Clear browser cache for localhost
- Check DevTools Console for any lingering errors

---

### 4b. Scene Exists but Cursor Input Listeners Not Attached

**Symptoms:**
- Canvas shows the portrait image correctly
- Face doesn't move when you move the cursor
- Debug panel shows yaw/pitch always at 0

**Root Cause:**
- Cursor input event listeners were attaching before `sceneReady` was true
- Effects that depend only on empty dependencies `[]` run before the scene is initialized
- Listeners bound to a stale reference or non-existent canvas

**Solution:**
- Cursor input effect must depend on `sceneReady` to rebind listeners only after scene initialization
- When `sceneReady` changes to true, the effect runs again and re-attaches listeners to the active canvas

If still not working:
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS)
- Check DevTools Console for any event listener errors
- Ensure debug panel shows yaw/pitch values changing (if they do, the shader issue is separate)

---

### 5. Three.js Scene Initialization Errors

**Error Messages:**
```
Failed to initialize scene
WebGL context lost
```

**What it means:**
- Three.js can't create a WebGL context
- GPU/driver issues

**Solutions:**
- Update your graphics drivers
- Try a different browser
- Check if WebGL is enabled: https://get.webgl.org/
- On macOS, ensure GPU acceleration is enabled in System Preferences

---

### 6. "Failed to create fallback depth map" Error

**Error Message:**
```
Failed to create fallback depth map
```

**What it means:**
- Even the fallback depth map creation failed
- This is rare and indicates a deeper issue

**Solutions:**
- Check if `portraitImage.width` and `portraitImage.height` are valid numbers
- Check browser console for JavaScript errors
- Try uploading a different image

---

### 7. Import/Module Errors

**Error Messages:**
```
Cannot find module 'onnxruntime-web'
Cannot find module 'three'
```

**Solutions:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### 8. TypeScript Errors During Build

**Error Messages:**
```
Type error: ...
```

**Solutions:**
```bash
# Check TypeScript version
npm list typescript

# Rebuild
npm run build
```

---

### 9. Atlas Mode: Image Disappears on Page Resize

**Symptoms:**
- Atlas mode works fine initially
- When you resize the browser window, the image disappears
- Grid coordinates stop updating

**Root Cause:**
- Container dimensions were being read from `ref.current.clientWidth/Height` without triggering re-renders
- When window resized, dimensions changed but React didn't know about it
- useAtlasMode hook received stale dimensions

**Solution (Fixed):**
Track container dimensions in component state with a resize listener:

```typescript
// Track dimensions in state
const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })

// Listen to window resize
useEffect(() => {
  const updateDimensions = () => {
    if (containerRef.current) {
      setContainerDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      })
    }
  }

  updateDimensions() // Initial update
  window.addEventListener('resize', updateDimensions)
  return () => window.removeEventListener('resize', updateDimensions)
}, [sceneReady])

// Use state dimensions in useAtlasMode
const atlasState = useAtlasMode(
  generatedAtlas || null,
  mousePositionRef.current.x,
  mousePositionRef.current.y,
  containerDimensions.width,  // Use state, not ref
  containerDimensions.height,
  config
)
```

Now when you resize, state updates trigger re-renders and the image stays visible ✅

---

## Debugging Steps

### Step 1: Check Browser Console

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Look for errors (red text)
4. Check Network tab for failed requests

### Step 2: Verify File Structure

```bash
# Check if required files exist
ls -la public/models/
ls -la src/components/Viewer.tsx
ls -la src/lib/depth/onnxRunner.ts
```

### Step 3: Test Fallback Mode

Edit `src/config.ts`:
```typescript
useFallbackOnly: true,
```

This will skip ONNX model loading entirely and use the fallback depth map.

### Step 4: Check Network Requests

1. Open DevTools → Network tab
2. Upload an image
3. Look for:
   - `/models/depth-anything-v2-small.onnx` (should be 404 if model missing)
   - Any other failed requests

### Step 5: Verify Dependencies

```bash
# Check installed packages
npm list onnxruntime-web three react

# Should show versions:
# onnxruntime-web@^1.19.2
# three@^0.169.0
# react@^18.3.1
```

---

## Quick Fixes

### "Nothing happens when I upload an image"

1. Check browser console for errors
2. Verify the image is valid (try a different image)
3. Check if WebGL is supported: https://get.webgl.org/
4. Try the fallback mode (set `useFallbackOnly: true`)

### "The face doesn't follow the cursor"

1. Check if Three.js scene initialized (look for errors)
2. Open debug panel (click "Show Debug" button)
3. Check if yaw/pitch values are changing:
   - **If debug panel shows yaw/pitch values changing to non-zero:** The parallax displacement may be too small to see (check "Vertex Shader Displacement Too Small" below)
   - **If debug panel shows yaw/pitch stuck at 0:** Cursor input listeners didn't attach (see below)
4. Try adjusting the **Intensity slider** to increase parallax effect strength
5. Try adjusting yaw/pitch range sliders to increase rotation sensitivity

**If yaw/pitch values are stuck at 0:**
- Scene may exist but cursor input listeners didn't attach
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS)
- Ensure cursor input effect depends on `sceneReady` to rebind after scene init

**Root Cause (Fixed):**
- Cursor input listeners were attaching before scene was ready, so they never bound to the canvas
- Solution: Input effect now waits for `sceneReady` and rebinds when the scene initializes

---

### "Vertex Shader Displacement Too Small" (Debug Shows Values Changing But Image Doesn't Move)

**Symptoms:**
- Debug panel shows yaw/pitch values changing (e.g., yaw: 5.23°, pitch: 2.15°)
- Image appears completely static - no parallax effect visible
- Intensity slider doesn't help much

**Root Cause:**
- Vertex shader displacement calculation was multiplying too many small values together
- With depthScale = 0.015 and sin(angle) ≈ 0.2, actual displacement was only ~0.15% of plane size
- The effect was mathematically correct but visually imperceptible

**Solution (Fixed):**
Updated vertex shader in `src/lib/three/createScene.ts` to:
1. Expand depth range: `(depth - 0.5) * 2.0` instead of `(depth - 0.5)`
2. Apply stronger multiplier: added `* 2.0` to increase displacement 4x
3. Simplified calculation for clarity

The updated shader now produces visible parallax that matches cursor movement.

### "App is very slow"

1. Use a smaller model (`model_q4f16.onnx` instead of `model_fp16.onnx`)
2. Reduce `maxImageWidth` in `src/config.ts`
3. Check which execution provider is being used (check console logs)
4. Consider using fallback mode for testing

---

## Getting Help

If you're still stuck:

1. **Check console errors** - Copy the full error message
2. **Check browser/OS** - Version and platform
3. **Check Network tab** - Any failed requests?
4. **Try fallback mode** - Does it work with `useFallbackOnly: true`?

---

## Expected Behavior

### Without Model File:
- ✅ App should still work
- ✅ Uses fallback depth map (radial gradient)
- ⚠️ Shows warning in console
- ℹ️ Shows error banner (but viewer still works)

### With Model File:
- ✅ Loads ONNX model
- ✅ Generates depth map from image
- ✅ Shows viewer with depth-based parallax
- ✅ No error messages

Both modes should result in a working viewer - the difference is depth quality!

