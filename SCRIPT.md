# 🎬 Face-Tracking Video Production Guide

> **Quick Start:** Jump to [Copy-Paste Script](#-copy-paste-script-template) to record in 5 minutes.

---

## 🚀 Quick Start (5 min setup → Hit Record)

1. **Clean workspace:**
   - Close unnecessary tabs/windows
   - Open only: Browser (with deployed app), Cursor IDE, Terminal (Claude Code)

2. **Prepare demo assets:**
   - Have 2-3 portrait images ready to upload
   - Have `aioriented-profile.png` ready for quick demo

3. **Start recording:**
   - Screen resolution: 1920x1080 or 2560x1440
   - Record desktop audio + microphone
   - Use OBS, QuickTime, or preferred tool

4. **Shortest path to recording:**
   - Scroll to [Copy-Paste Script Template](#-copy-paste-script-template)
   - Read it verbatim while demoing
   - Done.

---

## 📊 Video Structure & Timestamps

```
0:00 - Hook (Face Tracking Demo)
0:15 - Inspiration + Real Development Journey (Chat Exports)
1:30 - Architecture Overview (Depth + Atlas Modes)
2:30 - Cursor IDE Workflow (Visual Debugging)
4:00 - Claude Code Workflow (Terminal Power)
5:00 - Real Problems Solved (Aspect Ratio, Caching, UX)
6:00 - Technical Deep Dive (ONNX, Shaders, Algorithms)
7:30 - The Rate Limit Dance (Switching Tools)
8:30 - Final Results & Performance
10:00 - Conclusion & Links
```

**Total: ~10 minutes** (or 5-min version below)

---

## 🎥 Scene-by-Scene Breakdown

### Scene 1: Hook (0:00-0:15)

**What to show:** Final app running with smooth face tracking

**What to say:**
> "This portrait follows my cursor in real-time, entirely in the browser. No backend, no Python—just TypeScript and WebGL. But here's the twist: I built this using TWO AI coding assistants, switching between them strategically. Let me show you why."

**Actions:**
- Move cursor around smoothly
- Show face tracking cursor
- Zoom in on eyes following

**Files to have open:** Browser with deployed app

---

### Scene 2: Inspiration + Real Journey (0:15-1:30)

**What to show:** RESEARCH.md + chat_exports folder

**What to say:**
> "This started with Wes Bos's viral tweet about face-tracking effects. I found two approaches: depth-based parallax using WebGL shaders, and AI-generated gaze images. Most people pick one. I built both.
>
> But here's what that actually looked like. These are my exported chat logs from Cursor—over 83,000 lines across six major debugging sessions. The AI didn't write this in one shot. These logs show the real process: fixing aspect ratio bugs, implementing deterministic hashing for cross-browser caching, polishing the UI. It's collaborative debugging, not magic."

**Actions:**
- Show RESEARCH.md comparison table (lines 117-126)
- Pan to `chat_exports/` folder
- Run: `ls -lh chat_exports/`
- Highlight: `cursor_fix_image_aspect_ratio_in_app.md` (15,526 lines)

**On-screen text:**
- Depth Mode: WebGL + ONNX
- Atlas Mode: Replicate API + Image Grid
- 83,107 lines of chat logs = Real development

**Files to have open:**
- `RESEARCH.md` (lines 106-127)
- Terminal showing chat_exports/

**Key insight:** AI coding isn't instant—it's collaborative debugging.

---

### Scene 3: Architecture Overview (1:30-2:30)

**What to show:** Code structure, file tree

**What to say:**
> "Let's break down the architecture. The depth-based approach uses a 235-megabyte ONNX model that runs entirely in your browser—yes, machine learning inference with no server. It generates a depth map, then Three.js shaders displace vertices based on cursor position.
>
> The atlas mode uses a different strategy: it generates 121 different gaze images using Replicate's AI API, then swaps them based on where your cursor is. Think of it like a flipbook animation, but for eye tracking.
>
> The key insight? Both modes share the same cursor mapping logic—dead zones, exponential smoothing, and angle clamping for natural motion."

**Visual flow diagram:**
```
Upload → ONNX Depth Model → Three.js Scene → Custom Shaders → Real-time Parallax

OR

Upload → Replicate API → 121 Gaze Images → Image Swapping → Atlas Mode
```

**Actions:**
- Show file tree in Cursor
- Highlight key directories: `src/components/`, `src/lib/`, `api/`

---

### Scene 4: Cursor IDE Workflow (2:30-4:00)

**What to show:** Live coding in Cursor with real examples

**What to say:**
> "I use Cursor when I need visual feedback. Watch: I'm editing the Three.js scene creation code. Cursor shows inline errors, autocompletes Three.js types, and integrates with the browser dev tools. When debugging the atlas mode aspect ratio bug, I could see the canvas rendering in real-time while adjusting the code."

**Actions:**
- Open `src/lib/three/createScene.ts`
- Show autocomplete working (type `THREE.`)
- Open browser dev tools showing Three.js scene
- Make a small edit, show instant feedback

**Example code to highlight:**
```typescript
// src/lib/three/createScene.ts - Custom vertex shader
uniform sampler2D depthMap;
uniform float depthScale;
uniform float yaw;
uniform float pitch;
```

**Files to have open:**
- `src/lib/three/createScene.ts` (lines 20-80, shader code)
- `src/components/Viewer.tsx` (lines 713-734, atlas texture loading)
- Browser with dev tools

**Real example from chat:** "The aspect ratio bug—atlas images were zoomed in. Cursor helped me trace through the canvas drawing logic visually."

---

### Scene 5: Claude Code Workflow (4:00-5:00)

**What to show:** Terminal with Claude Code

**What to say:**
> "When I hit rate limits in Cursor, I switch to Claude Code in the terminal. No downtime. I can run the dev server in the background, make quick file edits, manage git commits, and deploy to Vercel—all without leaving the terminal. This isn't just about features; it's about continuous flow."

**Actions:**
- Show dev server running: `npm run dev` in background
- Make a quick edit to a file using Claude Code
- Show git workflow: `git status`, `git log --oneline -5`
- Demonstrate switching from Cursor when rate limited

**Commands to demo:**
```bash
npm run dev  # Show running in background
git log --oneline -5
git status
# Make a quick edit via Claude Code
# Show the file changed
```

**Key point:** "Two tools = resilience. When one rate limits, switch to the other."

---

### Scene 6: Real Problems Solved (5:00-6:00)

**What to show:** Actual debugging journey from chat exports

**What to say:**
> "AI coding isn't magic. Here are real problems I hit: Image aspect ratios were broken in atlas mode—images were zoomed in. The fix? Understanding how canvas drawing works and inverting the aspect-fit logic. Cross-browser caching failed because JPEG compression is non-deterministic. The fix? Hash raw pixel data instead of compressed images. These took iterations."

**Problem 1: Image Aspect Ratio Bug**
- From: `chat_exports/cursor_fix_image_aspect_ratio_in_app.md`
- Issue: "Atlas images were zoomed in, not maintaining aspect ratio"
- Root cause: Inverted aspect-fit logic in canvas drawing
- Show git diff of the fix (Viewer.tsx lines 713-734)
- Cursor's browser integration helped identify rendering issue

**Problem 2: Cross-Browser Caching**
- From: `chat_exports/cursor_crop_images_to_square_format.md`
- Issue: "Same demo image has different hashes in different browsers"
- Root cause: JPEG compression is non-deterministic
- Solution: Hash raw pixel data instead of compressed images
- Show: Before (broken caching) vs After (shared cache)

**Problem 3: User Experience Polish**
- From: `chat_exports/cursor_add_quick_access_button_for_prof.md`
- Added quick-access button for example portrait
- Made it "friendlier looking" with sparkle animation
- Small touches that make the app delightful

**Key files:**
- `chat_exports/cursor_fix_image_aspect_ratio_in_app.md` (lines 1-50)
- `chat_exports/cursor_crop_images_to_square_format.md` (lines 85-130)
- Git diff: `git show <commit-hash>`

**Talking point:** "Cursor helped me understand root causes, Claude Code helped implement fixes quickly."

---

### Scene 7: Technical Deep Dive (6:00-7:30)

**What to say:**
> "Let me show you the most technically interesting parts. First, ONNX depth inference—235MB model running in-browser with WebGPU/WebGL/WASM fallback. Second, custom vertex shaders that displace vertices based on depth. Third, the cursor mapping algorithm with dead zones and EMA smoothing. Finally, Vercel serverless functions calling Replicate API to generate atlas images."

#### 1. ONNX Inference (45 sec)
- Open: `src/lib/depth/onnxRunner.ts` (lines 40-60)
- Highlight: Provider fallback chain
- Show: Browser console with provider selection logs

```typescript
// 235MB model running with WebGPU/WebGL/WASM fallback
const session = await InferenceSession.create(modelPath, {
  executionProviders: ['webgpu', 'webgl', 'wasm']
})
```

**Why it's cool:**
- No Python backend needed
- Runs entirely client-side
- Automatic provider fallback

#### 2. Custom Shaders (45 sec)
- Open: `src/lib/three/createScene.ts` (lines 20-50)
- Highlight: Vertex displacement code
- Show: Side-by-side depth map and result

```glsl
// Vertex shader displaces vertices based on depth
vec3 displaced = pos + normal * (depth - 0.5) * depthScale;
displaced.x += sin(yaw) * depth * depthScale;
displaced.y += sin(pitch) * depth * depthScale;
```

**Visual:** Show parallax effect side-by-side with code

#### 3. Cursor Mapping (45 sec)
- Open: `src/lib/cursor/mapInput.ts` (lines 50-80)
- Highlight: Dead zone, EMA smoothing, clamping
- Show: Debug panel with real-time yaw/pitch values

```typescript
// Dead zone + EMA smoothing + angle clamps
const yaw = clamp(nx * 12, -12, 12)
state.yaw = lerp(state.yaw, yaw, emaAlpha) // Smooth interpolation
```

**Why it's cool:** Creates natural, jitter-free motion

#### 4. Serverless Atlas Generation (45 sec)
- Open: `api/generate-gaze.ts`
- Open: `src/lib/replicate/generateGaze.ts` (lines 20-50)
- Show: AtlasGenerator UI in action

```typescript
// Vercel serverless function → Replicate API
// Keeps API key secure, generates on-demand
const result = await generateGazeImage({ image, px, py })
```

**Files to screen record:**
- Each file mentioned above
- Browser with debug panel enabled
- Browser showing atlas generation progress

---

### Scene 8: The Rate Limit Dance (7:30-8:30)

**What to show:** Switching between tools

**What to say:**
> "Here's the honest reality: you hit rate limits. A lot. But with two tools, I'm never blocked. Working in Cursor, hit limit—switch to Claude Code, continue in terminal. By the time I need visual debugging again, Cursor's refreshed. This is the real workflow."

**Show the workflow:**
```
Working in Cursor → Hit rate limit
   ↓
Switch to Claude Code → Continue in terminal
   ↓
Cursor refreshes → Switch back for visual work
   ↓
Repeat!
```

**Actions:**
- Show rate limit message in Cursor (screenshot or recreate)
- Switch to Claude Code terminal
- Show continuing work
- Switch back to Cursor

**Visual:** Split screen showing both tools side-by-side

**Key Insight:** "Having two AI assistants isn't just about features—it's about resilience. When one hits rate limits, I switch to the other. No downtime, continuous flow."

---

### Scene 9: Results & Learnings (8:30-10:00)

**What to show:** Final app demo + key stats

**What to say:**
> "So what did we build? A production-ready face-tracking app that runs at 60 FPS on mid-tier laptops. It handles depth-based parallax AND atlas-based gaze tracking. It's deployed on Vercel with serverless functions. And the entire codebase is TypeScript with strict mode—no runtime surprises."

**Actions:**
- Upload a portrait image
- Show depth generation (use example image for speed)
- Demonstrate cursor tracking smoothly
- Switch to atlas mode
- Show atlas generation UI
- Use quick-access button
- Display FPS counter

**Stats to Highlight:**
- 517 lines: Viewer.tsx (core orchestrator)
- 175 lines: createScene.ts (Three.js + shaders)
- 235 MB: ONNX depth model running in-browser
- 121 images: Default atlas grid (11×11)
- 83,107 lines: Total chat export logs (real development process)
- 6 major debugging sessions captured in chat exports
- 2 tools: Cursor + Claude Code working in tandem

**Key Learnings:**
1. **Cursor excels at:** Visual debugging, component refactoring, inline errors
2. **Claude Code excels at:** Terminal workflows, git operations, background tasks
3. **Together:** Complementary strengths, rate limit resilience
4. **Architecture:** Clean separation (components, lib, workers)
5. **TypeScript:** Strict mode prevented runtime errors

---

### Scene 10: Conclusion (10:00-10:30)

**What to show:** GitHub repo + links

**What to say:**
> "The future of coding isn't about choosing one AI tool—it's about orchestrating multiple tools strategically. Cursor for visuals, Claude Code for terminals. Why limit yourself?
>
> The code is open source on GitHub, there's a live demo link in the description, and I'd love to hear which approach you prefer—depth or atlas mode. Drop a comment and let me know. Thanks for watching!"

**Actions:**
- Show final smooth tracking
- Display GitHub and demo links
- End screen with subscribe button

**Call to Action:**
- GitHub repo link
- Live demo link
- "Try it yourself—upload your portrait"
- "Comment which AI coding tool you prefer"

---

## 📝 Copy-Paste Script Template

**Use this if you want to just read and record:**

```
[SCENE 1 - HOOK]
"This portrait follows my cursor in real-time, entirely in the browser.
No Python backend, no external services—just TypeScript and WebGL.
But here's the twist: I built this using TWO AI coding assistants,
switching between them strategically. Let me show you why."

[Show demo - move cursor around]

[SCENE 2 - THE JOURNEY]
"This project started with Wes Bos's viral tweet about face tracking.
I found two approaches: depth-based parallax and AI-generated gaze images.
Most people pick one. I built both. And here's what that actually looked like."

[Show chat_exports/ folder]

"These are my exported chat logs from Cursor—over 83,000 lines of debugging
conversations. The AI helped me solve real problems: aspect ratio bugs,
image caching, deterministic hashing. This wasn't magic—it was iteration."

[Show ls -lh chat_exports/]

[SCENE 3 - DUAL WORKFLOW]
"I use Cursor when I need visual feedback. Watch: I'm editing the shader code,
and Cursor shows inline errors and autocompletes Three.js types."

[Show Cursor IDE with createScene.ts]

"But when I hit rate limits—and you will hit rate limits—I switch to Claude Code
in the terminal. No downtime. I keep working: run tests, manage git, deploy to Vercel."

[Show Claude Code terminal]

"Two tools means I'm never blocked. That's the real workflow."

[SCENE 4 - REAL PROBLEMS]
"AI coding isn't magic. Here's a real problem: atlas images were zoomed in.
The fix? Understanding canvas drawing and inverting the aspect-fit logic.
Cross-browser caching failed because JPEG compression is non-deterministic.
The fix? Hash raw pixel data instead. These took iterations."

[Show chat export files and git diffs]

[SCENE 5 - TECHNICAL HIGHLIGHTS]
"Let me show you the coolest parts. This 235MB ONNX depth model runs entirely
in your browser with automatic fallback from WebGPU to WebGL to WebAssembly."

[Show onnxRunner.ts]

"The vertex shader displaces vertices based on depth, creating the parallax effect."

[Show createScene.ts shader code]

"The cursor mapping uses dead zones and exponential smoothing for natural motion."

[Show mapInput.ts]

"And the atlas generation uses Vercel serverless functions to call Replicate API,
keeping the API key secure."

[Show api/generate-gaze.ts]

[SCENE 6 - FINAL DEMO]
"Here's the final result. Upload an image—depth inference runs in-browser.
The portrait follows at 60 FPS. Switch to atlas mode and generate 121 gaze images.
All deployed on Vercel."

[Show full demo]

[SCENE 7 - CLOSING]
"The code's open source—link in the description. The key lesson? Don't pick one
AI tool. Use multiple strategically. Cursor for visuals, Claude Code for terminals.
Why limit yourself? Try it and let me know what you build."

[Show GitHub link]
```

---

## 🎤 Talking Points Cheat Sheet

### Opening Hook
- "Built entirely in browser, no backend"
- "Used TWO AI tools strategically"
- "Let me show you why"

### The Journey
- "83,107 lines of debugging conversations"
- "AI helped iterate, not instant solve"
- "This is what AI coding actually looks like"

### Cursor Strengths
- "Visual debugging"
- "Inline errors and autocomplete"
- "Browser integration"
- "Component-level work"

### Claude Code Strengths
- "Terminal workflows"
- "Background processes"
- "Git operations"
- "Quick file edits"

### Technical Highlights
- "235MB model in browser"
- "Custom WebGL shaders"
- "Dead zone + EMA smoothing"
- "Serverless Replicate API"

### Real Problems
- "Aspect ratio bug—inverted logic"
- "Cross-browser caching—hash pixel data"
- "Iterations, not magic"

### Rate Limit Reality
- "Hit limits often"
- "Two tools = no downtime"
- "Continuous flow"

### Key Lesson
- "Don't pick one tool"
- "Use multiple strategically"
- "Resilience through redundancy"

---

## 🎬 Simplified 5-Minute Version

**If short on time, record these 3 scenes:**

### Scene 1: Hook + Demo (1 min)
- Show final app working
- "Built with two AI tools switching between them"

### Scene 2: The Workflow (3 min)
- Split screen: Cursor for visual work, Claude Code for terminal
- Show real problem from chat exports: aspect ratio bug
- Show rate limit switching

### Scene 3: Results + Lesson (1 min)
- Final demo
- "Use multiple AI tools strategically"
- Links

**Total: 5 minutes**

---

## 📊 Recording Checklist

### Priority 1 (Must Have)
- [ ] Final app demo with cursor tracking
- [ ] Uploading image → depth generation → tracking
- [ ] Atlas mode demonstration
- [ ] Quick-access button in action

### Priority 2 (Highly Recommended)
- [ ] Cursor IDE: editing `createScene.ts` with autocomplete
- [ ] Cursor IDE: browser dev tools integration
- [ ] Claude Code: terminal workflow (dev server, git)
- [ ] Rate limit message (screenshot) + switching tools
- [ ] Chat exports folder with file sizes

### Priority 3 (Nice to Have)
- [ ] Git commit history showing iterations
- [ ] Side-by-side code + result for shaders
- [ ] Atlas generation progress UI

### Pre-Production
- [ ] Set up screen recording (1080p or 4K)
- [ ] Clean up desktop/browser tabs
- [ ] Prepare 2-3 sample portraits for demo
- [ ] Test both Cursor and Claude Code environments
- [ ] Have Vercel deployment ready

### Post-Production
- [ ] Add text overlays for code snippets
- [ ] Highlight key lines of code (yellow boxes)
- [ ] Add arrows/annotations for important features
- [ ] Speed up slow parts (model loading, atlas generation)
- [ ] Background music (low volume, non-distracting)
- [ ] End screen with links

---

## 🎯 One-Sentence Summary of Each Scene

1. **Hook:** Face tracks cursor, built with two AI tools
2. **Inspiration + Journey:** Wes Bos tweet, 83K lines of debugging chats
3. **Architecture:** Depth mode (ONNX + shaders) vs Atlas mode (AI images)
4. **Cursor Workflow:** Visual debugging, inline errors, browser integration
5. **Claude Code Workflow:** Terminal work, git, no downtime on rate limits
6. **Real Problems:** Aspect ratio, caching, UX polish—iterations, not magic
7. **Technical Deep Dive:** ONNX in browser, shaders, cursor mapping, serverless
8. **Rate Limit Dance:** Two tools = continuous flow
9. **Results:** Production app, 60 FPS, deployed on Vercel
10. **Closing:** Use multiple AI tools strategically

---

## 💡 Pro Tips

1. **Talk while coding:** Don't edit in silence. Narrate what you're thinking.
2. **Show failures:** The aspect ratio bug makes the success more compelling.
3. **Use split screen:** Show Cursor + Claude Code side-by-side.
4. **Speed up boring parts:** Model loading, atlas generation—fast-forward in editing.
5. **Add text overlays:** Highlight key code lines with yellow boxes.
6. **Background music:** Low volume, non-distracting.
7. **Energy:** Keep energy high but not frantic. Enthusiasm is contagious.
8. **Show, don't tell:** Let the code and visuals speak.

---

## 🎥 Visual B-Roll Ideas

1. **Screen recordings:**
   - Cursor IDE: Inline errors, autocomplete, browser integration
   - Claude Code: Terminal commands, background processes
   - Switch between tools (show rate limit message → switch)

2. **Code snippets to highlight:**
   - Custom shader code (vertex/fragment)
   - ONNX inference setup
   - Cursor mapping algorithm
   - Replicate API integration

3. **Live app demo:**
   - Upload different portraits
   - Show depth generation (loading spinner → result)
   - Cursor tracking smoothness
   - Atlas generation (show progress)
   - Performance metrics (FPS counter)

4. **Side-by-side comparisons:**
   - Depth mode vs Atlas mode
   - Before/after shader tweaks
   - Rate limit handling (Cursor → Claude Code)

---

## 🎯 Key Differentiators for Your Video

1. **Dual-tool workflow** - Most coding videos show one tool. You show strategic switching.
2. **Real technical depth** - Custom shaders, ONNX in browser, serverless integration
3. **Real iteration** - 83K lines of chat logs show actual debugging process
4. **Two implementation approaches** - Depth vs Atlas (inspired by tweets)
5. **Rate limit resilience** - Honest about limitations, practical solution
6. **Production-ready** - Deployed on Vercel, not just localhost

---

## 🔗 Links for Video Description

**GitHub Repository:**
[github.com/your-username/face-follow-mouse-cursor]

**Live Demo:**
[your-vercel-deployment-url.vercel.app]

**Reference Implementation:**
- Wes Bos Tweet: https://x.com/wesbos/status/1985465640648339578
- Face Looker Repo: https://github.com/kylan02/face_looker

**Tools Used:**
- Cursor IDE: https://cursor.com
- Claude Code: https://claude.com/code
- Three.js: https://threejs.org
- ONNX Runtime: https://onnxruntime.ai
- Replicate API: https://replicate.com

**Technologies:**
- React + TypeScript
- Vite
- Three.js
- ONNX Runtime Web
- Vercel Serverless Functions

---

## 🎯 Target Audience

**Primary:**
- Web developers interested in AI coding tools
- Three.js / WebGL developers
- Creative coders exploring ML in browser
- Developers comparing Cursor vs other AI tools

**Secondary:**
- Content creators interested in face-tracking effects
- Students learning modern web development
- Tech enthusiasts curious about AI assistants

**Key Message:**
Using multiple AI coding tools strategically is more productive than relying on just one.

---

## 📝 Additional Notes

### Tone & Pacing
- Keep energy high but not frantic
- Pause briefly between major sections
- Use "show, don't tell" for technical concepts
- Let the code and visuals speak

### Music Suggestions
- Upbeat but not distracting
- Lower volume during voiceovers
- Build energy during technical showcases
- Smooth transitions between sections

### Graphics to Create
- Architecture diagram (data flow)
- Tool comparison chart (Cursor vs Claude Code)
- Performance metrics overlay
- Code highlight boxes
- Arrows/annotations for complex code

### Common Pitfalls to Avoid
- Don't spend too long on any one topic
- Don't assume viewers know Three.js or ONNX
- Don't get too technical without visual aids
- Don't forget to show the final result multiple times
- Don't skip the "why this matters" explanations

---

## 🚦 Ready to Record?

**Option A: Full 10-minute video**
Go through all 10 scenes. Record 30-45 min of footage, edit down to 10 minutes.

**Option B: Quick 5-minute video**
Record 3 key scenes (Hook + Workflow + Results), edit down to 5 minutes.

**Option C: Just start NOW**
1. Open the app in browser
2. Start screen recording
3. Use the [Copy-Paste Script Template](#-copy-paste-script-template)
4. Read it while demoing
5. Done.

---

## 🎥 You're Ready. Hit Record.
