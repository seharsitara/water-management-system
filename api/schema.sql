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
  date DATE NOT NULL,
  usage_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  duration INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
  daily_limit DECIMAL(10, 2) DEFAULT 100,
  monthly_limit DECIMAL(10, 2) DEFAULT 3000,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_usage_entries_date ON usage_entries(date);
CREATE INDEX idx_usage_entries_created_at ON usage_entries(created_at);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
