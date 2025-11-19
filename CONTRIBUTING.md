# Contributing to Face Follow Mouse Cursor

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🎯 Ways to Contribute

- **Bug Reports**: Report bugs via GitHub Issues
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit pull requests with fixes or enhancements
- **Documentation**: Improve README, code comments, or add examples
- **Testing**: Test on different browsers/devices and report compatibility issues
- **Performance**: Identify and fix performance bottlenecks

## 🐛 Reporting Bugs

Before submitting a bug report:
1. Check existing [GitHub Issues](https://github.com/chongdashu/face-follow-mouse-cursor/issues) to avoid duplicates
2. Test with the latest version of the code
3. Try to reproduce the issue with minimal steps

When reporting, include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Minimal steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version, device type
- **Screenshots/Logs**: Browser console errors, screenshots if applicable

Example:
```
**Bug**: Depth map generation fails on Safari

**Steps to Reproduce**:
1. Open app in Safari 17
2. Upload portrait image
3. Wait for depth generation

**Expected**: Depth map generates successfully
**Actual**: Error "ONNX model failed to load"

**Environment**: Safari 17.0, macOS 14.0, M1 Mac
**Console Error**: [paste error message]
```

## 💡 Feature Requests

When suggesting features:
1. Check if the feature already exists or is planned
2. Explain the use case and benefits
3. Consider implementation complexity
4. Be open to discussion and alternative approaches

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Getting Started

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/face-follow-mouse-cursor.git
cd face-follow-mouse-cursor

# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run linter
npm run lint

# Build for production
npm run build
```

### Project Structure

```
src/
├── components/      # React components
├── lib/            # Core logic (cursor, depth, three.js)
├── shaders/        # GLSL shaders
├── config.ts       # Configuration constants
api/                # Vercel serverless functions
public/             # Static assets
```

### Coding Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Formatting**: Follow existing code style (2-space indentation)
- **Linting**: Pass `npm run lint` before committing
- **Comments**: Add JSDoc comments for public functions
- **Naming**: Use descriptive variable names (camelCase for variables, PascalCase for components)

## 🚀 Pull Request Process

### Before Submitting

1. **Fork** the repository
2. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/issue-123
   ```
3. **Make your changes** following coding standards
4. **Test thoroughly**:
   - Test in multiple browsers (Chrome, Firefox, Safari)
   - Test with different portrait images
   - Verify depth map generation works
   - Check FPS performance
5. **Run linter**: `npm run lint`
6. **Build successfully**: `npm run build`
7. **Commit** with clear messages:
   ```bash
   git commit -m "Add feature: smooth camera rotation limits"
   # or
   git commit -m "Fix: depth map normalization edge case"
   ```

### Submitting

1. **Push** to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
2. **Open a Pull Request** on GitHub
3. **Fill out the PR template** (title, description, testing notes)
4. **Link related issues** (e.g., "Fixes #123")

### PR Guidelines

- **Title**: Clear, concise description (e.g., "Add configurable FPS limiter")
- **Description**:
  - What problem does this solve?
  - How does it work?
  - Any breaking changes?
  - Screenshots/videos for UI changes
- **Testing**: Describe how you tested the changes
- **Single Purpose**: One feature/fix per PR
- **Small PRs**: Easier to review than large ones

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the commit history

## 🧪 Testing Guidelines

### Manual Testing Checklist

- [ ] Upload various portrait images (different sizes, aspect ratios)
- [ ] Verify depth map generation (with and without model)
- [ ] Test cursor tracking in all viewport areas
- [ ] Check smooth motion with different smoothing values
- [ ] Verify FPS remains stable (50-60fps)
- [ ] Test controls (sliders, toggle debug panel)
- [ ] Test window resize behavior
- [ ] Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (if applicable)

### Browser Compatibility

Test your changes in:
- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions

### Performance Testing

- Monitor FPS in debug panel
- Check browser DevTools Performance tab
- Test on lower-end devices if possible
- Verify no memory leaks (check Memory tab)

## 📝 Code Style

### TypeScript

```typescript
// Good
interface DepthMapOptions {
  smoothing: number
  normalize: boolean
}

function generateDepthMap(image: ImageData, options: DepthMapOptions): Float32Array {
  // Implementation
}

// Avoid
function generateDepthMap(image: any, options: any): any {
  // No type safety
}
```

### React Components

```typescript
// Good
interface ViewerProps {
  portraitImage: HTMLImageElement
  intensity: number
  onError?: (error: Error) => void
}

export function Viewer({ portraitImage, intensity, onError }: ViewerProps) {
  // Component implementation
}
```

### Comments

```typescript
/**
 * Maps cursor position to rotation angles with smoothing
 * @param x - Cursor X position (screen coordinates)
 * @param y - Cursor Y position (screen coordinates)
 * @returns Smoothed yaw and pitch angles in degrees
 */
export function mapCursorToAngles(x: number, y: number): { yaw: number; pitch: number } {
  // Implementation
}
```

## 🏗️ Architecture Guidelines

### Adding New Features

1. **Configuration**: Add tunable parameters to `src/config.ts`
2. **State Management**: Use React hooks (`useState`, `useRef`, `useEffect`)
3. **Performance**: Avoid unnecessary re-renders (use `useRef` for mutable state)
4. **Error Handling**: Graceful degradation with fallbacks
5. **Resource Cleanup**: Dispose Three.js resources in effect cleanup

### Modifying Shaders

- Keep shaders in `src/shaders/` directory
- Add comments explaining shader math
- Test with different depth maps
- Verify performance impact

### Adding Dependencies

- Keep dependencies minimal
- Prefer well-maintained packages
- Check bundle size impact (`npm run build`)
- Update `package.json` with explanation in PR

## 🎨 UI/UX Guidelines

- **Responsive**: Test on different screen sizes
- **Accessible**: Consider keyboard navigation and screen readers
- **Performance**: Smooth 60fps experience
- **Feedback**: Show loading states, error messages
- **Intuitive**: Clear labels, helpful tooltips

## 📚 Documentation

When adding features, update:
- **README.md**: User-facing documentation
- **Code Comments**: JSDoc for functions/classes
- **CONTRIBUTING.md**: If adding new development workflows

## ❓ Questions?

- **Check existing Issues**: Someone may have asked already
- **Open a Discussion**: For questions or ideas
- **Ask in PR comments**: For specific code questions

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help newcomers get started

## 🙏 Thank You!

Every contribution helps improve this project. Whether it's a bug report, feature suggestion, or code contribution, your effort is appreciated!

---

**Ready to contribute?** Fork the repo, make your changes, and submit a PR!
