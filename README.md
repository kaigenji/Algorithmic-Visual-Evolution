[![Watch Demo](https://img.youtube.com/vi/wnuDwtfd6sA/hqdefault.jpg)](https://youtu.be/wnuDwtfd6sA)

# Algorithmic Visual Evolution

A modular, browser-based system for evolving algorithmic visuals: parameter-driven feedback, macros, and GPU-backed rendering.

## Branches

| Branch | Role |
|--------|------|
| **`main`** | **Default branch.** Full TypeScript app, compiled output in `dist/`, optional **regl** / WebGL path (`index.regl.html`, `regl_dist/`), JSON **presets**, and shader sources under `src/`. Clone or pull **`main`** for day-to-day use. |
| **`lite`** | Same tree as **`main`** after the repo was standardized (kept for existing links and checkouts; you can use either). |

The original JavaScript-only prototype is still in history at commit **`a555957`**, and as the git tag **`js-baseline`** (use `git checkout js-baseline` to browse that snapshot).

## Quick start

Requirements: **Node.js** and **npm**.

```bash
git clone <your-repo-url>
cd algorithmic-visual-evolution
npm install
npm run dev
```

Then open the URL printed by `live-server` (often `http://127.0.0.1:8080`). The default `index.html` loads `dist/app.js`; **`dist/` is checked in**, so you can run without compiling first.

To rebuild TypeScript after editing `.ts` files:

```bash
npx tsc
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Serves the project with `live-server` (default entry: `index.html`). |
| `npm run dev:ts` | Cleans `dist/`, runs `tsc`, fixes ESM import paths, then opens `index.html` in the browser. |
| `npm run dev:js` | Populates `dist/` from legacy JS sources (if present) and opens the app. |
| `npm run dev:regl` | Compiles `src/app.ts` into `regl_dist/` and serves `index.regl.html`. |
| `npm run switch` | Runs `switch-version.js` — pass `js` or `ts` (see script help). |

## Repository layout

- **`app.ts`**, **`config.ts`**, **`algorithms/`**, **`utils/`** — application and modules (compiled to `dist/`).
- **`src/`** — additional TypeScript and **GLSL** shaders used by the regl pipeline.
- **`presets/`** — saved parameter presets (JSON).
- **`switch-version.js`** — switches between JS and TS build outputs for local dev.

## License

See [LICENSE](LICENSE) (ISC).
