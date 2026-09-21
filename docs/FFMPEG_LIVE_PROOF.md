# FFmpeg Live Proof — T3–T6

## Scope

Ten slice łączy `FFmpegAdapter` z rzeczywistym `ffmpeg-skill` przez jego
contract-derived MCP stdio server.

Nie używa ręcznie składanego shell command jako warstwy wykonawczej OSA.

## Runtime path

```text
EditAction(kind="trim", preferred_adapter="ffmpeg")
  -> ExecutionRouter
  -> FFmpegAdapter
  -> AdapterCommand
  -> FFmpegSkillMCPExecutor
  -> ffmpeg-skill MCP tools/call: cut
  -> real output.mp4
  -> ffmpeg-skill MCP tools/call: probe
  -> ArtifactEvidence (probe + bytes + SHA-256)
  -> ArtifactVerifier
```

## Negative proof / repair

Test celowo podaje sześciusekundowy input jako kandydata dla kontraktu
oczekującego trzy sekundy:

```text
6 s candidate
  -> ArtifactVerifier
  -> DURATION_MISMATCH / FAIL
  -> RepairPlanner
  -> trim 1.0–4.0 / ffmpeg
  -> ExecutionRouter
  -> FFmpegSkillMCPExecutor
  -> repaired.mp4
  -> ArtifactVerifier
  -> PASS
```

## Evidence contract

Proof JSON zawiera:

- identyfikację i wersję serwera ffmpeg-skill;
- transport `mcp-stdio`;
- probe inputu i outputu;
- SHA-256 i rozmiar artefaktów;
- structured result z ffmpeg-skill;
- raport pierwszej walidacji;
- negatywny raport FAIL;
- machine-readable repair plan;
- evidence po naprawie;
- finalny raport PASS;
- GitHub run id i commit SHA.

## Upstream pin

Izolowany proof CI instaluje `ffmpeg-skill@1.25.0`.

## Status rule

Dokument nie deklaruje PASS przed zielonym realnym runem GitHub Actions.
Po weryfikacji runu jego ID i wynik zostaną dopisane jako proof.
