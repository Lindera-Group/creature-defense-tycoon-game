# Context Management & RAG Strategy

## Overview

This project uses multiple layers of context persistence to enable RAG-style retrieval of past conversations and design decisions.

## Context Layers

### 1. MCP Memory Server (Real-time)

The `memory` MCP server provides a **knowledge graph** that persists across sessions.

**Usage Pattern**:
- Store game design decisions as entities
- Store balancing changes as observations
- Link related concepts with relations
- Search by topic to recall past decisions

**Entity Types**:
```
GameDesignDecision  - Major design choices
BalancingChange     - Number tweaks and their rationale
BugFix              - Issues found and how they were resolved
FeatureIdea         - Ideas for future features (Tage's requests!)
ArchitectureChoice  - Tech decisions and why
PlaytestFeedback    - Notes from Tage's playtesting
```

**Example**:
```json
{
  "entities": [{
    "name": "WaveSystem_v2",
    "entityType": "GameDesignDecision",
    "observations": [
      "Changed from fixed waves to dynamic scaling based on player gear score",
      "Tage found the fixed waves too predictable after 3 playthroughs",
      "New system: base_difficulty * (1 + gear_score * 0.1)"
    ]
  }]
}
```

### 2. Claude Auto-Memory (Session Notes)

Located at: `~/.claude/projects/-Users-martin-Documents-GitHub-creature-defense-tycoon-game/memory/`

**What to store**:
- Patterns that worked well
- Common issues and solutions
- Tage's preferences and feedback
- Performance bottlenecks found

### 3. Conversation Context Files (.claude/contexts/)

For structured reference documents:

```
.claude/contexts/
├── game-design-bible.md      # Complete game design document
├── art-style-guide.md        # Visual reference and constraints
├── playtest-log.md           # Notes from each playtest session
└── tage-wishlist.md          # Features Tage wants (prioritized)
```

### 4. Git History as Context

Use `git log --oneline` and `git diff` to understand what changed and why.
Commit messages should be descriptive enough to serve as a changelog.

## RAG Retrieval Patterns

### "What did we decide about X?"
1. Search MCP memory: `search_nodes("X")`
2. Check context files: `Grep pattern="X" path=".claude/contexts/"`
3. Check git log: `git log --all --oneline --grep="X"`

### "What did Tage say about Y?"
1. Search memory for PlaytestFeedback entities
2. Check playtest-log.md
3. Check tage-wishlist.md

### "Why did we implement Z this way?"
1. Search memory for ArchitectureChoice entities
2. Check git log for related commits
3. Read CLAUDE.md architecture section

## Recommended MCP Additions (Future)

### For 3D Asset Generation

| MCP Server | Purpose | Status |
|------------|---------|--------|
| meshy-mcp | AI text-to-3D model generation | Evaluate when available |
| tripo3d-mcp | Alternative AI 3D generation | Evaluate when available |
| blender-mcp | Blender automation for asset pipeline | Available (Python) |

### For Enhanced Context

| MCP Server | Purpose | Status |
|------------|---------|--------|
| sqlite-mcp | Structured game data storage | Available |
| chroma-mcp | Vector embeddings for semantic search | Future |
| notion-mcp | Game design wiki | If needed |

## Context Maintenance

Every 5th session, run a context cleanup:
1. Archive resolved BugFix entities
2. Consolidate related BalancingChange entities
3. Update game-design-bible.md with latest decisions
4. Ensure playtest-log.md is current
