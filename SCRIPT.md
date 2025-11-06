# YouTube Video Script: "Building a Face-Tracking Web App with Cursor + Claude Code"

## 🎬 Video Outline

### **Hook (0:00-0:15)**
*Show the final result first - a portrait following the cursor smoothly*

"I built this face-tracking effect entirely in the browser using AI coding assistants. But here's the twist—I used TWO different AI tools, switching between them strategically to maximize productivity."

---

### **Act 1: The Inspiration (0:15-1:00)**

**Show the tweets from RESEARCH.md:**
- Wes Bos's tweet about the viral face tracker
- The two approaches: depth-based (WebGL shaders) vs pre-generated atlas (AI gaze images)

**Your Hook:**
"Instead of choosing one approach, I implemented BOTH. And I used two AI coding tools to do it:
- **Cursor IDE** for visual debugging and rapid prototyping
- **Claude Code** for terminal workflows and quick fixes"

---

### **Act 2: The Architecture (1:00-2:30)**

**Show the dual-mode system:**

#### **Mode 1: Depth-Based Parallax**
- Upload image → ONNX depth inference (235MB model running in-browser!)
- Three.js scene with custom vertex shaders
- Real-time parallax displacement based on cursor position

**Visual Demo:** Show the code structure
```
Upload → ONNX Depth Model → Three.js Scene → Custom Shaders → Real-time Parallax
```

#### **Mode 2: Atlas Generation**
- Replicate API integration via Vercel serverless functions
- Generate 121 gaze images (11×11 grid)
- Image swap based on cursor position

**Visual Demo:** Show the AtlasGenerator UI generating images

---

### **Act 3: The Dual-Tool Workflow (2:30-5:00)**
*This is the CORE differentiator of your video*

#### **When I Use Cursor IDE:**

**Strength: Visual Debugging + Browser Integration**

**Example 1: Fixing Shader Issues** (Show real example)
```typescript
// src/lib/three/createScene.ts - Custom vertex shader
uniform sampler2D depthMap;
uniform float depthScale;
uniform float yaw;
uniform float pitch;
```

**Show:**
- Cursor's inline error detection
- Browser dev tools integration
- Real-time Three.js scene inspection
- Visual diff when fixing shader uniforms

**Example 2: React Component Refactoring**
- Show the Upload component with drag-drop
- Cursor's autocomplete for TypeScript types
- Inline type checking as you code

---

#### **When I Use Claude Code:**

**Strength: Terminal Workflows + Background Tasks**

**Example 1: Running Dev Server + Debugging in Parallel**
```bash
npm run dev  # Running in background
git status   # Check changes
npm run lint # Fix type errors
```

**Show:**
- Terminal split view
- Background process monitoring
- Quick file edits via CLI

**Example 2: Vercel Deployment + Env Var Setup**
```bash
# Set up Replicate API integration
cp .env.local.example .env.local
# Deploy to Vercel with serverless functions
vercel --prod
```

**Example 3: Git Workflow**
```bash
git add .
git commit -m "Add atlas generation with caching"
git push origin main
```

---

### **Act 4: Technical Highlights (5:00-7:00)**
*Show the most impressive parts of the implementation*

#### **1. ONNX Depth Inference in Browser**
```typescript
// src/lib/depth/onnxRunner.ts
// 235MB model running with WebGPU/WebGL/WASM fallback
const session = await InferenceSession.create(modelPath, {
  executionProviders: ['webgpu', 'webgl', 'wasm']
})
```

**Why it's cool:**
- No Python backend needed
- Runs entirely client-side
- Automatic provider fallback

#### **2. Custom WebGL Shaders**
```glsl
// Vertex shader displaces vertices based on depth
vec3 displaced = pos + normal * (depth - 0.5) * depthScale;
displaced.x += sin(yaw) * depth * depthScale;
displaced.y += sin(pitch) * depth * depthScale;
```

**Visual:** Show the parallax effect side-by-side with code

#### **3. Cursor Mapping Algorithm**
```typescript
// src/lib/cursor/mapInput.ts
// Dead zone + EMA smoothing + angle clamps
const yaw = clamp(nx * 12, -12, 12)
state.yaw = lerp(state.yaw, yaw, emaAlpha) // Smooth interpolation
```

**Why it's cool:** Creates natural, jitter-free motion

#### **4. Serverless Atlas Generation**
```typescript
// api/generate-gaze.ts
// Vercel serverless function → Replicate API
// Keeps API key secure, generates on-demand
const result = await generateGazeImage({ image, px, py })
```

**Show:** The AtlasGenerator UI in action

---

### **Act 5: The Rate Limit Dance (7:00-8:00)**
*The reality of using AI coding assistants*

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

**Key Insight:**
"Having two AI assistants isn't just about features—it's about **resilience**. When one hits rate limits, I switch to the other. No downtime, continuous flow."

---

### **Act 6: Results & Learnings (8:00-9:30)**

**Show the final app:**
- Live demo: Upload image → Generate depth → Smooth tracking
- Show atlas mode: Generate gaze grid → Switch images
- Performance: 60 FPS on mid-tier laptop
- Deployment: Live on Vercel

