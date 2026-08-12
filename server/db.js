import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, "data.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    mobile TEXT,
    country TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    verification_code TEXT,
    verification_code_expires TEXT,
    created_at TEXT NOT NULL
  )
`);

// Add columns for databases created before these fields existed.
for (const stmt of [
  "ALTER TABLE users ADD COLUMN mobile TEXT",
  "ALTER TABLE users ADD COLUMN country TEXT",
  "ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN verification_code TEXT",
  "ALTER TABLE users ADD COLUMN verification_code_expires TEXT",
  "ALTER TABLE users ADD COLUMN avatar_url TEXT",
]) {
  try {
    db.exec(stmt);
  } catch {
    // column already exists
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    author TEXT NOT NULL,
    handle TEXT NOT NULL,
    text TEXT,
    media_type TEXT,
    media_url TEXT,
    kind TEXT NOT NULL DEFAULT 'user',
    up INTEGER NOT NULL DEFAULT 1,
    likes INTEGER NOT NULL DEFAULT 0,
    dislikes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    handle TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS post_votes (
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    PRIMARY KEY (post_id, user_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL,
    UNIQUE(requester_id, recipient_id)
  )
`);

// Seed the original fixture posts once, so the feed still opens with content.
const postCount = db.prepare("SELECT COUNT(*) AS n FROM posts").get().n;
if (postCount === 0) {
  const now = Date.now();
  const iso = (msAgo) => new Date(now - msAgo).toISOString();

  const insertPost = db.prepare(
    `INSERT INTO posts (user_id, author, handle, text, kind, up, likes, dislikes, created_at)
     VALUES (NULL, ?, ?, ?, ?, 1, ?, ?, ?)`
  );
  const insertComment = db.prepare(
    `INSERT INTO comments (post_id, author, handle, text, created_at) VALUES (?, ?, ?, ?, ?)`
  );

  const p1 = insertPost.run(
    "Maya R.",
    "@mayafx",
    "EURUSD holding above the 1.0820 shelf — watching for a break above 1.0850 before adding.",
    "user",
    18,
    1,
    iso(12 * 60 * 1000)
  );
  for (const c of [
    { author: "Theo K.", handle: "@theotrades", text: "Same read here, shelf has held twice already." },
    { author: "Priya N.", handle: "@priyafx", text: "Watching 1.0850 too, tight stop under the shelf." },
    { author: "Market Copilot", handle: "@ai-desk", text: "Volume profile agrees — thin supply just above 1.0850." },
    { author: "Dax", handle: "@daxpips", text: "Careful, NFP tomorrow could blow through both levels." },
  ]) {
    insertComment.run(p1.lastInsertRowid, c.author, c.handle, c.text, iso(10 * 60 * 1000));
  }

  const p2 = insertPost.run(
    "Market Copilot",
    "@ai-desk",
    "Gold up 0.5% on softer yields overnight. Momentum indicators are mixed heading into the US session — no strong directional edge yet.",
    "ai",
    9,
    0,
    iso(38 * 60 * 1000)
  );
  insertComment.run(p2.lastInsertRowid, "Maya R.", "@mayafx", "Mixed is right, sitting on hands for now.", iso(30 * 60 * 1000));

  insertPost.run(
    "Auto-Trader",
    "@your-bot",
    "Filled BUY 1.0 lots US30 @ 39,720. Closed @ 39,812 for +92.00.",
    "trade",
    5,
    0,
    iso(60 * 60 * 1000)
  );
}

export default db;
