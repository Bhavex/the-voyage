# The Voyage: project notes for AI agents

Full project brief: docs/PROJECT_BRIEF.md — read it before every task.

Read this before every task. It is shared by Codex (this file) and Claude Code (CLAUDE.md points here).

## What this is
Bhavishya's informal portfolio: an explorable, painterly, anime-film ocean world.
Each island is part of his life (films, 3D work, editing, projects, finance, about).
Visitors sail a ship, use a sea chart to quick-travel, see a cinematic fly-in at each island,
then dock and walk a small area as a stylised captain avatar (third-person).

Full design: docs/WORLD_BIBLE.md (summary) and the living World Bible doc linked there.
Plan and status: ROADMAP.md.

## Stack
- Vite + React 18
- three.js 0.169 via @react-three/fiber 8 and @react-three/drei 9
- @react-three/postprocessing for bloom, grain, vignette
- Plain CSS in src/styles.css (no Tailwind)

## Run it
- `npm install` once
- `npm run dev` to work, `npm run build` to check it compiles, `npm run lint` before committing

## Folder map
- src/world/  3D scene pieces (Ocean, Sky, Ship, CameraRig, World)
- src/world/waves.js  the ONLY place wave settings live; ocean shader and ship both read it
- src/config/  palette.js (colours per area), islands.js (island list and positions)
- src/ui/  HTML overlay on top of the canvas (title card, hints, later the compass and sea chart)
- public/models/  Blender exports (.glb). public/textures/, public/audio/

## Rules that keep the look consistent
1. Painterly, not realistic and not low-poly: banded toon light (2 to 3 steps), painted noise, soft edges.
2. All colours come from src/config/palette.js. Do not hard-code new colours in components.
3. Wave settings only change in waves.js, so floating objects stay in sync with the water.
4. Everything is original. No characters, flags, ships, symbols or names from One Piece or any other series.
5. Desktop first, but every feature needs a phone-lite path (see the World Bible, "Phone lite mode").
6. Keep the bundle lean: compress models (Draco/meshopt), lazy-load islands, no huge libraries without a reason.

## Placeholders to replace later
- Ship.jsx builds a ship from primitives. Its part names (hull, sail_main, wheel, flag, mast, yard) match
  what the Blender model will use, so it can be swapped for public/models/ship.glb.
- CameraRig.jsx has two fixed views (intro, deck). The real camera system replaces it.
- The ocean plane is fixed at the origin. Once the ship moves, the ocean must follow the ship
  (snap its position to a grid so waves don't slide).

## Working together (Codex + Claude)
- One agent per branch. Name branches by task: `codex/sailing`, `claude/ocean-look`.
- Never edit files another open branch is changing. Merge to main only after the other agent or Bhavishya reviews.
- After finishing a task: update ROADMAP.md (tick the item, add a one-line note), run lint and build, commit
  with a clear message.
- Keep explanations to Bhavishya short and in simple words.
