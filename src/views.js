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
    --bg: #fafafa;
    --card-bg: #ffffff;
    --border: #eaeaea;
    --text-main: #111111;
    --text-muted: #666666;
    --primary: #000000;
    --primary-hover: #333333;
    --danger: #e00;
    --danger-hover: #c00;
    --font: 'Inter', system-ui, -apple-system, sans-serif;
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    font-family: var(--font); 
    background: var(--bg); 
    color: var(--text-main);
    min-height: 100vh;
    line-height: 1.5;
  }
  
  /* Topbar Vercel-style */
  header.topbar { 
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    padding: 0 32px; 
    height: 64px;
    display: flex;
    align-items: center; 
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  header.topbar > a { color: var(--text-main); text-decoration: none; font-weight: 600; font-size: 16px; display: flex; align-items: center; gap: 10px;}
  header.topbar > a::before {
     content: ''; display: inline-block; width: 20px; height: 20px; background: var(--text-main); border-radius: 4px;
  }
  header.topbar nav { display: flex; align-items: center; gap: 24px; }
  header.topbar nav a { 
    color: var(--text-muted); 
    font-weight: 500; 
    font-size: 14px; 
    text-decoration: none;
    transition: color 0.2s ease;
  }
  header.topbar nav a:hover { color: var(--text-main); }
  
  main { max-width: 1040px; margin: 48px auto; padding: 0 24px; animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  
  h1 { font-size: 32px; margin-bottom: 12px; font-weight: 700; letter-spacing: -0.04em; }
  h2 { font-size: 20px; margin-bottom: 24px; font-weight: 600; letter-spacing: -0.02em; }
  
  /* Clean Cards */
  .card { 
    background: var(--card-bg);
    border: 1px solid var(--border); 
    border-radius: 8px; 
    padding: 32px; 
    margin-bottom: 32px; 
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .card:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    transform: translateY(-2px);
  }
  
  /* Tables */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  th, td { text-align: left; padding: 16px 12px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle; }
  th { color: var(--text-muted); font-weight: 500; font-size: 13px; text-transform: capitalize; border-bottom-width: 2px; }
  tbody tr { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
  tbody tr:hover { background: #fdfdfd; transform: translateX(4px); box-shadow: -4px 0 0 var(--text-main); }
  
  /* Buttons */
  a.btn, button.btn { 
    display: inline-flex; align-items: center; justify-content: center;
    background: var(--primary); color: #fff; border: 1px solid var(--primary);
    padding: 8px 16px; border-radius: 6px; text-decoration: none; 
    font-size: 14px; font-weight: 500; cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  a.btn:hover, button.btn:hover { background: var(--primary-hover); border-color: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  a.btn:active, button.btn:active { transform: scale(0.97); }
  
  a.btn.secondary, button.btn.secondary { background: #fff; color: var(--text-main); border: 1px solid var(--border); }
  a.btn.secondary:hover, button.btn.secondary:hover { background: #f9fafb; border-color: var(--text-main); color: var(--text-main); }
  
  a.btn.danger, button.btn.danger { background: #fff; color: var(--danger); border: 1px solid var(--border); }
  a.btn.danger:hover, button.btn.danger:hover { background: var(--danger); border-color: var(--danger); color: #fff; box-shadow: 0 4px 12px rgba(238,0,0,0.2); }
  
  /* Links */
  a.link { color: #0070f3; text-decoration: none; font-size: 14px; margin-right: 16px; font-weight: 500; transition: color 0.2s; }
  a.link:hover { text-decoration: underline; }
  button.link { background: none; border: none; padding: 0; cursor: pointer; color: var(--danger); font-size: 14px; font-weight: 500; }
  button.link:hover { text-decoration: underline; color: var(--danger-hover); }
  
  /* Grid Links (Dashboard) */
  .grid-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .grid-links a { 
    display: flex; flex-direction: column; justify-content: center;
    background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 24px; text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 16px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }
  .grid-links a:hover { 
    border-color: var(--text-main); 
    box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
    transform: translateY(-4px);
  }
  .grid-links a span { display: block; font-weight: 400; color: var(--text-muted); font-size: 14px; margin-top: 8px; }
  
  /* Forms */
  label { display: block; font-weight: 500; font-size: 14px; margin: 24px 0 8px; color: var(--text-main); }
  input[type=text], input[type=number], input[type=password], textarea, select {
    width: 100%; padding: 10px 12px; background: #fff; border: 1px solid var(--border); 
    border-radius: 6px; font-size: 14px; font-family: inherit; color: var(--text-main);
    transition: border 0.15s ease, box-shadow 0.15s ease;
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: #0070f3; box-shadow: 0 0 0 1px #0070f3; }
  textarea { min-height: 140px; resize: vertical; line-height: 1.5; }
  
  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 24px; }
  .checkbox-row input { width: 16px; height: 16px; cursor: pointer; }
  .checkbox-row label { margin: 0; cursor: pointer; color: var(--text-main); font-size: 14px; }
  
  .actions { margin-top: 32px; display: flex; gap: 16px; padding-top: 24px; border-top: 1px solid var(--border); }
  
  /* Alerts */
  .flash { 
    background: #0070f3; color: #fff;
    padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; font-size: 14px; font-weight: 500;
    display: flex; align-items: center; animation: slideDown 0.3s ease-out;
  }
  
  .muted { color: var(--text-muted); font-size: 14px; }
  form.inline { display: inline; }
  
  @keyframes slideUpFade { 
    from { opacity: 0; transform: translateY(20px); } 
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

module.exports = { esc, layout, renderForm, renderTable, fieldInput };
