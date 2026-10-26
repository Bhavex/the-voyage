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
- src/world/  3D scene pieces (Ocean, Sky, Atmosphere, Islands, Ship, CameraRig, World); src/world/film/ holds Film Island and its cameras
- src/world/waves.js  the ONLY place wave settings live; ocean shader and ship both read it
- src/config/  palette.js (open-sea and per-island colours), islands.js (island list and positions)
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
Each placeholder below is built from code and is swapped for a Blender export automatically when the
file exists in public/models/ (names and sizes: docs/MODEL_CONTRACT.md). If the file is missing or
invalid, the code version stays.
- Ship.jsx builds the ship from primitives with the part names hull, sail_main, wheel, flag, mast, yard.
  `public/models/ship.glb` replaces it.
- src/world/film/Captain.jsx is a primitive captain with swinging legs, coloured from the open-sea palette.
  `public/models/captain.glb` replaces it and may carry Idle, Walk and Run clips.
- src/world/film/FilmIsland.jsx builds the Film Island (beach, dock, four buildings, cinema, reel rack,
  lighthouse) from primitives. `public/models/film-island.glb` replaces it. Building footprints, collision
  and camera stops live in src/world/film/layout.js and must be updated if the art moves them.
- src/world/Islands.jsx draws the other six islands as plain rock shapes coloured from their palette in
  palette.js. Each is replaced by its own scene when that island is built.
- The Film video is not in the repo. Put it at `public/videos/qile-ki-kasak.mp4`; until then a painted
  "Film coming soon" card plays on the screen.
- Camera: CameraRig.jsx is the intro and open-sea follow camera. IslandDirector.jsx (arrival, docking,
  departure path) and IslandCamera.jsx (walking, booth and landmark views) are the island cameras.
- Sea and sky colours blend per island through src/world/lookBlend.js, using the palettes in palette.js.
  A new island needs an entry in islands.js and in ISLAND_PALETTES.

## Large files
Videos in public/videos are NOT committed (`public/videos/*.mp4` is in .gitignore). Keep them on your
own machine, never `git add -f` them, and never put videos in other folders of the repo. Share them
outside git (drive link, release asset or hosting). Keep only `.gitkeep` in that folder.

## Working together (Codex + Claude)
- One agent per branch. Name branches by task: `codex/sailing`, `claude/ocean-look`.
- Never edit files another open branch is changing. Merge to main only after the other agent or Bhavishya reviews.
- After finishing a task: update ROADMAP.md (tick the item, add a one-line note), run lint and build, commit
  with a clear message.
- Keep explanations to Bhavishya short and in simple words.
