
# Plan: Python + Alpha Vantage + SQLite + Node/React Trading App

You asked to lock in the plan *exactly as outlined*, with points 1 to 5 and the code examples. This file captures that plan in markdown so you can keep and reuse it.

---

## 1. What Alpha Vantage gives you (in Python)

With the `alpha_vantage` library students can, in Jupyter:

```python
from alpha_vantage.timeseries import TimeSeries

ts = TimeSeries(key="YOUR_API_KEY", output_format="pandas")
data, meta = ts.get_daily(symbol="AAPL", outputsize="compact")  # ~100 days
```

They immediately get **real historical prices** for AAPL as a pandas DataFrame.

From there they can:

- compute moving averages  
- see max/min price  
- see how volatile the stock is  
- maybe label it “rustig / gemiddeld / wild”

All with *real* data, not a static CSV.

---

## 2. How Python + Alpha Vantage can “feed” your webapp

Here’s a simple, concrete architecture that keeps things understandable:

### Shared SQLite schema

You define one schema that both **Python and Node** use, e.g.:

```sql
-- student research + trading DB
CREATE TABLE symbols (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT
);

CREATE TABLE prices (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  date TEXT NOT NULL,
  close REAL NOT NULL
);

CREATE TABLE analysis (
  id INTEGER PRIMARY KEY,
  symbol TEXT NOT NULL,
  avg_close REAL,
  max_close REAL,
  min_close REAL,
  volatility_label TEXT,
  my_plan TEXT
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT,
  hash TEXT,
  cash REAL
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  shares INTEGER NOT NULL,
  price REAL NOT NULL,
  timestamp TEXT NOT NULL
);
```

- **Python** writes to: `prices` + `analysis`  
- **Node webapp** writes to: `users` + `transactions`  
- **Both** can read from all tables

So the *same* database supports:

> research (Python) **and** trading (web app).

---

## 3. Student flow: analyze first → then trade

### Step A – Jupyter + Python + Alpha Vantage

In your envisioned Python assignment, students:

1. Pick 1–3 symbols they’re curious about (AAPL, TSLA, etc.).
2. Use `alpha_vantage` to fetch real daily data:

   ```python
   from alpha_vantage.timeseries import TimeSeries
   import sqlite3, numpy as np

   ts = TimeSeries(key="YOUR_KEY", output_format="pandas")
   df, meta = ts.get_daily("AAPL", outputsize="compact")  # real data
   close = df["4. close"]
   avg_close = close.mean()
   max_close = close.max()
   min_close = close.min()
   volatility = close.std()
   ```

3. Label volatility:

   ```python
   if volatility < 1:
       label = "rustig"
   elif volatility < 5:
       label = "gemiddeld"
   else:
       label = "wild"
   ```

4. Write this into **their SQLite DB**:

   ```python
   import sqlite3

   conn = sqlite3.connect("student_17.db")
   cur = conn.cursor()

   # store prices
   for date, price in close.items():
       cur.execute(
           "INSERT INTO prices (symbol, date, close) VALUES (?, ?, ?)",
           ("AAPL", date, float(price))
       )

   # store summary / plan
   my_plan = "Ik koop alleen AAPL als de prijs in de buurt van het gemiddelde ligt."
   cur.execute(
       """
       INSERT INTO analysis (symbol, avg_close, max_close, min_close, volatility_label, my_plan)
       VALUES (?, ?, ?, ?, ?, ?)
       """,
       ("AAPL", float(avg_close), float(max_close), float(min_close), label, my_plan)
   )

   conn.commit()
   conn.close()
   ```

Now the **database contains**:

- raw real prices (`prices`)  
- their own analysis + plan (`analysis`)

This matches your goal: *learn with real live data / data analyse / data opslaan*, using Alpha Vantage.

---

### Step B – Webapp (Node + React) uses that analysis when trading

Your **Node+React app** (for your challenge) then does:

- `GET /api/analysis` → reads from `analysis`
- `GET /api/prices/:symbol` → maybe reads sample rows from `prices`
- `POST /api/buy`, `POST /api/sell`, etc. → work with `transactions` & `users`

On the **trading page** in React, you can show:

- The live quote (Node calls Alpha Vantage REST for current price if you want)
- AND the student’s own research from `analysis`, e.g.:

> Gemiddelde prijs: €150  
> Hoogste prijs in dataset: €178  
> Volatiliteit: “gemiddeld”  
> Mijn plan: “Ik koop alleen als…”  

So the UI literally says:

> “Here is what *you* found in Python.  
> Now, based on that, do you buy or not?”

That’s **analysis → decision**, clearly connected.

---

## 4. What this gives you (educationally)

- Real live market data via Alpha Vantage  
- Computational thinking in Python:
  - calling an API  
  - transforming data with pandas  
  - designing a small classification (“rustig/gemiddeld/wild”)  
  - writing to a database  

- Computational thinking in the webapp:
  - how portfolio & history work  
  - how data models actions  
  - how their earlier analysis should influence decisions  

And crucially:

> **Python and the webapp actually meet through the same SQLite database and the `analysis` table.**

It’s not an abstract connection — it’s *literally the same data*.

An existing online trading site can’t show:

- the student’s custom `analysis` table  
- their own “my_plan” text computed/saved from a Python notebook  
- your simple portfolio/history logic based on that schema  

Your system is **built for learning**, not for “good trading”.

---

## 5. How hard is this to implement?

### For students (Python side)

Python side = Jupyter notebook with:

- a few Alpha Vantage calls
- some `df.mean() / df.std() / df.max()` etc.
- writing a few rows into SQLite

Challenging, but absolutely doable for a “higher class” with some Python foundation.

### For you (Node + React challenge)

Web app = normal CS50-Finance-style clone:

- login  
- quote  
- buy  
- sell  
- portfolio  
- history  

Plus an extra part:

- one or two endpoints to read from `analysis` / `prices`  
- one React component to show that analysis/plan next to trading UI

No `child_process`, no running Python from Node needed (unless you want to, later, as a bonus).

---

You can now use this file as your “locked” plan for the project.
