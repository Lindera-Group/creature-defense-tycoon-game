# Milestone 1: First Playable Loop

> Start in forest -> pick up free bat -> kill green zombies -> earn coins -> buy spiked bat

## Overview

| Metric | Value |
|--------|-------|
| Tasks | 15 (Task 0-14) |
| New files | ~44 |
| Modified files | 3 |
| Test files | 14 |
| TDD | Every task starts RED (failing tests) |

## Dependency Graph

```
Task 0:  Infrastructure (tests + tailwind)
   |
   v
Task 1:  Game Store ────────────────────┐
   |                                     |
   v                                     v
Task 2:  Economy Store             Task 3: Combat Store
   |         |                          |
   v         v                          v
Task 4:  Forest World             Task 6: Basic HUD
   |                                    |
   v                                    v
Task 5:  Player Character         Task 7: Weapon Pickup Button
   |         |                          |
   v         v                          v
Task 8:  Green Zombie ─────────> Task 9: Combat System
   |                                    |
   v                                    v
Task 10: Coin System            Task 11: Wave System
   |                                    |
   v                                    v
Task 12: Shop (Spiked Bat)      Task 13: Game Over / Victory
   |                                    |
   └────────────┬──────────────────────┘
                 v
         Task 14: Integration & Assembly
```

## Task Details

---

### Task 0: Test & Style Infrastructure

**Agent:** Vera + Hugo

**Goal:** Get Vitest running and Tailwind configured.

**Files to create:**
- `tailwind.config.ts`
- `postcss.config.js`
- `src/index.css`
- `tests/setup.ts`

**Files to modify:**
- `vite.config.ts` (add vitest test config with `environment: 'jsdom'`)
- `src/main.tsx` (import `index.css`)

**Verify:** `npm run test` passes (zero tests), `npm run dev` shows Tailwind active.

