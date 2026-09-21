# FFmpeg Adapter + Execution Router

## Scope

This slice adds a typed FFmpeg adapter and deterministic execution router to the
existing Agentic Post-Production Runtime V1.

It does **not** install or invoke FFmpeg, `ffmpeg-skill`, MCP, DaVinci Resolve,
Remotion, Higgsfield, or any GUI. The runtime remains side-effect free.

## Boundary

```text
DirectorRuntime
  -> EditPlan
  -> ExecutionRouter
     -> FFmpegAdapter
     -> DaVinciResolveAdapter
     -> RemotionAdapter
     -> HiggsfieldAdapter
  -> AdapterCommand
  -> external executor (out of scope)
```

## Routing rules

1. `EditAction.preferred_adapter` is authoritative.
2. If the preferred adapter is missing or does not support the action, routing
   fails closed with `RoutingError`.
3. If no preference is supplied, the deterministic fallback order is:
   `ffmpeg -> davinci -> remotion -> higgsfield`.
4. The router only returns `AdapterCommand`; it never executes a tool.

## FFmpeg adapter scope

Supported normalized operations:

- `cut`
- `trim`
- `remove_silence`
- `audio_cleanup`
- `caption`
- `color`
- `transition`
- `export`

The operation names are OSA internal contracts, not a claim that they already
match a specific upstream `ffmpeg-skill` CLI/MCP schema.

## Next integration boundary

A later executor layer may bind `AdapterCommand(adapter="ffmpeg", ...)` to the
live `ffmpeg-skill` machine-readable contract and return execution evidence.
That live transport requires a separate approval and verification scope.
