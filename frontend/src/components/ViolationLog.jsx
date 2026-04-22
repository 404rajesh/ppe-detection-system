import { useState, useEffect } from "react";
import { getViolations } from "../services/api";

const ViolationLog = ({ refreshTrigger }) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchViolations();
  }, [refreshTrigger]);

  const fetchViolations = async () => {
    try {
      const params = {};
      if (filter !== "ALL") params.risk_level = filter;
      const response = await getViolations({ limit: 20 });
      setViolations(response.data);
    } catch (error) {
      console.error("Failed to fetch violations:", error);
    }
    setLoading(false);
  };

  const riskBadge = (level) => {
    const classes = {
      HIGH: "badge-high",
      MEDIUM: "badge-medium",
      LOW: "badge-low",
      SAFE: "badge-safe",
    };
    return <span className={classes[level] || "badge-safe"}>{level}</span>;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "—";
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="card">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
      }}>
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#f1f5f9" }}>
          Recent Violations
        </h3>
        <div style={{ display: "flex", gap: "4px" }}>
          {["ALL", "HIGH", "MEDIUM", "LOW"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                background: filter === f ? "#3b82f6" : "#0f172a",
                color: filter === f ? "white" : "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "500",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}>
          Loading...
        </div>
      ) : violations.length === 0 ? (
        <div style={{
          textAlign: "center",
          color: "#94a3b8",
          padding: "30px",
          fontSize: "13px",
        }}>
          No violations recorded yet
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
          }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155" }}>
                {["Time", "Camera", "Missing PPE", "Risk"].map((h) => (
                  <th key={h} style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    color: "#64748b",
                    fontWeight: "500",
                    fontSize: "12px",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {violations.map((v, i) => (
                <tr
                  key={v.violation_id || i}
                  style={{
                    borderBottom: "1px solid #1e293b",
                    transition: "background 0.1s",
                  }}
                >
                  <td style={{ padding: "10px 12px", color: "#94a3b8" }}>
                    {formatTime(v.detection_time || v.timestamp)}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#f1f5f9" }}>
                    {v.camera_name || `CAM_0${v.camera_id}`}
                  </td>
                  <td style={{ padding: "10px 12px", color: "#f1f5f9" }}>
                    {Array.isArray(v.missing_ppe)
                      ? v.missing_ppe.join(", ")
                      : v.missing_ppe || "—"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {riskBadge(v.risk_level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViolationLog;