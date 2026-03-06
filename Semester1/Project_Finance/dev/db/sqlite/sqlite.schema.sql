PRAGMA foreign_keys = ON;

------------------------------------------------------------
-- USERS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    hash TEXT NOT NULL,
    cash REAL NOT NULL DEFAULT 10000,
    twelvedata_key TEXT
);

------------------------------------------------------------
-- SYMBOLS (cache symbol + metadata)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symbols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,              -- e.g. 'AAPL'
    name TEXT,                                -- e.g. 'Apple Inc.'
    region TEXT,                              -- e.g. 'United States' (or 'US')
    exchange TEXT,                            -- e.g. 'NASDAQ'
    currency TEXT,                            -- e.g. 'USD'

    -- Active means: we still track it and update daily_prices
    is_active INTEGER NOT NULL DEFAULT 1,     -- 1 = tracked, 0 = inactive

    -- Cursor for incremental daily_prices updates (last candle date stored)
    prices_updated_through DATE,              -- e.g. '2026-01-08'

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_symbols_active
ON symbols (is_active);

CREATE INDEX IF NOT EXISTS idx_symbols_prices_updated
ON symbols (prices_updated_through);

------------------------------------------------------------
-- TRANSACTIONS (portfolio history)
-- shares > 0 => BUY
-- shares < 0 => SELL
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol_id INTEGER NOT NULL,
    shares INTEGER NOT NULL,
    price REAL NOT NULL,                      -- price per share at trade time
    transacted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_symbol
ON transactions (user_id, symbol_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_time
ON transactions (user_id, transacted_at DESC);

------------------------------------------------------------
-- QUOTES (optional cache of snapshot lookups)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol_id INTEGER NOT NULL,

    price REAL NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source TEXT NOT NULL DEFAULT 'TWELVEDATA_QUOTE',

    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quotes_symbol_time
ON quotes (symbol_id, received_at DESC);

------------------------------------------------------------
-- DAILY PRICES (OHLC history, used for chart + analysis)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_prices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol_id INTEGER NOT NULL,
    date DATE NOT NULL,                       -- candle day (exchange day)

    open REAL,
    high REAL,
    low REAL,
    close REAL,
    volume INTEGER,

    source TEXT NOT NULL DEFAULT 'TWELVEDATA_TIME_SERIES_1DAY',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,

    UNIQUE (symbol_id, date),
    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_daily_prices_symbol_date
ON daily_prices (symbol_id, date DESC);

-- Keep updated_at correct automatically on update
CREATE TRIGGER IF NOT EXISTS trg_daily_prices_updated_at
AFTER UPDATE ON daily_prices
FOR EACH ROW
BEGIN
  UPDATE daily_prices
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

------------------------------------------------------------
-- WATCHLIST (symbols a user follows/researches)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, symbol_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user
ON watchlist (user_id);

------------------------------------------------------------
-- ANALYSIS (student's stored analysis/plan)
-- NOTE: Calculations are NOT stored here. They are computed dynamically from daily_prices.
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol_id INTEGER NOT NULL,

    plan_text TEXT NOT NULL DEFAULT '',
    buy_below REAL,
    sell_above REAL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, symbol_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (symbol_id) REFERENCES symbols(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analysis_user_symbol
ON analysis (user_id, symbol_id);

-- Keep updated_at correct automatically on update
CREATE TRIGGER IF NOT EXISTS trg_analysis_updated_at
AFTER UPDATE ON analysis
FOR EACH ROW
BEGIN
  UPDATE analysis
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
