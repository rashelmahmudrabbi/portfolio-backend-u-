function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&display=swap');
  
  :root {
    --bg: #F7F9FC;
    --bg-alt: #EEF3F8;
    --card-bg: #FFFFFF;
    --surface-2: #F3F6FA;
    --border: rgba(15, 23, 42, 0.12);
    --text-main: #0F172A;
    --text-muted: #475569;
    --text-faint: #7C8A9A;
    --primary: #2F6FED;
    --primary-hover: #1A54D0;
    --primary-tint: #E7F0FF;
    --gold: #2F6FED;
    --gold-soft: #6B9AF5;
    --danger: #EF4444;
    --danger-hover: #DC2626;
    --success: #10B981;
    --font: 'DM Sans', system-ui, -apple-system, sans-serif;
    --shadow: 0 12px 32px rgba(11, 31, 58, 0.06);
    --radius: 12px;
  }
  
  [data-theme="dark"] {
    --bg: #151C28;
    --bg-alt: #1B2534;
    --card-bg: #202C3D;
    --surface-2: #263449;
    --border: rgba(255, 255, 255, 0.12);
    --text-main: #F1F5F9;
    --text-muted: #C0CBD8;
    --text-faint: #8E9CAE;
    --primary: #2F6FED;
    --primary-hover: #4B88FF;
    --primary-tint: rgba(47, 111, 237, 0.15);
    --shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    font-family: var(--font); 
    background: var(--bg); 
    color: var(--text-main);
    min-height: 100vh;
    line-height: 1.5;
    transition: background 0.3s ease, color 0.3s ease;
  }
  
  /* Topbar Frosted Header */
  header.topbar { 
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    padding: 0 32px; 
    height: 68px;
    display: flex;
    align-items: center; 
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }
  .brand-logo {
    color: var(--text-main);
    text-decoration: none;
    font-weight: 700;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: #0B1F3A;
    border: 2px solid var(--gold);
    color: #fff;
    border-radius: 8px;
    font-weight: 700;
    font-size: 14px;
    font-family: 'Crimson Pro', serif;
  }
  [data-theme="dark"] .brand-mark {
    background: #0B1F3A;
    border-color: #78A9FF;
    color: #78A9FF;
  }
  
  header.topbar nav { display: flex; align-items: center; gap: 20px; }
  header.topbar nav a { 
    color: var(--text-muted); 
    font-weight: 600; 
    font-size: 14px; 
    text-decoration: none;
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  header.topbar nav a:hover { color: var(--primary); }
  
  /* Theme Toggle Button */
  .theme-toggle-btn {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-main);
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
  }
  .theme-toggle-btn:hover {
    background: var(--primary-tint);
    border-color: var(--primary);
    color: var(--primary);
  }
  
  main { max-width: 1100px; margin: 40px auto; padding: 0 24px; animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  h1 { font-size: 2.2rem; margin-bottom: 8px; font-weight: 700; letter-spacing: -0.03em; color: var(--text-main); }
  h2 { font-size: 1.3rem; margin-bottom: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); }
  
  /* Clean Cards */
  .card { 
    background: var(--card-bg);
    border: 1px solid var(--border); 
    border-radius: var(--radius); 
    padding: 28px 32px; 
    margin-bottom: 28px; 
    box-shadow: var(--shadow);
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
  }
  .card:hover {
    box-shadow: 0 14px 36px rgba(0,0,0,0.1);
  }
  
  /* Tables */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  th, td { text-align: left; padding: 14px 14px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  th { color: var(--text-faint); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom-width: 2px; }
  tbody tr { transition: all 0.2s ease; }
  tbody tr:hover { background: var(--surface-2); }
  
  /* Buttons */
  a.btn, button.btn { 
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: var(--primary); color: #fff !important; border: 1px solid var(--primary);
    padding: 8px 18px; border-radius: 8px; text-decoration: none; 
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease;
  }
  a.btn:hover, button.btn:hover { background: var(--primary-hover); border-color: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(47,111,237,0.3); }
  a.btn:active, button.btn:active { transform: scale(0.98); }
  
  a.btn.secondary, button.btn.secondary { background: var(--card-bg); color: var(--text-main) !important; border: 1px solid var(--border); }
  a.btn.secondary:hover, button.btn.secondary:hover { background: var(--surface-2); border-color: var(--text-main); color: var(--text-main) !important; }
  
  a.btn.danger, button.btn.danger { background: var(--card-bg); color: var(--danger) !important; border: 1px solid var(--border); }
  a.btn.danger:hover, button.btn.danger:hover { background: var(--danger); border-color: var(--danger); color: #fff !important; box-shadow: 0 4px 12px rgba(239,68,68,0.25); }
  
  /* Links */
  a.link { color: var(--primary); text-decoration: none; font-size: 14px; margin-right: 14px; font-weight: 600; transition: color 0.2s; }
  a.link:hover { text-decoration: underline; color: var(--primary-hover); }
  button.link { background: none; border: none; padding: 0; cursor: pointer; color: var(--danger); font-size: 14px; font-weight: 600; }
  button.link:hover { text-decoration: underline; color: var(--danger-hover); }
  
  /* Grid Links (Dashboard) */
  .grid-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .grid-links a { 
    display: flex; flex-direction: column; justify-content: center;
    background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 22px 24px; text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 16px;
    transition: all 0.25s ease;
    box-shadow: var(--shadow);
  }
  .grid-links a:hover { 
    border-color: var(--primary); 
    box-shadow: 0 12px 30px rgba(47,111,237,0.12); 
    transform: translateY(-3px);
  }
  .grid-links a span { display: block; font-weight: 400; color: var(--text-muted); font-size: 13.5px; margin-top: 6px; }
  
  /* Forms */
  label { display: block; font-weight: 600; font-size: 14px; margin: 20px 0 8px; color: var(--text-main); }
  input[type=text], input[type=number], input[type=password], textarea, select {
    width: 100%; padding: 10px 14px; background: var(--card-bg); border: 1px solid var(--border); 
    border-radius: 8px; font-size: 14px; font-family: inherit; color: var(--text-main);
    transition: border 0.15s ease, box-shadow 0.15s ease;
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-tint); }
  textarea { min-height: 140px; resize: vertical; line-height: 1.5; }
  
  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 20px; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }
  .checkbox-row label { margin: 0; cursor: pointer; color: var(--text-main); font-size: 14px; }
  
  .actions { margin-top: 28px; display: flex; gap: 14px; padding-top: 20px; border-top: 1px solid var(--border); }
  
  /* Alerts */
  .flash { 
    background: var(--primary); color: #fff;
    padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 16px rgba(47,111,237,0.25);
  }
  
  .muted { color: var(--text-muted); font-size: 14px; }
  form.inline { display: inline; }
  
  @keyframes slideUpFade { 
    from { opacity: 0; transform: translateY(16px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  @keyframes slideDown { 
    from { transform: translateY(-10px); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
`;

function layout({ title, authed, body, flash }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · Portfolio Admin</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<style>${STYLE}</style>
<script>
  (function() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  })();
  function toggleAdminTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    const icon = document.getElementById('adminThemeIcon');
    if (icon) icon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  }
</script>
</head>
<body>
<header class="topbar">
  <a href="/admin" class="brand-logo">
    <span class="brand-mark">R.</span>
    <span>Rashel Mahmud Rabbi <span style="font-size:12px; font-weight:500; opacity:0.6; margin-left:4px;">· Admin</span></span>
  </a>
  <div style="display:flex; align-items:center; gap:16px;">
    ${authed ? `<nav>
      <a href="/admin"><i class="bi bi-grid-fill"></i> Dashboard</a>
      <a href="/admin/settings"><i class="bi bi-gear-fill"></i> Settings</a>
      <a href="/admin/gallery"><i class="bi bi-images"></i> Gallery</a>
      <a href="/admin/cv"><i class="bi bi-file-earmark-person-fill"></i> Manage CV</a>
      <a href="/admin/change-password"><i class="bi bi-key-fill"></i> Password</a>
      <a href="https://rashelmahmudrabbi.github.io/" target="_blank" style="color:var(--gold-soft);"><i class="bi bi-box-arrow-up-right"></i> Live Site</a>
      <form class="inline" method="post" action="/admin/logout">
        <button class="btn secondary" style="padding:6px 12px; font-size:13px;"><i class="bi bi-box-arrow-right"></i> Log out</button>
      </form>
    </nav>` : ''}
    <button class="theme-toggle-btn" onclick="toggleAdminTheme()" title="Toggle Dark/Light Mode">
      <i id="adminThemeIcon" class="bi bi-moon-stars-fill"></i>
    </button>
  </div>
</header>
<main>
  ${flash ? `<div class="flash"><i class="bi bi-info-circle-fill"></i> ${esc(flash)}</div>` : ''}
  ${body}
</main>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = document.getElementById('adminThemeIcon');
    if (icon) icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  });
</script>
</body>
</html>`;
}

function fieldInput(field, value) {
  const v = value === undefined || value === null ? '' : value;
  if (field.type === 'textarea') {
    return `<textarea name="${esc(field.key)}">${esc(v)}</textarea>`;
  }
  if (field.type === 'checkbox') {
    return `<div class="checkbox-row"><input type="checkbox" id="${esc(field.key)}" name="${esc(field.key)}" ${v ? 'checked' : ''} /><label style="margin:0;" for="${esc(field.key)}">${esc(field.label)}</label></div>`;
  }
  if (field.type === 'select') {
    const opts = field.options
      .map((o) => `<option value="${esc(o)}" ${o === v ? 'selected' : ''}>${esc(o)}</option>`)
      .join('');
    return `<select name="${esc(field.key)}">${opts}</select>`;
  }
  if (field.type === 'number') {
    return `<input type="number" name="${esc(field.key)}" value="${esc(v)}" />`;
  }
  if (field.type === 'file') {
    return `<input type="file" name="${esc(field.key)}" accept="image/*" />`;
  }
  return `<input type="text" name="${esc(field.key)}" value="${esc(v)}" />`;
}

function renderForm({ fields, row = {}, action, submitLabel, includeOrder = true, extraHidden = '' }) {
  const rows = fields
    .map((f) => {
      if (f.type === 'checkbox') return fieldInput(f, row[f.key]);
      return `<label for="${esc(f.key)}">${esc(f.label)}</label>${fieldInput(f, row[f.key])}`;
    })
    .join('\n');
  const orderRow = includeOrder
    ? `<label for="order">Sort order (lower shows first)</label><input type="number" name="order" value="${esc(row.sort_order ?? row.order ?? 0)}" />`
    : '';
  const hasFile = fields.some((f) => f.type === 'file');
  const enctype = hasFile ? 'enctype="multipart/form-data"' : '';
  return `<form method="post" action="${esc(action)}" ${enctype}>
    ${extraHidden}
    ${rows}
    ${orderRow}
    <div class="actions">
      <button class="btn" type="submit">${esc(submitLabel)}</button>
      <a class="btn secondary" href="javascript:history.back()">Cancel</a>
    </div>
  </form>`;
}

function renderTable({ resourceKey, label, fields, rows, extraCol }) {
  const cols = fields.slice(0, 4); // keep the list view compact
  const head = cols.map((f) => `<th>${esc(f.label)}</th>`).join('');
  const body = rows
    .map((r) => {
      const cells = cols
        .map((f) => `<td>${esc(truncate(r[f.key], 80))}</td>`)
        .join('');
      return `<tr>
        ${cells}
        <td>${r.sort_order ?? 0}</td>
        <td style="white-space:nowrap; text-align: right;">
          ${extraCol ? extraCol(r) : ''}
          <a class="link" href="/admin/${esc(resourceKey)}/${r.id}/edit">Edit</a>
          <form class="inline" method="post" action="/admin/${esc(resourceKey)}/${r.id}/delete" onsubmit="return confirm('Delete this row?');">
            <button class="link" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:0;margin-right:0;">Delete</button>
          </form>
        </td>
      </tr>`;
    })
    .join('');
  return `<div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 14px;">
      <h2 style="margin:0;">${esc(label)}</h2>
      <div style="display:flex; gap:8px; align-items:center;">
        <a class="link" href="/api/${esc(resourceKey)}" target="_blank" style="font-size:12px;">View as JSON</a>
        <a class="btn" href="/admin/${esc(resourceKey)}/new">+ Add</a>
      </div>
    </div>
    <table>
      <thead><tr>${head}<th>Order</th><th></th></tr></thead>
      <tbody>${body || `<tr><td colspan="${cols.length + 2}" class="muted">No rows yet.</td></tr>`}</tbody>
    </table>
  </div>`;
}

function truncate(v, n) {
  const s = v === null || v === undefined ? '' : String(v);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function renderCvAdmin(currentUrl) {
  return `<div class="card">
    <h2>Manage CV</h2>
    <p class="muted" style="margin-bottom: 24px;">Upload your CV as a PDF file. This will be securely stored and served to visitors when they click "Download CV" on the website.
    <br><br>
    Currently active CV Link/Data: <br><code style="word-break: break-all; background: #eee; padding: 4px; border-radius: 4px; display: inline-block; margin-top: 4px;">${esc(currentUrl ? truncate(currentUrl, 100) : 'None')}</code>
    </p>
    <form method="post" action="/admin/cv" enctype="multipart/form-data">
      <div style="margin-bottom: 16px;">
        <label style="display:block; font-weight: 500; margin-bottom: 8px;">Upload New CV (PDF)</label>
        <input type="file" name="cv_file" accept="application/pdf" style="display:block; padding: 8px; border: 1px solid var(--border); border-radius: 6px; width: 100%;" required />
      </div>
      <button class="btn" type="submit">Upload CV</button>
    </form>
  </div>`;
}

module.exports = { esc, layout, renderForm, renderTable, fieldInput, renderCvAdmin };
