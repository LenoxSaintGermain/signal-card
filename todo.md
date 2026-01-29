# Third Signal Card - TODO

## Immersive Styling & Motion Enhancements

### Phase 1: Visual Foundation
- [x] Implement immersive background system with video/image support
- [x] Add glassmorphism UI layer with backdrop-blur effects
- [x] Extract and apply signal-card POC color palette (cyan/slate theme)
- [x] Add holographic grid floor effect with perspective transform
- [x] Implement HUD corner decorations and scan line effect
- [x] Add ambient radial gradients for depth

### Phase 2: Motion Design System
- [x] Create motion token system (durations, easing, distances)
- [x] Implement cinematic idle state with 4 progressive layers
- [x] Add micro-interactions for all interactive elements
- [x] Implement scene transitions with wipe effects
- [x] Add stagger animations for list items
- [ ] Implement focus/blur effects for card convergence

### Phase 3: Advanced Interactions
- [ ] Add haptic feedback simulation (visual pulse on interactions)
- [x] Implement "decoding text" effect for titles
- [x] Add glow/shadow effects on hover states
- [ ] Implement rate-limited "intelligence reveal" animations
- [x] Add subtle particle drift for idle state
- [ ] Implement prefers-reduced-motion support

### Phase 4: Polish
- [x] Add status bar with system metrics
- [x] Implement side data columns (HUD elements)
- [x] Add tactical button styling with clip-path
- [ ] Optimize animations for 60fps performance
- [ ] Test mobile responsiveness
- [ ] Add accessibility features


## Email Capture Feature
- [x] Create database schema for email captures (email, role, industry, signal, timestamp)
- [x] Build tRPC procedure for storing email captures
- [x] Design email capture UI component with glassmorphism styling
- [x] Add email validation and error handling
- [x] Integrate email capture between calibration and insight phases
- [x] Add success animation after email submission
- [x] Write vitest tests for email capture API
