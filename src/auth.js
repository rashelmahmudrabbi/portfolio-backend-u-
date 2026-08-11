// Minimal admin auth: one admin user (from env vars), a signed httpOnly
// cookie as the session. No express-session/passport dependency — this is
// a handful of lines with node:crypto and keeps the serverless function
// bundle (and therefore cold start) small.
const crypto = require('crypto');

const COOKIE_NAME = 'portfolio_admin';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret() {
  const secret = process.env.SECRET_KEY;
  if (!secret) {
    throw new Error('SECRET_KEY is not set. Add it in your Vercel project settings.');
  }
  return secret;
}

function sign(value) {
  const h = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  return `${value}.${h}`;
}

function verify(signed) {
  if (!signed || typeof signed !== 'string' || !signed.includes('.')) return null;
  const idx = signed.lastIndexOf('.');
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  const sigBuf = Buffer.from(sig, 'hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  return value;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
}

async function checkCredentials(sql, username, password) {
  if (!username || !password) return false;
  const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} LIMIT 1`;
  if (rows.length === 0) return false;
  return verifyPassword(password, rows[0].password_hash);
}

function safeStringEqual(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function createSessionCookie() {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `admin:${expires}`;
  const signed = sign(payload);
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${encodeURIComponent(signed)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  const raw = cookies[COOKIE_NAME];
  const value = verify(raw);
  if (!value) return false;
  const [tag, expiresStr] = value.split(':');
  if (tag !== 'admin') return false;
  const expires = Number(expiresStr);
  return Number.isFinite(expires) && Date.now() < expires;
}

function requireAdmin(req, res, next) {
  if (isAuthenticated(req)) return next();
  res.redirect('/admin/login');
}

module.exports = {
  COOKIE_NAME,
  hashPassword,
  verifyPassword,
  checkCredentials,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  requireAdmin,
};
