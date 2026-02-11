# Original Prompt - Creature Defense Tycoon

> Saved: 2026-02-11
> From: Martin & Tage (9 år)

## Prompt (Swedish)

Tage, min 9-åriga son, och jag vill skapa ett webbaserat spel. Skapa upp en agentstruktur och rekommenderade MCP-kopplingar (t.ex. för generering av grafik och 3D-objekt). Gärna någon typ av Context-hantering, så att det går att RAG-hämta gamla konversationer. Spara också denna ursprungsprompt. Använd den globala agentstrukturen och befintliga MCP:er som grund, med tillägg av projektspecifika agenter, MCP:s, skills, etc. Tanken är att deploya i Docker på min VPS enligt CI/CD-processen som definieras i det globala scopet. Men vi ska köra och testa spelet på localhost innan deploy. Använd också TDD-processen enligt standard definierad i det globala scopet.

Anpassa grafikens kvalitet utifrån vad som är möjligt i en webbläsare, men Tages ideal är Super Mario 3D World.

Spelet ska heta "Creature Defense Tycoon". Skapa katalogen creature-defense-tycoon-game under GitHub och lägg strukturen där. Spelet ska deployas till cdtgame.linderagroup.com.

Spelet ska gå ut på att man börjar med 0 pengar i en skog. Det finns en knapp som man kan gå på, där det står "Bat - free" och ett slagträ dyker upp när man går på den. Spelet ska vara på engelska, men vi kommer prompta på svenska. När man har slagträt börjar det komma gröna zombies. När man dödar dem får man pengar, som man kan köpa mer vapen och skydd för. I takt med att man bygger upp sina skydd och sin vapenarsenal blir motståndarna kraftfullare. Efter gröna kommer blå snabba zombies, sedan kommer röda starka zombies. Som minibossar kommer jättezombies. Slutboss är en ännu större zombie, kanske 10-15 meter hög.

Utöver vapen kan man bygga en befästning, typ en byggnad i flera våningar med torn, trappor och stegar överallt. Man är alltid själv i försvarslägret, så det behöver finnas även automatiska vapen för att hantera den ökande anfallsstyrkan.

När man har klarat slutbossen, kan man välja att bli återfödd (rebirth). Då tas hela byggnaden bort och man startar i en annan skog där det är fullmåne. När man har återfötts kommer det varulvar istället. Då får man mer pengar och nya typer av vapen (bättre) och andra typer av försvarsbefästningar.

Totalt är det 3 rebirths. I den sista är det blodmåne och då attackerar både varulvar och zombies. Slutet måste vara maxat!!

## Key Design Points

- **Title**: Creature Defense Tycoon
- **Platform**: Web browser (deployed to cdtgame.linderagroup.com)
- **Language**: English (UI), Swedish (development prompts)
- **Visual Target**: Super Mario 3D World quality (adapted for browser)
- **Core Loop**: Kill creatures → earn money → buy weapons/defenses → face stronger enemies
- **Progression**: 3 rebirths with escalating difficulty and rewards

### Rebirth Phases

| Phase | Setting | Enemies | Moon | Theme |
|-------|---------|---------|------|-------|
| 0 (Start) | Dark Forest | Green → Blue → Red Zombies + Giant Boss | Normal | Classic zombie defense |
| 1 (Rebirth 1) | Full Moon Forest | Werewolves | Full Moon | Lycanthrope invasion |
| 2 (Rebirth 2) | Cursed Forest | Enhanced creatures | Eclipsed Moon | Dark magic |
| 3 (Rebirth 3) | Blood Moon Forest | Zombies + Werewolves combined | Blood Moon | MAXIMUM CHAOS |

### Weapon Progression
- Free: Baseball Bat (melee)
- Early: Upgraded bats, crossbow
- Mid: Guns, turrets, traps
- Late: Automatic weapons, artillery
- Rebirth: Silver weapons, holy weapons, magic

### Fortification System
- Multi-story building
- Towers, stairs, ladders
- Automated defense turrets
- Walls, gates, barriers
