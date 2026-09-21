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

## Verified proof

Status: **PASS**

GitHub Actions:

- workflow: `FFmpeg Live Proof`;
- run ID: `35637587439`;
- run number: `2`;
- commit: `d13fee6396abecc79e2032d6d5aa2057ff3b72f6`;
- tests: **8/8 PASS**;
- upstream MCP identity: `ffmpeg-skill 1.25.0`;
- transport: `mcp-stdio`.

Real-media evidence:

- generated input duration: `6.0 s`;
- requested trim: `1.0–4.0 s`;
- output duration measured through upstream probe: `3.021333 s`;
- first artifact verification: **PASS**;
- intentional bad candidate verification: **FAIL** with `DURATION_MISMATCH`;
- repair plan: `trim` routed to `ffmpeg`;
- repaired artifact verification: **PASS**;
- output SHA-256:
  `b3edf1a2b8906f04795dca3e69ccfbe7f0420e7c617262c63647e2c7c21e64ed`;
- repaired output SHA-256:
  `b3edf1a2b8906f04795dca3e69ccfbe7f0420e7c617262c63647e2c7c21e64ed`.

Proof artifact:

- artifact name: `ffmpeg-live-proof`;
- artifact ID: `10656134644`;
- uploaded ZIP size: `2102 bytes`;
- artifact ZIP SHA-256:
  `4c2fdd3fb779216f817e820c46e32a73e64bec5aa1a24d9524ed6d56b41826a1`.

Ten proof potwierdza realne wykonanie przez upstream MCP, utworzenie rzeczywistego
pliku wideo, niezależny artifact verification oraz zamknięty negatywny
FAIL -> repair -> PASS loop.

## Status rule

`CLAIM ≠ PROOF`: status PASS pochodzi z zielonego workflow i evidence
rzeczywistych artefaktów, a nie z deklaracji executora.

Ta dokumentacyjna aktualizacja nie zmienia kodu proof i nie wymaga ponownego
uruchomienia workflow.
