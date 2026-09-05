# OSA VIDEO DIRECTOR 🐝🎬

**OSA VIDEO DIRECTOR** to skill reżyserski do zamiany pomysłu, notatek, copy lub artykułu w spójny pakiet krótkiego wideo z kanoniczną, napakowaną antropomorficzną Osą jako głównym aktorem.

Projekt jest inspirowany workflow repozytorium `kaomei/stickman-video-director`, ale ma własny character system, motion language i kontrakt ciągłości dostosowany do bardziej złożonej postaci.

## Cel v0

Wejście:

```text
temat / copy / artykuł
+ format obrazu
+ kierunek wizualny
```

Pipeline:

```text
SOURCE
  ↓
PHASE A — DIRECTOR'S PROPOSAL
  ↓
OPERATOR APPROVAL
  ↓
PHASE B — 6 STANDALONE VIDEO PROMPTS
  ↓
GENERATION
  ↓
STITCH / FINAL VIDEO
```

Domyślny format to około **60 sekund**, podzielone na **6 klipów po około 10 sekund**. Każdy klip ma trzy beaty czasowe, własny mikrocel narracyjny i jawny stan końcowy dopasowany do początku następnego klipu.

## Główna różnica: OSA Character Lock

Stickman może być utrzymany przez prostą geometrię. OSA wymaga silniejszego systemu tożsamości.

Każda scena musi utrzymywać:

- tę samą antropomorficzną Osę;
- masywną, muskularną sylwetkę;
- te same proporcje głowy, torsu, ramion, talii i nóg;
- dokładnie dwie ręce, dwie nogi, dwa czułki i dwa skrzydła;
- spójny żółto-czarny pancerz;
- stały język oczu i mimiki;
- stałą geometrię skrzydeł;
- brak losowej zmiany gatunku, stroju, materiału lub stylu;
- brak dodatkowych kończyn i mutacji anatomicznych;
- brak driftu Osa → pszczoła → człowiek → robot.

Pełny kontrakt: `skills/directing-osa-videos/references/osa-character-bible.md`.

## Workflow

1. Użytkownik podaje temat lub materiał źródłowy.
2. Skill zbiera wymagane ustawienia.
3. Powstaje **Phase A**: propozycja reżyserska i storyboard sześciu scen.
4. Skill zatrzymuje się na **approval gate**.
5. Po zatwierdzeniu powstaje **Phase B**: sześć samodzielnych promptów produkcyjnych.
6. Każdy prompt powtarza krytyczne locki postaci, stylu, kamery, audio i continuity.
7. Klipy są generowane niezależnie i składane przez match cut / motion match / audio bridge.

## Struktura

```text
skills/
└── directing-osa-videos/
    ├── SKILL.md
    └── references/
        ├── osa-character-bible.md
        ├── storyboard-template.md
        ├── video-prompt-contract.md
        ├── osa-motion-language.md
        └── examples.md
```

## Wywołanie

```text
$directing-osa-videos

Zrób 60-sekundową rolkę:
"Osa znajduje bounty za 10 000 USD i odpala RuntimeV2."

format: 9:16
styl: OSA Cyberpunk Dark
```

## Zasady v0

- Planowanie i komunikacja z operatorem: **po polsku**.
- Prompty do generatora wideo: domyślnie **po angielsku**, chyba że operator nakaże inaczej.
- Brak finalnych promptów przed zatwierdzeniem Phase A.
- Nie wolno dodawać nieudokumentowanych faktów, wyników, kwot ani claimów.
- Każdy klip ma trzy beaty: `0–3s`, `3–7s`, `7–10s`.
- Każdy klip musi wnosić czytelną zmianę wizualną co około 2–3 sekundy.
- OSA pozostaje tym samym bohaterem przez cały film.
- Referencyjny obraz Osy, jeśli dostępny, ma pierwszeństwo nad opisem tekstowym.

## Status

**v0 — character/system bootstrap.**

Następne etapy mogą dodać adaptery pod konkretne generatory wideo, referencyjne obrazy Osy, testy kontraktów promptów i automatyczny stitching.
