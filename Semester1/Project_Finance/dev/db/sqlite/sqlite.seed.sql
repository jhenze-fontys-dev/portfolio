PRAGMA foreign_keys = ON;

-- Clean start
DELETE FROM analysis;
DELETE FROM watchlist;
DELETE FROM daily_prices;
DELETE FROM quotes;
DELETE FROM transactions;
DELETE FROM symbols;
DELETE FROM users;

-- Minimal required: 1 user
-- Login:
--   username: demo
--   password: test123
INSERT INTO users (id, username, hash, cash)
VALUES (
  1,
  'demo',
  '$2b$10$TKUZL23CIizuxWjOokRmbO0jmDo.LAVtieoLaLQzlxsEdw2KWHEOu',
  10000
);
