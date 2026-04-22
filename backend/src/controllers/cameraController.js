const { query } = require("../config/db");

const getAllCameras = async (req, res) => {
  try {
    const result = await query(
      "SELECT * FROM cameras ORDER BY camera_id ASC"
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get cameras error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addCamera = async (req, res) => {
  try {
    const { name, location, ip_address } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Camera name is required" });
    }
    const result = await query(
      "INSERT INTO cameras (name, location, ip_address) VALUES ($1, $2, $3) RETURNING *",
      [name, location, ip_address]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Add camera error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, ip_address, is_active } = req.body;
    const result = await query(
      `UPDATE cameras SET 
        name = COALESCE($1, name),
        location = COALESCE($2, location),
        ip_address = COALESCE($3, ip_address),
        is_active = COALESCE($4, is_active)
       WHERE camera_id = $5 RETURNING *`,
      [name, location, ip_address, is_active, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Camera not found" });
    }
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update camera error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM cameras WHERE camera_id = $1", [id]);
    return res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error) {
    console.error("Delete camera error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getAllCameras, addCamera, updateCamera, deleteCamera };