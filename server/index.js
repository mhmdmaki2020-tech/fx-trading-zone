import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import multer from "multer";
import db from "./db.js";
import { sendVerificationEmail } from "./mailer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, "uploads");
mkdirSync(uploadsDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(0, 10);
      cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

const app = express();
// Only trust the platform-injected PORT in production. In local dev, the harness that
// starts Vite also sets a PORT env var for Vite's benefit — reading it here would make
// this server collide with Vite on the same port.
const PORT = process.env.NODE_ENV === "production" ? process.env.PORT || 4000 : 4000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-before-deploying";
const COOKIE_NAME = "session";

// Site-wide privacy gate: only active once SITE_USER/SITE_PASSWORD are set (e.g. on a public deployment).
function siteGate(req, res, next) {
  const siteUser = process.env.SITE_USER;
  const sitePassword = process.env.SITE_PASSWORD;
  if (!siteUser || !sitePassword) return next();
  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");
  if (scheme === "Basic" && encoded) {
    const [u, p] = Buffer.from(encoded, "base64").toString("utf8").split(":");
    if (u === siteUser && p === sitePassword) return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="FX Trading Zone"');
  res.status(401).send("Authentication required.");
}

app.use(siteGate);
app.use(express.json());
app.use(cookieParser());

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    mobile: row.mobile,
    country: row.country,
    emailVerified: !!row.email_verified,
    avatarUrl: row.avatar_url || null,
    createdAt: row.created_at,
  };
}

function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getSessionUser(req) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(payload.sub) || null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  req.user = user;
  next();
}

function publicPost(row, viewerId) {
  const comments = db
    .prepare("SELECT author, handle, text FROM comments WHERE post_id = ? ORDER BY id ASC")
    .all(row.id);
  const vote = viewerId
    ? db.prepare("SELECT type FROM post_votes WHERE post_id = ? AND user_id = ?").get(row.id, viewerId)
    : null;
  return {
    id: row.id,
    author: row.author,
    handle: row.handle,
    text: row.text,
    media: row.media_url ? { type: row.media_type, url: row.media_url } : null,
    kind: row.kind,
    up: !!row.up,
    likes: row.likes,
    dislikes: row.dislikes,
    userVote: vote?.type ?? null,
    commentsList: comments,
    createdAt: row.created_at,
  };
}

