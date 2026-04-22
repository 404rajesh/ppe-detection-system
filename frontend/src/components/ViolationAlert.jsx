import { useState, useEffect } from "react";

const ViolationAlert = ({ violation }) => {
  const [visible, setVisible] = useState(false);
  const [audio] = useState(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  });

  useEffect(() => {
    if (violation) {
      setVisible(true);
      playAlertSound();
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [violation]);

  const playAlertSound = () => {
    try {
      const oscillator = audio.createOscillator();
      const gainNode = audio.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audio.destination);
      oscillator.frequency.setValueAtTime(880, audio.currentTime);
      oscillator.frequency.setValueAtTime(440, audio.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(880, audio.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, audio.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + 0.4);
      oscillator.start(audio.currentTime);
      oscillator.stop(audio.currentTime + 0.4);
    } catch (e) {
      console.log("Audio not available");
    }
  };

  if (!visible || !violation) return null;

  const riskColors = {
    HIGH: { bg: "#7f1d1d", border: "#ef4444", text: "#fca5a5" },
    MEDIUM: { bg: "#9a3412", border: "#f97316", text: "#fdba74" },
    LOW: { bg: "#854d0e", border: "#eab308", text: "#fde68a" },
  };

  const colors = riskColors[violation.risk_level] || riskColors.HIGH;

  return (
    <div style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "10px",
      padding: "14px 18px",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      animation: "pulse 1s ease-in-out",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px" }}>🚨</span>
        <div>
          <div style={{
            fontSize: "14px",
            fontWeight: "700",
            color: colors.text,
          }}>
            PPE Violation Detected — Risk: {violation.risk_level}
          </div>
          <div style={{
            fontSize: "12px",
            color: colors.text,
            opacity: 0.8,
            marginTop: "2px",
          }}>
            Missing: {violation.missing_ppe?.join(", ") || "Unknown"}
            {" "} | Camera: {violation.camera || "CAM_01"}
          </div>
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        style={{
          background: "transparent",
          border: "none",
          color: colors.text,
          cursor: "pointer",
          fontSize: "18px",
          padding: "4px",
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default ViolationAlert;