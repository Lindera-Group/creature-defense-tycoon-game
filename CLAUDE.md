# Creature Defense Tycoon

> A 3D tower defense/tycoon game built with React Three Fiber. Created by Martin & Tage.

## Tech Stack

- **Engine**: Three.js via React Three Fiber (R3F) + Drei helpers
- **Framework**: React 18 + TypeScript (strict)
- **State**: Zustand (game state) + Immer (immutable updates)
- **Physics**: @react-three/rapier (3D physics)
- **Build**: Vite
- **Test**: Vitest + React Testing Library + Playwright (e2e)
- **Style**: Tailwind CSS (HUD/menus only)
- **3D Assets**: GLTF/GLB format, low-poly stylized aesthetic

## Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5175, strictPort)
npm run build            # Production build
npm run preview          # Preview production build

# Quality
npm run test             # Vitest unit tests
npm run test:watch       # Vitest watch mode
npm run test:e2e         # Playwright e2e tests
npm run typecheck        # TypeScript strict check
npm run lint             # ESLint
npm run format           # Prettier

# All checks before commit
npm run check            # typecheck + lint + test
```

## Project Structure

```
src/
├── game/
│   ├── entities/        # Game objects (Player, Zombie, Werewolf, Weapons, Buildings)
│   ├── systems/         # ECS-style systems (Combat, Economy, Wave, Physics, AI)
│   ├── world/           # World generation (Forest, Moon phases, Terrain)
│   ├── ui/              # HUD, menus, shop (React + Tailwind)
│   └── assets/          # 3D models (.glb), textures, audio, shaders
├── server/              # Optional: save game API, leaderboard
├── shared/              # Types, constants, game config
tests/
├── unit/                # Game logic tests (Vitest)
├── integration/         # System interaction tests
└── e2e/                 # Browser gameplay tests (Playwright)
```

## Game Design Reference

See [.claude/docs/ORIGINAL_PROMPT.md](.claude/docs/ORIGINAL_PROMPT.md) for the full game design.

### Core Loop
1. Start in forest with 0 money
2. Pick up free baseball bat
3. Kill zombies → earn coins
4. Buy weapons + build fortifications
5. Survive waves → defeat boss
6. Rebirth → new biome, new enemies, better rewards

### Rebirth Phases
| # | Moon | Enemies | Difficulty |
|---|------|---------|------------|
| 0 | Normal | Zombies (green→blue→red→boss) | Base |
| 1 | Full | Werewolves | 2x |
| 2 | Eclipse | Enhanced creatures | 4x |
| 3 | Blood | Zombies + Werewolves | 8x MAXIMUM |

## Art Direction

**Target**: Super Mario 3D World feel — bright, stylized, chunky proportions.
**Technique**: Low-poly with flat/cel shading, vibrant colors, exaggerated animations.
**Performance**: Target 60fps on mid-range hardware, 30fps minimum on mobile.

## File Boundaries

- **Safe to edit**: `src/`, `tests/`, `public/`, `docker/`
- **Config (careful)**: `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`
- **Never touch**: `node_modules/`, `.git/`, `dist/`

## Architecture Decisions

- **ECS-inspired**: Entities + Systems pattern (not a full ECS framework)
- **Zustand store slices**: Separate stores for `game`, `economy`, `combat`, `building`
- **Asset pipeline**: GLTF models optimized with gltf-transform, loaded via useGLTF
- **Wave system**: Config-driven enemy waves with escalating difficulty
- **Save system**: LocalStorage for single-player, optional server for cross-device

## Deploy

- **URL**: cdtgame.linderagroup.com
- **Container**: Docker (nginx serving static build)
- **CI/CD**: GitHub Actions → VPS auto-deploy on push to main
- **Infra**: Traefik reverse proxy + Let's Encrypt SSL

## Version Snapshots

Each major version is saved as a playable snapshot under `public/` so the game's evolution can be revisited:

| Version | Path | URL | Description |
|---------|------|-----|-------------|
| v1 | `public/first/` | `/first/` | Initial gameplay — 5 waves, basic combat, square world |
| v2 | `public/second/` | `/second/` | Full 30 waves, all zombie types, boss, 7 weapons, projectiles |
| v3 | `public/third/` | `/third/` | Round world, zombie AI, placement preview, sprint, camera controls |
| v4 | `public/fourth/` | `/fourth/` | Rebirth system (4 phases), werewolves, hotbar, blueprints, hammer |

**When to create a new version:** Only when the game feels meaningfully evolved — new mechanics, major visual changes, or significant gameplay shifts. Not for bug fixes or minor tweaks. A good rule of thumb: if Tage would notice the difference immediately, it's a new version.

**How to create a version:**
1. `npm run build`
2. `cp -r dist/ public/<name>/` (use ordinal: first, second, third, fourth, ...)
3. Remove nested snapshots: `rm -rf public/<name>/first/ public/<name>/second/` etc.
4. Add route in `docker/nginx.conf`: `location /<name>/ { try_files $uri $uri/ /<name>/index.html; }`
5. Commit, push — CI/CD auto-deploys

## Agent Ecosystem

This project extends Martin's global agent ecosystem with game-specific agents:

| Agent | Role | Model |
|-------|------|-------|
| **Daidalos** | Orchestrator | opus |
| **Hugo** | Frontend/UI + R3F | sonnet |
| **Athena** | Game engine (Three.js, physics, rendering) | sonnet |
| **Loki** | Game designer (balance, progression, AI) | sonnet |
| **Hephaestus** | 3D asset creation & optimization | sonnet |
| **Vera** | TDD + game testing | sonnet |
| **Hermes** | Docker, CI/CD, deploy | sonnet |

## TDD Workflow

1. **Red**: Vera writes failing tests for game mechanic
2. **Green**: Athena/Hugo implements minimum to pass
3. **Refactor**: Clean up, optimize, Bengt reviews if major
