const { query } = require("../config/db");
const axios = require("axios");
require("dotenv").config();

const saveDetection = async (req, res) => {
  try {
    const {
      camera_id,
      total_persons,
      persons,
      overall_violation,
      frame_path,
    } = req.body;

    const detectionResult = await query(
      `INSERT INTO detections (camera_id, total_persons, frame_path)
       VALUES ($1, $2, $3) RETURNING *`,
      [camera_id, total_persons, frame_path]
    );

    const detection = detectionResult.rows[0];

    for (let i = 0; i < persons.length; i++) {
      const person = persons[i];

      for (const ppe_item of ["helmet", "vest", "gloves", "goggles", "boots"]) {
        await query(
          `INSERT INTO ppe_status 
           (detection_id, person_index, ppe_item, status, confidence, bbox)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            detection.detection_id,
            i,
            ppe_item,
            person.ppe_found.includes(ppe_item),
            person.confidence,
            JSON.stringify(person.bbox),
          ]
        );
      }

      if (person.risk_level !== "SAFE") {
        await query(
          `INSERT INTO violations 
           (detection_id, camera_id, person_index, missing_ppe, risk_level, alert_sent)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            detection.detection_id,
            camera_id,
            i,
            person.missing_ppe,
            person.risk_level,
            true,
          ]
        );
      }
    }

    return res.status(201).json({
      message: "Detection saved successfully",
      detection_id: detection.detection_id,
    });
  } catch (error) {
    console.error("Save detection error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getDetections = async (req, res) => {
  try {
    const { camera_id, limit = 50 } = req.query;
    let queryText = `
      SELECT d.*, c.name as camera_name 
      FROM detections d
      LEFT JOIN cameras c ON d.camera_id = c.camera_id
    `;
    const params = [];
    if (camera_id) {
      queryText += " WHERE d.camera_id = $1";
      params.push(camera_id);
    }
    queryText += " ORDER BY d.timestamp DESC LIMIT $" + (params.length + 1);
    params.push(limit);
    const result = await query(queryText, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get detections error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { saveDetection, getDetections };