-- Portfolio backend schema (Postgres / Neon).
-- Run via `npm run migrate` (see scripts/migrate.js). Safe to re-run —
-- every statement is guarded with IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT DEFAULT '',
  title TEXT DEFAULT '',
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  stat_publications INTEGER DEFAULT 0,
  stat_projects INTEGER DEFAULT 0,
  stat_awards INTEGER DEFAULT 0,
  stat_certifications INTEGER DEFAULT 0,
  social_github TEXT DEFAULT '',
  social_linkedin TEXT DEFAULT '',
  social_researchgate TEXT DEFAULT '',
  social_scholar TEXT DEFAULT '',
  social_orcid TEXT DEFAULT '',
  skills_languages TEXT DEFAULT '',
  skills_frameworks TEXT DEFAULT '',
  skills_tools TEXT DEFAULT '',
  skills_research_methods TEXT DEFAULT '',
  father_name TEXT DEFAULT '',
  mother_name TEXT DEFAULT '',
  dob TEXT DEFAULT '',
  religion TEXT DEFAULT '',
  nid TEXT DEFAULT '',
  marital_status TEXT DEFAULT '',
  blood_group TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  address TEXT DEFAULT '',
  teaching_philosophy TEXT DEFAULT '',
  teaching_mentoring_text TEXT DEFAULT '',
  footer_text TEXT DEFAULT '',
  cv_last_updated TEXT DEFAULT '',
  cv_download_url TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS research_interests (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  icon TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS spoken_languages (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  name TEXT DEFAULT '',
  level TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS teaching_roles (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS teaching_areas (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  topic TEXT DEFAULT '',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  degree TEXT DEFAULT '',
  major TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  year TEXT DEFAULT '',
  grade TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  org TEXT DEFAULT '',
  period TEXT DEFAULT '',
  bullets TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  type TEXT DEFAULT 'conference',
  status TEXT DEFAULT 'published',
  title TEXT DEFAULT '',
  authors TEXT DEFAULT '',
  venue TEXT DEFAULT '',
  year TEXT DEFAULT '',
  abstract TEXT DEFAULT '',
  doi_link TEXT DEFAULT '',
  pdf_link TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  category TEXT DEFAULT 'research',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  tech TEXT DEFAULT '',
  year TEXT DEFAULT '',
  github_link TEXT DEFAULT '',
  paper_link TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  issuer TEXT DEFAULT '',
  year TEXT DEFAULT '',
  image TEXT DEFAULT '',
  verify_link TEXT DEFAULT '',
  pdf_link TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS awards (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  org TEXT DEFAULT '',
  year TEXT DEFAULT '',
  image TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  text TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS gallery_events (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  year TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  event_id INTEGER NOT NULL REFERENCES gallery_events(id) ON DELETE CASCADE,
  src TEXT DEFAULT '',
  caption TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  name TEXT DEFAULT '',
  institution TEXT DEFAULT '',
  period TEXT DEFAULT '',
  role TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  title TEXT DEFAULT '',
  slug TEXT DEFAULT '',
  date TEXT DEFAULT '',
  read_time TEXT DEFAULT '',
  category TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  featured BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS reference_list (
  id SERIAL PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  name TEXT DEFAULT '',
  role TEXT DEFAULT '',
  org TEXT DEFAULT '',
  note TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_gallery_photos_event_id ON gallery_photos(event_id);
