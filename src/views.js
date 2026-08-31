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
    --bg: #F8FAFC;
    --bg-alt: #F1F5F9;
    --card-bg: #FFFFFF;
    --sidebar-bg: #FFFFFF;
    --sidebar-border: rgba(15, 23, 42, 0.08);
    --sidebar-hover: #F1F5F9;
    --sidebar-active: #2F6FED;
    --sidebar-text: #334155;
    --sidebar-text-muted: #64748B;
    --surface-2: #F1F5F9;
    --border: rgba(15, 23, 42, 0.08);
    --text-main: #0F172A;
    --text-muted: #475569;
    --text-faint: #64748B;
    --primary: #2F6FED;
    --primary-hover: #1A54D0;
    --primary-tint: #E7F0FF;
    --gold: #2F6FED;
    --gold-soft: #6B9AF5;
    --danger: #EF4444;
    --danger-hover: #DC2626;
    --success: #10B981;
    --font: 'DM Sans', system-ui, -apple-system, sans-serif;
    --shadow: 0 4px 20px rgba(11, 31, 58, 0.05);
    --radius: 12px;
  }
  
  [data-theme="dark"] {
    --bg: #0D1522;
    --bg-alt: #131E30;
    --card-bg: #1A263A;
    --sidebar-bg: #101927;
    --sidebar-border: rgba(255, 255, 255, 0.08);
    --sidebar-hover: #1E2D44;
    --sidebar-active: #2F6FED;
    --sidebar-text: #F1F5F9;
    --sidebar-text-muted: #8E9CAE;
    --surface-2: #22324B;
    --border: rgba(255, 255, 255, 0.08);
    --text-main: #F1F5F9;
    --text-muted: #C0CBD8;
    --text-faint: #8E9CAE;
    --primary: #2F6FED;
    --primary-hover: #4B88FF;
    --primary-tint: rgba(47, 111, 237, 0.15);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  }
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    font-family: var(--font); 
    background: var(--bg); 
    color: var(--text-main);
    min-height: 100vh;
    line-height: 1.5;
    transition: background 0.3s ease, color 0.3s ease;
    display: flex;
  }
  
  /* SIDEBAR */
  aside.admin-sidebar {
    width: 260px;
    background: var(--sidebar-bg);
    color: var(--sidebar-text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 200;
    border-right: 1px solid var(--sidebar-border);
    transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
  }
  
  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid var(--sidebar-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .sidebar-brand {
    color: var(--text-main);
    text-decoration: none;
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: color 0.2s ease;
  }
  .sidebar-brand:hover { color: var(--primary); }
  
  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .sidebar-category {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--sidebar-text-muted);
    padding: 12px 12px 6px;
    margin-top: 6px;
  }
  
  .sidebar-nav a {
    color: var(--sidebar-text);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    padding: 9px 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.15s ease;
  }
  .sidebar-nav a i {
    font-size: 16px;
    color: var(--sidebar-text-muted);
    width: 20px;
    text-align: center;
    transition: color 0.15s ease;
  }
  .sidebar-nav a:hover {
    background: var(--sidebar-hover);
    color: var(--primary);
  }
  .sidebar-nav a:hover i {
    color: var(--primary);
  }
  .sidebar-nav a.active {
    background: var(--sidebar-active);
    color: #fff !important;
    font-weight: 600;
  }
  .sidebar-nav a.active i {
    color: #fff !important;
  }
  
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--sidebar-border);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  /* MAIN CONTENT AREA */
  .admin-main-wrap {
    flex: 1;
    margin-left: 260px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: calc(100% - 260px);
  }
  
  /* TOP NAVBAR */
  header.admin-topbar {
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
    backdrop-filter: blur(12px);
  }
  
  .topbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .mobile-toggle-btn {
    display: none;
    background: none;
    border: none;
    color: var(--text-main);
    font-size: 20px;
    cursor: pointer;
  }
  
  .theme-toggle-btn {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-main);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 15px;
    transition: all 0.2s ease;
  }
  .theme-toggle-btn:hover {
    background: var(--primary-tint);
    border-color: var(--primary);
    color: var(--primary);
  }
  
  main {
    flex: 1;
    max-width: 1080px;
    width: 100%;
    margin: 36px auto;
    padding: 0 32px;
    animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  
  h1 { font-size: 2rem; margin-bottom: 6px; font-weight: 700; letter-spacing: -0.03em; color: var(--text-main); }
  h2 { font-size: 1.25rem; margin-bottom: 18px; font-weight: 700; letter-spacing: -0.02em; color: var(--text-main); }
  
  /* Cards */
  .card { 
    background: var(--card-bg);
    border: 1px solid var(--border); 
    border-radius: var(--radius); 
    padding: 24px 28px; 
    margin-bottom: 24px; 
    box-shadow: var(--shadow);
    transition: box-shadow 0.25s ease, transform 0.25s ease;
  }
  
  /* Tables */
  table { width: 100%; border-collapse: separate; border-spacing: 0; }
  th, td { text-align: left; padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13.5px; vertical-align: middle; }
  th { color: var(--text-faint); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom-width: 2px; }
  tbody tr:hover { background: var(--surface-2); }
  
  /* Buttons */
  a.btn, button.btn { 
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    background: var(--primary); color: #fff !important; border: 1px solid var(--primary);
    padding: 8px 16px; border-radius: 8px; text-decoration: none; 
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: all 0.2s ease;
  }
  a.btn:hover, button.btn:hover { background: var(--primary-hover); border-color: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(47,111,237,0.3); }
  a.btn:active, button.btn:active { transform: scale(0.98); }
  
  a.btn.secondary, button.btn.secondary { background: var(--card-bg); color: var(--text-main) !important; border: 1px solid var(--border); }
  a.btn.secondary:hover, button.btn.secondary:hover { background: var(--surface-2); border-color: var(--text-main); }
  
  a.btn.danger, button.btn.danger { background: var(--card-bg); color: var(--danger) !important; border: 1px solid var(--border); }
  a.btn.danger:hover, button.btn.danger:hover { background: var(--danger); border-color: var(--danger); color: #fff !important; }
  
  /* Links */
  a.link { color: var(--primary); text-decoration: none; font-size: 13.5px; margin-right: 14px; font-weight: 600; }
  a.link:hover { text-decoration: underline; color: var(--primary-hover); }
  
  /* Grid Links (Dashboard) */
  .grid-links { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px; }
  .grid-links a { 
    display: flex; flex-direction: column; justify-content: center;
    background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 20px 22px; text-decoration: none; color: var(--text-main); font-weight: 600; font-size: 15px;
    transition: all 0.25s ease;
    box-shadow: var(--shadow);
  }
  .grid-links a:hover { 
    border-color: var(--primary); 
    box-shadow: 0 10px 28px rgba(47,111,237,0.12); 
    transform: translateY(-3px);
  }
  .grid-links a span { display: block; font-weight: 400; color: var(--text-muted); font-size: 13px; margin-top: 6px; }
  
  /* Forms */
  label { display: block; font-weight: 600; font-size: 13.5px; margin: 18px 0 6px; color: var(--text-main); }
  input[type=text], input[type=number], input[type=password], textarea, select {
    width: 100%; padding: 10px 12px; background: var(--card-bg); border: 1px solid var(--border); 
    border-radius: 8px; font-size: 13.5px; font-family: inherit; color: var(--text-main);
  }
  input:focus, textarea:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-tint); }
  textarea { min-height: 120px; resize: vertical; line-height: 1.5; }
  
  .checkbox-row { display: flex; align-items: center; gap: 10px; margin-top: 18px; }
  .checkbox-row input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary); }
  .checkbox-row label { margin: 0; cursor: pointer; color: var(--text-main); font-size: 13.5px; }
  
  .actions { margin-top: 24px; display: flex; gap: 12px; padding-top: 18px; border-top: 1px solid var(--border); }
  
  .flash { 
    background: var(--primary); color: #fff;
    padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13.5px; font-weight: 600;
    display: flex; align-items: center; gap: 8px; animation: slideDown 0.3s ease-out;
  }
  
  .muted { color: var(--text-muted); font-size: 13.5px; }
  form.inline { display: inline; }
  
  /* Visual WYSIWYG Editor & Toolbar */
  .wysiwyg-wrapper {
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--card-bg);
    overflow: hidden;
    margin-top: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }
  .wysiwyg-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    user-select: none;
  }
  .toolbar-group {
    display: flex;
    gap: 2px;
    align-items: center;
  }
  .toolbar-divider {
    width: 1px;
    height: 18px;
    background: var(--border);
    margin: 0 4px;
  }
  .toolbar-btn {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 4px 7px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-main);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    transition: all 0.15s ease;
    user-select: none;
  }
  .toolbar-btn:hover {
    background: var(--sidebar-hover);
    border-color: var(--border);
    color: var(--primary);
  }
  .toolbar-btn:active {
    background: var(--primary-tint);
  }
  .toolbar-btn.mode-btn {
    font-size: 11.5px;
    padding: 2px 8px;
    border: 1px solid var(--border);
    background: var(--card-bg);
    border-radius: 5px;
    font-weight: 600;
    height: 25px;
  }
  .toolbar-btn.mode-btn.active {
    background: var(--primary);
    color: #ffffff;
    border-color: var(--primary);
  }
  .wysiwyg-visual-editor {
    min-height: 180px;
    max-height: 540px;
    overflow-y: auto;
    padding: 14px 16px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-main);
    background: var(--card-bg);
    outline: none;
  }
  .wysiwyg-visual-editor:focus {
    box-shadow: inset 0 0 0 2px var(--primary-tint);
  }
  .wysiwyg-visual-editor p { margin-bottom: 0.75rem; }
  .wysiwyg-visual-editor p:last-child { margin-bottom: 0; }
  .wysiwyg-visual-editor ul, .wysiwyg-visual-editor ol { margin: 0.4rem 0 0.8rem 1.4rem; padding-left: 0.5rem; }
  .wysiwyg-visual-editor li { margin-bottom: 0.25rem; }
  .wysiwyg-visual-editor strong, .wysiwyg-visual-editor b { font-weight: 700; color: var(--primary); }
  .wysiwyg-visual-editor em, .wysiwyg-visual-editor i { font-style: italic; }
  .wysiwyg-visual-editor u { text-decoration: underline; }
  
  .wysiwyg-code-editor {
    width: 100% !important;
    min-height: 180px;
    border: none !important;
    border-radius: 0 !important;
    padding: 14px 16px !important;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.5;
    background: var(--card-bg) !important;
    color: var(--text-main);
    resize: vertical;
    outline: none !important;
    box-shadow: none !important;
  }
  .wysiwyg-preview-pane {
    min-height: 180px;
    padding: 14px 16px;
    background: var(--surface-2);
    color: var(--text-main);
    font-size: 14px;
    line-height: 1.65;
    border-top: 1px solid var(--border);
  }
  .wysiwyg-preview-pane p { margin-bottom: 0.75rem; }
  .wysiwyg-preview-pane p:last-child { margin-bottom: 0; }
  .wysiwyg-preview-pane ul, .wysiwyg-preview-pane ol { margin: 0.4rem 0 0.8rem 1.4rem; padding-left: 0.5rem; }
  .wysiwyg-preview-pane li { margin-bottom: 0.25rem; }
  .wysiwyg-preview-pane strong, .wysiwyg-preview-pane b { font-weight: 700; color: var(--primary); }
  .wysiwyg-preview-pane em, .wysiwyg-preview-pane i { font-style: italic; }
  .wysiwyg-preview-pane u { text-decoration: underline; }
  
  @media(max-width: 900px) {
    aside.admin-sidebar {
      transform: translateX(-100%);
    }
    aside.admin-sidebar.open {
      transform: translateX(0);
    }
    .admin-main-wrap {
      margin-left: 0;
      width: 100%;
    }
    .mobile-toggle-btn {
      display: inline-block;
    }
    main {
      padding: 0 16px;
    }
  }
  
  @keyframes slideUpFade { 
    from { opacity: 0; transform: translateY(14px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
  @keyframes slideDown { 
    from { transform: translateY(-10px); opacity: 0; } 
    to { transform: translateY(0); opacity: 1; } 
  }
`;

function layout({ title, authed, body, flash }) {
  const currentPath = '';
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
  function toggleSidebar() {
    const sb = document.querySelector('aside.admin-sidebar');
    if (sb) sb.classList.toggle('open');
  }

  function execCmd(id, cmd, val) {
    const visual = document.getElementById('visual_' + id);
    if (!visual) return;
    visual.focus();
    document.execCommand(cmd, false, val || null);
    syncWysiwygContent(id, 'visual');
  }

  function execFormatBlock(id, tag) {
    const visual = document.getElementById('visual_' + id);
    if (!visual) return;
    visual.focus();
    document.execCommand('formatBlock', false, '<' + tag + '>');
    syncWysiwygContent(id, 'visual');
  }

  function execCreateLink(id) {
    const visual = document.getElementById('visual_' + id);
    if (!visual) return;
    visual.focus();
    const url = prompt('Enter URL (e.g. https://...):', 'https://');
    if (url) {
      document.execCommand('createLink', false, url);
      syncWysiwygContent(id, 'visual');
    }
  }

  function syncWysiwygContent(id, fromMode) {
    const visual = document.getElementById('visual_' + id);
    const code = document.getElementById('code_' + id);
    const preview = document.getElementById('preview_' + id);
    const hidden = document.getElementById(id);
    if (!visual || !code || !hidden) return;

    let html = '';
    if (fromMode === 'visual') {
      html = visual.innerHTML;
      code.value = html;
    } else if (fromMode === 'code') {
      html = code.value;
      visual.innerHTML = html;
    }
    hidden.value = html;
    if (preview) {
      preview.innerHTML = html || '<p class="muted"><i>(Empty content)</i></p>';
    }
  }

  function switchWysiwygMode(id, targetMode) {
    const visual = document.getElementById('visual_' + id);
    const code = document.getElementById('code_' + id);
    const preview = document.getElementById('preview_' + id);
    const btnVisual = document.getElementById('btn_visual_' + id);
    const btnCode = document.getElementById('btn_code_' + id);
    const btnPreview = document.getElementById('btn_preview_' + id);
    if (!visual || !code || !preview) return;

    if (visual.style.display !== 'none') {
      syncWysiwygContent(id, 'visual');
    } else if (code.style.display !== 'none') {
      syncWysiwygContent(id, 'code');
    }

    visual.style.display = 'none';
    code.style.display = 'none';
    preview.style.display = 'none';
    if (btnVisual) btnVisual.classList.remove('active');
    if (btnCode) btnCode.classList.remove('active');
    if (btnPreview) btnPreview.classList.remove('active');

    if (targetMode === 'visual') {
      visual.style.display = 'block';
      visual.focus();
      if (btnVisual) btnVisual.classList.add('active');
    } else if (targetMode === 'code') {
      code.style.display = 'block';
      code.focus();
      if (btnCode) btnCode.classList.add('active');
    } else if (targetMode === 'preview') {
      preview.innerHTML = visual.innerHTML || '<p class="muted"><i>(Empty content)</i></p>';
      preview.style.display = 'block';
      if (btnPreview) btnPreview.classList.add('active');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', async (e) => {
        const fileInputs = Array.from(form.querySelectorAll('input[type="file"]'));
        let needsCompression = false;
        
        for (const input of fileInputs) {
          if (input.files && input.files.length > 0) {
            const file = input.files[0];
            if (file.type.startsWith('image/') && file.size > 1.5 * 1024 * 1024) {
              needsCompression = true;
            }
          }
        }
        
        if (!needsCompression || form.dataset.compressed === 'true') return;
        
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const oldText = submitBtn ? submitBtn.innerText : 'Save';
        if (submitBtn) { submitBtn.innerText = 'Compressing...'; submitBtn.disabled = true; }
        
        try {
          for (const input of fileInputs) {
            if (input.files && input.files.length > 0) {
              const file = input.files[0];
              if (file.type.startsWith('image/') && file.size > 1.5 * 1024 * 1024) {
                const dataUrl = await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      let width = img.width; let height = img.height;
                      const maxDim = 1600;
                      if (width > maxDim || height > maxDim) {
                        if (width > height) { height *= maxDim / width; width = maxDim; }
                        else { width *= maxDim / height; height = maxDim; }
                      }
                      canvas.width = width; canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      ctx.drawImage(img, 0, 0, width, height);
                      resolve(canvas.toDataURL('image/jpeg', 0.8));
                    };
                    img.src = ev.target.result;
                  };
                  reader.readAsDataURL(file);
                });
                
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = input.name + '_b64';
                hiddenInput.value = dataUrl;
                form.appendChild(hiddenInput);
                
                // Remove name so the heavy file is NOT uploaded
                input.removeAttribute('name');
              }
            }
          }
          form.dataset.compressed = 'true';
          form.submit();
        } catch (err) {
          console.error(err);
          if (submitBtn) { submitBtn.innerText = oldText; submitBtn.disabled = false; }
          alert('Failed to compress image.');
        }
      });
    });
  });
</script>
</head>
<body>
${authed ? `
<aside class="admin-sidebar">
  <div class="sidebar-header">
    <a href="/admin" class="sidebar-brand">
      <i class="bi bi-shield-lock-fill text-primary" style="font-size:20px; color:#78A9FF;"></i>
      <span>Admin Control</span>
    </a>
  </div>
  
  <div class="sidebar-nav">
    <div class="sidebar-category">Overview</div>
    <a href="/admin"><i class="bi bi-grid-fill"></i> Dashboard</a>
    <a href="/admin/about"><i class="bi bi-person-lines-fill"></i> About Section &amp; Pills</a>
    <a href="/admin/spotlights"><i class="bi bi-stars"></i> Spotlight Highlights</a>
    <a href="/admin/settings"><i class="bi bi-gear-fill"></i> Site Settings</a>
    <a href="/admin/cv"><i class="bi bi-file-earmark-person-fill"></i> Manage CV</a>
    
    <div class="sidebar-category">Academic & Research</div>
    <a href="/admin/publications"><i class="bi bi-journal-text"></i> Publications</a>
    <a href="/admin/research-interests"><i class="bi bi-lightbulb-fill"></i> Research Interests</a>
    <a href="/admin/education"><i class="bi bi-mortarboard-fill"></i> Education</a>
    <a href="/admin/experience"><i class="bi bi-briefcase-fill"></i> Experience</a>
    <a href="/admin/references"><i class="bi bi-person-lines-fill"></i> References</a>
    
    <div class="sidebar-category">Portfolio & Media</div>
    <a href="/admin/projects"><i class="bi bi-window-sidebar"></i> Software Projects</a>
    <a href="/admin/research-projects"><i class="bi bi-kanban"></i> Research Projects</a>
    <a href="/admin/gallery"><i class="bi bi-images"></i> Gallery</a>
    <a href="/admin/blog"><i class="bi bi-pencil-square"></i> Blog Posts</a>
    
    <div class="sidebar-category">Recognition & Skills</div>
    <a href="/admin/awards"><i class="bi bi-trophy-fill"></i> Awards</a>
    <a href="/admin/certifications"><i class="bi bi-patch-check-fill"></i> Certifications</a>
    <a href="/admin/activities"><i class="bi bi-activity"></i> Activities</a>
    <a href="/admin/spoken-languages"><i class="bi bi-translate"></i> Spoken Languages</a>

    <div class="sidebar-category">Teaching</div>
    <a href="/admin/teaching-roles"><i class="bi bi-person-badge"></i> Teaching Roles</a>
    <a href="/admin/courses"><i class="bi bi-mortarboard"></i> Courses &amp; Workshops</a>
    <a href="/admin/teaching-areas"><i class="bi bi-book-half"></i> Teaching Areas</a>
  </div>
  
  <div class="sidebar-footer">
    <a href="https://rashelmahmudrabbi.github.io/" target="_blank" class="btn secondary" style="font-size:12.5px; justify-content:flex-start; width:100%;">
      <i class="bi bi-box-arrow-up-right"></i> Live Portfolio
    </a>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
      <a href="/admin/change-password" style="color:var(--sidebar-text-muted); font-size:12px; text-decoration:none;">
        <i class="bi bi-key-fill"></i> Password
      </a>
      <form class="inline" method="post" action="/admin/logout">
        <button style="background:none; border:none; color:#EF4444; font-size:12px; cursor:pointer; font-weight:600;">
          <i class="bi bi-box-arrow-right"></i> Logout
        </button>
      </form>
    </div>
  </div>
</aside>` : ''}

<div class="${authed ? 'admin-main-wrap' : 'w-100'}">
  <header class="admin-topbar">
    <div class="topbar-left">
      ${authed ? `<button class="mobile-toggle-btn" onclick="toggleSidebar()" aria-label="Toggle Sidebar"><i class="bi bi-list"></i></button>` : ''}
      <a href="/admin" style="color:var(--primary); font-weight:700; font-size:1.15rem; text-decoration:none; letter-spacing:-0.01em;">
        Rashel Mahmud Rabbi
      </a>
      <span class="role-badge">Administrator</span>
    </div>
    <div style="display:flex; align-items:center; gap:14px;">
      ${authed ? `<a href="https://rashelmahmudrabbi.github.io/" target="_blank" class="btn secondary" style="padding:6px 12px; font-size:12.5px;"><i class="bi bi-box-arrow-up-right"></i> Preview Site</a>` : ''}
      <button class="theme-toggle-btn" onclick="toggleAdminTheme()" title="Toggle Dark/Light Mode">
        <i id="adminThemeIcon" class="bi bi-moon-stars-fill"></i>
      </button>
    </div>
  </header>
  
  <main>
    ${flash ? `<div class="flash"><i class="bi bi-info-circle-fill"></i> ${esc(flash)}</div>` : ''}
    ${body}
  </main>
</div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const icon = document.getElementById('adminThemeIcon');
    if (icon) icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    
    // Highlight active link in sidebar
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-nav a').forEach(function(a) {
      if (a.getAttribute('href') === currentPath) {
        a.classList.add('active');
      }
    });

    // Form submit auto-sync for all WYSIWYG editors
    document.querySelectorAll('form').forEach(function(form) {
      form.addEventListener('submit', function() {
        document.querySelectorAll('.wysiwyg-wrapper').forEach(function(wrap) {
          const id = wrap.getAttribute('data-id');
          if (id) {
            const visual = document.getElementById('visual_' + id);
            const hidden = document.getElementById(id);
            const code = document.getElementById('code_' + id);
            if (code && code.style.display !== 'none') {
              hidden.value = code.value;
            } else if (visual && hidden) {
              hidden.value = visual.innerHTML;
            }
          }
        });
      });
    });
  });
</script>
</body>
</html>`;
}

function richTextarea(name, label, value, customId) {
  const v = value === undefined || value === null ? '' : String(value);
  const id = customId || 'wysiwyg_' + name.replace(/[^a-zA-Z0-9_]/g, '_');
  
  let initialHtml = v;
  if (initialHtml && !initialHtml.includes('<p>') && !initialHtml.includes('<br>') && !initialHtml.includes('<ul>')) {
    initialHtml = initialHtml.split(/\n\s*\n/).map(function(p) { return '<p>' + p.trim().replace(/\n/g, '<br/>') + '</p>'; }).join('');
  }

  return `
  <div class="wysiwyg-wrapper" id="wrap_${id}" data-id="${id}">
    <div class="wysiwyg-toolbar">
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'bold')" title="Bold (Ctrl+B)"><i class="bi bi-type-bold"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'italic')" title="Italic (Ctrl+I)"><i class="bi bi-type-italic"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'underline')" title="Underline (Ctrl+U)"><i class="bi bi-type-underline"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'strikeThrough')" title="Strikethrough"><i class="bi bi-type-strikethrough"></i></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execFormatBlock('${id}', 'p')" title="Paragraph (Normal text)">&para;</button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execFormatBlock('${id}', 'h4')" title="Heading 4">H4</button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'insertUnorderedList')" title="Bullet List"><i class="bi bi-list-ul"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'insertOrderedList')" title="Numbered List"><i class="bi bi-list-ol"></i></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'justifyLeft')" title="Align Left"><i class="bi bi-text-left"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'justifyCenter')" title="Align Center"><i class="bi bi-text-center"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'justifyRight')" title="Align Right"><i class="bi bi-text-right"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'justifyFull')" title="Justify Full Text"><i class="bi bi-justify"></i></button>
      </div>
      <div class="toolbar-divider"></div>
      <div class="toolbar-group">
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCreateLink('${id}')" title="Insert Link"><i class="bi bi-link-45deg"></i></button>
        <button type="button" class="toolbar-btn" onmousedown="event.preventDefault()" onclick="execCmd('${id}', 'removeFormat')" title="Clear Formatting"><i class="bi bi-eraser"></i></button>
      </div>
      <div class="toolbar-group" style="margin-left: auto; gap: 4px;">
        <button type="button" class="toolbar-btn mode-btn active" id="btn_visual_${id}" onmousedown="event.preventDefault()" onclick="switchWysiwygMode('${id}', 'visual')" title="Visual WYSIWYG Mode"><i class="bi bi-pencil-square"></i> Visual</button>
        <button type="button" class="toolbar-btn mode-btn" id="btn_code_${id}" onmousedown="event.preventDefault()" onclick="switchWysiwygMode('${id}', 'code')" title="HTML Source Code Mode"><i class="bi bi-code-slash"></i> HTML</button>
        <button type="button" class="toolbar-btn mode-btn" id="btn_preview_${id}" onmousedown="event.preventDefault()" onclick="switchWysiwygMode('${id}', 'preview')" title="Live Preview Mode"><i class="bi bi-eye"></i> Preview</button>
      </div>
    </div>
    
    <div id="visual_${id}" class="wysiwyg-visual-editor" contenteditable="true" oninput="syncWysiwygContent('${id}', 'visual')">${initialHtml}</div>
    <textarea id="code_${id}" class="wysiwyg-code-editor" style="display:none;" oninput="syncWysiwygContent('${id}', 'code')">${esc(initialHtml)}</textarea>
    <div id="preview_${id}" class="wysiwyg-preview-pane" style="display:none;"></div>
    <textarea id="${id}" name="${esc(name)}" style="display:none;">${esc(initialHtml)}</textarea>
  </div>`;
}

function fieldInput(field, value) {
  const v = value === undefined || value === null ? '' : value;
  if (field.type === 'textarea' || field.type === 'richtext') {
    return richTextarea(field.key, field.label, v);
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
    return `
      ${v ? `<div style="margin-bottom:8px;"><img src="${esc(String(v).startsWith('media/') ? 'https://rashelmahmudrabbi.github.io/' + v : v).replace(/ /g, '%20')}" style="max-height:80px; max-width:120px; object-fit:cover; border-radius:6px; border:1px solid var(--border); display:block; margin-bottom:4px;" /><small class="muted">Current image: <code>${esc(truncate(v, 40))}</code></small></div>` : ''}
      <input type="file" name="${esc(field.key)}" accept="image/*" style="display:block; padding:8px; border:1px solid var(--border); border-radius:6px; width:100%; background:var(--surface-2);" />
    `;
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
        <td>
          <form method="post" action="/admin/${esc(resourceKey)}/${r.id}/reorder" class="inline" style="margin:0;">
            <input type="number" name="order" value="${r.sort_order ?? 0}" style="width: 70px; padding: 4px; text-align: center;" onchange="this.form.submit()" />
          </form>
        </td>
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

function renderAboutAdmin({ settings = {}, pills = [] }) {
  const pillRows = pills.map(p => `
    <tr>
      <td><i class="bi ${esc(p.icon || 'bi-cpu')} text-${esc(p.color_type || 'primary')}" style="font-size:18px;"></i> <code>${esc(p.icon || 'bi-cpu')}</code></td>
      <td><strong>${esc(p.label)}</strong></td>
      <td><span class="badge" style="text-transform:capitalize; padding:3px 8px; border-radius:12px; background:var(--primary-tint); font-size:11px;">${esc(p.color_type || 'primary')}</span></td>
      <td>
        <form method="post" action="/admin/about-pills/${p.id}/reorder" class="inline" style="margin:0;">
          <input type="number" name="order" value="${p.sort_order ?? 0}" style="width: 70px; padding: 4px; text-align: center;" onchange="this.form.submit()" />
        </form>
      </td>
      <td style="text-align:right; white-space:nowrap;">
        <a class="link" href="/admin/about-pills/${p.id}/edit">Edit</a>
        <form class="inline" method="post" action="/admin/about-pills/${p.id}/delete" onsubmit="return confirm('Delete this pill?');">
          <button class="link" style="background:none;border:none;color:var(--danger);cursor:pointer;padding:0;margin-left:8px;">Delete</button>
        </form>
      </td>
    </tr>
  `).join('');

  return `
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
    <div>
      <h1 style="margin:0 0 4px 0;">About Section Manager</h1>
      <p class="muted" style="margin:0;">Control your headline, status badge, rich text paragraphs, and metadata pills in one place.</p>
    </div>
    <a href="https://rashelmahmudrabbi.github.io/#objective" target="_blank" class="btn secondary" style="font-size:13px;">
      <i class="bi bi-box-arrow-up-right"></i> View on Live Site
    </a>
  </div>

  <div class="card" style="margin-bottom:32px;">
    <h2 style="margin-top:0; margin-bottom:18px; font-size:20px;"><i class="bi bi-card-text text-primary me-2"></i> Section Content & Body Text</h2>
    <form method="post" action="/admin/about">
      <div style="margin-bottom:16px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Section Kicker (Top Small Subheading)</label>
        <input type="text" name="about_kicker" value="${esc(settings.about_kicker || 'ABOUT ME')}" style="width:100%;" required />
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Main Headline</label>
        <input type="text" name="about_headline" value="${esc(settings.about_headline || 'AI research with a practical mindset.')}" style="width:100%;" required />
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-weight:600; margin-bottom:6px;">Research Status Pill Text (Green pulse dot)</label>
        <input type="text" name="about_status_text" value="${esc(settings.about_status_text || 'Open to research opportunities')}" style="width:100%;" required />
      </div>

      <div style="margin-bottom:18px;">
        <label style="font-weight:600; margin-bottom:6px; display:block;">Body Text & Paragraphs (Rich Formatting Toolbar)</label>
        ${richTextarea('about_text', 'Body Text', settings.about_text, 'aboutBodyArea')}
        <small class="muted" style="display:block; margin-top:6px;">Tip: Use the toolbar buttons above for <b>Bold</b>, <i>Italic</i>, <u>Underline</u>, <b>Lists</b>, and <b>Justify</b>. Leave empty to use the default 3-paragraph executive narrative.</small>
      </div>

      <div class="actions">
        <button class="btn" type="submit">Save About Section</button>
      </div>
    </form>
  </div>

  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <h2 style="margin:0 0 4px 0; font-size:20px;"><i class="bi bi-tags-fill text-success me-2"></i> About Meta Pills</h2>
        <p class="muted" style="margin:0; font-size:13.5px;">These custom badge pills appear between the headline and the body paragraphs.</p>
      </div>
      <a class="btn" href="/admin/about-pills/new">+ Add New Pill</a>
    </div>

    <table>
      <thead>
        <tr>
          <th>Icon</th>
          <th>Label</th>
          <th>Accent Color</th>
          <th>Sort Order</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${pillRows || `<tr><td colspan="5" class="muted">No custom pills yet (using default system pills).</td></tr>`}
      </tbody>
    </table>
  </div>

  <script>
    function wrapFormat(tag) {
      const textarea = document.getElementById('aboutBodyArea');
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end);
      const openTag = '<' + tag + '>';
      const closeTag = '</' + tag + '>';
      const replacement = selected ? (openTag + selected + closeTag) : (openTag + closeTag);
      
      textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }
  </script>
  `;
}

module.exports = { esc, layout, renderForm, renderTable, fieldInput, renderCvAdmin, renderAboutAdmin };

