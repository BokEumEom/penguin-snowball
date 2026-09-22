---
name: penguin-snowball-unity
description: Use when creating, migrating, editing, or validating the Unity version of Penguin Snowball. Enforces the reference game's visual language, mobile WebGL layout, 2D sprite workflow, uGUI HUD, penguin animation states, and the cheer/snowball-production loop. Use this before changing Unity scenes, prefabs, UI, animation, gameplay, or WebGL settings for this project.
---

# Penguin Snowball Unity

Build the Unity version as an original game strongly inspired by the provided Unityroom reference's presentation and interaction, without copying proprietary source code or exact art assets.

## Tool routing

1. Prefer Unity's official CLI/MCP and skills when available:
   - `unity status`
   - `unity command`
   - `unity mcp --project-path <project>`
   - `unity skill install codex --local`
2. For UI work, follow the Unity `ui` skill. This project uses **uGUI** for runtime UI because the game targets mobile WebGL and needs simple Canvas scaling.
3. If official Unity MCP is unavailable, CoplayDev Unity MCP or IvanMurzak Unity-MCP are acceptable fallbacks. Do not mix multiple Unity MCP bridges in one project session.
4. Use MCP/Editor commands for scene, prefab, component, animation and build changes. Do not hand-edit `.unity`, `.prefab`, or serialized asset YAML when an Editor is available.

## Non-negotiable visual contract

Read `references/reference-style.md` before visual/UI changes.

The current React/Canvas implementation is **not** the art source of truth.

For final visuals:
- Use imported 2D sprite assets and Animator clips.
- Do not use procedural Canvas drawing, SVG-like geometric penguins, runtime Bézier blobs, gradients, glossy vector rendering, or generic mobile-app cards.
- Preserve the reference-like qualities: flat hand-painted color masses, chunky imperfect outlines, simple faces, large white belly, yellow beak/feet, loose asymmetry, playful motion.
- Team identity should be readable primarily from the character/base palette and battlefield side, not modern badges or decorative app UI.
- Character silhouettes must stay readable at 32–64 px on mobile.

## Scene structure

Use two scenes:

### Title
- Paper/cream snow background.
- Large hand-drawn Korean title.
- Penguin group art is the visual focus.
- One primary Start button.
- Difficulty and match time are small secondary controls.
- Settings is a small icon/button.
- No large dashboard cards, unit encyclopedia, marketing copy, feature cards, or deep shadows.

### Battle
- Orthographic 2D camera.
- Left player igloo, right enemy igloo.
- Play area occupies most of the viewport.
- Top: timer + minimal home/pause controls.
- Bottom: cheer, cost gauge, five unit buttons, base HP.
- Selected unit: battlefield placement preview.
- Desktop: pointer movement + left click placement + right click cancel.
- Mobile: tap unit, tap battlefield to place, tap same unit or cancel control to cancel.

## Gameplay contract

Unit costs:
- Small 1
- Gentoo 3
- Chinstrap 5
- Emperor 7
- King 10

Core loop:
1. Spend cost to deploy penguins.
2. Units walk toward the opposing side.
3. When a target is in range, a unit makes a snowball.
4. The snowball visibly grows through a short making animation.
5. The unit throws it in an arc.
6. When out of prepared snowballs, the penguin makes another one.
7. Cheer tapping accelerates **snowball-making speed**, not generic cost regeneration.
8. Cost regeneration is independent of cheer.
9. Destroying the opposing igloo ends the match.

## Animation minimum

Each penguin needs:
- Idle
- Walk
- MakeSnowball
- Throw
- Hit
- Defeat

Character motion:
- Small: exaggerated short waddles.
- Gentoo: fast forward lean.
- Chinstrap: calm long stride, stable upper body.
- Emperor: heavy stomp and squash.
- King: slow proud walk, large anticipation before throw.

Do not ship with a single generic animation shared by all five units.

## Mobile WebGL rules

- Canvas Scaler: Scale With Screen Size.
- Reference resolution: 1920x1080.
- Match width/height: 0.5 unless a concrete test proves another value is better.
- Respect safe areas.
- Minimum actionable touch target: 44 CSS-equivalent px.
- Test landscape 16:9 and phone portrait/landscape layouts.
- Avoid hover-only interactions.
- No required right-click on mobile.
- Avoid allocations in Update and large transparent full-screen particle systems.

## Validation loop

After meaningful visual/gameplay changes:
1. Save scene/prefabs.
2. Enter Play Mode.
3. Capture Game View at desktop 16:9.
4. Capture phone portrait and phone landscape.
5. Compare against `references/reference-style.md`.
6. Run EditMode/PlayMode tests if gameplay logic changed.
7. Build WebGL before declaring complete.
8. Never claim visual parity from code inspection alone; inspect a rendered Game View screenshot.

## Definition of done

A change is not done if:
- the game still looks like a generic web/mobile app;
- penguins are generated from code shapes instead of final sprites;
- title screen uses dashboard/card composition;
- cheer still boosts cost instead of snowball production;
- mobile placement cannot be completed with taps;
- the Unity WebGL build has not been checked.
