# OSA VIDEO DIRECTOR — GOAL LOCK

## North Star

**OSA Video Director to evidence-driven agentic post-production runtime, który zamienia surowe media i intencję twórczą w zweryfikowany finalny film poprzez planowanie montażu, routing pracy między wyspecjalizowane executory, walidację rzeczywistych artefaktów i evidence-driven repair loop.**

English canonical form:

> **OSA Video Director is an evidence-driven agentic post-production runtime that transforms raw media and creative intent into a verified final video by planning edits, routing work across specialized media executors, validating real artifacts, and repairing failures until the final output satisfies its contract.**

## Input contract

System przyjmuje:

- surowe video / audio / images;
- prompt / objective;
- `DirectorDNA`;
- wymagania wyjścia: format, proporcje, czas, branding i inne jawne constraints.

## Required pipeline

```text
INPUT
  ↓
UNDERSTAND
  ↓
DIRECT
  ↓
EDIT PLAN
  ↓
EXECUTION ROUTER
  ├─ FFmpeg
  ├─ DaVinci Resolve
  ├─ Remotion
  └─ Higgsfield
  ↓
CANDIDATE VIDEO
  ↓
VERIFY
  ├─ PASS → FINAL EXPORT + PROOF
  └─ FAIL → REPAIR PLAN → EXECUTE → VERIFY
```

## Definition of Done

Repo osiąga główny goal dopiero wtedy, gdy pełny workflow potrafi na realnym materiale:

1. przeanalizować wejściowe media i wymagania;
2. utworzyć maszynowy `EditPlan`;
3. wybrać właściwy executor przez `ExecutionRouter`;
4. wykonać wymagane operacje postprodukcji;
5. utworzyć rzeczywisty `candidate` artifact;
6. zebrać evidence z rzeczywistego artefaktu;
7. zweryfikować wynik niezależnie od claimu executora;
8. przy FAIL utworzyć bounded repair plan wyłącznie z evidence;
9. ponowić wykonanie i weryfikację;
10. zakończyć na **verified final video + machine-readable proof**.

## Proof rule

> **CLAIM ≠ PROOF**

Film nie jest uznany za gotowy dlatego, że agent lub executor zwrócił `done`.
Finalny status PASS wymaga verifier evidence z rzeczywistego artefaktu.

## Non-goals

To repo nie ma być:

- prostym generatorem promptów;
- wrapperem tylko na DaVinci Resolve;
- samym `prompt → Remotion`;
- kolekcją luźnych skills bez wspólnego runtime;
- dashboardem bez działającego backendu wykonawczego;
- automatycznym publisherem social media.

Publikacja i dystrybucja mogą być osobną warstwą ponad zweryfikowanym finalnym artefaktem.

## Stop condition

Prace nad głównym golem uznaje się za zamknięte dopiero po powtarzalnym E2E proof:

```text
raw media
→ DirectorRuntime
→ EditPlan
→ ExecutionRouter
→ live executor(s)
→ candidate artifact
→ verifier
→ repair when required
→ verified final artifact
→ proof
```

Bez realnego artefaktu i verifier evidence status pozostaje niepełny.
