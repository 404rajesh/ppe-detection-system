import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getDashboardStats,
  getComplianceTrend,
  getViolationStats,
} from "../services/api";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [violationStats, setViolationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, trendRes, violRes] = await Promise.all([
        getDashboardStats(),
        getComplianceTrend(7),
        getViolationStats(),
      ]);
      setStats(statsRes.data);
      setTrend(trendRes.data);
      setViolationStats(violRes.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
    setLoading(false);
  };

  const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e"];

  const riskData = violationStats?.by_risk_level?.map((r) => ({
    name: r.risk_level,
    value: parseInt(r.count),
  })) || [];

  const cameraData = violationStats?.by_camera?.map((c) => ({
    name: c.name || "Unknown",
    violations: parseInt(c.count),
  })) || [];

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        color: "#94a3b8",
        fontSize: "16px",
      }}>
        Loading analytics...
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f1f5f9" }}>
          Analytics
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
          PPE compliance insights and trends
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {[
          {
            label: "Total Workers Monitored",
            value: stats?.total_workers_monitored || 0,
            color: "#3b82f6",
          },
          {
            label: "Total Violations",
            value: stats?.total_violations || 0,
            color: "#ef4444",
          },
          {
            label: "Compliance Rate",
            value: `${stats?.compliance_rate || 100}%`,
            color: "#22c55e",
          },
          {
            label: "Today Violations",
            value: stats?.today_violations || 0,
            color: "#f97316",
          },
        ].map((card) => (
          <div key={card.label} style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
          }}>
            <div style={{
              fontSize: "12px",
              color: "#94a3b8",
              marginBottom: "8px",
            }}>
              {card.label}
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

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px",
        marginBottom: "16px",
      }}>
        <div className="card">
          <h3 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#f1f5f9",
            marginBottom: "20px",
          }}>
            Compliance Trend (7 days)
          </h3>
          {trend.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#94a3b8",
              padding: "40px",
              fontSize: "13px",
            }}>
              No trend data yet. Start detecting to see trends.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(v) => new Date(v).toLocaleDateString()}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="compliance_percentage"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e" }}
                  name="Compliance %"
                />
                <Line
                  type="monotone"
                  dataKey="total_violations"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444" }}
                  name="Violations"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#f1f5f9",
            marginBottom: "20px",
          }}>
            Violations by Risk Level
          </h3>
          {riskData.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#94a3b8",
              padding: "40px",
              fontSize: "13px",
            }}>
              No violation data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {riskData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "#f1f5f9",
          marginBottom: "20px",
        }}>
          Violations by Camera
        </h3>
        {cameraData.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#94a3b8",
            padding: "40px",
            fontSize: "13px",
          }}>
            No camera data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cameraData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  color: "#f1f5f9",
                }}
              />
              <Bar dataKey="violations" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Analytics;