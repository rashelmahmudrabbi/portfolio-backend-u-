const express = require('express');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

const { getSql } = require('./db');
const { RESOURCES, serializeRow, splitCommas, splitLines } = require('./resources');
const auth = require('./auth');
const { layout, renderForm, renderTable, esc, renderCvAdmin, renderAboutAdmin } = require('./views');

let tablesEnsured = false;
async function ensureTables(sql) {
  if (tablesEnsured) return;
  try {
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const stmt of statements) {
        try {
          await sql(stmt);
        } catch (e) {
          // ignore existing table or constraint errors
        }
      }
    }
  } catch (e) {
    console.error('Schema auto-migration notice:', e.message);
  }
  tablesEnsured = true;
}

// Resources that get a generic, auto-generated admin CRUD screen. Gallery
// events also live here (title/year only) — their nested photos get their
// own dedicated admin routes further down. Settings is a singleton and
// handled entirely separately.
const ADMIN_RESOURCE_KEYS = [
  'education', 'experience', 'publications', 'projects', 'certifications',
  'awards', 'activities', 'courses', 'blog', 'references',
  'research-interests', 'spoken-languages', 'teaching-roles', 'teaching-areas', 'spotlights', 'about-pills',
];

// Resources exposed on the public read-only API at /api/<key>. Gallery and
// settings are handled by their own custom routes below since they need
// nested data, not a flat table dump.
const PUBLIC_API_KEYS = [
  'education', 'experience', 'publications', 'projects', 'certifications',
  'awards', 'activities', 'courses', 'blog', 'references', 'spotlights', 'about-pills',
];

function buildApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.urlencoded({ extended: false }));

  // ── Security headers ─────────────────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .concat([
      'https://rashelmahmudrabbi.github.io',
      'http://localhost:5500', 'http://127.0.0.1:5500',
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:5173', 'http://127.0.0.1:5173',
      'http://localhost:8000', 'http://127.0.0.1:8000',
      'http://localhost:8080', 'http://127.0.0.1:8080',
    ]);

  app.use('/api', cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(null, false);
    },
  }));

  // ── Simple in-memory rate limiter for /api/* ──────────────────────────
  const rateLimitMap = new Map();
  const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX = 120; // max requests per window per IP
  app.use('/api', (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = rateLimitMap.get(ip);
    if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
      entry = { start: now, count: 0 };
      rateLimitMap.set(ip, entry);
    }
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ detail: 'Too many requests. Please try again later.' });
    }
    next();
  });
  // Clean up stale entries every 5 minutes
  setInterval(() => {
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    for (const [ip, entry] of rateLimitMap) {
      if (entry.start < cutoff) rateLimitMap.delete(ip);
    }
  }, 5 * 60 * 1000).unref();

  // ── Cache-Control for all GET /api/* responses ───────────────────────
  app.use('/api', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    }
    next();
  });

  // ─────────────────────────────────────────────────────────────────────
  // Public, read-only API — same paths and JSON shapes the frontend
  // already calls (see portfolio-frontend/assets/js/api.js).
  // ─────────────────────────────────────────────────────────────────────

  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Portfolio API is running',
      endpoints: { admin: '/admin', health: '/api/health', api: '/api/' },
    });
  });

  app.get('/api/health', (req, res) => res.json({ ok: true }));

  app.get('/api/cv/download', async (req, res, next) => {
    try {
      const sql = getSql();
      // Auto-create table if it doesn't exist
      await sql(`CREATE TABLE IF NOT EXISTS cv_files (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        file_data TEXT,
        mimetype TEXT,
        filename TEXT
      )`);
      const [cvFile] = await sql(`SELECT file_data, mimetype, filename FROM cv_files WHERE id = 1`);
      
      if (cvFile && cvFile.file_data) {
        const buffer = Buffer.from(cvFile.file_data, 'base64');
        res.setHeader('Content-Type', cvFile.mimetype || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${cvFile.filename || 'cv.pdf'}"`);
        res.send(buffer);
      } else {
        // Fallback to legacy Google Drive link or return 404
        const [settings] = await sql(`SELECT cv_download_url FROM site_settings WHERE id = 1`);
        if (settings && settings.cv_download_url) {
          let fallbackUrl = settings.cv_download_url;
          const gDriveMatch = fallbackUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (gDriveMatch) {
            fallbackUrl = `https://drive.google.com/uc?export=download&id=${gDriveMatch[1]}`;
          }
          res.redirect(fallbackUrl);
        } else {
          res.status(404).send('CV not found');
        }
      }
    } catch (err) { next(err); }
  });
  // ── Combined /api/portfolio endpoint ──────────────────────────────────
  // Returns ALL homepage data in a single response, cutting round-trips
  // from 10+ to 1 and making the page load significantly faster.
  app.get('/api/portfolio', async (req, res, next) => {
    try {
      const sql = getSql();
      await ensureTables(sql);

      // Fire all queries in parallel
      const [settingsRow, interests, langs, roles, areas,
             eduRows, expRows, pubRows, projRows, certRows,
             awardRows, actRows, galleryEvents, galleryPhotos, refRows, spotRows, courseRows, pillRows] = await Promise.all([
        sql`SELECT * FROM site_settings WHERE id = 1`,
        sql`SELECT * FROM research_interests ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM spoken_languages ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM teaching_roles ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM teaching_areas ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM education ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM experience ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM publications ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM certifications ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM awards ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM activities ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM gallery_events ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM gallery_photos ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM reference_list ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM spotlights ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM courses ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM about_pills ORDER BY sort_order ASC, id ASC`,
      ]);

      const s = settingsRow[0] || {};

      // Build gallery with nested photos
      const byEvent = {};
      for (const p of galleryPhotos) {
        (byEvent[p.event_id] = byEvent[p.event_id] || []).push({ src: p.src, caption: p.caption });
      }

      res.json({
        settings: {
          profile: {
            name: s.name || '', title: s.title || '', email: s.email || '',
            phone: s.phone || '', location: s.location || '', avatar: s.avatar || '',
            heroStatusText: s.hero_status_text || 'Open to research',
            objective: s.objective || '',
            stats: {
              publications: s.stat_publications || 0, projects: s.stat_projects || 0,
              awards: s.stat_awards || 0, certifications: s.stat_certifications || 0,
            },
            socials: {
              github: s.social_github || '', linkedin: s.social_linkedin || '',
              researchgate: s.social_researchgate || '', scholar: s.social_scholar || '',
              orcid: s.social_orcid || '',
            },
          },
          researchInterests: interests.map((r) => ({ icon: r.icon, topic: r.topic, desc: r.description })),
          skills: {
            languages: splitCommas(s.skills_languages), frameworks: splitCommas(s.skills_frameworks),
            tools: splitCommas(s.skills_tools), researchMethods: splitCommas(s.skills_research_methods),
          },
          spokenLanguages: langs.map((l) => ({ name: l.name, level: l.level })),
          about: {
            kicker: s.about_kicker || 'ABOUT ME',
            headline: s.about_headline || 'AI research with a practical mindset.',
            text: s.about_text || '',
            statusText: s.about_status_text || 'Open to research opportunities',
            pills: pillRows && pillRows.length > 0 ? pillRows.map(p => ({
              id: p.id,
              label: p.label,
              icon: p.icon || 'bi-cpu',
              colorType: p.color_type || 'primary'
            })) : [],
          },
          personalInfo: {
            fatherName: s.father_name || '',
            motherName: s.mother_name || '',
            dob: s.dob || '',
            religion: s.religion || '',
            nid: s.nid || '',
            maritalStatus: s.marital_status || '',
            bloodGroup: s.blood_group || '',
            nationality: s.nationality || '',
            address: s.address || s.location || 'Rajshahi, Bangladesh',
          },
          teaching: {
            philosophy: s.teaching_philosophy || '',
            roles: roles.map((r) => ({ title: r.title, desc: r.description })),
            areas: areas.map((a) => ({ topic: a.topic, desc: a.description })),
            mentoringText: s.teaching_mentoring_text || '',
          },
          footerText: s.footer_text || '',
          cvLastUpdated: s.cv_last_updated || '',
          cvDownloadUrl: s.cv_download_url || '',
        },
        education: eduRows.map((r) => serializeRow('education', r)),
        experience: expRows.map((r) => serializeRow('experience', r)),
        publications: pubRows.map((r) => serializeRow('publications', r)),
        projects: projRows.map((r) => serializeRow('projects', r)),
        certifications: certRows.map((r) => serializeRow('certifications', r)),
        awards: awardRows.map((r) => serializeRow('awards', r)),
        activities: actRows.map((r) => serializeRow('activities', r)),
        spotlights: spotRows.map((r) => serializeRow('spotlights', r)),
        courses: courseRows.map((r) => serializeRow('courses', r)),
        gallery: galleryEvents.map((e) => ({
          id: e.id, title: e.title, year: e.year, category: e.category, venue: e.venue, date: e.date, order: e.sort_order,
          photos: byEvent[e.id] || [],
        })),
        references: refRows.map((r) => serializeRow('references', r)),
      });
    } catch (err) { next(err); }
  });

  app.get('/api/settings', async (req, res, next) => {
    try {
      const sql = getSql();
      const [settingsRow] = await sql`SELECT * FROM site_settings WHERE id = 1`;
      const s = settingsRow || {};
      const [interests, langs, roles, areas] = await Promise.all([
        sql`SELECT * FROM research_interests ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM spoken_languages ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM teaching_roles ORDER BY sort_order ASC, id ASC`,
        sql`SELECT * FROM teaching_areas ORDER BY sort_order ASC, id ASC`,
      ]);

      res.json({
        profile: {
          name: s.name || '',
          title: s.title || '',
          email: s.email || '',
          phone: s.phone || '',
          location: s.location || '',
          avatar: s.avatar || '',
          objective: s.objective || '',
          stats: {
            publications: s.stat_publications || 0,
            projects: s.stat_projects || 0,
            awards: s.stat_awards || 0,
            certifications: s.stat_certifications || 0,
          },
          socials: {
            github: s.social_github || '',
            linkedin: s.social_linkedin || '',
            researchgate: s.social_researchgate || '',
            scholar: s.social_scholar || '',
            orcid: s.social_orcid || '',
          },
        },
        researchInterests: interests.map((r) => ({ icon: r.icon, topic: r.topic, desc: r.description })),
        skills: {
          languages: splitCommas(s.skills_languages),
          frameworks: splitCommas(s.skills_frameworks),
          tools: splitCommas(s.skills_tools),
          researchMethods: splitCommas(s.skills_research_methods),
        },
        spokenLanguages: langs.map((l) => ({ name: l.name, level: l.level })),
        personalInfo: {
          fatherName: s.father_name || '',
          motherName: s.mother_name || '',
          dob: s.dob || '',
          religion: s.religion || '',
          nid: s.nid || '',
          maritalStatus: s.marital_status || '',
          bloodGroup: s.blood_group || '',
          nationality: s.nationality || '',
          address: s.address || s.location || 'Rajshahi, Bangladesh',
        },
        teaching: {
          philosophy: s.teaching_philosophy || '',
          roles: roles.map((r) => ({ title: r.title, desc: r.description })),
          areas: areas.map((a) => ({ topic: a.topic, desc: a.description })),
          mentoringText: s.teaching_mentoring_text || '',
        },
        footerText: s.footer_text || '',
        cvLastUpdated: s.cv_last_updated || '',
        cvDownloadUrl: s.cv_download_url || '',
      });
    } catch (err) { next(err); }
  });

  app.get('/api/gallery', async (req, res, next) => {
    try {
      const sql = getSql();
      const events = await sql`SELECT * FROM gallery_events ORDER BY sort_order ASC, id ASC`;
      const photos = await sql`SELECT * FROM gallery_photos ORDER BY sort_order ASC, id ASC`;
      const byEvent = {};
      for (const p of photos) {
        (byEvent[p.event_id] = byEvent[p.event_id] || []).push({ src: p.src, caption: p.caption });
      }
      res.json(events.map((e) => ({
        id: e.id, title: e.title, year: e.year, category: e.category, venue: e.venue, date: e.date, order: e.sort_order,
        photos: byEvent[e.id] || [],
      })));
    } catch (err) { next(err); }
  });

  app.get('/api/gallery/:id', async (req, res, next) => {
    try {
      const sql = getSql();
      const [e] = await sql`SELECT * FROM gallery_events WHERE id = ${req.params.id}`;
      if (!e) return res.status(404).json({ detail: 'Not found.' });
      const photos = await sql`SELECT * FROM gallery_photos WHERE event_id = ${e.id} ORDER BY sort_order ASC, id ASC`;
      res.json({
        id: e.id, title: e.title, year: e.year, category: e.category, venue: e.venue, date: e.date, order: e.sort_order,
        photos: photos.map((p) => ({ src: p.src, caption: p.caption })),
      });
    } catch (err) { next(err); }
  });

  for (const key of PUBLIC_API_KEYS) {
    const resource = RESOURCES[key];
    app.get(`/api/${key}`, async (req, res, next) => {
      try {
        const sql = getSql();
        const rows = await sql(
          `SELECT * FROM ${resource.table} ORDER BY sort_order ASC, id ASC`
        );
        res.json(rows.map((r) => serializeRow(key, r)));
      } catch (err) { next(err); }
    });

    app.get(`/api/${key}/:id`, async (req, res, next) => {
      try {
        const sql = getSql();
        const rows = await sql(
          `SELECT * FROM ${resource.table} WHERE id = $1`,
          [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ detail: 'Not found.' });
        res.json(serializeRow(key, rows[0]));
      } catch (err) { next(err); }
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // Admin panel — session-cookie protected, server-rendered HTML forms.
  // ─────────────────────────────────────────────────────────────────────

  app.get('/admin/login', (req, res) => {
    if (auth.isAuthenticated(req)) return res.redirect('/admin');
    res.send(layout({
      title: 'Log in', authed: false,
      body: `<div class="card" style="max-width:360px; margin: 60px auto;">
        <h1>Portfolio Admin</h1>
        <p class="muted">Log in to edit your content.</p>
        <form method="post" action="/admin/login">
          <label for="username">Username</label>
          <input type="text" name="username" id="username" autocomplete="username" />
          <label for="password">Password</label>
          <input type="password" name="password" id="password" autocomplete="current-password" />
          <div class="actions"><button class="btn" type="submit">Log in</button></div>
        </form>
      </div>`,
      flash: req.query.error ? 'Invalid username or password.' : null,
    }));
  });

  app.post('/admin/login', async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const sql = getSql();
      await ensureTables(sql);
      
      // Ensure admin_users table exists
      await sql(`CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
      )`);

      // Seed admin_users table if empty
      const adminCount = await sql`SELECT count(*) FROM admin_users`;
      if (!adminCount || Number(adminCount[0]?.count) === 0) {
        const expectedUser = process.env.ADMIN_USERNAME || 'admin';
        const expectedPass = process.env.ADMIN_PASSWORD || 'password';
        const hash = auth.hashPassword(expectedPass);
        await sql`INSERT INTO admin_users (id, username, password_hash) VALUES (1, ${expectedUser}, ${hash}) ON CONFLICT DO NOTHING`;
      }

      if (await auth.checkCredentials(sql, username, password)) {
        res.setHeader('Set-Cookie', auth.createSessionCookie());
        return res.redirect('/admin');
      }
      res.redirect('/admin/login?error=1');
    } catch (err) {
      console.error('Login error:', err);
      res.redirect('/admin/login?error=1');
    }
  });

  app.post('/admin/logout', (req, res) => {
    res.setHeader('Set-Cookie', auth.clearSessionCookie());
    res.redirect('/admin/login');
  });

  app.use('/admin', (req, res, next) => {
    if (req.path === '/login') return next();
    auth.requireAdmin(req, res, next);
  });

  app.get('/admin/change-password', (req, res) => {
    res.send(layout({
      title: 'Change Password', authed: true,
      body: `<div class="card" style="max-width:400px; margin: 40px auto;">
        <h2>Change Password</h2>
        <form method="post" action="/admin/change-password">
          <label>Current Password</label>
          <input type="password" name="oldPassword" required />
          <label>New Password</label>
          <input type="password" name="newPassword" required />
          <label>Confirm New Password</label>
          <input type="password" name="confirmPassword" required />
          <div class="actions">
            <a href="/admin" class="btn secondary">Cancel</a>
            <button class="btn" type="submit">Save</button>
          </div>
        </form>
      </div>`,
      flash: req.query.error ? 'Password change failed. Check your current password and ensure new passwords match.' : (req.query.success ? 'Password successfully changed.' : null)
    }));
  });

  app.post('/admin/change-password', async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!newPassword || newPassword !== confirmPassword) {
      return res.redirect('/admin/change-password?error=1');
    }
    const sql = getSql();
    let rows = await sql`SELECT * FROM admin_users LIMIT 1`;
    if (rows.length === 0) {
      const expectedPass = process.env.ADMIN_PASSWORD || 'password';
      if (oldPassword !== expectedPass) {
        return res.redirect('/admin/change-password?error=1');
      }
      const expectedUser = process.env.ADMIN_USERNAME || 'admin';
      const newHash = auth.hashPassword(newPassword);
      await sql`INSERT INTO admin_users (id, username, password_hash) VALUES (1, ${expectedUser}, ${newHash})`;
      return res.redirect('/admin/change-password?success=1');
    }
    if (!auth.verifyPassword(oldPassword, rows[0].password_hash)) {
      return res.redirect('/admin/change-password?error=1');
    }
    const newHash = auth.hashPassword(newPassword);
    await sql`UPDATE admin_users SET password_hash = ${newHash} WHERE id = ${rows[0].id}`;
    res.redirect('/admin/change-password?success=1');
  });

  const DASHBOARD_GROUPS = [
    {
      title: 'Core Info',
      items: [
        { key: 'about', label: 'About Section & Pills', desc: 'Headline, narrative paragraphs & meta pills', icon: 'bi-person-lines-fill', color: '#10b981', table: 'about_pills' },
        { key: 'spotlights', label: 'Spotlight Highlights', desc: 'Hero slideshow highlight cards', icon: 'bi-stars', color: '#f59e0b', table: 'spotlights' },
        { key: 'settings', label: 'Site Settings', desc: 'Profile, socials, skills, personal info', icon: 'bi-gear-fill', color: '#6366f1', table: null },
        { key: 'spoken-languages', label: 'Spoken Languages', desc: 'Manage spoken languages', icon: 'bi-translate', color: '#8b5cf6', table: 'spoken_languages' }
      ]
    },
    {
      title: 'Academic & Career',
      items: [
        { key: 'education', label: 'Education', desc: 'Manage education', icon: 'bi-mortarboard-fill', color: '#ec4899', table: 'education' },
        { key: 'experience', label: 'Experience', desc: 'Manage experience', icon: 'bi-briefcase-fill', color: '#f43f5e', table: 'experience' },
        { key: 'publications', label: 'Publications', desc: 'Manage publications', icon: 'bi-journal-text', color: '#f97316', table: 'publications' },
        { key: 'research-interests', label: 'Research Interests', desc: 'Manage research interests', icon: 'bi-lightbulb-fill', color: '#eab308', table: 'research_interests' },
        { key: 'references', label: 'References', desc: 'Manage references', icon: 'bi-person-lines-fill', color: '#84cc16', table: 'reference_list' }
      ]
    },
    {
      title: 'Portfolio & Media',
      items: [
        { key: 'projects', label: 'Projects', desc: 'Manage projects', icon: 'bi-kanban', color: '#10b981', table: 'projects' },
        { key: 'gallery', label: 'Gallery Events', desc: 'Events + photos', icon: 'bi-images', color: '#14b8a6', table: 'gallery_events' },
        { key: 'blog', label: 'Blog Posts', desc: 'Manage blog posts', icon: 'bi-pencil-square', color: '#06b6d4', table: 'blog_posts' }
      ]
    },
    {
      title: 'Achievements',
      items: [
        { key: 'awards', label: 'Awards', desc: 'Manage awards', icon: 'bi-trophy-fill', color: '#0ea5e9', table: 'awards' },
        { key: 'certifications', label: 'Certifications', desc: 'Manage certifications', icon: 'bi-patch-check-fill', color: '#3b82f6', table: 'certifications' },
        { key: 'activities', label: 'Activities', desc: 'Manage activities', icon: 'bi-activity', color: '#6366f1', table: 'activities' }
      ]
    },
    {
      title: 'Teaching',
      items: [
        { key: 'teaching-roles', label: 'Teaching Roles', desc: 'Manage teaching roles', icon: 'bi-person-badge', color: '#8b5cf6', table: 'teaching_roles' },
        { key: 'teaching-areas', label: 'Teaching Areas', desc: 'Manage teaching areas', icon: 'bi-book-half', color: '#d946ef', table: 'teaching_areas' },
        { key: 'courses', label: 'Teaching Courses', desc: 'Manage teaching courses', icon: 'bi-journal-bookmark-fill', color: '#ec4899', table: 'courses' }
      ]
    }
  ];

  app.get('/admin', async (req, res, next) => {
    try {
      const sql = getSql();
      await ensureTables(sql);
      const counts = {};
      
      await Promise.all(
        DASHBOARD_GROUPS.flatMap(g => g.items).map(async (item) => {
          if (item.table) {
            try {
              const result = await sql(`SELECT count(*) as count FROM ${item.table}`);
              counts[item.key] = result && result[0] ? result[0].count : 0;
            } catch (e) {
              counts[item.key] = 0;
            }
          }
        })
      );

      let groupsHtml = '';
      for (const group of DASHBOARD_GROUPS) {
        groupsHtml += `<h2 style="margin-top:48px; margin-bottom:20px; font-size:22px; color:var(--text-main); font-weight:700; letter-spacing:-0.03em;">${group.title}</h2><div class="grid-links">`;
        for (const item of group.items) {
          const countLabel = item.table ? `<div style="margin-top:12px;"><span style="font-size:12px; font-weight:600; color:${item.color}; background:${item.color}15; padding:4px 10px; border-radius:20px;">${counts[item.key]} items</span></div>` : '';
          groupsHtml += `
            <a href="/admin/${item.key}">
              <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
                <div style="width:36px; height:36px; border-radius:8px; background:${item.color}15; display:flex; align-items:center; justify-content:center;">
                  <i class="bi ${item.icon}" style="color:${item.color}; font-size:18px;"></i>
                </div>
                <div style="font-weight:600; color:var(--text-main); font-size:16px;">${item.label}</div>
              </div>
              <span style="display:block; font-weight:400; color:var(--text-muted); font-size:14px;">${item.desc}</span>
              ${countLabel}
            </a>`;
        }
        groupsHtml += `</div>`;
      }
      
      res.send(layout({
        title: 'Dashboard', authed: true,
        body: `<div style="margin-top:32px; margin-bottom:16px;">
            <h1 style="font-size:36px; font-weight:800; letter-spacing:-0.04em;">Dashboard</h1>
            <p class="muted" style="font-size:16px;">Edits here appear on the live site immediately — no redeploy needed.</p>
          </div>
          ${groupsHtml}
          <div style="height:64px;"></div>`,
      }));
    } catch (err) { next(err); }
  });

  // Generic CRUD for every "simple list" resource.
  for (const key of ADMIN_RESOURCE_KEYS) {
    const resource = RESOURCES[key];

    app.get(`/admin/${key}`, async (req, res, next) => {
      try {
        const sql = getSql();
        await ensureTables(sql);
        let rows = [];
        try {
          rows = await sql(`SELECT * FROM ${resource.table} ORDER BY sort_order ASC, id ASC`);
        } catch (queryErr) {
          if (queryErr.message && queryErr.message.includes('does not exist')) {
            // Force table creation and retry
            tablesEnsured = false;
            await ensureTables(sql);
            try {
              rows = await sql(`SELECT * FROM ${resource.table} ORDER BY sort_order ASC, id ASC`);
            } catch (retryErr) {
              rows = [];
            }
          } else {
            throw queryErr;
          }
        }
        res.send(layout({
          title: resource.label, authed: true,
          body: `<h1>${esc(resource.label)}</h1>` + renderTable({ resourceKey: key, label: resource.label, fields: resource.fields, rows }),
        }));
      } catch (err) { next(err); }
    });

    app.get(`/admin/${key}/new`, (req, res) => {
      res.send(layout({
        title: `New ${resource.label}`, authed: true,
        body: `<h1>New ${esc(resource.label)}</h1><div class="card">${renderForm({
          fields: resource.fields, action: `/admin/${key}/new`, submitLabel: 'Create',
        })}</div>`,
      }));
    });

    app.post(`/admin/${key}/new`, upload.single('image_file'), async (req, res, next) => {
      try {
        const sql = getSql();
        const values = extractValues(resource.fields, req.body);
        const hasImageField = resource.fields.some(f => f.key === 'image_file');
        if (req.body.image_file_b64) {
          values.image = req.body.image_file_b64;
        } else if (req.file && hasImageField) {
          const b64 = req.file.buffer.toString('base64');
          values.image = `data:${req.file.mimetype};base64,${b64}`;
        }
        const dbFields = resource.fields.filter(f => f.key !== 'image_file');
        const order = Number(req.body.order) || 0;
        const cols = ['sort_order', ...dbFields.map((f) => f.key)];
        const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        await sql(
          `INSERT INTO ${resource.table} (${cols.join(', ')}) VALUES (${placeholders})`,
          [order, ...dbFields.map((f) => values[f.key])]
        );
        res.redirect(`/admin/${key}`);
      } catch (err) { next(err); }
    });

    app.get(`/admin/${key}/:id/edit`, async (req, res, next) => {
      try {
        const sql = getSql();
        const rows = await sql(`SELECT * FROM ${resource.table} WHERE id = $1`, [req.params.id]);
        if (!rows.length) return res.status(404).send('Not found');
        res.send(layout({
          title: `Edit ${resource.label}`, authed: true,
          body: `<h1>Edit ${esc(resource.label)}</h1><div class="card">${renderForm({
            fields: resource.fields, row: rows[0], action: `/admin/${key}/${req.params.id}/edit`, submitLabel: 'Save',
          })}</div>`,
        }));
      } catch (err) { next(err); }
    });

    app.post(`/admin/${key}/:id/edit`, upload.single('image_file'), async (req, res, next) => {
      try {
        const sql = getSql();
        const values = extractValues(resource.fields, req.body);
        const hasImageField = resource.fields.some(f => f.key === 'image_file');
        if (req.body.image_file_b64) {
          values.image = req.body.image_file_b64;
        } else if (req.file && hasImageField) {
          const b64 = req.file.buffer.toString('base64');
          values.image = `data:${req.file.mimetype};base64,${b64}`;
        } else if (hasImageField && !values.image) {
          // If no new file uploaded and image url is empty, keep existing image
          try {
            const [existing] = await sql(`SELECT image FROM ${resource.table} WHERE id = $1`, [req.params.id]);
            if (existing && existing.image) values.image = existing.image;
          } catch (imgErr) { /* column may not exist, ignore */ }
        }
        const dbFields = resource.fields.filter(f => f.key !== 'image_file');
        const order = Number(req.body.order) || 0;
        const setSql = dbFields.map((f, i) => `${f.key} = $${i + 2}`).join(', ');
        await sql(
          `UPDATE ${resource.table} SET sort_order = $1, ${setSql} WHERE id = $${dbFields.length + 2}`,
          [order, ...dbFields.map((f) => values[f.key]), req.params.id]
        );
        res.redirect(`/admin/${key}`);
      } catch (err) { next(err); }
    });

    app.post(`/admin/${key}/:id/delete`, async (req, res, next) => {
      try {
        const sql = getSql();
        await sql(`DELETE FROM ${resource.table} WHERE id = $1`, [req.params.id]);
        res.redirect(`/admin/${key}`);
      } catch (err) { next(err); }
    });

    app.post(`/admin/${key}/:id/reorder`, async (req, res, next) => {
      try {
        const sql = getSql();
        const order = Number(req.body.order) || 0;
        await sql(`UPDATE ${resource.table} SET sort_order = $1 WHERE id = $2`, [order, req.params.id]);
        res.redirect(`/admin/${key}`);
      } catch (err) { next(err); }
    });
  }

  // --- Gallery photos (nested under an event) ---
  app.get('/admin/gallery/:id/photos', async (req, res, next) => {
    try {
      const sql = getSql();
      const [event] = await sql(`SELECT * FROM gallery_events WHERE id = $1`, [req.params.id]);
      if (!event) return res.status(404).send('Not found');
      const photos = await sql(
        `SELECT * FROM gallery_photos WHERE event_id = $1 ORDER BY sort_order ASC, id ASC`,
        [req.params.id]
      );
      const rows = photos
        .map((p) => `<tr>
          <td>${esc(p.caption)}</td>
          <td>
            <form method="post" action="/admin/gallery/${event.id}/photos/${p.id}/reorder" class="inline" style="margin:0;">
              <input type="number" name="order" value="${p.sort_order ?? 0}" style="width: 70px; padding: 4px; text-align: center;" onchange="this.form.submit()" />
            </form>
          </td>
          <td style="white-space:nowrap;">
            <a class="link" href="/admin/gallery/${event.id}/photos/${p.id}/edit">Edit</a>
            <form class="inline" method="post" action="/admin/gallery/${event.id}/photos/${p.id}/delete" onsubmit="return confirm('Delete this photo?');">
              <button class="link" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:0;">Delete</button>
            </form>
          </td>
        </tr>`)
        .join('');
      res.send(layout({
        title: `Photos — ${event.title}`, authed: true,
        body: `<h1>Photos — ${esc(event.title)}</h1>
          <p><a class="link" href="/admin/gallery">&larr; Back to Gallery</a></p>
          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
              <h2 style="margin:0;">Photos</h2>
              <a class="btn" href="/admin/gallery/${event.id}/photos/new">+ Add photo</a>
            </div>
            <table>
              <thead><tr><th>Caption</th><th>Order</th><th></th></tr></thead>
              <tbody>${rows || '<tr><td colspan="3" class="muted">No photos yet.</td></tr>'}</tbody>
            </table>
          </div>`,
      }));
    } catch (err) { next(err); }
  });

  app.get('/admin/gallery/:id/photos/new', async (req, res, next) => {
    try {
      const sql = getSql();
      const [event] = await sql(`SELECT * FROM gallery_events WHERE id = $1`, [req.params.id]);
      if (!event) return res.status(404).send('Not found');
      res.send(layout({
        title: 'New Photo', authed: true,
        body: `<h1>New Photo — ${esc(event.title)}</h1><div class="card">${renderForm({
          fields: PHOTO_FIELDS, action: `/admin/gallery/${event.id}/photos/new`, submitLabel: 'Create',
        })}</div>`,
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/photos/new', upload.single('photo_file'), async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      let dataUri = req.body.src || req.body.photo_file_b64 || '';
      if (req.file && !dataUri) {
        const b64 = req.file.buffer.toString('base64');
        dataUri = `data:${req.file.mimetype};base64,${b64}`;
      }
      await sql(
        `INSERT INTO gallery_photos (event_id, sort_order, src, caption) VALUES ($1, $2, $3, $4)`,
        [req.params.id, order, dataUri, req.body.caption || '']
      );
      res.redirect(`/admin/gallery/${req.params.id}/photos`);
    } catch (err) { next(err); }
  });

  app.get('/admin/gallery/:id/photos/:photoId/edit', async (req, res, next) => {
    try {
      const sql = getSql();
      const [event] = await sql(`SELECT * FROM gallery_events WHERE id = $1`, [req.params.id]);
      const [photo] = await sql(`SELECT * FROM gallery_photos WHERE id = $1`, [req.params.photoId]);
      if (!event || !photo) return res.status(404).send('Not found');
      res.send(layout({
        title: 'Edit Photo', authed: true,
        body: `<h1>Edit Photo — ${esc(event.title)}</h1><div class="card">${renderForm({
          fields: PHOTO_FIELDS, row: photo, action: `/admin/gallery/${event.id}/photos/${photo.id}/edit`, submitLabel: 'Save',
        })}</div>`,
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/photos/:photoId/edit', upload.single('photo_file'), async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      
      const src = req.body.src || req.body.photo_file_b64;
      if (src) {
        await sql(
          `UPDATE gallery_photos SET sort_order = $1, src = $2, caption = $3 WHERE id = $4`,
          [order, src, req.body.caption || '', req.params.photoId]
        );
      } else if (req.file) {
        const b64 = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        await sql(
          `UPDATE gallery_photos SET sort_order = $1, src = $2, caption = $3 WHERE id = $4`,
          [order, dataUri, req.body.caption || '', req.params.photoId]
        );
      } else {
        await sql(
          `UPDATE gallery_photos SET sort_order = $1, caption = $2 WHERE id = $3`,
          [order, req.body.caption || '', req.params.photoId]
        );
      }
      
      res.redirect(`/admin/gallery/${req.params.id}/photos`);
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/photos/:photoId/delete', async (req, res, next) => {
    try {
      const sql = getSql();
      await sql(`DELETE FROM gallery_photos WHERE id = $1`, [req.params.photoId]);
      res.redirect(`/admin/gallery/${req.params.id}/photos`);
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/photos/:photoId/reorder', async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      await sql(`UPDATE gallery_photos SET sort_order = $1 WHERE id = $2`, [order, req.params.photoId]);
      res.redirect(`/admin/gallery/${req.params.id}/photos`);
    } catch (err) { next(err); }
  });

  // --- CV Management ---
  app.get('/admin/cv', async (req, res, next) => {
    try {
      const sql = getSql();
      const [settings] = await sql(`SELECT cv_download_url FROM site_settings WHERE id = 1`);
      res.send(layout({
        title: 'Manage CV',
        authed: true,
        body: renderCvAdmin(settings?.cv_download_url),
        flash: req.query.success ? 'CV updated successfully!' : ''
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/cv', upload.single('cv_file'), async (req, res, next) => {
    try {
      if (req.file) {
        const sql = getSql();
        const b64 = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        
        await sql(`CREATE TABLE IF NOT EXISTS cv_files (
          id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          file_data TEXT,
          mimetype TEXT,
          filename TEXT
        )`);
        await sql(`DELETE FROM cv_files WHERE id = 1`);
        await sql(`INSERT INTO cv_files (id, file_data, mimetype, filename) VALUES (1, $1, $2, $3)`, [b64, req.file.mimetype, req.file.originalname]);
        await sql(`UPDATE site_settings SET cv_last_updated = $1 WHERE id = 1`, [new Date().getFullYear().toString()]);
      }
      res.redirect('/admin/cv?success=1');
    } catch (err) { next(err); }
  });

  // --- Dedicated About Section & Meta Pills Unified Manager ---
  app.get('/admin/about', async (req, res, next) => {
    try {
      const sql = getSql();
      await ensureTables(sql);
      const [settingsRow] = await sql`SELECT * FROM site_settings WHERE id = 1`;
      const pills = await sql`SELECT * FROM about_pills ORDER BY sort_order ASC, id ASC`;
      res.send(layout({
        title: 'About Section & Pills',
        authed: true,
        body: renderAboutAdmin({ settings: settingsRow || {}, pills }),
        flash: req.query.success ? 'About section saved successfully!' : null
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/about', async (req, res, next) => {
    try {
      const sql = getSql();
      await ensureTables(sql);
      const { about_kicker, about_headline, about_status_text, about_text } = req.body;
      await sql(
        `UPDATE site_settings SET
          about_kicker = $1,
          about_headline = $2,
          about_status_text = $3,
          about_text = $4
        WHERE id = 1`,
        [about_kicker || 'ABOUT ME', about_headline || '', about_status_text || '', about_text || '']
      );
      res.redirect('/admin/about?success=1');
    } catch (err) { next(err); }
  });

  // --- Site Settings (singleton) ---
  app.get('/admin/settings', async (req, res, next) => {
    try {
      const sql = getSql();
      const [row] = await sql`SELECT * FROM site_settings WHERE id = 1`;
      const s = row || {};
      res.send(layout({
        title: 'Site Settings', authed: true,
        body: `<h1>Site Settings</h1>
          <p class="muted">Manage the nested lists separately:
            <a class="link" href="/admin/research-interests">Research Interests</a>
            <a class="link" href="/admin/spoken-languages">Spoken Languages</a>
            <a class="link" href="/admin/teaching-roles">Teaching Roles</a>
            <a class="link" href="/admin/teaching-areas">Teaching Areas</a>
          </p>
          <div class="card">${renderForm({
            fields: SETTINGS_FIELDS, row: s, action: '/admin/settings', submitLabel: 'Save Settings', includeOrder: false,
          })}</div>`,
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/settings', upload.single('avatar_file'), async (req, res, next) => {
    try {
      const sql = getSql();
      await ensureTables(sql);
      const values = extractValues(SETTINGS_FIELDS, req.body);
      
      if (req.body.avatar_file_b64) {
        values.avatar = req.body.avatar_file_b64;
      } else if (req.file) {
        const b64 = req.file.buffer.toString('base64');
        values.avatar = `data:${req.file.mimetype};base64,${b64}`;
      } else if (!values.avatar) {
        const [existing] = await sql`SELECT avatar FROM site_settings WHERE id = 1`;
        if (existing && existing.avatar) values.avatar = existing.avatar;
      }

      const dbFields = SETTINGS_FIELDS.filter(f => f.key !== 'avatar_file');
      const cols = dbFields.map((f) => f.key);
      const setSql = cols.map((c, i) => `${c} = $${i + 2}`).join(', ');
      const params = [1, ...cols.map((c) => values[c])];
      await sql(
        `INSERT INTO site_settings (id, ${cols.join(', ')}) VALUES (${params.map((_, i) => `$${i + 1}`).join(', ')})
         ON CONFLICT (id) DO UPDATE SET ${setSql}`,
        params
      );
      res.redirect('/admin/settings');
    } catch (err) { next(err); }
  });

  // --- Gallery events list (uses the generic table renderer + a custom "photos" link) ---
  app.get('/admin/gallery', async (req, res, next) => {
    try {
      const sql = getSql();
      const rows = await sql`SELECT * FROM gallery_events ORDER BY sort_order ASC, id ASC`;
      res.send(layout({
        title: 'Gallery', authed: true,
        body: `<h1>Gallery Events</h1>` + renderTable({
          resourceKey: 'gallery', label: 'Gallery Events',
          fields: RESOURCES.gallery ? RESOURCES.gallery.fields : GALLERY_EVENT_FIELDS,
          rows,
          extraCol: (r) => `<a class="btn secondary" style="padding:4px 10px; font-size:12px; margin-right:16px;" href="/admin/gallery/${r.id}/photos">Manage Photos</a>`,
        }),
      }));
    } catch (err) { next(err); }
  });

  const NEW_GALLERY_EVENT_FIELDS = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'category', label: 'Category (Optional)', type: 'text' },
    { key: 'venue', label: 'Venue (Optional)', type: 'text' },
    { key: 'date', label: 'Date (Optional)', type: 'text' },
    { key: 'photo_file', label: 'Upload Initial Photo (Optional)', type: 'file' },
    { key: 'photo_caption', label: 'Initial Photo Caption (Optional)', type: 'text' },
  ];

  app.get('/admin/gallery/new', (req, res) => {
    res.send(layout({
      title: 'New Gallery Event', authed: true,
      body: `<h1>New Gallery Event</h1><div class="card">${renderForm({
        fields: NEW_GALLERY_EVENT_FIELDS, action: '/admin/gallery/new', submitLabel: 'Create',
      })}</div>`,
    }));
  });

  app.post('/admin/gallery/new', upload.single('photo_file'), async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      const rows = await sql(
        `INSERT INTO gallery_events (sort_order, title, year, category, venue, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [order, req.body.title || '', req.body.year || '', req.body.category || '', req.body.venue || '', req.body.date || '']
      );
      
      const eventId = rows[0].id;
      
      if (req.file) {
        const b64 = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        await sql(
          `INSERT INTO gallery_photos (event_id, sort_order, src, caption) VALUES ($1, 0, $2, $3)`,
          [eventId, dataUri, req.body.photo_caption || '']
        );
      }
      
      res.redirect('/admin/gallery');
    } catch (err) { next(err); }
  });

  const EDIT_GALLERY_EVENT_FIELDS = [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'year', label: 'Year', type: 'text' },
    { key: 'category', label: 'Category (Optional)', type: 'text' },
    { key: 'venue', label: 'Venue (Optional)', type: 'text' },
    { key: 'date', label: 'Date (Optional)', type: 'text' },
    { key: 'photo_file', label: 'Upload an additional Photo (Optional)', type: 'file' },
    { key: 'photo_caption', label: 'New Photo Caption (Optional)', type: 'text' },
  ];

  app.get('/admin/gallery/:id/edit', async (req, res, next) => {
    try {
      const sql = getSql();
      const [row] = await sql(`SELECT * FROM gallery_events WHERE id = $1`, [req.params.id]);
      if (!row) return res.status(404).send('Not found');
      res.send(layout({
        title: 'Edit Gallery Event', authed: true,
        body: `<h1>Edit Gallery Event</h1><div class="card">${renderForm({
          fields: EDIT_GALLERY_EVENT_FIELDS, row, action: `/admin/gallery/${req.params.id}/edit`, submitLabel: 'Save',
        })}</div>`,
      }));
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/edit', upload.single('photo_file'), async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      await sql(
        `UPDATE gallery_events SET sort_order = $1, title = $2, year = $3, category = $4, venue = $5, date = $6 WHERE id = $7`,
        [order, req.body.title || '', req.body.year || '', req.body.category || '', req.body.venue || '', req.body.date || '', req.params.id]
      );
      
      if (req.file) {
        const b64 = req.file.buffer.toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${b64}`;
        await sql(
          `INSERT INTO gallery_photos (event_id, sort_order, src, caption) VALUES ($1, 0, $2, $3)`,
          [req.params.id, dataUri, req.body.photo_caption || '']
        );
      }
      
      res.redirect('/admin/gallery');
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/delete', async (req, res, next) => {
    try {
      const sql = getSql();
      await sql(`DELETE FROM gallery_events WHERE id = $1`, [req.params.id]);
      res.redirect('/admin/gallery');
    } catch (err) { next(err); }
  });

  app.post('/admin/gallery/:id/reorder', async (req, res, next) => {
    try {
      const sql = getSql();
      const order = Number(req.body.order) || 0;
      await sql(`UPDATE gallery_events SET sort_order = $1 WHERE id = $2`, [order, req.params.id]);
      res.redirect('/admin/gallery');
    } catch (err) { next(err); }
  });

  // ─────────────────────────────────────────────────────────────────────
  app.use((req, res) => res.status(404).json({ detail: 'Not found.' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    if (req.path.startsWith('/api/')) {
      return res.status(500).json({ detail: 'Server error.' });
    }
    res.status(500).send(layout({
      title: 'Error', authed: auth.isAuthenticated(req),
      body: `<h1>Something went wrong</h1><p class="muted">${esc(err.message)}</p>`,
    }));
  });

  return app;
}

function extractValues(fields, body) {
  const out = {};
  for (const f of fields) {
    if (f.type === 'checkbox') {
      out[f.key] = body[f.key] === 'on';
    } else {
      out[f.key] = body[f.key] || '';
    }
  }
  return out;
}

const PHOTO_FIELDS = [
  { key: 'src', label: 'Image URL/Path (Overrides upload)', type: 'text' },
  { key: 'photo_file', label: 'Upload Photo (leaves existing if empty)', type: 'file' },
  { key: 'caption', label: 'Caption', type: 'text' },
];

const GALLERY_EVENT_FIELDS = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'year', label: 'Year', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'venue', label: 'Venue', type: 'text' },
  { key: 'date', label: 'Date', type: 'text' },
];

const SETTINGS_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'title', label: 'Headline / Title', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'avatar_file', label: 'Browse / Upload Profile Avatar Photo (JPG, PNG, WebP)', type: 'file' },
  { key: 'avatar', label: 'Or Avatar Image URL (If not browsing a file)', type: 'text' },
  { key: 'hero_status_text', label: 'Hero Avatar Status Button Text (e.g. Open to research)', type: 'text' },
  { key: 'objective', label: 'About Me Bio / Objective (Short summary for CV / Profile cards)', type: 'textarea' },
  { key: 'stat_publications', label: 'Stat: Publications', type: 'number' },
  { key: 'stat_projects', label: 'Stat: Projects', type: 'number' },
  { key: 'stat_awards', label: 'Stat: Awards', type: 'number' },
  { key: 'stat_certifications', label: 'Stat: Certifications', type: 'number' },
  { key: 'social_github', label: 'GitHub URL', type: 'text' },
  { key: 'social_linkedin', label: 'LinkedIn URL', type: 'text' },
  { key: 'social_researchgate', label: 'ResearchGate URL', type: 'text' },
  { key: 'social_scholar', label: 'Google Scholar URL', type: 'text' },
  { key: 'social_orcid', label: 'ORCID URL', type: 'text' },
  { key: 'skills_languages', label: 'Skills: Languages (comma separated)', type: 'text' },
  { key: 'skills_frameworks', label: 'Skills: Frameworks (comma separated)', type: 'text' },
  { key: 'skills_tools', label: 'Skills: Tools (comma separated)', type: 'text' },
  { key: 'skills_research_methods', label: 'Skills: Research Methods (comma separated)', type: 'text' },
  { key: 'father_name', label: "Father's Name", type: 'text' },
  { key: 'mother_name', label: "Mother's Name", type: 'text' },
  { key: 'dob', label: 'Date of Birth', type: 'text' },
  { key: 'religion', label: 'Religion', type: 'text' },
  { key: 'nid', label: 'NID', type: 'text' },
  { key: 'marital_status', label: 'Marital Status', type: 'text' },
  { key: 'blood_group', label: 'Blood Group', type: 'text' },
  { key: 'nationality', label: 'Nationality', type: 'text' },
  { key: 'address', label: 'Address', type: 'textarea' },
  { key: 'teaching_philosophy', label: 'Teaching Philosophy', type: 'textarea' },
  { key: 'teaching_mentoring_text', label: 'Mentoring Text', type: 'textarea' },
  { key: 'footer_text', label: 'Footer Text', type: 'text' },
  { key: 'cv_last_updated', label: 'CV Last Updated', type: 'text' },
  { key: 'cv_download_url', label: 'CV Download URL', type: 'text' },
];

module.exports = { buildApp };