**Stats to Highlight:**
- 517 lines: Viewer.tsx (core orchestrator)
- 175 lines: createScene.ts (Three.js + shaders)
- 235 MB: ONNX depth model
- 121 images: Default atlas grid
- 2 tools: Cursor + Claude Code

**Key Learnings:**

1. **Cursor excels at:** Visual debugging, component refactoring, inline errors
2. **Claude Code excels at:** Terminal workflows, git operations, background tasks
3. **Together:** Complementary strengths, rate limit resilience
4. **Architecture:** Clean separation (components, lib, workers)
5. **TypeScript:** Strict mode prevented runtime errors

---

### **Conclusion (9:30-10:00)**

**Call to Action:**
- GitHub repo link
- Live demo link
- "Try it yourself—upload your portrait"
- "Comment which AI coding tool you prefer"

**Final Thought:**
"The future of coding isn't about choosing ONE AI tool—it's about orchestrating MULTIPLE tools strategically. Cursor for visuals, Claude Code for terminals. Why limit yourself?"

---

## 🎥 Visual B-Roll Suggestions

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
3. **Two implementation approaches** - Depth vs Atlas (inspired by the tweets)
4. **Rate limit resilience** - Honest about limitations, practical solution
5. **Production-ready** - Deployed on Vercel, not just localhost

---

## 📊 Suggested Timestamps for Description

```
0:00 - The Result (Face Tracking Demo)
0:15 - Inspiration (Wes Bos Tweet + Two Approaches)
1:00 - Architecture Overview (Depth + Atlas Modes)
2:30 - Cursor IDE Workflow (Visual Debugging)
4:00 - Claude Code Workflow (Terminal Power)
5:00 - Technical Deep Dive (ONNX, Shaders, Algorithms)
7:00 - The Rate Limit Dance (Switching Tools)
8:00 - Final Results & Performance
9:30 - Conclusion & Links
```

---

## 🎬 Recording Checklist

### Pre-Production
- [ ] Set up screen recording (1080p or 4K)
- [ ] Clean up desktop/browser tabs
- [ ] Prepare sample portraits for demo
- [ ] Test both Cursor and Claude Code environments
- [ ] Have Vercel deployment ready
- [ ] Prepare tweet screenshots from RESEARCH.md

### Cursor IDE Scenes
- [ ] Record shader debugging with inline errors
- [ ] Show TypeScript autocomplete in Upload.tsx
- [ ] Demonstrate browser dev tools integration
- [ ] Show visual diff for component changes
- [ ] Record rate limit message (authentic!)

### Claude Code Scenes
- [ ] Record terminal workflow (dev server in background)
- [ ] Show git operations (status, commit, push)
- [ ] Demonstrate quick file edits via CLI
- [ ] Record Vercel deployment
- [ ] Show switching from Cursor when rate limited

### Technical Deep Dive
- [ ] Screen record: ONNX model loading sequence
- [ ] Show: createScene.ts with shader code highlighted
- [ ] Demonstrate: Cursor mapping with visual overlay
- [ ] Record: Atlas generation (full cycle)
- [ ] Capture: FPS counter during smooth tracking

### Live Demo
- [ ] Upload multiple different portraits
- [ ] Show depth map generation (fast-forward if needed)
- [ ] Demonstrate smooth cursor tracking
- [ ] Switch to atlas mode
- [ ] Show performance metrics

### Post-Production Notes
- [ ] Add text overlays for code snippets
- [ ] Highlight key lines of code (yellow boxes)
- [ ] Add arrows/annotations for important features
- [ ] Speed up slow parts (model loading, atlas generation)
- [ ] Background music (low volume, non-distracting)
- [ ] End screen with links

---

## 🎤 Detailed Script (Scene by Scene)

### Scene 1: Opening Hook (15 seconds)

**Visual:** Full-screen demo of portrait following cursor smoothly

**Voiceover:**
"Check this out—this portrait follows my cursor in real-time, entirely in the browser. No Python backend, no external services, just pure TypeScript and WebGL. But here's what makes this project unique: I built it using TWO AI coding assistants, strategically switching between them. Let me show you how."

**Action:** Move cursor around, show smooth tracking

---

### Scene 2: The Inspiration (45 seconds)

**Visual:** Show tweet from Wes Bos, reference implementation screenshots

**Voiceover:**
"This started with a viral tweet from Wes Bos about face-tracking effects. I found two fascinating approaches: one uses depth maps and WebGL shaders for continuous parallax, the other uses AI-generated gaze images in a grid pattern. Most people pick one approach. I said, why not build both?"

**Action:** Split screen showing both approaches

**On-screen text:**
- Depth Mode: WebGL + ONNX
- Atlas Mode: Replicate API + Image Grid

---

### Scene 3: Architecture Overview (1:30)

**Visual:** Code structure, file tree, architecture diagram

**Voiceover:**
"Let's break down the architecture. The depth-based approach uses a 235-megabyte ONNX model that runs entirely in your browser—yes, machine learning inference with no server. It generates a depth map, then Three.js shaders displace vertices based on cursor position.

