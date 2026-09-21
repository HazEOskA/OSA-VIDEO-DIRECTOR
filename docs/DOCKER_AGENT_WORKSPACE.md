# Docker Agent Workspace Preview

## Purpose

Ten kontener jest logicznym, wspólnym środowiskiem wykonawczym dla agentów
OSA Video Director. Nie jest kolejnym runtime; opakowuje istniejące warstwy
w jeden powtarzalny sandbox.

```text
Browser / Operator
      |
      v
Node Preview API + UI
      |
      +---- Remotion renderer
      |
      +---- Python Agentic Runtime
                |
                +---- DirectorRuntime
                +---- ExecutionRouter
                +---- ArtifactVerifier
                +---- RepairPlanner
                |
                +---- ffmpeg-skill MCP
                           |
                           v
                        FFmpeg
```

## Boundaries

Kontener zawiera:

- Node 22 + Express preview;
- istniejący Remotion renderer z `qwen/video-director-v1`;
- Python 3.11 runtime z brancha agentic;
- `ffmpeg-skill@1.25.0`;
- FFmpeg/FFprobe;
- MCP stdio transport;
- shared `/app/outputs`.

DaVinci Resolve i Higgsfield pozostają executorami zewnętrznymi. Nie są
udawane wewnątrz kontenera.

## Health

`GET /api/runtime/health` sprawdza realnie:

- Python;
- FFmpeg;
- FFprobe;
- import OSA runtime;
- zarejestrowane adaptery;
- start `ffmpeg-skill` MCP;
- obecność narzędzi `probe` i `cut`.

Docker HEALTHCHECK używa właśnie tego endpointu.

## Proof

`python3 scripts/docker_preview_proof.py` wykonuje wewnątrz kontenera:

```text
synthetic input.mp4 (6s)
-> ExecutionRouter
-> FFmpegAdapter
-> ffmpeg-skill MCP
-> trim 1s..4s
-> output.mp4
-> hash + probe
-> ArtifactVerifier PASS
-> intentional bad candidate FAIL
-> RepairPlanner
-> live repair
-> PASS
```

GitHub Actions `Docker Preview Proof` buduje obraz, uruchamia kontener,
czeka na healthy API i odpala ten proof w tym samym obrazie.

## Local preview

```bash
docker build -t osa-video-director:preview .
docker run --rm -p 8080:8080 --name osa-video-director-preview osa-video-director:preview
```

UI: `http://localhost:8080`

Runtime health: `http://localhost:8080/api/runtime/health`