**Testing strategy:**
- Pure logic (stores, systems, math): Vitest unit tests
- R3F 3D components: Defer to Playwright e2e (jsdom can't render WebGL)
- HUD/UI (React + Tailwind): React Testing Library

---

### Task 1: Game Store (Core State)

**Agent:** Vera (RED) -> Ada (GREEN)

**RED tests** (`tests/unit/stores/game-store.test.ts`):
- Initialize with defaults (coins: 0, health: 100, wave: 0, no weapon, not started)
- `startGame()` -> gameStarted: true, wave: 1
- `addWeapon('bat')` -> ownedWeapons includes 'bat'
- `equipWeapon('bat')` -> equippedWeapon: 'bat'
- Cannot equip weapon not owned
- `takeDamage(10)` -> health: 90
- Health doesn't go below 0, sets gameOver: true
- `nextWave()` -> wave increments
- `setEnemiesAlive(5)` -> tracks count

**GREEN** (`src/game/stores/gameStore.ts`):
- Zustand + Immer middleware
- State from `GameState` type (subset for M1: phase always 0, no turrets/fortifications)
- Export `useGameStore` hook + `getGameState()` for non-React access

---

### Task 2: Economy Store (Coins)

**Agent:** Vera (RED) -> Ada (GREEN), Loki (balance review)

**RED tests** (`tests/unit/stores/economy-store.test.ts`):
- Initialize with 0 coins
- `addCoins(10)` -> 10 coins
- `spendCoins(50)` with 100 coins -> 50 remaining, returns true
- Refuse spend when insufficient -> returns false
- `rollCoinDrop([5, 10])` -> number between 5-10
- `canAfford('spiked_bat')` checks against WEAPONS cost
- `buyWeapon('spiked_bat')` deducts coins + adds weapon to game store

**GREEN** (`src/game/stores/economyStore.ts`):
- Zustand + Immer
- Cross-references `WEAPONS` constants for pricing

---

### Task 3: Combat Store (Damage Tracking)

**Agent:** Vera (RED) -> Ada (GREEN)

**RED tests** (`tests/unit/stores/combat-store.test.ts`):
- Track attack cooldown based on weapon attackSpeed
- `getWeaponDamage()` with bat -> 10
- No weapon -> 0 damage
- `registerHit(enemyId, damage)` tracked
- Last attack timestamp for cooldown

**GREEN** (`src/game/stores/combatStore.ts`):
- Reads `equippedWeapon` from gameStore
- Uses `performance.now()` for cooldowns

---

### Task 4: Forest World (3D Environment)

**Agent:** Vera (RED for config), Athena (scene), Hephaestus (trees)

**RED tests** (`tests/unit/world/forest.test.ts`):
- Ground dimensions >= 50x50
- 15-30 trees for visual density
- Trees not placed within 5 units of center (spawn area)
- `createTreeGeometry` returns trunk + canopy data
- Tree height varies randomly

**GREEN:**
- `src/game/world/Forest.tsx` - Container component
- `src/game/world/Ground.tsx` - 80x80 green plane, receiveShadow
- `src/game/world/Trees.tsx` - 20-25 procedural trees (CylinderGeometry trunk #8B4513 + SphereGeometry/ConeGeometry canopy in greens), MeshToonMaterial, outside 10-unit center radius
- `src/game/world/ForestLighting.tsx` - Warm ambient (0.5) + directional sun (1.2, casts shadows)
- Sky: `<color attach="background" args={['#87CEEB']} />`

**Art notes:** Chunky cartoonish trees like Super Mario 3D World. Bright greens, warm ground.

---

### Task 5: Player Character (Model + Movement)

**Agent:** Vera (RED), Hephaestus (model), Athena (movement + camera)

**RED tests** (`tests/unit/entities/player.test.ts`):
- WASD input -> correct velocity direction
- Diagonal movement normalized (not sqrt(2) faster)
- Speed = PLAYER_DEFAULTS.speed (5 units/sec)
- Position clamped within world bounds
- Player rotates to face movement direction

**GREEN:**
- `src/game/entities/Player.tsx` - Procedural chibi character:
  - Body: BoxGeometry (0.6x0.8x0.4), color #FFD700 (gold)
  - Head: SphereGeometry (r=0.35), color #FFCC80 (skin)
  - Eyes: Two small black spheres
  - Legs + Arms: Small boxes
  - MeshToonMaterial for all
  - Bobbing animation while moving (sinusoidal Y on legs)
- `src/game/hooks/useKeyboardInput.ts` - WASD/Arrow tracking
- `src/game/hooks/useFollowCamera.ts` - Third-person camera (offset [0, 8, 12], smooth lerp)
- Movement in useFrame, clamp to [-38, 38]

---

### Task 6: Basic HUD

**Agent:** Vera (RED) -> Hugo (GREEN)

**RED tests** (`tests/unit/ui/hud.test.ts`):
- Health bar width proportional to health percentage
- Health bar color: >50% green, 25-50% yellow, <25% red
- Coin counter displays correct value
- Wave indicator shows "Wave N" or "Get Ready!"
- Equipped weapon name displayed

**GREEN:**
- `src/game/ui/HUD.tsx` - Fixed overlay, reads Zustand stores
- `src/game/ui/HealthBar.tsx` - Top-left, gradient bar
- `src/game/ui/CoinCounter.tsx` - Top-right, gold text, scale-up animation on change
- `src/game/ui/WaveIndicator.tsx` - Top-center
- Tailwind styling, semi-transparent backgrounds

---

### Task 7: Weapon Pickup Button ("Bat - Free!")

**Agent:** Vera (RED) -> Hugo (GREEN)

**RED tests** (`tests/unit/ui/weapon-pickup.test.ts`):
- Shows when no weapon owned
- Clicking: addWeapon('bat'), equipWeapon('bat'), startGame()
- Disappears after pickup

**GREEN** (`src/game/ui/WeaponPickupButton.tsx`):
- Large center-bottom button with pulsing glow animation
- "Pick Up Bat - FREE!"
- On click: gives bat, equips it, starts game (wave 1)
- Impossible to miss (big, colorful, bouncing)

---

### Task 8: Green Zombie (Model + AI)

**Agent:** Vera (RED), Hephaestus (model), Athena (AI), Loki (balance)

**RED tests** (`tests/unit/entities/zombie.test.ts`):
- Moves toward player at ENEMIES.zombie_green.speed (1.5 u/s)
- Faces player while moving
- Stops at attack range (1.5 units)
- Deals 5 damage per hit at 1 hit/sec
- Respects attack cooldown
- Initializes with 30 HP
- Takes damage, dies at 0
- Drops coins in [5, 10] range

**GREEN:**
- `src/game/entities/Zombie.tsx` - Procedural zombie:
  - Body: BoxGeometry (0.8x1.2x0.5), #4CAF50 green
  - Head: Oversized SphereGeometry (r=0.4), chibi style
  - Arms extended forward (zombie pose!)
  - Red dot eyes (menacing but cute)
  - MeshToonMaterial, wobble while walking
  - AI: useFrame move toward player, attack when close
  - Health via ref (performance), death triggers coin drop

- `src/game/entities/EnemyManager.tsx` - Manages all zombies:
  - Array of active enemies
  - Spawns based on wave system
  - Updates enemiesAlive count

**Balance:** 30HP zombie, 10 dmg bat = 3 hits to kill. At 2 hits/sec = 1.5s per zombie. Very manageable for a 9-year-old.

---

### Task 9: Combat System (Melee + Hit Effects)

**Agent:** Vera (RED) -> Athena (GREEN)

**RED tests** (`tests/unit/systems/combat.test.ts`):
- Detect enemies within weapon range
- Only hit enemies in front (180-degree arc)
- Apply weapon damage
- Respect attack cooldown
- Hit effect data on successful hit
- Killing blow triggers coin drop + enemy death

**GREEN:**
- `src/game/systems/CombatSystem.tsx` - useFrame system:
  - Click/Spacebar to attack
  - Check cooldown, find enemies in range + arc
  - Apply damage to closest enemy
- `src/game/systems/HitEffect.tsx` - Visual feedback:
  - White flash on hit (100ms)
  - Floating damage numbers
  - Small particle burst
- `src/game/entities/BatWeapon.tsx` - Visual bat:
  - Elongated box/cylinder, #8B7355 wood brown
  - Swing animation on attack

---

### Task 10: Coin Drop & Collection

**Agent:** Vera (RED), Athena (3D), Hugo (counter animation)

**RED tests** (`tests/unit/systems/coin-system.test.ts`):
- Spawn coins at enemy death position
- Correct amount based on coinDrop config
- Auto-collect within 3 units (generous!)
- Add to economy store on collect
- Remove from scene on collect

**GREEN:**
- `src/game/systems/CoinSystem.tsx` - Manages coin entities
- `src/game/entities/Coin.tsx` - Visual coin:
  - CylinderGeometry (r=0.3, h=0.08), #FFD700 gold
  - MeshToonMaterial, emissive glow
  - Spinning + floating animation
  - "Magnet" effect: lerp toward player when close
  - 3-unit pickup radius (generous, no frustrating near-misses)

---

### Task 11: Wave System (Waves 1-5)

**Agent:** Vera (RED), Loki (design), Athena (GREEN)

**RED tests** (`tests/unit/systems/wave-system.test.ts`):
- Wave 1-5 configs defined
- Start wave 1 when game starts
- Spawn enemies per config with delays
- Detect wave completion (all dead)
- Award bonus coins (wave * 50)
- 5-second inter-wave pause
- "Wave Complete!" message between waves
- "All Waves Complete!" after wave 5

**GREEN:**
- `src/shared/waveConfigs.ts`:
  ```
  Wave 1: 2 green zombies, 3.0s delay, 50 bonus
  Wave 2: 3 green zombies, 2.5s delay, 100 bonus
  Wave 3: 4 green zombies, 2.0s delay, 150 bonus
  Wave 4: 5 green zombies, 2.0s delay, 200 bonus
  Wave 5: 8 green zombies, 1.5s delay, 300 bonus
  ```
- `src/game/systems/WaveSystem.tsx` - State machine (idle->spawning->active->waveComplete->interWave->allComplete)
- `src/game/ui/WaveAnnouncement.tsx` - Full-screen overlay text

**Balance (Loki):** Total potential coins: ~22 zombies * ~7 avg + 800 bonus = ~950 coins. Enough for spiked bat (100) with plenty to spare. Generous = fun!

---

### Task 12: Minimal Shop (Buy Spiked Bat)

**Agent:** Vera (RED) -> Hugo (GREEN), Loki (pricing)

**RED tests** (`tests/unit/ui/shop.test.ts`):
- Shows spiked_bat with cost 100
- Disabled when can't afford
- Enabled when can afford
- Deducts coins + adds weapon on buy
- Auto-equips purchased weapon
- Shows "OWNED" for purchased weapons
- Toggle visibility

**GREEN:**
- `src/game/ui/Shop.tsx` - Semi-transparent overlay panel
- `src/game/ui/ShopButton.tsx` - Bottom-right toggle
- Shows: Spiked Bat - 100 coins - "Double the damage!" - [BUY]
- Green button when affordable, gray when not

---

### Task 13: Game Over + Victory + Start Screen

**Agent:** Vera (RED) -> Hugo (GREEN)

**RED tests** (`tests/unit/ui/game-screens.test.ts`):
- Game over shows when health = 0
- Shows "Try Again" button that resets game
- Victory shows after wave 5 complete
- Shows "You Win!" with stats
- Start screen shows before bat pickup

**GREEN:**
- `src/game/ui/GameOverScreen.tsx` - Dark overlay, red "GAME OVER", stats, "Try Again"
- `src/game/ui/VictoryScreen.tsx` - Gold overlay, "YOU WIN!", confetti effects, teaser text
- `src/game/ui/StartScreen.tsx` - Title + "Pick up the bat to start!"

---

### Task 14: Integration & Assembly

**Agent:** Vera (integration tests), Athena (assembly)

**Tests** (`tests/integration/game-loop.test.ts`):
- Full flow: start -> pickup -> kill -> earn -> buy
- Game over flow
- Victory flow

**Final App.tsx assembly:**
```tsx
<Canvas>
  <Physics>
    <Forest />
    {gameStarted && !gameOver && (
      <Player /><EnemyManager /><CombatSystem /><CoinSystem /><WaveSystem />
    )}
  </Physics>
</Canvas>
{/* HTML overlays */}
{!gameStarted && <StartScreen />}
{gameStarted && !gameOver && <HUD />}
{!gameStarted && <WeaponPickupButton />}
{gameOver && <GameOverScreen />}
{isVictory && <VictoryScreen />}
```

---

## Agent Assignment Summary

| Agent | Tasks | Role |
|-------|-------|------|
| **Vera** | All tasks (RED phase) | Writes failing tests first |
| **Ada** | 1, 2, 3 | Zustand stores, logic |
| **Athena** | 4, 5, 8, 9, 10, 11, 14 | R3F, physics, systems |
| **Hugo** | 0, 6, 7, 12, 13 | React UI, Tailwind |
| **Hephaestus** | 4, 5, 8, 9, 10 | Procedural 3D models |
| **Loki** | 2, 8, 11, 12 | Balance, wave design |

## Tage-Fun Checklist

- [ ] Player bobs/bounces while walking
- [ ] Bat swing animation is satisfying
- [ ] Zombies flash white on hit
- [ ] Damage numbers float up (big, bold)
- [ ] Coins are shiny gold and spin
- [ ] Coins magnetically fly toward player
- [ ] Coin counter bounces on update
- [ ] "Wave Complete!" feels rewarding
- [ ] Shop purchase feels impactful
- [ ] Spiked bat looks different from regular bat
- [ ] Victory screen is celebratory
- [ ] Game over is gentle, not scary
- [ ] Controls are responsive
- [ ] Waves 1-3 are easy enough to learn
- [ ] Wave 5 is beatable with spiked bat
