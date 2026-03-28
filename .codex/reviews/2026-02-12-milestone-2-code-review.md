# Milestone 2 Code Review

Date: 2026-02-12  
Scope: Uncommitted Milestone 2 working tree changes  
Constraint followed: No source changes made, review only.

## Findings (ordered by severity)

1. **Ranged hits are recorded and damage numbers shown before impact is resolved**
   - `src/game/systems/CombatSystem.tsx:81`-`94` registers hit state and emits `onHit(...)` immediately when firing a ranged weapon.
   - Actual damage is applied later in `src/game/systems/ProjectileSystem.tsx:93`-`135` when/if projectile reaches target.
   - Result: hit feedback and hit records can be false positives (e.g., projectile expires/misses), causing gameplay/UI inconsistency.

2. **Wave group spawn behavior is serialized, not mixed, despite multi-group configs and comments**
   - `src/game/systems/WaveSystem.tsx:99`-`129` spawns one group to completion before starting the next.
   - The comment says "round-robin through groups" at `src/game/systems/WaveSystem.tsx:99`, but implementation is sequential.
   - With Milestone 2 wave design relying on mixed enemy pressure (`src/shared/waveConfigs.ts`), this changes encounter pacing materially versus intended composition.

3. **Announcement timers are not cleaned up on reset/unmount**
   - `src/game/systems/WaveSystem.tsx:38` and `src/game/systems/WaveSystem.tsx:41` create `setTimeout` callbacks without retaining/clearing timer IDs.
   - Result: stale delayed writes to `announcement` can occur after game reset or state transitions.

4. **Invalid Tailwind utility classes in new shop UI**
   - `src/game/ui/Shop.tsx:106` and `src/game/ui/Shop.tsx:195` use `border-3`, which is not defined by default Tailwind scales.
   - This silently degrades intended styling in key shop UI elements.

## Test coverage gaps (TDD miss)

Milestone 2 added major runtime behavior, but tests mostly expanded stores/config assertions. Current tests list (`tests/unit/**`) does not include dedicated coverage for:

1. `src/game/systems/ProjectileSystem.tsx`
   - No tests for direct-hit logic, AOE logic, TTL expiry, or "closest within threshold" behavior.

2. `src/game/systems/DamageNumbers.tsx`
   - No tests for lifecycle timing, fade/pop animation progression, or cleanup behavior.

3. `src/game/systems/CombatSystem.tsx` (new ranged flow)
   - Existing `tests/unit/systems/combat.test.ts` only covers helper functions (`findEnemiesInRange`, `isInFrontArc`) and not projectile dispatch/hit timing semantics.

4. `src/game/systems/WaveSystem.tsx` (new multi-group spawning)
   - Existing `tests/unit/systems/wave-system.test.ts` validates static config properties, not runtime spawn ordering/state transitions.

5. `src/game/ui/BossHealthBar.tsx` and boss lifecycle integration
   - No tests for visibility conditions (`bossMaxHealth`), percentage math, or integration with boss spawn/death updates from `src/game/entities/Zombie.tsx:52`-`59` and `src/game/entities/Zombie.tsx:140`-`153`.

6. `src/game/entities/BatWeapon.tsx` (new multi-weapon rendering/animation)
   - No tests for weapon model selection or melee vs ranged animation behavior.

## Validation snapshot

- `npm run test`: PASS (`116` tests)
- `npm run typecheck`: PASS
- `npm run build`: PASS (with CSS warning about `@import` order in `src/index.css:5`)

