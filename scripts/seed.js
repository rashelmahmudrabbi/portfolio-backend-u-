// Loads the starter content from src/seed-data.js into the database.
// Safe to re-run: it clears each table first, so re-running just resets
// content back to these defaults (any edits made via /admin since will be
// overwritten — that's the intended "factory reset" behaviour).
require('dotenv').config();
const { Client } = require('pg');
const data = require('../src/seed-data');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set (checked process.env and .env).');
    process.exit(1);
  }

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Site settings (singleton)
    const s = data.settings;
    const cols = Object.keys(s);
    await client.query(
      `INSERT INTO site_settings (id, ${cols.join(', ')}) VALUES (1, ${cols.map((_, i) => `$${i + 1}`).join(', ')})
       ON CONFLICT (id) DO UPDATE SET ${cols.map((c, i) => `${c} = $${i + 1}`).join(', ')}`,
      cols.map((c) => s[c])
    );

    await seedSimpleList(client, 'research_interests', data.researchInterests, ['icon', 'topic', 'description']);
    await seedSimpleList(client, 'spoken_languages', data.spokenLanguages, ['name', 'level']);
    await seedSimpleList(client, 'teaching_roles', data.teachingRoles, ['title', 'description']);
    await seedSimpleList(client, 'teaching_areas', data.teachingAreas, ['topic', 'description']);
    await seedSimpleList(client, 'education', data.education, ['degree', 'major', 'institution', 'year', 'grade']);
    await seedSimpleList(client, 'experience', data.experience, ['title', 'org', 'period', 'bullets']);
    await seedSimpleList(client, 'publications', data.publications, ['type', 'status', 'title', 'authors', 'venue', 'year', 'abstract', 'doi_link', 'pdf_link']);
    await seedSimpleList(client, 'projects', data.projects, ['category', 'title', 'description', 'tech', 'year', 'github_link', 'paper_link', 'featured']);
    await seedSimpleList(client, 'certifications', data.certifications, ['title', 'issuer', 'year', 'image', 'verify_link', 'pdf_link']);
    await seedSimpleList(client, 'awards', data.awards, ['title', 'org', 'year', 'image']);
    await seedSimpleList(client, 'activities', data.activities, ['text']);
    await seedSimpleList(client, 'courses', data.courses, ['name', 'institution', 'period', 'role']);
    await seedSimpleList(client, 'blog_posts', data.blog, ['title', 'slug', 'date', 'read_time', 'category', 'excerpt', 'content', 'featured']);
    await seedSimpleList(client, 'reference_list', data.references, ['name', 'role', 'org', 'note', 'phone', 'email']);
    if (data.spotlights) {
      await seedSimpleList(client, 'spotlights', data.spotlights, ['badge', 'badge_type', 'title', 'description', 'tag', 'image', 'link_url', 'link_label']);
    }

    // Gallery (events + nested photos)
    await client.query('DELETE FROM gallery_photos');
    await client.query('DELETE FROM gallery_events');
    for (let i = 0; i < data.gallery.length; i++) {
      const event = data.gallery[i];
      const { rows } = await client.query(
        `INSERT INTO gallery_events (sort_order, title, year) VALUES ($1, $2, $3) RETURNING id`,
        [i, event.title, event.year]
      );
      const eventId = rows[0].id;
      for (let j = 0; j < event.photos.length; j++) {
        const photo = event.photos[j];
        await client.query(
          `INSERT INTO gallery_photos (sort_order, event_id, src, caption) VALUES ($1, $2, $3, $4)`,
          [j, eventId, photo.src, photo.caption]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Seed complete — starter content loaded.');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

async function seedSimpleList(client, table, rows, columns) {
  await client.query(`DELETE FROM ${table}`);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const values = [i, ...columns.map((c) => row[c])];
    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');
    await client.query(
      `INSERT INTO ${table} (sort_order, ${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
