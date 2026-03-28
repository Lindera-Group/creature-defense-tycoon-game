# Code Review - Creature Defense Tycoon

Date: 2026-02-11  
Scope: Current working tree snapshot in this repository.  
Reviewer role: Findings only (no code changes applied).

## Findings (ordered by severity)

1. **Build is currently broken due to Node typing/config mismatch**  
   - `vite.config.ts:4` imports Node's `path` module and `vite.config.ts:10`-`12` uses `__dirname`, but `tsconfig.node.json:2` does not include Node types.  
   - `npm run build` fails with unresolved `path` and `__dirname` errors.  
   - Impact: production build cannot complete.

2. **Lint gate is non-functional with ESLint v9**  
   - `package.json:14` runs `eslint src/ --ext .ts,.tsx`.  
   - No `eslint.config.js|mjs|cjs` exists in repo root; ESLint v9 requires flat config by default.  
   - `npm run check` fails before tests are evaluated in the full gate.  
   - Impact: static analysis quality gate is effectively disabled.

3. **Runtime uses mutable global cross-component channels (fragile coupling)**  
   - `src/App.tsx:20`-`21` stores module-level setter refs (`_setVictory`, `_setAnnouncement`).  
   - `src/game/systems/CoinSystem.tsx:41`-`42` and `src/game/systems/CoinSystem.tsx:60`-`61` expose/assign static `CoinSystem._spawnCoins`.  
   - Impact: hidden dependencies, lifecycle edge cases, harder integration testing and refactoring.

4. **Enemy/wave runtime is hardcoded despite broader typed model**  
   - `src/game/entities/Zombie.tsx:7` locks config to `ENEMIES.zombie_green`.  
   - `src/game/systems/WaveSystem.tsx:77` only reads `waveConfig.enemies[0]`.  
   - `src/shared/types.ts:123`-`131` defines multi-enemy wave composition, but runtime ignores most of that shape.  
   - Impact: progression system cannot scale to intended enemy diversity without structural changes.

5. **State model drift and duplicated source of truth for coins**  
   - `src/game/stores/gameStore.ts:9` and `src/game/stores/gameStore.ts:34` include `coins` in game store state.  
   - Economy/UI use `src/game/stores/economyStore.ts:22` and `src/game/ui/CoinCounter.tsx:4` as active coin source.  
   - `src/shared/types.ts:61`-`62` includes turret/fortification fields that are not represented in the active game store shape.  
   - Impact: potential inconsistency and confusion when new systems integrate.

## Validation summary

- `npm run test`: **PASS** (`14` files, `103` tests).  
- `npm run check`: **FAIL** (ESLint flat-config missing).  
- `npm run build`: **FAIL** (`vite.config.ts` Node types / `__dirname` errors).

## Open questions for implementation pass

1. Should wave progression be driven entirely by `WAVE_CONFIGS` (including multiple enemy groups per wave), or do you want procedural overrides later?
2. Should coins exist only in `economyStore`, with `gameStore` owning only phase/wave/combat progression?
3. Do you want to standardize cross-system events through Zustand actions/selectors, or introduce a lightweight event bus?

## Suggested implementation order

1. Restore toolchain gates first (`build`, `lint`) so future changes are verifiable.
2. Remove global/static runtime channels in favor of explicit state/event wiring.
3. Generalize enemy spawning/behavior to consume full `WaveConfig` + `EnemyType`.
4. Align store contracts and shared types to a single source of truth.
5. Add integration tests around game-loop transitions (start, wave complete, game over, victory).
