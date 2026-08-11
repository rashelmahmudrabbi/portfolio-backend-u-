function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  :root {
    --bg: #0f172a;
    --card-bg: rgba(30, 41, 59, 0.7);
    --border: rgba(255, 255, 255, 0.1);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --primary: #3b82f6;
    --primary-hover: #60a5fa;
    --danger: #ef4444;
    --danger-hover: #f87171;
    --accent: #eab308;
    --font: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    font-family: var(--font); 
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
    color: var(--text-main);
    min-height: 100vh;
  }
  
  /* Topbar with Glassmorphism */
  header.topbar { 
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px; 
    display: flex;
    align-items: center; 
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  header.topbar a { color: var(--text-main); text-decoration: none; font-weight: 700; font-size: 18px; letter-spacing: -0.5px; }
  header.topbar nav { display: flex; align-items: center; gap: 20px; }
  header.topbar nav a { 
    color: var(--text-muted); 
    font-weight: 500; 
    font-size: 14px; 
    transition: color 0.2s ease, transform 0.2s ease;
  }
  header.topbar nav a:hover { color: var(--text-main); transform: translateY(-1px); }
  
  main { max-width: 1000px; margin: 40px auto; padding: 0 24px; animation: fadeIn 0.4s ease-out; }
  
  h1 { font-size: 28px; margin-bottom: 8px; font-weight: 700; letter-spacing: -0.5px; }
  h2 { font-size: 20px; margin-bottom: 20px; font-weight: 600; color: var(--text-main); }
  
  /* Glass Cards */
  .card { 
    background: var(--card-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border); 
    border-radius: 12px; 
    padding: 24px; 
    margin-bottom: 24px; 
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.1); }
  
  /* Tables */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  th, td { text-align: left; padding: 14px 16px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  th { color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody tr { transition: background 0.2s; }
  tbody tr:hover { background: rgba(255, 255, 255, 0.03); }
  
  /* Buttons */
  a.btn, button.btn { 
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--primary); color: #fff; border: none;
    padding: 10px 18px; border-radius: 8px; text-decoration: none; 
    font-size: 14px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
  }
  a.btn:hover, button.btn:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 6px 12px -2px rgba(59, 130, 246, 0.3); }
  a.btn:active, button.btn:active { transform: translateY(0); }
  
  a.btn.secondary, button.btn.secondary { background: rgba(255,255,255,0.1); box-shadow: none; border: 1px solid var(--border); }
  a.btn.secondary:hover, button.btn.secondary:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
  
  a.btn.danger, button.btn.danger { background: var(--danger); box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2); }
  a.btn.danger:hover, button.btn.danger:hover { background: var(--danger-hover); box-shadow: 0 6px 12px -2px rgba(239, 68, 68, 0.3); }
  
  /* Links */
  a.link { color: var(--primary-hover); text-decoration: none; font-size: 14px; margin-right: 14px; font-weight: 500; transition: color 0.2s; }
  a.link:hover { color: #fff; }
  button.link:hover { color: #fff !important; }
  
  /* Grid Links */
  .grid-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .grid-links a { 
    display: block; background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px;
    padding: 20px; text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  }
  .grid-links a:hover { 
    transform: translateY(-4px) scale(1.02); 
    border-color: var(--primary); 
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.2); 
    background: rgba(30, 41, 59, 0.9);
  }
  .grid-links a span { display: block; font-weight: 400; color: var(--text-muted); font-size: 13px; margin-top: 6px; }
  
  /* Forms */
  label { display: block; font-weight: 500; font-size: 13px; margin: 18px 0 8px; color: var(--text-muted); }
  input[type=text], input[type=number], input[type=password], textarea, select {
    width: 100%; padding: 12px 14px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); 
    border-radius: 8px; font-size: 15px; font-family: inherit; color: var(--text-main);
    transition: all 0.2s;
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); }
  textarea { min-height: 120px; resize: vertical; }
  
  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }
  .checkbox-row label { margin: 0; cursor: pointer; color: var(--text-main); font-size: 15px; }
  
  .actions { margin-top: 28px; display: flex; gap: 12px; }
  
  /* Alerts */
  .flash { 
    background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399;
    padding: 14px 18px; border-radius: 8px; margin-bottom: 24px; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; animation: slideDown 0.3s ease-out;
  }
  
  .muted { color: var(--text-muted); font-size: 13px; }
  form.inline { display: inline; }
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
`;

function layout({ title, authed, body, flash }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)} · Portfolio Admin</title>
<style>${STYLE}</style>
</head>
<body>
<header class="topbar">
  <a href="/admin">Portfolio Admin</a>
  ${authed ? `<nav><a href="/admin">Dashboard</a><a href="/admin/settings">Settings</a><a href="/admin/gallery">Gallery</a><a href="https://rashelmahmudrabbi.github.io/portfolio-frontend/" target="_blank" style="color:#e8b84b;">↗ Preview Site</a><form class="inline" method="post" action="/admin/logout"><button class="btn secondary" style="margin-left:16px;">Log out</button></form></nav>` : ''}
</header>
<main>
  ${flash ? `<div class="flash">${esc(flash)}</div>` : ''}
  ${body}
</main>
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
  return `<form method="post" action="${esc(action)}">
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
        <td style="white-space:nowrap;">
          <a class="link" href="/admin/${esc(resourceKey)}/${r.id}/edit">Edit</a>
          <form class="inline" method="post" action="/admin/${esc(resourceKey)}/${r.id}/delete" onsubmit="return confirm('Delete this row?');">
            <button class="link" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:0;">Delete</button>
          </form>
          ${extraCol ? extraCol(r) : ''}
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

module.exports = { esc, layout, renderForm, renderTable, fieldInput };
