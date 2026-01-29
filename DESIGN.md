# Design System: Agentic Hologram
**Project ID:** orbital-agent-hud

## 1. Visual Theme & Atmosphere
**"The Gundam Cockpit"**
A hyper-immersive, operational interface that feels like a holographic projection. It is not a website; it is a **Heads-Up Display (HUD)**.
- **Vibe:** Cinematic, Technical, Operational, Deep Space.
- **Lighting:** Self-luminous. Everything glows. Shadows are harsh and deep.
- **Texture:** Glass scans, grid overlays, lens flares, chromatic aberration on edges.

## 2. Color Palette & Roles
- **Void Black (#020617):** The infinite background.
- **Holo Cyan (#06b6d4):** Primary interface lines and active states.
- **System Amber (#f59e0b):** Warnings, alerts, and critical data points.
- **Phantom Slate (#1e293b):** Inactive panels and structural framing (glass opacity 10-20%).
- **Signal White (#ffffff):** High-contrast text, but often slightly transparent (90%) to blend with the hologram.

## 3. Typography Rules
- **Font Family:** `Rajdhani` (Primary/Headings), `JetBrains Mono` (Data/Technical).
- **Weights:** Light (300) for large headers, Medium (500) for data.
- **Letter Spacing:** Wide tracking (`tracking-widest`) for all uppercase labels.

## 4. Component Stylings
* **Panels:** Glassmorphism with *sharp*, angled corners (cut corners). 1px borders with `border-cyan-500/30`.
* **Buttons:** "Tactical Triggers". Rectangular, often with 45-degree cut corners. Hover states trigger a "scan" or "glitch" effect.
* **Decorations:** decorative lines, crosshairs (`+`), and technical readout numbers (`01`, `004`, `SYS.READY`) scattered around containers.

## 5. Layout Principles
* **Grid:** Rigid, technical alignment. Elements often connected by thin "circuit" lines.
* **Whitespace:** Expansive, but filled with subtle grid patterns (low opacity) to show "space" is actually "monitored territory".
* **Motion:** Everything enters with a decode sequence (text scrambling) or a scan sweep.
