import { useState, useEffect } from "react";
import { getCameras, addCamera, updateCamera, deleteCamera } from "../services/api";

const Cameras = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    ip_address: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await getCameras();
      setCameras(response.data);
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await addCamera(form);
      setForm({ name: "", location: "", ip_address: "" });
      setShowForm(false);
      fetchCameras();
    } catch (error) {
      console.error("Failed to add camera:", error);
    }
    setSaving(false);
  };

  const handleToggle = async (camera) => {
    try {
      await updateCamera(camera.camera_id, {
        is_active: !camera.is_active,
      });
      fetchCameras();
    } catch (error) {
      console.error("Failed to update camera:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this camera?")) return;
    try {
      await deleteCamera(id);
      fetchCameras();
    } catch (error) {
      console.error("Failed to delete camera:", error);
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9" }}>
            Camera Management
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
            Manage your surveillance cameras
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          + Add Camera
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: "24px" }}>
          <h3 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#f1f5f9",
            marginBottom: "16px",
          }}>
            Add New Camera
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}>
            {[
              { key: "name", placeholder: "Camera name (e.g. CAM_04)" },
              { key: "location", placeholder: "Location (e.g. Main Gate)" },
              { key: "ip_address", placeholder: "IP Address (e.g. 192.168.1.104)" },
            ].map((field) => (
              <input
                key={field.key}
                type="text"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                style={{
                  padding: "10px 14px",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Camera"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>
          Loading cameras...
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
        }}>
          {cameras.map((camera) => (
            <div key={camera.camera_id} className="card">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}>
                <div style={{
                  width: "44px",
                  height: "44px",
                  background: camera.is_active ? "#1d4ed8" : "#334155",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "22px",
                }}>
                  📷
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <div style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: camera.is_active ? "#22c55e" : "#ef4444",
                  }} />
                  <span style={{
                    fontSize: "12px",
                    color: camera.is_active ? "#22c55e" : "#ef4444",
                  }}>
                    {camera.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <h3 style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#f1f5f9",
                marginBottom: "4px",
              }}>
                {camera.name}
              </h3>

              <div style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "4px",
              }}>
                📍 {camera.location || "No location set"}
              </div>

              <div style={{
                fontSize: "13px",
                color: "#94a3b8",
                marginBottom: "16px",
              }}>
                🌐 {camera.ip_address || "No IP set"}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleToggle(camera)}
                  style={{
                    flex: 1,
                    padding: "8px",
                    background: camera.is_active ? "#7f1d1d" : "#14532d",
                    color: camera.is_active ? "#fca5a5" : "#86efac",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {camera.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(camera.camera_id)}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cameras;