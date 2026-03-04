-- Supabase Database Schema for WaterTrack App

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage entries table
CREATE TABLE IF NOT EXISTS usage_entries (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  usage_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  duration INTEGER,
  entity_type VARCHAR(20) DEFAULT 'home',  -- home, society, or industry
  entity_name VARCHAR(255),                 -- House A, Block B, Factory 1, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add columns if they don't exist (for existing databases)
ALTER TABLE usage_entries ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20) DEFAULT 'home';
ALTER TABLE usage_entries ADD COLUMN IF NOT EXISTS entity_name VARCHAR(255);

-- Usage categories table
CREATE TABLE IF NOT EXISTS usage_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  daily_limit DECIMAL(10, 2),
  monthly_limit DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  daily_limit DECIMAL(10, 2) DEFAULT 500,     -- Updated default for home
  monthly_limit DECIMAL(10, 2) DEFAULT 15000, -- Updated default for home
  entity_type VARCHAR(20) DEFAULT 'home',     -- Preferred entity type
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add entity_type column if it doesn't exist (for existing databases)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20) DEFAULT 'home';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_usage_entries_date ON usage_entries(date);
CREATE INDEX IF NOT EXISTS idx_usage_entries_created_at ON usage_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Alerts table to record limit violations
CREATE TABLE IF NOT EXISTS usage_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  category_name VARCHAR(100) NOT NULL,
  alert_type VARCHAR(20) NOT NULL, -- daily or monthly
  total_amount DECIMAL(10, 2) NOT NULL,
  limit_amount DECIMAL(10,2),
  percent_used DECIMAL(5,2),
  occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usage_entry_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_alerts_occurred_at ON usage_alerts(occurred_at);
CREATE INDEX IF NOT EXISTS idx_usage_entries_user_id ON usage_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_alerts_user_id ON usage_alerts(user_id);
