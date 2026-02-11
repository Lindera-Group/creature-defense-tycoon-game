---
description: Start a playtest session - launch dev server, open browser, and log feedback
---

# Playtest Session

Run this command to start a playtesting session with Tage:

1. Start the dev server: `npm run dev`
2. Open the game in the browser via Playwright
3. Take a screenshot of the current state
4. Ask for feedback from the playtest
5. Log feedback to `.claude/contexts/playtest-log.md`
6. Save key insights to MCP memory as PlaytestFeedback entities
7. Create issues for any bugs found

Remember: Tage is 9 - ask simple, specific questions:
- "Was that too easy or too hard?"
- "What was the most fun part?"
- "What was the most annoying part?"
- "What do you wish you could do?"
