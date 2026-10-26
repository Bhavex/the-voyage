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
- Verified: lint, production build, seven movement tests (`npm test`), and browser checks for controls, wheel dragging, island/edge messages and responsive/touch hints. Waves, palettes and Ocean/Sky shaders unchanged.

## Week 3: Film Island prototype
- [ ] Fly-in cinematic and docking (Codex, camera feel by Claude)
- [ ] Captain controller: walk, run, interact (Codex)
- [ ] Reel-into-projector interaction, film plays on the screen (Codex)
- [ ] Film Island models (Bhavishya)

## Week 4: Systems
- [ ] Sea chart and quick travel (Codex)
- [ ] Loading cinematic and asset compression (Codex)
- [ ] Quality settings and phone-lite mode (Codex)
- [ ] Spatial audio (Codex)
- [ ] Quick Voyage overview page (Claude)

## After week 4
- [ ] Remaining islands, one at a time
- [ ] Core Checklist and Details Checklist passes, then deploy
