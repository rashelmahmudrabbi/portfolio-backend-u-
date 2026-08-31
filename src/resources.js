// Single source of truth for every simple, list-style content type: its
// Postgres table, the fields the admin form should show, and how each row
// gets turned into the JSON shape the frontend expects (matching the old
// Django REST Framework serializers field-for-field, including the
// camelCase renames like `doiLink`/`githubLink`).
//
// `key` is used in the API path (/api/<key>) and the admin path
// (/admin/<key>). `column` is the actual Postgres column name when it
// differs from `key` (e.g. avoiding the reserved word-adjacent `order`).

const RESOURCES = {
  education: {
    table: 'education',
    label: 'Education',
    fields: [
      { key: 'degree', label: 'Degree', type: 'text' },
      { key: 'major', label: 'Major', type: 'text' },
      { key: 'institution', label: 'Institution', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'grade', label: 'Grade', type: 'text' },
    ],
  },

  experience: {
    table: 'experience',
    label: 'Experience',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'org', label: 'Organization', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'bullets', label: 'Bullets (one per line)', type: 'textarea' },
    ],
    serialize: (row) => ({
      id: row.id,
      title: row.title,
      org: row.org,
      period: row.period,
      bullets: splitLines(row.bullets),
      order: row.sort_order,
    }),
  },

  publications: {
    table: 'publications',
    label: 'Publications',
    fields: [
      { key: 'type', label: 'Type', type: 'select', options: ['conference', 'journal', 'thesis'] },
      {
        key: 'status', label: 'Status', type: 'select',
        options: ['published', 'under-review', 'completed', 'accepted', 'preprint'],
      },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'authors', label: 'Authors', type: 'text' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'abstract', label: 'Abstract', type: 'textarea' },
      { key: 'doi_link', label: 'DOI link', type: 'text' },
      { key: 'pdf_link', label: 'PDF link', type: 'text' },
    ],
    serialize: (row) => ({
      id: row.id,
      type: row.type,
      status: row.status,
      title: row.title,
      authors: row.authors,
      venue: row.venue,
      year: row.year,
      abstract: row.abstract,
      doiLink: row.doi_link,
      pdfLink: row.pdf_link,
      order: row.sort_order,
    }),
  },

  projects: {
    table: 'projects',
    label: 'Projects',
    fields: [
      { key: 'category', label: 'Category', type: 'select', options: ['thesis', 'research', 'development'] },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'tech', label: 'Tech (comma separated)', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'github_link', label: 'GitHub link', type: 'text' },
      { key: 'paper_link', label: 'Paper / live link', type: 'text' },
      { key: 'featured', label: 'Featured', type: 'checkbox' },
    ],
    serialize: (row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      description: row.description,
      tech: splitCommas(row.tech),
      year: row.year,
      githubLink: row.github_link,
      paperLink: row.paper_link,
      featured: row.featured,
      order: row.sort_order,
    }),
  },

  certifications: {
    table: 'certifications',
    label: 'Certifications',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'issuer', label: 'Issuer', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'image_file', label: 'Upload Certificate Image (PNG/JPG)', type: 'file' },
      { key: 'image', label: 'Or Image Path/URL', type: 'text' },
      { key: 'verify_link', label: 'Verify link', type: 'text' },
      { key: 'pdf_link', label: 'PDF link', type: 'text' },
    ],
    serialize: (row) => ({
      id: row.id,
      title: row.title,
      issuer: row.issuer,
      year: row.year,
      image: row.image,
      verifyLink: row.verify_link,
      pdfLink: row.pdf_link,
      order: row.sort_order,
    }),
  },

  awards: {
    table: 'awards',
    label: 'Awards',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'org', label: 'Organization', type: 'text' },
      { key: 'year', label: 'Year', type: 'text' },
      { key: 'image_file', label: 'Upload Award Photo (PNG/JPG)', type: 'file' },
      { key: 'image', label: 'Or Image Path/URL', type: 'text' },
    ],
  },

  activities: {
    table: 'activities',
    label: 'Activities',
    fields: [
      { key: 'text', label: 'Text', type: 'text' },
    ],
  },

  courses: {
    table: 'courses',
    label: 'Teaching Courses',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'institution', label: 'Institution', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
    ],
  },

  blog: {
    table: 'blog_posts',
    label: 'Blog Posts',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'slug', label: 'Slug', type: 'text' },
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'read_time', label: 'Read time', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'featured', label: 'Featured', type: 'checkbox' },
    ],
    serialize: (row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      date: row.date,
      readTime: row.read_time,
      category: row.category,
      excerpt: row.excerpt,
      content: row.content,
      featured: row.featured,
      order: row.sort_order,
    }),
  },

  references: {
    table: 'reference_list',
    label: 'References',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'org', label: 'Organization', type: 'text' },
      { key: 'note', label: 'Note', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
    ],
  },

  // --- Nested under Site Settings (still simple order-only lists) ---
  'research-interests': {
    table: 'research_interests',
    label: 'Research Interests',
    fields: [
      { key: 'icon', label: 'Icon (Bootstrap icon class, e.g. bi-eye)', type: 'text' },
      { key: 'topic', label: 'Topic', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
    serialize: (row) => ({ icon: row.icon, topic: row.topic, desc: row.description }),
  },

  'spoken-languages': {
    table: 'spoken_languages',
    label: 'Spoken Languages',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'level', label: 'Level', type: 'text' },
    ],
    serialize: (row) => ({ name: row.name, level: row.level }),
  },

  'teaching-roles': {
    table: 'teaching_roles',
    label: 'Teaching Roles',
    fields: [
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
    serialize: (row) => ({ title: row.title, desc: row.description }),
  },

  'teaching-areas': {
    table: 'teaching_areas',
    label: 'Teaching Areas',
    fields: [
      { key: 'topic', label: 'Topic', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
    ],
    serialize: (row) => ({ topic: row.topic, desc: row.description }),
  },

  'about-pills': {
    table: 'about_pills',
    label: 'About Meta Pills',
    fields: [
      { key: 'label', label: 'Pill Label (e.g. AI & Computer Vision, Medical Imaging, Rajshahi, Bangladesh)', type: 'text' },
      { key: 'icon', label: 'Bootstrap Icon Class (e.g. bi-cpu, bi-heart-pulse-fill, bi-geo-alt-fill, bi-lightning-charge)', type: 'text' },
      {
        key: 'color_type', label: 'Icon / Accent Color', type: 'select',
        options: ['primary', 'danger', 'success', 'warning', 'info', 'secondary'],
      },
    ],
    serialize: (row) => ({
      id: row.id,
      label: row.label,
      icon: row.icon,
      colorType: row.color_type,
      order: row.sort_order,
    }),
  },

  spotlights: {
    table: 'spotlights',
    label: 'Spotlight Highlights',
    fields: [
      { key: 'badge', label: 'Badge Label (e.g. Top Publication, Latest AI Project)', type: 'text' },
      {
        key: 'badge_type', label: 'Badge Style / Color', type: 'select',
        options: ['badge-pub', 'badge-proj', 'badge-xai'],
      },
      { key: 'title', label: 'Highlight Title', type: 'text' },
      { key: 'description', label: 'Short Description', type: 'textarea' },
      { key: 'tag', label: 'Tag (e.g. Journal Paper, Medical Image AI)', type: 'text' },
      { key: 'image_file', label: 'Browse / Upload Thumbnail Photo (Supports JPG, PNG, WebP)', type: 'file' },
      { key: 'image', label: 'Or Photo / Thumbnail URL (If not browsing a local file)', type: 'text' },
      { key: 'link_url', label: 'Action Link URL (e.g. publications/index.html)', type: 'text' },
      { key: 'link_label', label: 'Link Button Text (e.g. View Paper, Explore)', type: 'text' },
    ],
    serialize: (row) => ({
      id: row.id,
      badge: row.badge,
      badgeType: row.badge_type,
      title: row.title,
      description: row.description,
      tag: row.tag,
      image: row.image,
      linkUrl: row.link_url,
      linkLabel: row.link_label,
      order: row.sort_order,
    }),
  },
};

function splitLines(text) {
  return String(text || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitCommas(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function defaultSerialize(row, fields) {
  const out = { id: row.id };
  for (const f of fields) out[f.key] = row[f.key];
  out.order = row.sort_order;
  return out;
}

function serializeRow(resourceKey, row) {
  const resource = RESOURCES[resourceKey];
  if (resource.serialize) return resource.serialize(row);
  return defaultSerialize(row, resource.fields);
}

module.exports = { RESOURCES, serializeRow, splitLines, splitCommas };