app.post("/api/auth/signup", async (req, res) => {
  const { email, username, password, mobile, country } = req.body || {};
  if (!email || !username || !password || !mobile || !country) {
    return res.status(400).json({ error: "Email, username, password, mobile number, and country are required." });
  }
  if (!/(?=.*[A-Za-z])(?=.*\d).{8,}/.test(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters and include both letters and numbers." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ? OR username = ?").get(normalizedEmail, username);
  if (existing) {
    return res.status(409).json({ error: "Email or username is already taken." });
  }

  const hash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();
  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  // No email provider configured yet — skip verification instead of blocking signup.
  // Remove this bypass once RESEND_API_KEY is set (real codes will be required again).
  if (!process.env.RESEND_API_KEY) {
    const info = db
      .prepare(
        `INSERT INTO users (email, username, password_hash, mobile, country, created_at, email_verified, verification_code, verification_code_expires)
         VALUES (?, ?, ?, ?, ?, ?, 1, NULL, NULL)`
      )
      .run(normalizedEmail, username, hash, mobile, country, createdAt);
    setSessionCookie(res, info.lastInsertRowid);
    return res.json({
      user: publicUser({ id: info.lastInsertRowid, email: normalizedEmail, username, mobile, country, email_verified: 1, created_at: createdAt }),
    });
  }

  const info = db
    .prepare(
      `INSERT INTO users (email, username, password_hash, mobile, country, created_at, email_verified, verification_code, verification_code_expires)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
    )
    .run(normalizedEmail, username, hash, mobile, country, createdAt, code, expires);

  try {
    await sendVerificationEmail(normalizedEmail, code);
  } catch (e) {
    db.prepare("DELETE FROM users WHERE id = ?").run(info.lastInsertRowid);
    return res.status(502).json({ error: `Could not send verification email: ${e.message}` });
  }

  res.json({ pendingVerification: true, email: normalizedEmail });
});

app.post("/api/auth/verify-email", (req, res) => {
  const { email, code } = req.body || {};
  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  if (!user) return res.status(404).json({ error: "No account found for that email." });
  if (user.email_verified) return res.status(400).json({ error: "Email is already verified." });
  if (!user.verification_code || user.verification_code !== code) {
    return res.status(400).json({ error: "Incorrect verification code." });
  }
  if (!user.verification_code_expires || new Date(user.verification_code_expires) < new Date()) {
    return res.status(400).json({ error: "Code expired. Request a new one." });
  }

  db.prepare("UPDATE users SET email_verified = 1, verification_code = NULL, verification_code_expires = NULL WHERE id = ?").run(
    user.id
  );
  setSessionCookie(res, user.id);
  res.json({ user: publicUser({ ...user, email_verified: 1 }) });
});

app.post("/api/auth/resend-code", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email is required." });
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  if (!user) return res.status(404).json({ error: "No account found for that email." });
  if (user.email_verified) return res.status(400).json({ error: "Email is already verified." });

  const code = generateCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  db.prepare("UPDATE users SET verification_code = ?, verification_code_expires = ? WHERE id = ?").run(code, expires, user.id);

  try {
    await sendVerificationEmail(normalizedEmail, code);
  } catch (e) {
    return res.status(502).json({ error: `Could not send verification email: ${e.message}` });
  }
  res.json({ ok: true });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(normalizedEmail);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }
  if (!user.email_verified) {
    return res.status(403).json({ error: "Please verify your email first.", pendingVerification: true, email: user.email });
  }
  setSessionCookie(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Not signed in." });
  res.json({ user: publicUser(user) });
});

app.post("/api/profile/avatar", requireAuth, upload.single("avatar"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded." });
  const avatarUrl = `/uploads/${req.file.filename}`;
  db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(avatarUrl, req.user.id);
  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json({ user: publicUser(updated) });
});

app.get("/api/posts", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
  res.json({ posts: rows.map((r) => publicPost(r, req.user.id)) });
});

app.post("/api/posts", requireAuth, (req, res) => {
  const { text, media } = req.body || {};
  if (!text?.trim() && !media) {
    return res.status(400).json({ error: "A post needs text or media." });
  }
  const createdAt = new Date().toISOString();
  const up = Math.random() > 0.4 ? 1 : 0;
  const info = db
    .prepare(
      `INSERT INTO posts (user_id, author, handle, text, media_type, media_url, kind, up, likes, dislikes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', ?, 0, 0, ?)`
    )
    .run(req.user.id, req.user.username, `@${req.user.username}`, text?.trim() || null, media?.type ?? null, media?.url ?? null, up, createdAt);
  const row = db.prepare("SELECT * FROM posts WHERE id = ?").get(info.lastInsertRowid);
  res.json({ post: publicPost(row, req.user.id) });
});

app.post("/api/posts/:id/vote", requireAuth, (req, res) => {
  const postId = Number(req.params.id);
  const { type } = req.body || {};
  if (type !== "like" && type !== "dislike") {
    return res.status(400).json({ error: "type must be 'like' or 'dislike'." });
  }
  const post = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
  if (!post) return res.status(404).json({ error: "Post not found." });

  const existing = db.prepare("SELECT type FROM post_votes WHERE post_id = ? AND user_id = ?").get(postId, req.user.id);
  const column = (t) => (t === "like" ? "likes" : "dislikes");

  if (existing?.type === type) {
    db.prepare("DELETE FROM post_votes WHERE post_id = ? AND user_id = ?").run(postId, req.user.id);
    db.prepare(`UPDATE posts SET ${column(type)} = ${column(type)} - 1 WHERE id = ?`).run(postId);
  } else {
    if (existing) {
      db.prepare(`UPDATE posts SET ${column(existing.type)} = ${column(existing.type)} - 1 WHERE id = ?`).run(postId);
      db.prepare("UPDATE post_votes SET type = ? WHERE post_id = ? AND user_id = ?").run(type, postId, req.user.id);
    } else {
      db.prepare("INSERT INTO post_votes (post_id, user_id, type) VALUES (?, ?, ?)").run(postId, req.user.id, type);
    }
    db.prepare(`UPDATE posts SET ${column(type)} = ${column(type)} + 1 WHERE id = ?`).run(postId);
  }

  const updated = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
  res.json({ post: publicPost(updated, req.user.id) });
});

app.post("/api/posts/:id/comments", requireAuth, (req, res) => {
  const postId = Number(req.params.id);
  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "Comment text is required." });
  const post = db.prepare("SELECT id FROM posts WHERE id = ?").get(postId);
  if (!post) return res.status(404).json({ error: "Post not found." });

  db.prepare("INSERT INTO comments (post_id, author, handle, text, created_at) VALUES (?, ?, ?, ?, ?)").run(
    postId,
    req.user.username,
    `@${req.user.username}`,
    text.trim(),
    new Date().toISOString()
  );
  const updated = db.prepare("SELECT * FROM posts WHERE id = ?").get(postId);
  res.json({ post: publicPost(updated, req.user.id) });
});

