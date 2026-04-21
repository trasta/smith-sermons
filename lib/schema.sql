-- Smith Sermons — Supabase Database Schema
-- Run this in Supabase: SQL Editor → New query → paste and run

-- ============================================================
-- SERMONS
-- ============================================================
CREATE TABLE sermons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id         TEXT UNIQUE NOT NULL,        -- e.g. S0001
  title             TEXT,
  date              DATE,
  service_type      TEXT,                         -- 'Sunday Morning Worship', etc.
  speaker           TEXT NOT NULL DEFAULT 'Doyle Smith',
  series_name       TEXT,
  series_chapter    INTEGER,
  audio_url         TEXT NOT NULL,               -- Cloudflare R2 public URL
  original_filename TEXT,
  duration_seconds  INTEGER,
  file_size_bytes   BIGINT,
  transcript        TEXT,
  is_private        BOOLEAN NOT NULL DEFAULT FALSE,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SCRIPTURE REFERENCES
-- ============================================================
CREATE TABLE scripture_references (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id      UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  book           TEXT NOT NULL,
  chapter        INTEGER,
  verse_start    INTEGER,
  verse_end      INTEGER,
  reference_text TEXT NOT NULL   -- human-readable, e.g. "Romans 8:1-4"
);

-- ============================================================
-- SERMON TAGS  (themes, biblical characters, topics)
-- ============================================================
CREATE TABLE sermon_tags (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sermon_id   UUID NOT NULL REFERENCES sermons(id) ON DELETE CASCADE,
  tag_type    TEXT NOT NULL CHECK (tag_type IN ('theme', 'character', 'topic')),
  tag_value   TEXT NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_sermons_date           ON sermons(date DESC);
CREATE INDEX idx_sermons_series         ON sermons(series_name);
CREATE INDEX idx_sermons_is_private     ON sermons(is_private);
CREATE INDEX idx_sermons_is_published   ON sermons(is_published);
CREATE INDEX idx_sermons_sermon_id      ON sermons(sermon_id);
CREATE INDEX idx_scripture_sermon_id    ON scripture_references(sermon_id);
CREATE INDEX idx_scripture_book         ON scripture_references(book);
CREATE INDEX idx_tags_sermon_id         ON sermon_tags(sermon_id);
CREATE INDEX idx_tags_type_value        ON sermon_tags(tag_type, tag_value);

-- Full-text search index on title + transcript
CREATE INDEX idx_sermons_fts ON sermons
  USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(transcript, '')));

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Public can read non-private, published sermons only.
-- ============================================================
ALTER TABLE sermons             ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripture_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermon_tags         ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public sermons are readable by anyone"
  ON sermons FOR SELECT
  USING (is_private = FALSE AND is_published = TRUE);

CREATE POLICY "Scripture refs follow sermon visibility"
  ON scripture_references FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sermons s
      WHERE s.id = sermon_id AND s.is_private = FALSE AND s.is_published = TRUE
    )
  );

CREATE POLICY "Tags follow sermon visibility"
  ON sermon_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sermons s
      WHERE s.id = sermon_id AND s.is_private = FALSE AND s.is_published = TRUE
    )
  );

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
