---
description: Design and implement a new enemy type with TDD
---

# New Enemy Design & Implementation

Follow this workflow to add a new enemy type:

## 1. Design Phase (Loki)
- What rebirth phase does this enemy appear in?
- What makes it unique? (speed, health, special attack, size?)
- How does it fit the difficulty curve?
- What does it look like? (colors, proportions, animations)

## 2. Red Phase (Vera)
Write failing tests first:
- Enemy config validation test
- Spawn behavior test
- Combat interaction test
- Coin drop test
- Death animation trigger test

## 3. Green Phase (Athena + Hephaestus)
- Create the 3D model (procedural or GLTF)
- Implement the entity class
- Add to wave configuration
- Implement AI behavior
- Add sound effects and particles

## 4. Refactor & Review
- Optimize for performance (instancing if hordes)
- Run full test suite
- Playtest the new enemy
