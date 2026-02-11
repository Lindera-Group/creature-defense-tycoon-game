---
name: game-design
description: Interactive game design session for Creature Defense Tycoon. Use for designing new enemies, weapons, waves, or balancing existing mechanics.
---

# Game Design Session

When this skill is invoked, follow this workflow:

## 1. Context Gathering
- Read `.claude/docs/ORIGINAL_PROMPT.md` for the game vision
- Search MCP memory for related design decisions
- Read current game config files in `src/shared/`

## 2. Design Mode
- Ask what aspect to design/balance (enemies, weapons, waves, buildings, economy)
- Present options with clear tradeoffs
- Remember: the primary player is a 9-year-old boy who loves action games
- Everything should feel POWERFUL and REWARDING

## 3. Balancing Framework
For any new addition, define:
- **Cost** (in coins): What does the player give up?
- **Power** (DPS or HP): What do they get?
- **Fun factor**: Is there a satisfying visual/audio payoff?
- **Progression fit**: Does it fill a gap in the current progression?

## 4. Documentation
- Save decisions to MCP memory as GameDesignDecision entities
- Update game config files with new values
- Write tests for new game mechanics (TDD!)

## 5. Playtesting Prep
- Suggest specific things to test
- Define what "balanced" looks like for each change
- Add entry to `.claude/contexts/playtest-log.md`
