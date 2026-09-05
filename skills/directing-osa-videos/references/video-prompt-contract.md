# Phase B — Video Production Prompt Contract

Używaj wyłącznie po zatwierdzeniu aktualnej Phase A.

## Pakiet produkcyjny

Wygeneruj kolejno:

1. Global Continuity Block
2. Prompt 1
3. Prompt 2
4. Prompt 3
5. Prompt 4
6. Prompt 5
7. Prompt 6
8. Stitching Guide
9. Audio Continuity Note
10. Post-Production Overlay List

## Global Continuity Block

Podsumuj:

- format;
- długość pojedynczego klipu;
- styl;
- OSA Character Lock;
- status obrazu referencyjnego;
- paletę;
- narrator lock;
- język VO;
- audio arc;
- zasady continuity;
- negative constraints.

Globalny blok jest podsumowaniem. Nie zastępuje locków wewnątrz samodzielnych promptów.

## Kolejność każdego promptu

Każdy prompt zawiera kolejno:

1. **OUTPUT**
2. **STYLE**
3. **OSA CHARACTER LOCK**
4. **REFERENCE IMAGE RULE**
5. **PALETTE**
6. **COMPOSITION**
7. **FIRST FRAME**
8. **0–3s**
9. **3–7s**
10. **7–10s**
11. **VOICEOVER**
12. **NARRATOR LOCK**
13. **BGM / SFX**
14. **FINAL FRAME**
15. **CONTINUITY HANDOFF**
16. **NEGATIVE CONSTRAINTS**

## OUTPUT

Podaj:

- około 10 sekund;
- wybrany aspect ratio;
- target rozdzielczości zgodny z narzędziem;
- płynny ruch;
- zsynchronizowany dźwięk, jeżeli model go obsługuje.

Nie wymyślaj parametrów technicznych, których użytkownik lub wybrany generator nie określił.

## STYLE

Opisz środowisko i język wizualny.

Preferowany bazowy preset OSA może używać:

- premium cyberpunk;
- ultra-dark;
- mocny kontrast;
- cinematic rim light;
- energia systemów AI;
- czytelna sylwetka;
- kontrolowane particles;
- dynamiczne motion graphics.

Preset nie może nadpisywać zatwierdzonego kierunku artystycznego.

## OSA CHARACTER LOCK

Wklej jawny lock z Character Bible i doprecyzuj cechy widoczne w danym ujęciu.

Zawsze zaznacz:

- ta sama OSA;
- identyczne proporcje;
- 2 ręce;
- 2 nogi;
- 2 czułki;
- 2 skrzydła;
- identyczna geometria głowy;
- identyczny wzór pancerza;
- brak character redesign.

## REFERENCE IMAGE RULE

Jeśli obraz referencyjny istnieje:

> Użyj dostarczonego referencyjnego obrazu Osy jako nadrzędnego źródła prawdy dla wyglądu postaci. Zachowaj tożsamość, proporcje, głowę, oczy, czułki, skrzydła, pancerz i sylwetkę. Nie reinterpretuj designu.

Jeśli brak obrazu:

> Zachowaj character identity wyłącznie przez pełny tekstowy Character Lock i dokładnie powtarzaj go w każdym klipie.

## PALETTE

Nazwy kolorów opisowo, bez technicznego kodowania, jeśli nie jest ono potrzebne downstream.

Kolor musi pełnić funkcję: zagrożenie, analiza, energia, sukces, warning itd.

## TIMED BEATS

Każdy beat musi określać:

- akcję Osy;
- zmianę środowiska;
- ruch kamery;
- minimum jeden element secondary motion;
- relację z VO;
- punkt wyjścia do kolejnego beatu.

Nie używaj ogólnego „dynamiczna scena”. Opisz faktyczną choreografię.

## VOICEOVER

Wklej zatwierdzone VO dokładnie, bez parafrazy.

Jeżeli VO ma być audio-only, napisz to jawnie.

Nie dodawaj drugiej wersji zdania.

## NARRATOR LOCK

Powtarzaj identyczny opis narratora w sześciu promptach.

Emocja może ewoluować, ale:

- tożsamość głosu;
- akcent;
- barwa;
- wiek;
- podstawowe tempo

pozostają stałe, chyba że storyboard jawnie przewiduje zmianę narratora.

## AUDIO

Narracja ma pierwszeństwo nad BGM.

Synchronizuj SFX do widocznych wydarzeń:

- impact;
- wing burst;
- UI pulse;
- code collapse;
- spark;
- landing;
- whoosh;
- alarm;
- match cut;
- energy release.

## FINAL FRAME

Opisz klatkę jak asset do match cutu:

- pozycja Osy;
- orientacja ciała;
- kierunek ruchu;
- położenie kamery;
- dominujący obiekt;
- kolor dominujący;
- stan skrzydeł;
- stan światła.

## NEGATIVE CONSTRAINTS

Każdy prompt zabrania minimum:

- extra limbs;
- missing limbs;
- extra wings;
- face redesign;
- species drift;
- humanization;
- bee-like redesign;
- full robot conversion;
- random clothing;
- random logos;
- anatomy mutation;
- proportion drift;
- armor-pattern drift;
- palette drift;
- unintended duplicate OSA;
- malformed hands;
- fused limbs;
- disconnected wings;
- unrelated characters;
- unsupported claims;
- unwanted captions, subtitles, logos or watermarks.

## Stitching Guide

Dla cięć 1→2, 2→3, 3→4, 4→5 i 5→6 podaj:

- stan końcowy;
- stan początkowy;
- rodzaj cięcia;
- ewentualny trim;
- audio bridge;
- motion match.

## Audio Continuity

Przy niezależnych generacjach rekomenduj:

1. tę samą referencję głosu, jeśli generator ją obsługuje;
2. identyczny narrator lock w każdym promptcie;
3. przy wysokim wymaganiu spójności: jeden zewnętrzny VO i jeden ciągły BGM na etapie składania.

## Phase B Check

- aktualna Phase A zatwierdzona;
- dokładnie 6 promptów;
- każdy prompt samodzielny;
- każdy zawiera pełny OSA lock;
- każdy zawiera 3 beaty;
- VO identyczne jak zatwierdzone;
- final frame każdego klipu pasuje do first frame kolejnego;
- żadna scena nie łamie liczby kończyn lub skrzydeł;
- reference image rule jest jawny;
- brak dodanych faktów;
- brak przypadkowej typografii.
