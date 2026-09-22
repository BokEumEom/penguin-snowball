# Unity MCP setup for Penguin Snowball

This repository keeps the existing web prototype and a runnable Unity migration source set under `UnityProject/`. The Unity Editor bootstrap generates the reference-matched Title and Battle scenes plus unit prefabs/animators from committed hand-drawn sprite sources.

## Recommended stack

Use **Unity official CLI MCP + Unity official skills first**.

Why:
- `unity mcp` exposes a connected Unity Editor as MCP tools.
- `unity mcp configure codex --local` can write a project-local Codex MCP config.
- `unity skill install codex --local` installs the matching Unity CLI skill into `.agents/skills/unity-cli`.
- The project's own `.agents/skills/penguin-snowball-unity` skill adds the game-specific art/UI/gameplay contract.

Do not run two Unity MCP bridges simultaneously for the same Editor.

Fallbacks only if the official bridge cannot work:
1. CoplayDev/unity-mcp
2. IvanMurzak/Unity-MCP

## Local setup

Run from the Unity project directory on the development machine:

```powershell
unity --version
unity status --format json
unity mcp configure --list
unity skill install --list

unity mcp configure codex --local --project-path .
unity skill install codex --local
```

Then open the project and verify the Editor is connected:

```powershell
unity open .
unity status --format json
unity commands --project-path .
```

If the Editor is already open:

```powershell
unity status
unity command editor_play --project-path .
```

## Skill usage

Codex should discover:

- `.agents/skills/unity-cli` — installed by the Unity CLI
- `.agents/skills/penguin-snowball-unity` — committed in this repo

For any Penguin Snowball scene/UI/animation/gameplay task, read the project skill first, then use the official Unity tools.

## Unity project creation

Use a **Universal 2D** project and target WebGL.

Open `UnityProject/` with Unity 6.3.24f1. After scripts compile, run **Tools > Penguin Snowball > Bootstrap Reference Scenes**. This decodes the committed art, creates prefabs and animations, wires Title/Battle scenes, and adds them to Build Settings.

Recommended project shape:

```text
Assets/
  Art/
    Background/
    Penguins/
      Small/
      Gentoo/
      Chinstrap/
      Emperor/
      King/
    UI/
    Igloo/
  Animations/
  Prefabs/
    Units/
    UI/
  Scenes/
    Title.unity
    Battle.unity
  Scripts/
```

## Visual implementation rule

The current web prototype is not a valid final art source.

Final Unity visuals should be imported sprite assets:
- transparent PNG or PSD;
- hand-drawn flat color;
- thick imperfect outline;
- no procedural geometric penguin rendering.

Minimum per-unit sprite/clip set:
- idle
- walk
- make-snowball
- throw
- hit
- defeat

## Build validation

Before calling the Unity migration complete:

```powershell
unity test . --mode EditMode
unity test . --mode PlayMode
```

Then make a WebGL build through the project's build method or configured Unity build command.

Validate at:
- 1920x1080
- 390x844 portrait
- mobile landscape

Use Unity MCP Game View capture for visual comparison after each major UI/art pass.
