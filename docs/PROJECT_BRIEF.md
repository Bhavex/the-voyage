Before doing anything else, read this full project brief carefully. Then save it word for word as docs/PROJECT_BRIEF.md, and add a line near the top of AGENTS.md saying "Full project brief: docs/PROJECT_BRIEF.md — read it before every task." Do NOT start building features yet. When done, reply with a short summary of what you understood and any questions.

=====================================================
THE VOYAGE — FULL PROJECT BRIEF
=====================================================

WHO I AM
I'm Bhavishya, a first-year B.Tech CSBS student at VIT Vellore. I do filmmaking, video editing, 3D modelling in Blender, and web development. I'm a junior core member of ACM-VIT and a member of Dream Merchants (VIT's finance club). I'm new to tools like you, so explain things to me in simple words and give terminal steps one at a time.

WHAT WE ARE BUILDING
My INFORMAL portfolio website (I'll build a separate formal one later). It's a highly immersive, highly interactive 3D world inspired by the FEELING of One Piece: a huge open world, adventure, and freedom. Every island is a part of my life. The visitor sails a ship between islands and explores them. It should feel like stepping into an animated film, not browsing a website.

LOCKED DECISIONS
- Look: painterly, stylised, anime-film lighting, hand-painted feel. NOT low-poly and NOT photoreal.
- Movement: free sailing with the ship's wheel, PLUS a sea chart for quick travel to any island.
- Island arrival: a short cinematic fly-in, then the ship docks and you walk a small, hand-crafted area.
- Visitor: plays a stylised captain version of me, third-person, seen from behind.
- Audience: wow factor and anyone who visits. Not mainly for recruiters.
- Devices: desktop first. Phones get a lighter mode.
- Originality: EVERYTHING must be original. No characters, flags, ships, symbols, or names from One Piece or any other series.

DESIGN PILLARS
1. Every click is a place: no plain menus or pages; content lives in objects you touch in the world.
2. Dense, not big: small islands packed with detail beat big empty ones.
3. My real work is the treasure: films, renders and projects are the rewards of exploring.
4. Never lost, never stuck: the sea chart and Quick Voyage reach anywhere in two clicks.

THE VISITOR JOURNEY (4 layers)
1. Opening (~15s): painted dawn sky over still water; camera rises out of the sea onto the deck as the sails fill. This hides the world loading.
2. Choice: "Set sail" (full experience) or "Quick voyage" (fast overview).
3. Layer 1, open sea: captain at the wheel; islands on the horizon, each with its own sky colour so it reads from far away.
4. Layer 2, approach: near an island (or after picking it on the sea chart), a cinematic fly-in; the island's name paints onto the screen.
5. Layer 3, on the island: the ship docks, the captain walks a small area; glowing landmarks mark what can be touched.
6. Layer 4, the project: touching a landmark opens its project inside the world (a film on a screen, a model on a pedestal, a ship to board), plus a panel with details and links.
7. Leaving: walk back to the dock or open the sea chart.
A compass in the corner always shows the current layer and steps back out one layer per click.

CORE SYSTEMS (built once, reused by every island)
- Sailing: ship rides the waves; drag the wheel or A/D to steer; W/S raise and lower sails (3 levels); speed follows sail height.
- Spyglass: hold right-click to zoom toward a distant island and see a preview card.
- Sea chart: painted map of all islands (M key or chart icon); picking one auto-sails there.
- Fly-in: a camera path per island; any key skips it; it ends at the dock.
- Docking and walking: ship moors, captain steps off, third-person WASD + mouse, E to interact, in a bounded area.
- Captain avatar: idle, walk, run, interact, and steering animations.
- Progress: visited islands colour in on the chart; finding a secret on every island unlocks a hidden final island. Saved in the browser.
- Shared rule: interactable objects glow softly when the captain is near and show a one-word hint ("Play", "Inspect", "Board").

THE ISLANDS
1. Film Island (THE PROTOTYPE, built first): golden hour, warm haze. Open-air cinema in a small town square, and a lighthouse whose beam carries my INTACH Filmit award. Contents: my film "Qile Ki Kasak" (won Overall Best Film at the national INTACH Filmit India awards) and other films. Interaction: pick up a film reel from a rack, slot it into the projector, and the film plays on the big screen. Walking up the lighthouse shows the award story.
2. Forge Island (3D/Blender work): volcanic dusk, embers, heat shimmer. A forge workshop in a cliff. Each model sits on an anvil-pedestal: click to lift, drag to spin, scroll to zoom, plus a wireframe toggle.
3. Editing Island (video editing): neon night with rain. An editing den with a wall of glowing monitors. Contents: C2C event teasers (a sakura-petal/vine/monolith animation and a split-screen promo), a bubble-cluster transition, and a finance reel on global debt. Click a monitor to play it; a "before and after" lever shows raw footage vs the final cut.
4. Builder's Port (web and dev projects): bright midday harbour. Each project is a docked ship with its own flag: Car Wars (multiplayer car combat game for ACM-VIT, shown at Gravitas), Vision Stick (assistive device for visually impaired users), FitCheck, Election Portal, RiskGate (hackathon PR risk-scoring tool), and a Father's Day tribute website. Board a ship to open its project panel.
5. Market Isle (finance and quant): crisp morning. A merchant exchange with a ticker board. Contents: WorldQuant Brain alpha research, Dream Merchants work (sponsorship brochure, "The Merchant Times" newsletter, a rebrand pitch), and a market intelligence dashboard project. The ticker scrolls project stats; a merchant's ledger flips through work samples.
6. The Uncharted Zone (work in progress): thick fog, distant storm. Half-visible islands that appear only through the spyglass. Contents: my OS-from-scratch project, a personal AI assistant ("Jarvis"), an F1 race-strategy simulator. Each shows a sealed chest with a progress bar; when a project ships, it moves to a real island.
7. Home Island (about me): soft sunset, cherry blossoms, wind chimes. A captain's cabin on a hill. Contents: about me, VIT, ACM-VIT, Dream Merchants, Pehla Kadam (a community trust I've been part of for 14+ years), interests. A wanted-poster-style About card with my own stats, a journal on the desk, and a message-in-a-bottle on the beach as the contact form.
8. Sky Island (hidden): unlocked after finding a secret on every island; reached by a beam of light from the ocean. Bloopers, behind-the-scenes, a thank-you note.

ART DIRECTION
- Toon shading with 2-3 light bands and soft painted edges; not hard cel lines everywhere.
- Hand-painted textures with visible brush strokes; no photo textures.
- Thin coloured outlines only on characters and key landmarks.
- Painted skies with big sculpted clouds; each island owns one sky.
- Ocean: deep teal to turquoise, painted foam lines, sparkling highlights, gentle stylised waves.
- Post-processing: soft bloom, light colour grading per island, subtle paper grain.
- Palettes per area: Open sea (teal, sky blue, cream; dawn), Film (amber, honey, deep red; golden hour), Forge (charcoal, ember orange, magma; dusk), Editing (indigo, neon cyan, magenta; night rain), Builder's Port (white, navy, sunny yellow; midday), Market (emerald, brass, ivory; morning), Uncharted (grey-green, storm violet; fog), Home (blossom pink, warm wood, peach; sunset).

AUDIO
- At sea: waves, wind in the sails, creaking wood, gulls; volume follows ship speed.
- Each island's soundscape fades in during approach (projector whirr on Film, crackling fire on Forge, rain and keyboard taps on Editing, chimes on Home).
- Calm original music at sea with a variation per island; royalty-free or self-made only.
- Soft interaction sounds. Sound starts muted until the first click, with a clear toggle.

PHONE LITE MODE AND QUICK VOYAGE
- Phones: sea chart only (tap to sail), tap landmarks instead of walking, reduced particles, baked lighting, smaller textures, shorter opening.
- Quick Voyage: a button on the opening screen and in the compass. Opens a painted scroll page with every island's highlights in one fast overview.
- Quality settings (Low/Medium/High) auto-picked by device, changeable by hand.

TECH
- Vite + React 18, three.js via React Three Fiber and drei, @react-three/postprocessing. Plain CSS.
- Wave settings live ONLY in src/world/waves.js; the ocean shader and anything floating read from it.
- Colours live ONLY in src/config/palette.js. Islands are listed in src/config/islands.js.
- 3D models are made by me in Blender and exported as .glb into public/models/. Placeholder models in code use the same part names (hull, sail_main, wheel, flag, mast) so mine can be swapped in.
- Performance matters: compress models (Draco/meshopt), lazy-load islands, keep the bundle lean, aim for 60fps on desktop.

WHO DOES WHAT
- Codex (you): big builds and systems: sailing, camera, character controller, docking, sea chart, loading, quality settings, phone mode, audio system.
- Claude: design, the look (ocean/sky shaders, palettes, post-processing), Quick Voyage page, writing, and reviewing your work.
- Me: all Blender art, decisions, and final say.
- Rules: one agent per branch (codex/... or claude/...); never edit files another open branch is changing; don't change waves.js, palette.js, or the Ocean/Sky shaders unless I ask; after each task run lint and build, tick ROADMAP.md, commit with a clear message, and explain what you did in simple words.

PLAN
- Week 1: pre-production and repo setup (done), my reference board and ship blockout.
- Week 2: sailing, ocean following the ship, follow camera, island placeholders, look pass.
- Week 3: Film Island prototype: fly-in, docking, captain controller, reel-into-projector.
- Week 4: sea chart, loading, quality settings, phone mode, audio, Quick Voyage.
- After: remaining islands one by one, then a production-readiness and polish pass, then deploy.
=====================================================