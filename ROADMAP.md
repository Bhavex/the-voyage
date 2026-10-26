# Roadmap

Who: **Claude** (design, look, shaders, review), **Codex** (big builds, systems), **Bhavishya** (Blender art, decisions).

## Week 1: Pre-production
- [x] World Bible written (Claude)
- [x] Repo set up: Vite, React Three Fiber, shared notes, folder structure (Claude)
- Setup verified on macOS: dependencies installed, build and lint pass, private GitHub repository created (Codex)
- [x] First look: painterly ocean, sky, placeholder ship riding the waves, title card (Claude)
- [ ] Reference board for the painterly style (Bhavishya)
- [ ] Ship blockout in Blender (Bhavishya)

## Week 2: Core world
- [x] Sailing: wheel/keys steer, sails set speed, ship moves through the world (Codex)
- [x] Ocean follows the ship; world origin handling for long voyages (Codex)
- [x] Camera system: follow cam behind the ship, smooth turns, replaces CameraRig (Codex)
- [ ] Ocean and sky look pass, per-island palette switching (Claude)
- [x] Island placeholders on the horizon from islands.js (Codex)
- [x] Sea edge: gently turn back beyond 900 units and show a warning (Codex)
- [x] Controls hint with sail status and a touch-device message (Codex)
- Sailing pass: three animated sail levels, keyboard/drag helm, heading-aware wave riding, grid-snapped sea, smooth follow camera, seven palette-tinted islands and approach names. The bounded sea keeps coordinates small; floating-origin rebasing is not needed yet.
- Verified: lint, production build, nine movement tests (`npm test`), and browser checks for controls, wheel dragging, island/edge messages and responsive/touch hints. Waves, palettes and Ocean/Sky shaders unchanged.
- Sailing follow-up: drag-only damped camera with automatic return, solid island shores, camera clearance, wider ship view, and a timed H-key controls hint (Codex).

## Week 3: Film Island prototype
- [ ] Fly-in cinematic and docking (Codex, camera feel by Claude): camera feel pass in progress
- [x] Captain controller: walk, run, interact (Codex)
- [x] Reel-into-projector interaction, film plays on the screen (Codex)
- [x] Walkable Film Island placeholder: beach, dock, four buildings, cinema, reel rack and lighthouse (Codex)
- [x] Optional GLB loading with safe fallback, named ship parts and captain animation support (Codex)
- [x] Reusable glowing interactions, lighthouse award panel and phone landmark camera (Codex)
- [ ] Film Island models (Bhavishya)
- Prototype complete with skippable arrival, mooring/boarding, bounded walking and building collision, reel carry/load, video playback or a painted coming-soon card, stop/sound controls and phone tap navigation. Blender export requirements are in `docs/MODEL_CONTRACT.md`.
- Verified: 12 movement/collision tests, desktop and phone browser journeys, all three GLB swaps and H.264 video playback using temporary fixtures. Lint and production build pass. Protected wave settings, palettes and Ocean/Sky shaders remain unchanged. Full-world phone navigation, quality controls and compression beyond meshopt remain in Week 4.

- [x] Film Island feel pass: lower follow camera with heading recovery and wall clearance, framed booth view, faster accelerated walking with fixed substeps, objective markers, named prompts, carrying pose and sound invitation (Codex).
- [x] Film land palette, grass/path details, unobstructed corner arrival title, guarded arrival skipping and a sailing direction/distance marker (Codex).
- Feel-pass verification: lint, production build and 15 tests pass, including 20/60 fps movement parity and steering-key skip regression. Desktop/phone browser journeys, camera drag/recovery, booth framing, objective progression and real-video sound controls checked; spawn/rack/projector/lighthouse screenshots captured. Intro, sailing physics, touch navigation/camera and sea shaders are unchanged; only the explicitly requested Film Island palette was added.

## Week 4: Systems
- [ ] Sea chart and quick travel (Codex)
- [ ] Loading cinematic and asset compression (Codex)
- [ ] Quality settings and phone-lite mode (Codex)
- [ ] Spatial audio (Codex)
- [ ] Quick Voyage overview page (Claude)

## After week 4
- [ ] Remaining islands, one at a time
- [ ] Core Checklist and Details Checklist passes, then deploy
