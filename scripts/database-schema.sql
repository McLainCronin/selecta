-- Users table with OAuth tokens
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  spotify_token TEXT,
  spotify_refresh_token TEXT,
  apple_token TEXT,
  apple_refresh_token TEXT,
  cloud_storage_config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500) NOT NULL,
  release_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service, external_id)
);

-- Playlists table
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  is_synced BOOLEAN DEFAULT FALSE,
  sync_target_service VARCHAR(50),
  sync_target_playlist_id UUID,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, service, external_id)
);

-- Tracks table
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  service VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(500) NOT NULL,
  album_id UUID REFERENCES albums(id),
  isrc_code VARCHAR(20),
  duration_ms INTEGER,
  position INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(playlist_id, service, external_id)
);

-- Track matches for AI matching system
CREATE TABLE track_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  target_track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  match_type VARCHAR(50) NOT NULL, -- 'isrc_album', 'exact', 'fuzzy', 'ai'
  confidence_score DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sync jobs for background processing
CREATE TABLE sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source_playlist_id UUID REFERENCES playlists(id),
  target_playlist_id UUID REFERENCES playlists(id),
  direction VARCHAR(20) NOT NULL, -- 'bidirectional', 'source_to_target', 'target_to_source'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  progress INTEGER DEFAULT 0,
  total_tracks INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Backup jobs
CREATE TABLE backup_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  backup_type VARCHAR(20) DEFAULT 'full', -- 'full', 'incremental'
  services TEXT[] DEFAULT '{}',
  initiated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Backup files
CREATE TABLE backup_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_job_id UUID REFERENCES backup_jobs(id) ON DELETE CASCADE,
  storage_location TEXT NOT NULL,
  file_format VARCHAR(10) NOT NULL, -- 'json', 'csv'
  file_size BIGINT,
  cloud_uploaded BOOLEAN DEFAULT FALSE,
  cloud_location TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_playlists_user_service ON playlists(user_id, service);
CREATE INDEX idx_tracks_playlist ON tracks(playlist_id);
CREATE INDEX idx_tracks_isrc ON tracks(isrc_code) WHERE isrc_code IS NOT NULL;
CREATE INDEX idx_sync_jobs_user_status ON sync_jobs(user_id, status);
CREATE INDEX idx_backup_jobs_user_status ON backup_jobs(user_id, status);
