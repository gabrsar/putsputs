# putsputs

Browser-local audio visualizer and coding playground. Static files, no build step.

## Run

From the repository root:

```sh
python -m http.server 8791 --bind 127.0.0.1
```

Open `http://127.0.0.1:8791/avs/`. GitHub Pages serves the same folder at `/avs/`.
p5.js and Ace load from their CDNs. DM Sans and Space Grotesk are self-hosted
under their SIL Open Font Licenses in assets/fonts/.

## Three ways to explore

- **Primeira visita** explains the app and offers a no-permission visual demo.
- **Quero brincar** focuses on music, visual selection, shuffle and sound controls.
- **Laboratório completo** exposes code, FFT, individual bands, seeds and local presets.

Checkboxes on preset cards control shuffle eligibility. Manual selection remains possible.
Shuffle draws from enabled presets without repeating within a cycle. Timing is randomized;
sustained changes in energy/timbre may advance a transition, with a minimum dwell time.
Crossfades use a separate image overlay, so feedback renderers are not contaminated.

## Audio

Use Chrome/Edge for shared tab/system audio. The browser must offer audio for the
selected source; enable its share-audio checkbox. Keep the capture window open.
It analyzes audio locally and uses a same-origin BroadcastChannel to supply FFT data.
Reloading the main window preserves this connection; closing/reloading capture ends it.
Microphone and local audio-file playback are also available. Demo is synthetic visual input.

## Privacy and local presets

The integrated presets do not record or upload audio. Editor code, saved presets,
selection settings and seeds stay in browser storage. No analytics are added.
Custom JavaScript executes the code the user loads. The third-party p5.js/Ace libraries use CDNs; fonts are self-hosted.

Local storage is scoped to a browser profile **and origin**. Export the JSON library to
transfer presets between localhost, WebStorm and the public site. Export `.js` for a single
code body. JSON/JS imports validate before updating the library. A failed save/import
preserves existing saved presets. Starting to edit pauses shuffle and file watching.

## Preset API

Each `.js` in `presets/` is the body of `draw(p,a,s)`:

- `p`: p5 instance, `s`: state until the next apply.
- `a.time`, `a.elapsed`, `a.dt`, `a.frame`, `a.fps`.
- `a.seed`, `a.rand(min,max)`; seed also resets p5 random/noise generators.
- `a.mouse`: position, normalized position, velocity, acceleration, click/press/release.
- `a.keyboard.down/pressed/released(key)`; input ignores editable controls.
- `a.clock`: local browser date/time fields.
- `a.groups`: selected frequency grouping; `db`, `magnitude`, `hit`, `level`, etc.
- `a.music`: rolling-window energy, trend, direction, timbral centroid, volatility and pulse.
- `a.renderScale`: stable resolution choice; `a.showHUD`: laboratory-mode diagnostics.

`state.dispose` releases offscreen canvases and per-preset input listeners on transitions.
Preset errors stop that visual and show a recoverable message; audio remains connected.
The main history uses fixed time coordinates; performance culls only its faded oldest tail.

## Validation

```sh
node --test tests/avs-lab.test.mjs tests/factor-math.test.mjs tests/trig-math.test.mjs
```

Use `--test-isolation=none` when the environment blocks test subprocesses.
Tests cover band boundaries, fixed dB scaling, rolling trends, every bundled preset with
regrouping and resize, bounded fractal camera motion, atomic local saves and asset wiring.
GPU appearance, browser audio permissions and actual frame rates require browser checks.

The library includes original reinterpretations of AVS Bass Spin, Dot Plane, Scope Star and
Roto Blitter, plus moire, polar, kaleidoscope, fire, fractal, Lorenz and landscape visuals.
References are linked in the upper-right About menu; these are not binary AVS preset conversions.

## Immersive stage and sequence

Space pauses/resumes preset switching, without pausing the music. The sequence button
shows its current action; Random selects another enabled visual. Fullscreen controls use
transparent blurred glass and hide after 3.2 seconds without input; pointer movement or
keyboard input brings them back. Open dialogs and keyboard-focused controls stay usable.

The twin Lorenz attractors use independent left/right analyzers for live files, examples,
and shared audio. The portable silent preview contains mono analysis, so it falls back
to the combined signal until real stereo audio is connected.

The collection includes optical illusions, Perlin flow fields, woven fabric variations,
psychedelic kaleidoscopes, shader-supersampled fractals and independent per-preset bloom
histories. Preset code remains editable and importable.

## Capture and visual previews

Computer audio opens an animated guide in the main page, then the native browser picker. Audio availability depends on browser and operating system; video-only captures are rejected with guidance. External capture hides file transport controls.

Library cards render the actual preset code with one shared preview renderer, cache snapshots, and animate on pointer hover. Automatic timing supports musical/dynamic changes and exact intervals through 30 minutes. Credits live in the header; page scrolling is confined to panels.


## Product interface

The compact layout keeps the canvas and playback controls inside the mobile viewport, including landscape and safe areas. Play/Create open scrollable panels; the Visuals library and audio source picker remain separate contextual controls. The language menu detects browser preferences by default and persists an explicit choice locally. Code, filenames, personal presets and song titles stay unchanged.

The default sample is the first movement of Beethoven's Symphony No. 5, performed by the Skidmore College Orchestra and released into the public domain. The catalog also includes Kevin MacLeod tracks under CC BY 4.0. See `assets/audio/LICENSE.txt` and the in-app credits. Audio files load when selected, and the initial silent visual uses a precomputed analysis of the default recording. Tap the animated sound prompt to start actual audio playback.

Automatic rendering limits pixel density and backs off expensive WebGL resolution after sustained slow frames. The preset library renders only nearby thumbnails and reuses cached images; desktop hover previews are capped at 12 fps. Higher quality can be selected explicitly in Play.

Computer/tab audio requires HTTPS and a browser that exposes screen capture with an audio track. The source must be selected by the user in the native browser picker with Share audio enabled. Firefox/mobile/OS combinations may not offer this; local music files remain available. Capture cancellation keeps the existing audio source. Shared audio is analyzed without connecting it to the speakers again, avoiding echoes.
