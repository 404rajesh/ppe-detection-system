import { useState, useEffect } from "react";
import LiveFeed from "../components/LiveFeed";
import PPETogglePanel from "../components/PPETogglePanel";
import ViolationAlert from "../components/ViolationAlert";
import ViolationLog from "../components/ViolationLog";
import { getDashboardStats } from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_detections: 0,
    total_violations: 0,
    today_violations: 0,
    active_cameras: 0,
    total_persons_detected: 0,
    compliance_rate: 100,
  });
  const [currentViolation, setCurrentViolation] = useState(null);
  const [ppeRules, setPpeRules] = useState({
    helmet: true,
    vest: true,
    gloves: false,
    goggles: false,
    boots: false,
  });
  const [refreshLog, setRefreshLog] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState(1);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleViolation = (violation) => {
    setCurrentViolation(violation);
    setRefreshLog((prev) => prev + 1);
    fetchStats();
  };

  const handleRulesChange = (newRules) => {
    setPpeRules(newRules);
  };

  const statCards = [
    {
      label: "Workers Detected",
      value: stats.total_persons_detected,
      color: "#3b82f6",
      icon: "👤",
    },
    {
      label: "Today Violations",
      value: stats.today_violations,
      color: "#ef4444",
      icon: "⚠️",
    },
    {
      label: "Compliance Rate",
      value: `${stats.compliance_rate}%`,
      color: stats.compliance_rate >= 80 ? "#22c55e" : "#ef4444",
      icon: "✅",
    },
    {
      label: "Active Cameras",
      value: stats.active_cameras,
      color: "#a855f7",
      icon: "📷",
    },
  ];

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
            Live Monitor
          </h1>
          <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
            Real-time PPE compliance detection
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {[1, 2, 3].map((cam) => (
            <button
              key={cam}
              onClick={() => setSelectedCamera(cam)}
              style={{
                padding: "6px 14px",
                background: selectedCamera === cam ? "#3b82f6" : "#1e293b",
                color: selectedCamera === cam ? "white" : "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              CAM_0{cam}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {card.label}
              </span>
              <span style={{ fontSize: "20px" }}>{card.icon}</span>
            </div>
            <div style={{
              fontSize: "28px",
              fontWeight: "700",
              color: card.color,
            }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <ViolationAlert violation={currentViolation} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        gap: "16px",
        marginBottom: "24px",
      }}>
        <LiveFeed
          key={selectedCamera}
          ppeRules={ppeRules}
          cameraId={selectedCamera}
          onViolation={handleViolation}
        />
        <PPETogglePanel onRulesChange={handleRulesChange} />
      </div>

      <ViolationLog refreshTrigger={refreshLog} />
    </div>
  );
};

export default Dashboard;