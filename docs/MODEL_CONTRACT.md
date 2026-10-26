# Blender handoff: Film Island prototype

Place exports in `public/models/`. The app tries these files automatically and keeps its procedural art if a file is missing, invalid, or lacks a required part. Reload the page after replacing an asset. Models are cached for the current visit.

Export glTF Binary (`.glb`), with textures embedded, metres as units, applied scale, and glTF's Y-up coordinates. Use uncompressed or meshopt-compressed exports; Draco decoding is not included yet. Keep the geometry and textures modest. Author toon/painted materials in Blender; the loader preserves them. Film Island is loaded only when approaching or visiting it.

## Files and names

| File | Required named objects | Optional names / animation clips |
| --- | --- | --- |
| `captain.glb` | No required child names | `coat`, `hat`; clips named `Idle`, `Walk`, `Run` (case-insensitive) |
| `ship.glb` | `hull`, `sail_main`, `wheel`, `flag`, `mast` | `yard` |
| `film-island.glb` | `projector`, `reel`, `screen` | `dock`, `lighthouse_door`, `lighthouse`, `reel_rack`, `cinema`, `projector_booth` for direct phone taps |

Names are case-sensitive except animation clips. Keep them unique. Objects may be groups containing meshes, except `screen`, which must be a mesh. The procedural models use the same names. The current `reel` object disappears from the rack when picked up; a small procedural reel appears in the captain's hand and in the placeholder projector.

## Captain

- Origin at the soles, facing local **−Z**, about **2.6 units tall** including the hat.
- Export the armature and animation clips together. Walk/run clips should move the limbs in place; the controller moves the root.
- The carried reel currently attaches at local **[0.65, 1, −0.2]**. Match the right-hand pose to that point; a named hand-bone attachment can be added with the final rig.

## Ship

- Origin at the centre of the hull on the waterline; bow faces **−Z**.
- Placeholder hull is about **4.4 wide × 11.2 long**, with mast/flag top near **Y = 10.4**. Keep these dimensions so shoreline clearance and the dock fit.
- Put `sail_main`'s pivot at its top edge on the yard (currently **[0, 8.5, −0.9]**). The cloth extends downward. Its local Y scale controls furling and preserves the exported full-sail scale.
- `wheel` turns around its local **Z axis**, with zero rotation as the neutral pose. `flag` sways around local **Y**. Apply fixed mounting rotations on parent objects.
- The loader sits inside the existing wave-riding group. Do not bake world position or wave motion into the export.

## Film Island

- Origin at the island centre at sea level. The app places it at world **X = 180, Z = −260**; do not bake that world offset into Blender.
- Shore footprint: approximately **35 units along X × 28 along Z** from the centre. Walking surface: **Y = 3.2**, with a usable ellipse of radius **30.5 × 23.5**.
- Dock runs along **+Z**, centred on **X = 0**, from **Z = 18 to 44**, about **6 units wide**, top **Y = 3.2**. The moored ship sits at **[8, 0, 40]**.
- Rack/reel interaction: **[−8, 3.2, 8]**. Projector interaction: **[4, 3.2, 1.5]**, with projector body near **[4, 5.4, 4.8]**.
- Screen: mesh centred at **[4, 8.4, −19.5]**, facing **+Z**, about **14 × 7.875** (16:9). Map the complete screen face to UV 0–1 using standard glTF UV orientation. The app replaces this mesh's material with the painted card/video; model the surrounding frame separately.
- Lighthouse centre: **[22, 3.2, −8]**, door faces +Z; interaction point **[22, 3.2, −3.5]**.
- Building footprints, seats, booth walls, camera stops and collision bounds live together in `src/world/film/layout.js`. Match that layout when replacing the scene. If the final art moves a building or landmark, update that file at the same time; collision is deliberately simple and does not derive from arbitrary mesh triangles.

## Film file

Place the final video at **`public/videos/qile-ki-kasak.mp4`**, preferably H.264 video and AAC audio in a 16:9 MP4. Playback starts muted, with an Enable sound button. Stop film pauses playback; Play starts it again. Missing or unreadable video shows the painted “Film coming soon” card.

## Verified in this prototype

Desktop arrival/skip, docking, walking/running, reel carry/load, missing-video card, award dialog, departure and re-entry guard; phone landmark navigation and complete arrival; all three GLB replacements using temporary named fixtures; actual H.264 playback, sound toggle, stop and replay. The temporary test assets are not included in this repository.
