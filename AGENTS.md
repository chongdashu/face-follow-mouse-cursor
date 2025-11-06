# AGENTS.md

This file contains rules and guidelines for AI agents (like Claude Code) working on this codebase. Following these rules helps prevent common errors and maintains code quality.

---

## TypeScript Strict Mode Rules

This project uses **strict TypeScript mode**. All code must pass `tsc` compilation with no errors.

### 1. Avoid Literal Type Inference

**Problem:** TypeScript may infer string literals instead of the `string` type, causing assignment errors.

**Bad:**
```typescript
let modelPath = CONFIG.modelPath  // Type: ""
if (!modelPath) {
  modelPath = '/models/depth.onnx'  // Error: Type '"/models/depth.onnx"' is not assignable to type '""'
}
```

**Good:**
```typescript
let modelPath: string = CONFIG.modelPath  // Explicit type annotation
if (!modelPath) {
  modelPath = '/models/depth.onnx'  // ✓ OK
}
```

**Rule:** When declaring variables that will be reassigned to different string values, always add explicit type annotations.

---

### 2. Check for Null/Undefined Before Access

**Problem:** Accessing properties on potentially null/undefined refs causes TS18047 errors.

**Bad:**
```typescript
if (sceneStateRef.current.renderer) {
  sceneStateRef.current.renderer.render(  // Error: 'sceneStateRef.current' is possibly 'null'
    sceneStateRef.current.scene,          // Error: 'sceneStateRef.current' is possibly 'null'
    sceneStateRef.current.camera          // Error: 'sceneStateRef.current' is possibly 'null'
  )
}
```

**Good:**
```typescript
// Option 1: Use optional chaining for all accesses
if (sceneStateRef.current?.renderer && sceneStateRef.current?.scene && sceneStateRef.current?.camera) {
  sceneStateRef.current.renderer.render(
    sceneStateRef.current.scene,
    sceneStateRef.current.camera
  )
}

// Option 2: Cache the ref value
const sceneState = sceneStateRef.current
if (sceneState?.renderer && sceneState?.scene && sceneState?.camera) {
  sceneState.renderer.render(sceneState.scene, sceneState.camera)
}
```

**Rule:** Always use optional chaining (`?.`) or explicit null checks when accessing ref properties in all locations within a conditional block.

---

### 3. Remove Unused Imports

**Problem:** Importing but not using variables causes TS6133 errors.

**Bad:**
```typescript
import { useAtlasMode, cursorToGridCoords, createAtlasKey } from '../lib/atlas/useAtlasMode'
// Only useAtlasMode is used in the file
```

**Good:**
```typescript
import { useAtlasMode } from '../lib/atlas/useAtlasMode'
```

**Rule:** Only import what you use. Remove unused imports immediately.

---

### 4. Ref Type Safety Patterns

**Problem:** Refs can be null, especially in useEffect cleanup or early execution.

**Best Practice:**
```typescript
const sceneStateRef = useRef<ReturnType<typeof createScene> | null>(null)

useEffect(() => {
  // Always check before use
  if (!sceneStateRef.current) return

  // Or cache and check once
  const state = sceneStateRef.current
  if (!state) return

  // Now safe to use 'state' without null checks
  state.renderer.render(state.scene, state.camera)
}, [dependency])
```

**Rule:** Never assume refs are populated. Always check or use optional chaining.

---

### 5. Async/Await Variable Scope

**Problem:** Variables assigned in try-catch blocks may not be accessible outside.

**Bad:**
```typescript
let modelPath
if (!CONFIG.modelPath) {
  try {
    modelPath = '/local/path'  // Might infer wrong type
  } catch {
    modelPath = CONFIG.modelCdnUrl  // Type mismatch potential
  }
}
```

**Good:**
```typescript
let modelPath: string = CONFIG.modelPath

if (!modelPath) {
  try {
    modelPath = '/local/path'
  } catch {
    modelPath = CONFIG.modelCdnUrl || ''
  }
}
```

**Rule:** Initialize variables with type annotations before try-catch blocks.

---

### 6. Optional Chaining Consistency

**Problem:** Using optional chaining on first access but not subsequent ones.

**Bad:**
```typescript
if (sceneStateRef.current?.material?.uniforms?.depthMap) {
  sceneStateRef.current.material.uniforms.depthMap.value = texture  // ✗ Missing checks
  sceneStateRef.current.material.uniformsNeedUpdate = true          // ✗ Missing checks
}
```

**Good:**
```typescript
// Option 1: Cache after checking
const material = sceneStateRef.current?.material
if (material?.uniforms?.depthMap) {
  material.uniforms.depthMap.value = texture
  material.uniformsNeedUpdate = true
}

// Option 2: Use optional chaining throughout (if inside the same if block)
if (sceneStateRef.current?.material?.uniforms?.depthMap) {
  // TypeScript narrows the type inside this block for the first check
  const material = sceneStateRef.current.material
  material.uniforms.depthMap.value = texture
  material.uniformsNeedUpdate = true
}
```

**Rule:** Either cache values after null checks or use consistent optional chaining.

---

## Pre-Commit Checklist

Before committing code changes, always:

1. **Run the build:**
   ```bash
   npm run build
   ```
   Must complete with no TypeScript errors.

2. **Run the linter:**
   ```bash
   npm run lint
   ```
   Must pass with no errors.

3. **Check for unused imports:**
   - TypeScript will report TS6133 errors
   - Remove any unused imports immediately

4. **Verify ref accesses:**
   - Search for `.current` in your changes
   - Ensure all uses have null checks or optional chaining

5. **Check variable declarations:**
   - Look for `let` declarations that get reassigned
   - Add explicit type annotations if needed

---

## Common Error Patterns & Fixes

### TS2322: Type 'X' is not assignable to type 'Y'
- **Cause:** Literal type inference
- **Fix:** Add explicit type annotation: `let variable: string = value`

### TS18047: 'X' is possibly 'null'
- **Cause:** Missing null check on refs or optional properties
- **Fix:** Use optional chaining `X?.property` or explicit null check

### TS6133: 'X' is declared but its value is never read
- **Cause:** Unused import or variable
- **Fix:** Remove the unused declaration

### TS2532: Object is possibly 'undefined'
- **Cause:** Accessing property on potentially undefined object
- **Fix:** Use optional chaining or add guard clause

---

## Testing Changes

After making changes:

1. **Development server:** `npm run dev`
   - Vite will show TypeScript errors in real-time
   - Fix errors as they appear

2. **Production build:** `npm run build`
   - Final verification before committing
   - Must complete successfully

3. **Manual testing:**
   - Upload an image
   - Test all controls
   - Check browser console for runtime errors

---

## IDE Configuration

For best results, ensure your IDE:

1. Uses the project's TypeScript version (not global)
2. Has ESLint integration enabled
3. Shows inline TypeScript errors
4. Auto-imports use correct paths (relative imports)

VS Code settings (`.vscode/settings.json`):
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Summary

**Golden Rule:** If TypeScript complains, it's usually right. Don't fight the type system—work with it.

**Most Common Fixes:**
1. Add type annotations to reassigned variables
2. Use optional chaining on refs and optional properties
3. Remove unused imports
4. Cache ref values after null checks for cleaner code

**Verification:**
- Run `npm run build` before every commit
- Zero TypeScript errors is mandatory
- Warnings should be addressed or explicitly documented
