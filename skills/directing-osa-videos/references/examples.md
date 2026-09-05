# Przykłady v0

Przykłady pokazują strukturę, nie są źródłem faktów. Konkretne kwoty, wyniki i nazwy mogą być użyte tylko wtedy, gdy operator poda je jako materiał źródłowy.

---

## Przykład 1 — OSA znajduje bounty

### INPUT

```text
Temat: Osa znajduje bounty za 10 000 USD i odpala RuntimeV2.
Format: 9:16
Styl: OSA Cyberpunk Dark
Język VO: polski
Referencyjny obraz Osy: dostępny
```

### Phase A — skrót

**Hook:** czerwony alert przecina ciemny ekran, a oczy Osy natychmiast kierują się na źródło sygnału.

**Arc:**

1. alert;
2. szybka kwalifikacja;
3. wejście w problem;
4. debug jako fizyczna walka z błędem;
5. test/proof;
6. payoff i callback do alertu.

### Continuity example

Scena 1 kończy się czerwonym holograficznym panelem przesuwającym się w stronę kamery.

Scena 2 zaczyna się od tego samego panelu wypełniającego kadr; kamera przechodzi przez niego i odsłania Osę w analysis mode.

---

## Przykład 2 — OSA Audit

### INPUT

```text
Temat: audyt strony firmy i pokazanie trzech najważniejszych problemów.
Format: 9:16
Styl: premium dark tech
Język VO: polski
Referencyjny obraz Osy: brak
```

### Pattern

```text
wejście na stronę
→ skan
→ evidence
→ konsekwencja
→ rekomendacja
→ CTA
```

Metafora: strona firmy staje się trójwymiarową strukturą, a OSA podświetla trzy pęknięcia. Każde pęknięcie odpowiada dokładnie jednemu udokumentowanemu problemowi.

Nie wolno dodawać czwartego problemu tylko dlatego, że wygląda atrakcyjnie wizualnie.

---

## Przykład 3 — RuntimeV2

### INPUT

```text
Temat: pokaż, jak akcja przechodzi przez runtime i kończy się Verified Evidence.
Format: 16:9
Styl: cinematic cyberpunk systems
Język VO: polski
Referencyjny obraz Osy: dostępny
```

### Visual grammar

- OSA jako operator/przewodnik;
- request jako fizyczny pakiet energii;
- kolejne bramy symbolizują etapy runtime;
- evidence jako finalny, stabilny artifact;
- kamera porusza się w jednym kierunku przez cały pipeline;
- ostatnia scena wraca do szerokiego hero shotu Osy obok potwierdzonego wyniku.

---

## Mini-template Phase B

```text
PROMPT X

OUTPUT
Około 10 sekund, [FORMAT], płynny ruch, zsynchronizowane audio jeśli obsługiwane.

STYLE
[ZATWIERDZONY STYL]

OSA CHARACTER LOCK
Ta sama kanoniczna antropomorficzna OSA: potężnie umięśniona, bardzo szerokie barki, mocny tors i ramiona, wąska talia, atletyczne nogi, owadzia głowa z dokładnie dwoma oczami i dwoma czułkami, dokładnie dwie ręce, dwie nogi i dwa półprzezroczyste skrzydła, spójny żółto-czarny organiczny pancerz, identyczne proporcje i identyczny design jak w pozostałych klipach.

FIRST FRAME
[STAN ODZIEDZICZONY]

0–3s
[BEAT 1]

3–7s
[BEAT 2]

7–10s
[BEAT 3]

VOICEOVER
"[DOKŁADNIE ZATWIERDZONE VO]"

FINAL FRAME
[STAN DO MATCH CUTU]

NEGATIVE
Bez dodatkowych kończyn, dodatkowych skrzydeł, redesignu twarzy, species driftu, humanizacji, pełnej robotyzacji, losowych ubrań, losowych logo, deformacji anatomii, duplicate OSA, captionów i watermarków.
```

---

## Przykład approval gate

Po Phase A:

```text
STATUS: AWAITING STORYBOARD APPROVAL

Możesz:
1. ZATWIERDZAM STORYBOARD
2. POPRAW SCENĘ 3: ...
3. ZMIEŃ GLOBALNIE: format / styl / VO / palette
```

Phase B nie powstaje przed punktem 1.
