const { query } = require("../config/db");

const getViolations = async (req, res) => {
  try {
    const { camera_id, risk_level, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT 
        v.*,
        c.name as camera_name,
        d.timestamp as detection_time
      FROM violations v
      LEFT JOIN cameras c ON v.camera_id = c.camera_id
      LEFT JOIN detections d ON v.detection_id = d.detection_id
      WHERE 1=1
    `;
    const params = [];

    if (camera_id) {
      params.push(camera_id);
      queryText += ` AND v.camera_id = $${params.length}`;
    }

    if (risk_level) {
      params.push(risk_level);
      queryText += ` AND v.risk_level = $${params.length}`;
    }

    queryText += ` ORDER BY v.timestamp DESC`;
    params.push(limit);
    queryText += ` LIMIT $${params.length}`;
    params.push(offset);
    queryText += ` OFFSET $${params.length}`;

    const result = await query(queryText, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get violations error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getViolationStats = async (req, res) => {
  try {
    const totalViolations = await query(
      "SELECT COUNT(*) as count FROM violations"
    );

    const todayViolations = await query(
      `SELECT COUNT(*) as count FROM violations 
       WHERE DATE(timestamp) = CURRENT_DATE`
    );

    const byRiskLevel = await query(
      `SELECT risk_level, COUNT(*) as count 
       FROM violations 
       GROUP BY risk_level`
    );

    const byCamera = await query(
      `SELECT c.name, COUNT(v.violation_id) as count
       FROM violations v
       LEFT JOIN cameras c ON v.camera_id = c.camera_id
       GROUP BY c.name
       ORDER BY count DESC`
    );

    const recentTrend = await query(
      `SELECT 
        DATE(timestamp) as date,
        COUNT(*) as violations
       FROM violations
       WHERE timestamp >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`
    );

    return res.status(200).json({
      total: parseInt(totalViolations.rows[0].count),
      today: parseInt(todayViolations.rows[0].count),
      by_risk_level: byRiskLevel.rows,
      by_camera: byCamera.rows,
      trend_7days: recentTrend.rows,
    });
  } catch (error) {
    console.error("Get violation stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getViolations, getViolationStats };