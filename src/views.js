function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STYLE = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         margin: 0; background: #f4f5f7; color: #1c1e21; }
  header.topbar { background: #14171c; color: #fff; padding: 14px 24px; display: flex;
                  align-items: center; justify-content: space-between; }
  header.topbar a { color: #fff; text-decoration: none; font-weight: 600; }
  header.topbar nav a { color: #c7cad1; margin-left: 16px; font-weight: 400; font-size: 14px; }
  main { max-width: 960px; margin: 32px auto; padding: 0 20px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 18px; margin: 0 0 16px; }
  .card { background: #fff; border: 1px solid #e2e4e9; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 14px; vertical-align: top; }
  th { color: #6b7280; font-weight: 600; font-size: 12px; text-transform: uppercase; }
  a.btn, button.btn { display: inline-block; background: #2563eb; color: #fff; border: none;
        padding: 8px 14px; border-radius: 6px; text-decoration: none; font-size: 14px; cursor: pointer; }
  a.btn.secondary, button.btn.secondary { background: #6b7280; }
  a.btn.danger, button.btn.danger { background: #dc2626; }
  a.link { color: #2563eb; text-decoration: none; font-size: 14px; margin-right: 12px; }
  .grid-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .grid-links a { display: block; background: #fff; border: 1px solid #e2e4e9; border-radius: 8px;
        padding: 16px; text-decoration: none; color: #1c1e21; font-weight: 600; }
  .grid-links a span { display: block; font-weight: 400; color: #6b7280; font-size: 13px; margin-top: 4px; }
  label { display: block; font-weight: 600; font-size: 13px; margin: 14px 0 6px; }
  input[type=text], input[type=number], input[type=password], textarea, select {
        width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; font-family: inherit; }
  textarea { min-height: 100px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .checkbox-row input { width: auto; }
  .actions { margin-top: 20px; display: flex; gap: 10px; }
  .flash { background: #fef3c7; border: 1px solid #fde68a; padding: 10px 14px; border-radius: 6px; margin-bottom: 16px; font-size: 14px; }
  .muted { color: #6b7280; font-size: 13px; }
  form.inline { display: inline; }
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
  ${authed ? `<nav><a href="/admin">Dashboard</a><a href="/admin/settings">Settings</a><a href="/admin/gallery">Gallery</a><form class="inline" method="post" action="/admin/logout"><button class="btn secondary" style="margin-left:16px;">Log out</button></form></nav>` : ''}
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
      <a class="btn" href="/admin/${esc(resourceKey)}/new">+ Add</a>
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
