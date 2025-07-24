-- Create Mini App discovery tables
-- Simplified schema for core functionality only

-- Table to store discovered Mini Apps
CREATE TABLE IF NOT EXISTS discovered_mini_apps (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  home_url TEXT,
  manifest_url TEXT,
  engagement_score INTEGER DEFAULT 0,
  is_valid BOOLEAN DEFAULT false,
  last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  manifest_data JSONB,
  discovery_source VARCHAR(50) DEFAULT 'cast_crawling',
  cast_hash VARCHAR(255),
  cast_url TEXT,
  validation_errors TEXT[],
  validation_warnings TEXT[],
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_domain ON discovered_mini_apps(domain);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_valid ON discovered_mini_apps(is_valid);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_engagement ON discovered_mini_apps(engagement_score DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_discovered_mini_apps_updated_at 
  BEFORE UPDATE ON discovered_mini_apps 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 