app.get("/api/users/search", requireAuth, (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) return res.json({ users: [] });
  const rows = db
    .prepare("SELECT id, username, country, created_at FROM users WHERE username LIKE ? AND id != ? ORDER BY username ASC LIMIT 20")
    .all(`%${q}%`, req.user.id);
  res.json({ users: rows.map((r) => ({ id: r.id, username: r.username, handle: `@${r.username}`, country: r.country, createdAt: r.created_at })) });
});

function publicFriendUser(row) {
  return { id: row.id, username: row.username, handle: `@${row.username}`, country: row.country, createdAt: row.created_at };
}

app.get("/api/friends", requireAuth, (req, res) => {
  const meId = req.user.id;
  const friends = db
    .prepare(
      `SELECT u.id, u.username, u.country, u.created_at
       FROM friendships f
       JOIN users u ON u.id = (CASE WHEN f.requester_id = ? THEN f.recipient_id ELSE f.requester_id END)
       WHERE f.status = 'accepted' AND (f.requester_id = ? OR f.recipient_id = ?)`
    )
    .all(meId, meId, meId);
  const incoming = db
    .prepare(
      `SELECT f.id AS friendship_id, u.id, u.username, u.country, u.created_at
       FROM friendships f JOIN users u ON u.id = f.requester_id
       WHERE f.status = 'pending' AND f.recipient_id = ?`
    )
    .all(meId);
  const outgoing = db
    .prepare(
      `SELECT f.id AS friendship_id, u.id, u.username, u.country, u.created_at
       FROM friendships f JOIN users u ON u.id = f.recipient_id
       WHERE f.status = 'pending' AND f.requester_id = ?`
    )
    .all(meId);

  res.json({
    friends: friends.map(publicFriendUser),
    incomingRequests: incoming.map((r) => ({ friendshipId: r.friendship_id, ...publicFriendUser(r) })),
    outgoingRequests: outgoing.map((r) => ({ friendshipId: r.friendship_id, ...publicFriendUser(r) })),
  });
});

app.post("/api/friends/request", requireAuth, (req, res) => {
  const { username } = req.body || {};
  if (!username) return res.status(400).json({ error: "Username is required." });
  const target = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!target) return res.status(404).json({ error: "No such user." });
  if (target.id === req.user.id) return res.status(400).json({ error: "You can't friend yourself." });

  const existing = db
    .prepare(
      `SELECT * FROM friendships WHERE (requester_id = ? AND recipient_id = ?) OR (requester_id = ? AND recipient_id = ?)`
    )
    .get(req.user.id, target.id, target.id, req.user.id);

  if (existing?.status === "accepted") return res.status(400).json({ error: "Already friends." });

  if (existing?.status === "pending" && existing.requester_id === target.id) {
    // They already asked us — accept immediately instead of creating a duplicate/contradictory row.
    db.prepare("UPDATE friendships SET status = 'accepted' WHERE id = ?").run(existing.id);
    return res.json({ status: "accepted" });
  }
  if (existing?.status === "pending") {
    return res.status(400).json({ error: "Request already sent." });
  }

  db.prepare("INSERT INTO friendships (requester_id, recipient_id, status, created_at) VALUES (?, ?, 'pending', ?)").run(
    req.user.id,
    target.id,
    new Date().toISOString()
  );
  res.json({ status: "pending" });
});

app.post("/api/friends/:id/accept", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM friendships WHERE id = ?").get(Number(req.params.id));
  if (!row || row.recipient_id !== req.user.id || row.status !== "pending") {
    return res.status(404).json({ error: "Request not found." });
  }
  db.prepare("UPDATE friendships SET status = 'accepted' WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

app.post("/api/friends/:id/decline", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM friendships WHERE id = ?").get(Number(req.params.id));
  if (!row || row.recipient_id !== req.user.id) {
    return res.status(404).json({ error: "Request not found." });
  }
  db.prepare("DELETE FROM friendships WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

app.delete("/api/friends/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM friendships WHERE id = ?").get(Number(req.params.id));
  if (!row || (row.requester_id !== req.user.id && row.recipient_id !== req.user.id)) {
    return res.status(404).json({ error: "Request not found." });
  }
  db.prepare("DELETE FROM friendships WHERE id = ?").run(row.id);
  res.json({ ok: true });
});

app.use("/uploads", express.static(uploadsDir));

// In production, serve the built frontend (npm run build output) from the same server.
const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
