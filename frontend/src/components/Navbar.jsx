import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", label: "Live Monitor" },
    { path: "/analytics", label: "Analytics" },
    { path: "/cameras", label: "Cameras" },
  ];

  return (
    <nav style={{
      background: "#1e293b",
      borderBottom: "1px solid #334155",
      padding: "0 24px",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🦺</span>
          <span style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#f1f5f9",
          }}>
            PPE Monitor
          </span>
        </div>

        <div style={{ display: "flex", gap: "4px" }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: "6px 16px",
                background: location.pathname === item.path
                  ? "#3b82f6"
                  : "transparent",
                color: location.pathname === item.path
                  ? "white"
                  : "#94a3b8",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                transition: "all 0.2s",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#22c55e",
          }} />
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>
            Live
          </span>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 12px",
          background: "#0f172a",
          borderRadius: "8px",
          border: "1px solid #334155",
        }}>
          <div style={{
            width: "28px",
            height: "28px",
            background: "#3b82f6",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "700",
            color: "white",
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "13px", color: "#f1f5f9" }}>
            {user?.username}
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            background: "transparent",
            color: "#ef4444",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "500",
            transition: "all 0.2s",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;