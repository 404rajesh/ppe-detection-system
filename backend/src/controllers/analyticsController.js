const { query } = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const totalDetections = await query(
  "SELECT COALESCE(SUM(total_persons), 0) as count FROM detections"
);

    const totalViolations = await query(
  "SELECT COUNT(DISTINCT detection_id) as count FROM violations"
);

    const todayDetections = await query(
      `SELECT COUNT(*) as count FROM detections 
       WHERE DATE(timestamp) = CURRENT_DATE`
    );

    const todayViolations = await query(
  `SELECT COUNT(DISTINCT detection_id) as count FROM violations 
   WHERE DATE(timestamp) = CURRENT_DATE`
);

    const activeCameras = await query(
      "SELECT COUNT(*) as count FROM cameras WHERE is_active = true"
    );

    const totalPersons = await query(
      "SELECT COALESCE(SUM(total_persons), 0) as count FROM detections"
    );

    const totalDet = parseInt(totalDetections.rows[0].count);
const totalViol = parseInt(totalViolations.rows[0].count);
const totalPersons2 = parseInt(totalPersons.rows[0].count);
const violatingPersons = await query(
  "SELECT COUNT(*) as count FROM violations"
);
const totalViolPersons = parseInt(violatingPersons.rows[0].count);
const complianceRate = totalPersons2 > 0
  ? Math.max(0, Math.round(((totalPersons2 - totalViolPersons) / totalPersons2) * 100))
  : 100;

    return res.status(200).json({
      total_workers_monitored: totalDet,
      total_violations: totalViol,
      today_detections: parseInt(todayDetections.rows[0].count),
      today_violations: parseInt(todayViolations.rows[0].count),
      active_cameras: parseInt(activeCameras.rows[0].count),
      total_persons_detected: parseInt(totalPersons.rows[0].count),
      compliance_rate: parseFloat(complianceRate),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getComplianceTrend = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const result = await query(
      `SELECT 
        DATE(d.timestamp) as date,
        COUNT(DISTINCT d.detection_id) as total_detections,
        COUNT(DISTINCT v.violation_id) as total_violations,
        CASE 
          WHEN COUNT(DISTINCT d.detection_id) > 0 
          THEN ROUND(
            (COUNT(DISTINCT d.detection_id) - COUNT(DISTINCT v.violation_id))::numeric 
            / COUNT(DISTINCT d.detection_id) * 100, 1
          )
          ELSE 100 
        END as compliance_percentage
       FROM detections d
       LEFT JOIN violations v ON d.detection_id = v.detection_id
       WHERE d.timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
       GROUP BY DATE(d.timestamp)
       ORDER BY date ASC`
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Compliance trend error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getPPERules = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM ppe_rules ORDER BY rule_id ASC"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get PPE rules error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updatePPERules = async (req, res) => {
  try {
    const { rules } = req.body;
    for (const rule of rules) {
      await query(
        `UPDATE ppe_rules SET is_required = $1, updated_at = NOW() 
         WHERE ppe_item = $2`,
        [rule.is_required, rule.ppe_item]
      );
    }
    const updated = await query(
      "SELECT * FROM ppe_rules ORDER BY rule_id ASC"
    );
    return res.status(200).json(updated.rows);
  } catch (error) {
    console.error("Update PPE rules error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
  getComplianceTrend,
  getPPERules,
  updatePPERules,
};