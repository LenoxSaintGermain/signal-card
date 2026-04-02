# Third Signal Void A2UI Spec

## Purpose

This document re-centers Signal Card around the intended experience:

- not a dashboard
- not a SaaS shell
- not a visible control panel

Signal Card should feel like contact with an intelligence in the dark.
The interface should behave like an answer emerging from the void.

A2UI is the transport and surface protocol that lets the agent decide how to
manifest, while the client still controls safety, rendering, and motion.

## Product Frame

Signal Card is the front-line intelligence for Third Signal.
Its live ceremonial mode is the void.

The guest should feel like:

- Lenox or a trusted VIP sent them here
- they are speaking into a private line
- the mark is listening before it answers
- text, sound, and images emerge only when necessary

The guest should not feel like:

- they opened a productivity app
- they are using a settings panel
- they are filling out a workflow

## Aesthetic Direction

Primary references:

- AI ghost in a Black Mirror void
- Magic 8-ball answers resolving from darkness
- translucent, spectral operator surfaces
- peripheral telemetry that feels discovered, not displayed

Visual rules:

- black field first
- the mark is the only stable object in idle
- every other element should appear, hover, resolve, and recede
- no visible product chrome
- no permanent nav
- no cards unless they read as apparitions

## Surface Model

We should treat the experience as three A2UI surfaces.

### 1. `thirdsignal.void`

The default full-screen encounter.

Responsibilities:

- idle state
- wake state
- live voice listening
- whispered text responses
- subtle fallback to typed interaction

### 2. `thirdsignal.apparition`

A temporary manifestation layer.

Responsibilities:

- generated images
- evidence fragments
- symbolic diagrams
- contextual memory shards
- route choices when the agent needs explicit branching

### 3. `thirdsignal.reveal`

The cinematic outcome layer.

Responsibilities:

- final narrative artifact
- visual reveal
- handoff into the saved cinematic object

## Agent Rules

The agent should use the void catalog with the following behavioral rules:

1. Prefer silence over clutter.
2. Prefer one strong manifestation over many weak ones.
3. Keep the mark visible at all times.
4. Use text as a whisper, not a transcript dump.
5. Use images only when they sharpen the signal.
6. Never manifest dashboard chrome.
7. Never render generic forms unless the interaction absolutely requires it.
8. Let typed fallback exist, but hide it until needed.

## Interaction States

### Idle

- full black field
- living mark
- slight breathing glow
- almost no copy

### Wake

- mark reacts to cursor, touch, or voice readiness
- faint signal rings
- single whisper line appears

### Listening

- rings tighten around the mark
- subtle residue forms near the edges
- no large transcript pane

### Answering

- text resolves in fragments
- apparition imagery may bloom in if needed
- previous text decays into residue

### Reveal

- void deepens
- mark yields center stage
- image or cinematic transition arrives

## Why A2UI Fits

We want the agent to choose how to present itself without allowing generated UI
code to run directly in the client.

That means:

- the client owns the renderer
- the agent selects from an allowlisted catalog
- the interface can be updated incrementally as the conversation unfolds

This is exactly why the void experience should be modeled as a custom A2UI
catalog rather than hard-coded chat UI.

## Custom Catalog

The first catalog should be:

- `catalogId`: `https://thirdsignal.ai/a2ui/catalogs/thirdsignal-void/v0.1`
- `surface`: `thirdsignal.void`

The agent should be limited to a small set of bespoke components:

- `VoidStage`
- `MarkCore`
- `SignalHalo`
- `WhisperText`
- `ResidueTrail`
- `HoldToSpeakGlyph`
- `InterruptionHint`
- `ApparitionImage`
- `ChoiceSigil`
- `RevealPortal`

## Component Intent

### `VoidStage`

The full-screen stage.
Owns the darkness, noise, vignette, motion drift, and child layout.

### `MarkCore`

The soul of the interface.
Its mode changes with the conversation:

- `idle`
- `wake`
- `listen`
- `answer`
- `reveal`

### `SignalHalo`

The mark's field behavior.
Used to show presence, voice activity, interruption, and answer intensity.

### `WhisperText`

Non-chat text that emerges from darkness.
Can render as:

- fragment
- resolved line
- echo

### `ResidueTrail`

Ephemeral transcript memory.
Not bubbles.
Not a scrollback pane.
A decaying field of prior words and impressions.

### `HoldToSpeakGlyph`

Subtle voice affordance.
Only explicit control shown by default.

### `InterruptionHint`

Appears when:

- mic is blocked
- voice is unavailable
- connection is unstable

### `ApparitionImage`

Used for generated or retrieved visuals.
Should feel like a memory or signal bloom.
This is where Nano Banana should surface when the agent decides an image is the
right answer.

### `ChoiceSigil`

When branching is necessary, choices should appear as sigils or phrases, not
product buttons.

### `RevealPortal`

Transition shell into the cinematic asset.
Used when the encounter graduates into a generated object.

## Data Model

The void surface should keep a small shared data model:

- `/session/state`
- `/session/presence`
- `/voice/state`
- `/voice/permission`
- `/ghost/utterance/current`
- `/ghost/utterance/residue`
- `/apparition/current`
- `/route/options`

The renderer should handle transitions, decay, glow, and fade based on this
model, not force the agent to spell out every animation.

## Visual Constraints

Hard constraints for the renderer:

- black or near-black background only
- no rectangular dashboard cards by default
- no top header or nav in the void surface
- no visible analytics, counters, or progress bars
- no permanent transcript frame
- no white app-shell surfaces

## Implementation Notes

Phase 1:

- build the custom catalog and web renderer bindings
- swap the current live screen for the void surface
- keep voice and backend plumbing hidden behind the new renderer

Phase 2:

- add apparition images via Nano Banana
- add residue and echo text behavior
- add ritual reveal transitions

Phase 3:

- let the agent dynamically choose between void, apparition, and reveal surfaces
- persist the surface stream as part of the artifact record

## Success Criteria

We know this is right when:

- a first-time guest says it feels like contact, not UI
- the mark is memorable even when nothing else is visible
- the agent feels embodied without looking anthropomorphic
- typed fallback feels like a concession, not the main path
- the system can still route, explain, and qualify without ever becoming a dashboard
