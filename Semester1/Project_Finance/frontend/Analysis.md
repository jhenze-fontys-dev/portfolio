# Analyse-berekeningen bij aandelen
*Documentatie voor leerlingen en docenten*

De app **rekent**.  
De leerling **interpreteert en verantwoordt**.

Deze berekeningen zijn bewust eenvoudig, uitlegbaar en realistisch.
Ze sluiten aan bij hoe echte beleggingswebsites werken, zonder automatische adviezen.

---

## Overzicht

### Basis
- Gemiddelde slotkoers
- Hoogste prijs
- Laagste prijs
- Bandbreedte
- Gemiddelde dagelijkse beweging

### Uitbreiding
- Prijsverandering over periode
- Afstand t.o.v. gemiddelde
- Bandbreedte t.o.v. gemiddelde
- Aantal stijgende dagen
- Percentage stijgende dagen
- Grootste daling vanaf top
- Simple Moving Average


## 1. Gemiddelde slotkoers (`meanClose`)

### Wat wordt berekend?
De gemiddelde slotkoers over een periode (bijvoorbeeld 30 dagen).

### Waarom bij beleggen?
Laat zien of de huidige prijs relatief hoog of laag is ten opzichte van het verleden.

### Wiskundig (hoog niveau)
\[
\bar{C} = \frac{1}{N} \sum_{i=1}^{N} C_i
\]

### Wiskunde (middelbare school)
Tel alle slotkoersen bij elkaar op en deel door het aantal dagen.

### Economisch
Veel beleggers vergelijken de huidige prijs met het gemiddelde.

### Python (pandas)
    df["close"].mean()

---

## 2. Hoogste prijs (`periodHigh`)

### Wat?
De hoogste koers (high) in de periode.

### Waarom?
Geeft mogelijke weerstandsniveaus aan.

### Wiskundig
\[
\max(H_1, H_2, \dots, H_N)
\]

### Python
    df["high"].max()

---

## 3. Laagste prijs (`periodLow`)

### Wat?
De laagste koers (low) in de periode.

### Waarom?
Geeft mogelijke steun aan.

### Wiskundig
\[
\min(L_1, L_2, \dots, L_N)
\]

### Python
    df["low"].min()



## 1. Gemiddelde slotkoers (`meanClose`)

### Wat wordt berekend?
De gemiddelde slotkoers over een periode (bijvoorbeeld 30 dagen).

### Waarom bij beleggen?
Laat zien of de huidige prijs relatief hoog of laag is ten opzichte van het verleden.

### Wiskundig (hoog niveau)
\[
\bar{C} = \frac{1}{N} \sum_{i=1}^{N} C_i
\]

### Wiskunde (middelbare school)
Tel alle slotkoersen bij elkaar op en deel door het aantal dagen.

### Economisch
Veel beleggers vergelijken de huidige prijs met het gemiddelde.

### Python (pandas)
    df["close"].mean()

---

## 2. Hoogste prijs (`periodHigh`)

### Wat?
De hoogste koers (high) in de periode.

### Waarom?
Geeft mogelijke weerstandsniveaus aan.

### Wiskundig
\[
\max(H_1, H_2, \dots, H_N)
\]

### Python
    df["high"].max()

---

## 3. Laagste prijs (`periodLow`)

### Wat?
De laagste koers (low) in de periode.

### Waarom?
Geeft mogelijke steun aan.

### Wiskundig
\[
\min(L_1, L_2, \dots, L_N)
\]

### Python
    df["low"].min()



## 6. Prijsverandering over periode (`priceChange`)

### Wat wordt berekend?
Hoeveel procent de prijs is gestegen of gedaald tussen begin en eind.

### Waarom bij beleggen?
Dit is wat veel websites tonen als “performance”.

### Wiskundig
\[
\frac{C_{laatst} - C_{eerste}}{C_{eerste}} \times 100
\]

### Python
    (df["close"].iloc[-1] - df["close"].iloc[0]) / df["close"].iloc[0] * 100

---

## 7. Afstand t.o.v. gemiddelde (`distanceAverage`)

### Wat?
Hoe ver de laatste prijs boven of onder het gemiddelde ligt.

### Waarom?
Helpt redeneren over “relatief duur of goedkoop”.

### Wiskundig
\[
\frac{C_{laatst} - \bar{C}}{\bar{C}} \times 100
\]

### Python
    (df["close"].iloc[-1] - df["close"].mean()) / df["close"].mean() * 100

---

## 8. Bandbreedte t.o.v. gemiddelde (`rangeAverage`)

### Wat?
Bandbreedte als percentage van het gemiddelde.

### Waarom?
Maakt aandelen met verschillende prijzen vergelijkbaar.

### Python
    (df["high"].max() - df["low"].min()) / df["close"].mean() * 100



## 9. Aantal stijgende dagen (`risingDaysCount`)

### Wat?
Aantal dagen dat de slotkoers hoger is dan de dag ervoor.

### Waarom?
Geeft een eenvoudig beeld van richting.

### Python
    (df["close"].diff() > 0).sum()

---

## 10. Percentage stijgende dagen (`risingDaysRatio`)

### Wat?
Percentage dagen met een stijging.

### Waarom?
Maakt periodes vergelijkbaar.

### Python
    (df["close"].diff() > 0).mean() * 100

---

## 11. Grootste daling vanaf top (`maxPeakDrop`)

### Wat?
De grootste daling vanaf een eerdere top (in procenten).

### Waarom?
Een realistische risicomaat die veel platforms tonen.

### Wiskundig
\[
DD_i = \frac{C_i - \max(C_1,\dots,C_i)}{\max(C_1,\dots,C_i)} \times 100
\]

### Python
    peak = df["close"].cummax()
    dd = (df["close"] - peak) / peak * 100
    dd.min()

---

## 12. Simple Moving Average (`sma`)

### Wat?
Gemiddelde van de laatste p slotkoersen.

### Waarom?
Wordt veel gebruikt op grafieken om trends te bespreken.

### Python
    df["close"].rolling(window=p).mean().iloc[-1]
