-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cameras table
CREATE TABLE cameras (
  camera_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  ip_address VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- PPE rules table (stores dashboard toggle states)
CREATE TABLE ppe_rules (
  rule_id SERIAL PRIMARY KEY,
  ppe_item VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Detections table
CREATE TABLE detections (
  detection_id SERIAL PRIMARY KEY,
  camera_id INT REFERENCES cameras(camera_id),
  timestamp TIMESTAMP DEFAULT NOW(),
  frame_path VARCHAR(255),
  total_persons INT DEFAULT 0
);

-- PPE status table (one row per person per PPE item)
CREATE TABLE ppe_status (
  id SERIAL PRIMARY KEY,
  detection_id INT REFERENCES detections(detection_id),
  person_index INT,
  ppe_item VARCHAR(50),
  status BOOLEAN,
  confidence FLOAT,
  bbox JSONB
);

-- Violations table
CREATE TABLE violations (
  violation_id SERIAL PRIMARY KEY,
  detection_id INT REFERENCES detections(detection_id),
  camera_id INT REFERENCES cameras(camera_id),
  person_index INT,
  missing_ppe TEXT[],
  risk_level VARCHAR(20),
  alert_sent BOOLEAN DEFAULT false,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Daily stats table (for fast dashboard queries)
CREATE TABLE daily_stats (
  id SERIAL PRIMARY KEY,
  stat_date DATE,
  camera_id INT REFERENCES cameras(camera_id),
  total_detections INT DEFAULT 0,
  total_violations INT DEFAULT 0,
  compliance_percentage FLOAT DEFAULT 0
);

-- Insert default PPE rules
INSERT INTO ppe_rules (ppe_item, is_required) VALUES
  ('helmet', true),
  ('vest', true),
  ('gloves', false),
  ('goggles', false),
  ('shoes', false);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash, role) VALUES
  ('admin', '$2b$10$rKJ8J3J3J3J3J3J3J3J3JuJ3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', 'admin');

-- Insert sample cameras
INSERT INTO cameras (name, location, ip_address) VALUES
  ('CAM_01', 'Main Entrance', '192.168.1.101'),
  ('CAM_02', 'Production Floor', '192.168.1.102'),
  ('CAM_03', 'Storage Area', '192.168.1.103');
