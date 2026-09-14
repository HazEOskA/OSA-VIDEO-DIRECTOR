# ADR-001: Split director intelligence from editor execution

**Status:** Accepted for V1 branch

## Context

Oryginalne repo jest skillem reżyserskim skupionym na generowaniu sześciu klipów z zachowaniem continuity OSA Character Lock. Nowy kierunek jest szerszy: surowy materiał ma być rozumiany, montowany, wzbogacany, weryfikowany i poprawiany przez kilka wyspecjalizowanych narzędzi.

## Decision

Wprowadzamy mały, dependency-free runtime z czterema granicami:

1. `DirectorRuntime` tworzy tool-independent edit decisions.
2. Adaptery tłumaczą decyzje dla DaVinci Resolve, Higgsfield i Remotion.
3. `TimelineVerifier` ocenia candidate output wyłącznie na podstawie obserwowalnego evidence.
4. `RepairPlanner` zamienia failed evidence na bounded repair plan.

Istniejący `skills/directing-osa-videos` pozostaje nietknięty i może zasilać runtime w kolejnych etapach.

## Consequences

Pozytywne:

- brak vendor lock-in;
- deterministyczne i testowalne planowanie;
- verification gate przed final export;
- przyszłe MCP/API transports bez przepisywania Director Brain;
- zachowanie istniejącego OSA Character Lock.

Trade-offs:

- V1 nie steruje jeszcze bezpośrednio DaVinci/Higgsfield/Remotion;
- timeline observation wymaga przyszłej warstwy probe/executor;
- analiza semantyczna transkryptu jest kontraktem runtime, nie wbudowanym wywołaniem LLM.
