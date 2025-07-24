-- Create tables for Mini App discovery system

-- Table to store discovered Mini Apps
CREATE TABLE IF NOT EXISTS discovered_mini_apps (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  home_url TEXT NOT NULL,
  manifest_url TEXT NOT NULL,
  engagement_score DECIMAL(5,2) DEFAULT 0.0,
  is_valid BOOLEAN DEFAULT true,
  last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata from manifest
  manifest_data JSONB,
  
  -- Discovery source tracking
  discovery_source VARCHAR(50) DEFAULT 'cast_crawling', -- 'cast_crawling', 'registry', 'manual'
  cast_hash VARCHAR(255), -- Hash of the cast that led to discovery
  cast_url TEXT, -- URL of the cast that contained this Mini App
  
  -- Validation tracking
  validation_errors TEXT[], -- Array of validation error messages
  validation_warnings TEXT[], -- Array of validation warning messages
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  CONSTRAINT discovered_mini_apps_domain_check CHECK (domain ~ '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

-- Table to track discovery runs
CREATE TABLE IF NOT EXISTS discovery_runs (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'running', -- 'running', 'completed', 'failed'
  
  -- Statistics
  total_casts_processed INTEGER DEFAULT 0,
  total_domains_found INTEGER DEFAULT 0,
  new_apps_discovered INTEGER DEFAULT 0,
  existing_apps_updated INTEGER DEFAULT 0,
  validation_errors INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  
  -- Configuration
  config JSONB DEFAULT '{}'::jsonb
);

-- Table to track cast processing for deduplication
CREATE TABLE IF NOT EXISTS processed_casts (
  id SERIAL PRIMARY KEY,
  cast_hash VARCHAR(255) NOT NULL UNIQUE,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discovery_run_id INTEGER REFERENCES discovery_runs(id),
  
  -- Cast metadata
  cast_data JSONB,
  domains_found TEXT[]
);

-- Table to track domain crawling history
CREATE TABLE IF NOT EXISTS domain_crawl_history (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL, -- 'success', 'not_found', 'error', 'invalid'
  
  -- Response details
  http_status INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  
  -- Manifest details (if found)
  manifest_found BOOLEAN DEFAULT false,
  manifest_valid BOOLEAN DEFAULT false,
  
  -- Index for performance
  CONSTRAINT domain_crawl_history_domain_check CHECK (domain ~ '^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_domain ON discovered_mini_apps(domain);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_engagement_score ON discovered_mini_apps(engagement_score DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_is_valid ON discovered_mini_apps(is_valid);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_discovered_at ON discovered_mini_apps(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_mini_apps_last_validated_at ON discovered_mini_apps(last_validated_at DESC);

CREATE INDEX IF NOT EXISTS idx_discovery_runs_started_at ON discovery_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_runs_status ON discovery_runs(status);

CREATE INDEX IF NOT EXISTS idx_processed_casts_hash ON processed_casts(cast_hash);
CREATE INDEX IF NOT EXISTS idx_processed_casts_processed_at ON processed_casts(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_domain_crawl_history_domain ON domain_crawl_history(domain);
CREATE INDEX IF NOT EXISTS idx_domain_crawl_history_crawled_at ON domain_crawl_history(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_domain_crawl_history_status ON domain_crawl_history(status);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_discovered_mini_apps_updated_at 
  BEFORE UPDATE ON discovered_mini_apps 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
  usage_count INTEGER,
  days_since_discovery INTEGER,
  validation_errors_count INTEGER
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  base_score DECIMAL(5,2);
  time_factor DECIMAL(5,2);
  error_penalty DECIMAL(5,2);
BEGIN
  -- Base score from usage
  base_score := LEAST(usage_count * 10.0, 100.0);
  
  -- Time decay factor (newer apps get slight boost)
  time_factor := GREATEST(1.0 - (days_since_discovery * 0.01), 0.5);
  
  -- Penalty for validation errors
  error_penalty := validation_errors_count * 5.0;
  
  RETURN GREATEST(base_score * time_factor - error_penalty, 0.0);
END;
$$ LANGUAGE plpgsql;

-- Create a view for active Mini Apps
CREATE OR REPLACE VIEW active_mini_apps AS
SELECT 
  id,
  domain,
  name,
  description,
  icon_url,
  home_url,
  engagement_score,
  discovered_at,
  last_validated_at,
  usage_count,
  discovery_source
FROM discovered_mini_apps 
WHERE is_valid = true 
  AND engagement_score > 0
ORDER BY engagement_score DESC, discovered_at DESC;

-- Add RLS policies (if needed for future admin features)
ALTER TABLE discovered_mini_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_casts ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_crawl_history ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active Mini Apps
CREATE POLICY "Allow public read access to active mini apps" ON discovered_mini_apps
  FOR SELECT USING (is_valid = true);

-- Allow authenticated users to update usage stats
CREATE POLICY "Allow authenticated users to update usage" ON discovered_mini_apps
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON discovered_mini_apps
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON discovery_runs
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON processed_casts
  FOR ALL USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON domain_crawl_history
  FOR ALL USING (true)
  WITH CHECK (true); 