The atlas mode uses a different strategy: it generates 121 different gaze images using Replicate's AI API, then swaps them based on where your cursor is. Think of it like a flipbook animation, but for eye tracking.

The key insight? Both modes share the same cursor mapping logic—dead zones, exponential smoothing, and angle clamping for natural motion."

**Action:** Animate the data flow diagram

---

### Scene 4: Cursor IDE in Action (1:30)

**Visual:** Screen recording in Cursor with live coding

**Voiceover:**
"Here's where the dual-tool strategy comes in. I use Cursor IDE when I need visual feedback. Watch this—I'm editing the vertex shader, and Cursor shows me inline type errors immediately. The autocomplete understands the Three.js API, the TypeScript types, everything.

When I'm debugging the Three.js scene, Cursor's browser integration is unbeatable. I can inspect the scene graph, check uniform values, and see shader compilation errors right in the IDE. For component-level work and visual debugging, Cursor is my go-to."

**Action:**
- Show inline error in shader code
- Demonstrate autocomplete
- Show browser dev tools integration
- Fix a bug with visual feedback

---

### Scene 5: Claude Code in Action (1:30)

**Visual:** Terminal screen with Claude Code

**Voiceover:**
"But when I need to work with the terminal, git operations, or run background processes, I switch to Claude Code. Watch—I can run the dev server in the background, monitor the output, and make quick edits without leaving the terminal.

Claude Code excels at workflow automation. Setting up environment variables, deploying to Vercel, managing git commits—all of this is faster in the terminal. And here's the real trick: when Cursor hits its rate limit, I just switch to Claude Code and keep working. No downtime."

**Action:**
- Show dev server running in background
- Execute git commands
- Make a quick file edit
- Show rate limit message → switch tools

---

### Scene 6: Technical Deep Dive (2:00)

**Visual:** Code walkthroughs with highlighted sections

**Voiceover:**
"Let me show you the most technically interesting parts. First, the ONNX inference. This depth estimation model is 235 megabytes, and it runs entirely client-side using WebGPU, WebGL, or WebAssembly as a fallback. No server needed.

Second, the custom shaders. The vertex shader samples the depth map and displaces each vertex based on the cursor's yaw and pitch. The math is actually quite elegant—we use sine waves to create the parallax effect.

Third, the cursor mapping algorithm. We normalize cursor position, apply a dead zone to prevent jitter, use exponential moving average for smoothing, and clamp to realistic head rotation angles. This is what makes the motion feel natural.

Finally, the atlas generation. We use Vercel serverless functions to call the Replicate API, keeping our API key secure. The function generates images on-demand and caches them for performance."

**Action:**
- Highlight code sections as mentioned
- Show side-by-side comparison of shader effect
- Visualize the cursor mapping algorithm
- Show atlas generation in real-time

---

### Scene 7: The Rate Limit Dance (1:00)

**Visual:** Split screen showing both tools, switching between them

**Voiceover:**
"Here's the honest truth about using AI coding assistants: you hit rate limits. A lot. But having two tools changes the game completely.

I'm working in Cursor, building out a component, and boom—rate limit. Instead of waiting, I immediately switch to Claude Code, continue in the terminal, push some changes, run tests. By the time I need visual debugging again, Cursor's refreshed and I switch back.

This isn't just about features—it's about resilience and continuous flow. Two tools mean you're never blocked."

**Action:**
- Show rate limit message in Cursor
- Switch to Claude Code terminal
- Continue working
- Switch back to Cursor
- Overlay: "No downtime, continuous productivity"

---

### Scene 8: Results & Learnings (1:30)

**Visual:** Live demo of final app, performance metrics

**Voiceover:**
"So what did we build? A production-ready face-tracking app that runs at 60 FPS on mid-tier laptops. It handles depth-based parallax AND atlas-based gaze tracking. It's deployed on Vercel with serverless functions. And the entire codebase is TypeScript with strict mode—no runtime surprises.

Here's what I learned: Cursor excels at visual debugging, component work, and inline errors. Claude Code excels at terminal workflows, git operations, and background tasks. Together, they're complementary tools with built-in rate limit resilience.

The architecture—clean separation between components, lib functions, and workers—made everything testable and maintainable. TypeScript strict mode caught bugs before they hit production. And the dual-implementation approach gave me deep insights into both depth-based and atlas-based rendering."

**Action:**
- Show app running smoothly
- Display FPS counter
- Upload different portraits
- Show both modes working
- Display key stats on screen

---

### Scene 9: Conclusion (30 seconds)

**Visual:** Final demo with links overlaid

**Voiceover:**
"The future of coding isn't about choosing one AI tool—it's about orchestrating multiple tools strategically. Cursor for visuals, Claude Code for terminals. Why limit yourself?

The code is open source on GitHub, there's a live demo link in the description, and I'd love to hear which approach you prefer—depth or atlas mode. Drop a comment and let me know. Thanks for watching!"

**Action:**
- Show final smooth tracking
- Display GitHub and demo links
- End screen with subscribe button

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

## 🔗 Links for Description

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
