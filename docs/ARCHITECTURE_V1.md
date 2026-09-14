# OSA Video Director — Agentic Post-Production Runtime V1

## Goal contract

V1 jest ukończony, gdy OSA Video Director potrafi reprezentować zadanie postprodukcji jako maszynowe decyzje, przetłumaczyć je na komendy narzędziowe, zweryfikować kandydata na podstawie evidence i zbudować bounded repair plan bez domyślnego sterowania realnym edytorem.

## Pipeline

```text
UNDERSTAND
  ↓
DIRECT
  ↓
EDIT PLAN
  ├─ DaVinci Resolve adapter
  ├─ Higgsfield adapter
  └─ Remotion adapter
  ↓
CANDIDATE RENDER / TIMELINE OBSERVATION
  ↓
VERIFY
  ↓
REPAIR PLAN
  ↓
RE-EDIT
  ↓
VERIFY
  ↓
FINAL EXPORT
```

Runtime core jest executor-agnostic. Decyzja to `EditAction`. Integracja narzędziowa zamienia akcję na `AdapterCommand`. Adaptery V1 są kontraktami translacji; live MCP/API transport jest osobną warstwą wykonawczą.

## Director DNA

`DirectorDNA` przechowuje trwały kontrakt stylu:

- tempo cięć;
- maksymalną ciszę;
- tolerancję powtórek;
- styl napisów;
- politykę przejść;
- wymagane tokeny marki;
- notatki języka wizualnego.

## Verification

Verifier ocenia evidence z timeline zamiast ufać claimom executora. V1 wykrywa:

- nadmierną ciszę;
- pozostawione retake/repetition;
- drift synchronizacji audio/wideo;
- brak tokenów brandingu;
- luki w caption coverage.

Błędy blokują PASS. Ostrzeżenia są raportowane, ale nie muszą automatycznie blokować kandydata.

## Repair loop

`RepairPlanner` mapuje wyłącznie wykryte problemy na konkretne akcje naprawcze. Nie wolno generować napraw bez evidence.

## Adapter boundaries

### DaVinci Resolve

Structural edit, trims, silence/retake cleanup, audio cleanup, transitions, color i export.

### Higgsfield

Generative B-roll i motion-graphic asset generation.

### Remotion

Deterministyczne coded captions i graphics.

## End-to-end V1

1. `PostProductionJob` dostaje source assets, transcript i `DirectorDNA`.
2. `DirectorRuntime.plan()` tworzy `EditPlan`.
3. Każda akcja jest tłumaczona przez wskazany adapter.
4. Executor poza core wykonuje operacje i zwraca `TimelineObservation`.
5. `TimelineVerifier.verify()` tworzy `VerificationReport`.
6. Jeżeli są błędy, `RepairPlanner.from_report()` tworzy bounded repair plan.
7. Po ponownym wykonaniu cykl VERIFY/REPAIR trwa do spełnienia stop condition.

## Non-goals V1

- brak automatycznej instalacji MCP;
- brak bezpośredniego GUI control;
- brak secrets/credentials;
- brak auto-publikacji;
- brak claimu „gotowe” bez verifier evidence.

## Stop condition

V1 kończy się na zweryfikowanym plan/report boundary. Destrukcyjne sterowanie realnym edytorem wymaga jawnego executora poza planning core.
