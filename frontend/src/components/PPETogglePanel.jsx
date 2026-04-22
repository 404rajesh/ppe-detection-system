import { useState, useEffect } from "react";
import { getPPERules, updatePPERules } from "../services/api";

const PPETogglePanel = ({ onRulesChange }) => {
  const [rules, setRules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await getPPERules();
      setRules(response.data);
    } catch (error) {
      console.error("Failed to fetch PPE rules:", error);
    }
  };

  const toggleRule = async (ppe_item, current) => {
    const updated = rules.map((r) =>
      r.ppe_item === ppe_item ? { ...r, is_required: !current } : r
    );
    setRules(updated);
    setSaving(true);
    try {
      await updatePPERules(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onRulesChange) {
        const rulesMap = {};
        updated.forEach((r) => (rulesMap[r.ppe_item] = r.is_required));
        onRulesChange(rulesMap);
      }
    } catch (error) {
      console.error("Failed to update rules:", error);
    }
    setSaving(false);
  };

  const ppeIcons = {
    helmet: "⛑️",
    vest: "🦺",
    gloves: "🧤",
    goggles: "🥽",
    shoes: "👢",
    boots: "👢",
    mask: "😷",
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
          PPE Rules
        </h3>
        {saved && (
          <span style={{ fontSize: "12px", color: "#22c55e" }}>
            ✓ Saved
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {rules.map((rule) => (
          <div
            key={rule.ppe_item}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              background: "#0f172a",
              borderRadius: "8px",
              border: "1px solid #334155",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>
                {ppeIcons[rule.ppe_item] || "🔧"}
              </span>
              <span style={{
                fontSize: "14px",
                color: "#f1f5f9",
                textTransform: "capitalize",
              }}>
                {rule.ppe_item}
              </span>
            </div>

            <div
              onClick={() => toggleRule(rule.ppe_item, rule.is_required)}
              style={{
                width: "44px",
                height: "24px",
                background: rule.is_required ? "#22c55e" : "#475569",
                borderRadius: "12px",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute",
                top: "2px",
                left: rule.is_required ? "22px" : "2px",
                width: "20px",
                height: "20px",
                background: "white",
                borderRadius: "50%",
                transition: "left 0.2s",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: "12px",
        fontSize: "11px",
        color: "#64748b",
        textAlign: "center",
      }}>
        Toggle to enable or disable PPE requirements
      </div>
    </div>
  );
};

export default PPETogglePanel;