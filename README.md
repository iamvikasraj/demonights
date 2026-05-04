# Design Demo Nights — event site

A static microsite for **Design Demo Nights** in Bengaluru: event details, schedule, and an interactive **Three.js** scene with a GLB model (`demo_nights.glb`). Built as plain HTML, CSS, and JavaScript—no build step or package manager.

## Features

- **Split layout:** 3D canvas on the left, typography and copy on the right (`index.html` + `style.css`).
- **Orbit controls** to explore the model; optional in-panel **tweakers** (scale, azimuth, elevation) with “Copy values” for dialing in the shot in `scene.js`.
- **Alternative single file:** `demo-nights.html` inlines styles for a self-contained page.

## Tech

- [Three.js](https://threejs.org/) r124 (CDN)
- `GLTFLoader` + `OrbitControls` (unpkg, matching Three version)
- Fonts: [Google Fonts](https://fonts.google.com/) — VT323, Crimson Pro

## Run locally

This project loads `demo_nights.glb` over HTTP. Opening HTML via `file://` may block or fail that load, so use a small static server from the repo root:

```bash
python3 -m http.server 8080
```

Then open:

- [http://localhost:8080/](http://localhost:8080/) — main experience (`index.html`)
- [http://localhost:8080/demo-nights.html](http://localhost:8080/demo-nights.html) — standalone variant

Any static server works (e.g. `npx serve .` if you use Node elsewhere).

## Repository layout

| File | Role |
|------|------|
| `index.html` | Main page; links `style.css` and `scene.js` |
| `style.css` | Layout and typography |
| `scene.js` | Three.js scene, loader, controls, tweaker UI |
| `demo_nights.glb` | 3D model loaded by the scene |
| `demo-nights.html` | Same idea with styles inlined |
| `computer.glb` | Extra asset (not referenced by default in `scene.js`) |

## Deploy

Push to GitHub and enable **Pages** with “Deploy from a branch” (e.g. `main` / `/ (root)`), or host the folder on any static host; ensure `demo_nights.glb` is deployed with the HTML and JS.

---

Presented by [Design Demo Nights](https://luma.com/calendar/cal-Lz8YkYPCTUZPX9t).
