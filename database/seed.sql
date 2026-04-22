-- Seed data for demo day
-- Simulates 7 days of PPE detection history

-- Insert sample detections for past 7 days
INSERT INTO detections (camera_id, timestamp, total_persons) VALUES
(1, NOW() - INTERVAL '6 days', 3),
(2, NOW() - INTERVAL '6 days', 2),
(1, NOW() - INTERVAL '5 days', 4),
(3, NOW() - INTERVAL '5 days', 2),
(2, NOW() - INTERVAL '4 days', 3),
(1, NOW() - INTERVAL '4 days', 5),
(3, NOW() - INTERVAL '3 days', 2),
(2, NOW() - INTERVAL '3 days', 4),
(1, NOW() - INTERVAL '2 days', 3),
(3, NOW() - INTERVAL '2 days', 2),
(2, NOW() - INTERVAL '1 day', 4),
(1, NOW() - INTERVAL '1 day', 3),
(3, NOW() - INTERVAL '1 day', 2);

-- Insert sample violations
INSERT INTO violations (detection_id, camera_id, person_index, missing_ppe, risk_level, timestamp) VALUES
(1, 1, 0, '{helmet}', 'HIGH', NOW() - INTERVAL '6 days'),
(1, 1, 1, '{vest}', 'LOW', NOW() - INTERVAL '6 days'),
(2, 2, 0, '{helmet,vest}', 'HIGH', NOW() - INTERVAL '6 days'),
(3, 1, 0, '{vest}', 'LOW', NOW() - INTERVAL '5 days'),
(4, 3, 0, '{helmet}', 'HIGH', NOW() - INTERVAL '5 days'),
(5, 2, 0, '{helmet,vest}', 'HIGH', NOW() - INTERVAL '4 days'),
(6, 1, 0, '{vest}', 'LOW', NOW() - INTERVAL '4 days'),
(6, 1, 1, '{helmet}', 'HIGH', NOW() - INTERVAL '4 days'),
(7, 3, 0, '{helmet,vest}', 'HIGH', NOW() - INTERVAL '3 days'),
(8, 2, 0, '{vest}', 'LOW', NOW() - INTERVAL '3 days'),
(9, 1, 0, '{helmet}', 'HIGH', NOW() - INTERVAL '2 days'),
(10, 3, 0, '{vest,gloves}', 'MEDIUM', NOW() - INTERVAL '2 days'),
(11, 2, 0, '{helmet}', 'HIGH', NOW() - INTERVAL '1 day'),
(12, 1, 0, '{vest}', 'LOW', NOW() - INTERVAL '1 day'),
(13, 3, 0, '{helmet,vest}', 'HIGH', NOW() - INTERVAL '1 day');