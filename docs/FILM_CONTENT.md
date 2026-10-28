# Film Island content

## The Director video

Put your filmmaking/editing introduction at `public/videos/director-intro.mp4`. Use H.264 video with AAC audio, ideally 16:9. MP4 files in this folder are ignored by Git: upload the real video separately with the deployed site. Never force-add it to Git.

The app requests the video only after the captain is on Film Island and loads the reel. Playback starts muted, with a sound button. Play/Pause keeps the current position, Replay starts again, and Stop film returns to the poster. Leaving the island or entering the lighthouse stops playback and releases the source. Missing or unreadable media shows a painted Coming soon card.

The placeholder poster is `public/textures/director-poster.svg`. Replace it, or add a JPG/WebP and set its URL in `src/config/cinema.js` (for example `/textures/director-poster.webp`). The same config holds the video URL and title.

Qile Ki Kasak is no longer played inside the site. When The Director ends, the cinema screen shows its award and external links.

## Links

Edit `src/config/links.js`. Replace each `#` with a full `https://` URL. `qileKiKasak.url` is the YouTube film link; the `profiles` list controls the row of profile links. You can add, rename or remove profile entries. Every link opens in a new tab.

## Lighthouse certificates and gallery

- Put certificate images in `public/lighthouse/certificates/`.
- Put film stills and behind-the-scenes photos in `public/lighthouse/gallery/`.
- Edit `src/config/lighthouse.js`: add an entry with a unique `id`, `title`, `src` and one-line `caption` to `certificates` or `gallery`.

Example certificate entry:

```js
{ id: 'filmit-award', title: 'Overall Best Film',
  src: '/lighthouse/certificates/filmit-award.webp',
  caption: 'Qile Ki Kasak — INTACH Filmit India, Overall Best Film.' }
```

Example gallery entry:

```js
{ id: 'on-set', title: 'On set',
  src: '/lighthouse/gallery/on-set.webp',
  caption: 'A quiet moment between takes.' }
```

Use JPG, PNG or WebP images. Keep web copies reasonably sized; the viewer fits portraits and landscapes without cropping. An empty or missing image uses a painted placeholder. Captions appear on frames and in the full-size viewer, and serve as image descriptions. Frames are generated from the config; extra entries create additional rows. The phone catalogue lists every entry. The award story is also editable in this config.

On desktop, press E at the lighthouse door to enter, walk with WASD, click a frame to enlarge it, and use Next/Previous or arrow keys to browse. Escape closes the viewer. The door and Leave lighthouse button return to the island. On phones, tap a wall frame or its title in the bottom strip.
