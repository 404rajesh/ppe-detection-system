import { useRef, useEffect, useState, useCallback } from "react";
import { saveDetection } from "../services/api";

const LiveFeed = ({ ppeRules, cameraId, onViolation }) => {
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const webcamRef = useRef(null);
  const lastViolationSave = useRef(0);
  const [connected, setConnected] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [processedFrame, setProcessedFrame] = useState(null);
  const [mode, setMode] = useState("webcam");
  const [videoFile, setVideoFile] = useState(null);
  const [stats, setStats] = useState({ persons: 0, violations: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    stopDetection();
  }, [cameraId]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket("ws://localhost:8000/ws/detect");
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
        setError("");
      };
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.frame_base64) {
          setProcessedFrame(`data:image/jpeg;base64,${data.frame_base64}`);
        }
        setStats({
          persons: data.total_persons || 0,
          violations: data.persons?.filter(
            (p) => p.risk_level !== "SAFE"
          ).length || 0,
        });
        if (data.overall_violation && data.persons?.length > 0) {
          const violatingPerson = data.persons.find(
            (p) => p.risk_level !== "SAFE"
          );
          if (violatingPerson && onViolation) {
            onViolation({
              ...violatingPerson,
              camera: `CAM_0${cameraId}`,
            });
          }
          const now = Date.now();
          if (now - lastViolationSave.current > 10000) {
            lastViolationSave.current = now;
            try {
              await saveDetection({
                camera_id: cameraId,
                total_persons: data.total_persons,
                persons: data.persons,
                overall_violation: data.overall_violation,
                frame_path: null,
              });
            } catch (err) {
              console.error("Failed to save detection:", err);
            }
          }
        }
      };
      ws.onerror = () => {
        setError("Cannot connect to AI service.");
        setConnected(false);
      };
      ws.onclose = () => {
        setConnected(false);
        setTimeout(connectWebSocket, 3000);
      };
    } catch (err) {
      setError("WebSocket connection failed");
    }
  };

  const getFrame = useCallback(() => {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN
    ) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let source = null;
    if (mode === "webcam" && webcamRef.current) {
      source = webcamRef.current;
    } else if (mode === "video" && videoRef.current) {
      source = videoRef.current;
    }
    if (!source) return;
    canvas.width = 640;
    canvas.height = 480;
    ctx.drawImage(source, 0, 0, 640, 480);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    let rulesMap = {
      helmet: true,
      vest: true,
      gloves: false,
      goggles: false,
      boots: false,
    };

    if (ppeRules && typeof ppeRules === "object") {
      if (Array.isArray(ppeRules)) {
        ppeRules.forEach((r) => {
          if (r.ppe_item) rulesMap[r.ppe_item] = r.is_required;
        });
      } else {
        Object.keys(ppeRules).forEach((key) => {
          rulesMap[key] = ppeRules[key];
        });
      }
    }

    wsRef.current.send(
      JSON.stringify({ frame: imageData, ppe_rules: rulesMap })
    );
  }, [mode, ppeRules]);

  const startDetection = () => {
  setDetecting(true);
  if (mode === "video" && videoRef.current) {
    videoRef.current.play();
  }
  intervalRef.current = setInterval(() => getFrame(), 2000);
};

useEffect(() => {
  if (detecting) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => getFrame(), 2000);
  }
}, [ppeRules, getFrame]);

  const stopDetection = () => {
    setDetecting(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (videoRef.current) videoRef.current.pause();
    setProcessedFrame(null);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoFile(url);
    setMode("video");
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = url;
        videoRef.current.load();
        videoRef.current.play();
      }
    }, 500);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.play();
      }
      setMode("webcam");
      setError("");
    } catch (err) {
      setError("Webcam not available. Please use video upload instead.");
    }
  };

  return (
    <div className="card">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h3 style={{
            fontSize: "15px",
            fontWeight: "600",
            color: "#f1f5f9",
          }}>
            Live Feed — CAM_0{cameraId}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: connected ? "#22c55e" : "#ef4444",
            }} />
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
              {connected ? "AI Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={startWebcam}
            style={{
              padding: "5px 12px",
              background: mode === "webcam" ? "#1d4ed8" : "#1e293b",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Webcam
          </button>
          <label style={{
            padding: "5px 12px",
            background: mode === "video" ? "#1d4ed8" : "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
          }}>
            Upload Video
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              style={{ display: "none" }}
            />
          </label>
          {!detecting ? (
            <button
              onClick={startDetection}
              disabled={!connected}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "6px 14px" }}
            >
              Start Detection
            </button>
          ) : (
            <button
              onClick={stopDetection}
              className="btn-danger"
              style={{ fontSize: "13px", padding: "6px 14px" }}
            >
              Stop
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{
          background: "#7f1d1d",
          border: "1px solid #ef4444",
          borderRadius: "8px",
          padding: "10px",
          marginBottom: "12px",
          fontSize: "12px",
          color: "#fca5a5",
        }}>
          {error}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        background: "#0f172a",
      }}>
        <video
          ref={webcamRef}
          autoPlay
          muted
          style={{
            width: "100%",
            borderRadius: "8px",
            display: mode === "webcam" && !processedFrame ? "block" : "none",
          }}
        />
        <video
          ref={videoRef}
          src={videoFile}
          muted
          loop
          autoPlay
          playsInline
          onLoadedData={() => {
            if (videoRef.current) videoRef.current.play();
          }}
          style={{
            width: "100%",
            borderRadius: "8px",
            display: mode === "video" ? "block" : "none",
          }}
        />
        {processedFrame && (
          <img
            src={processedFrame}
            alt="Processed"
            style={{
              width: "100%",
              borderRadius: "8px",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {!videoFile && mode === "video" && (
          <div style={{
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
            color: "#94a3b8",
          }}>
            <span style={{ fontSize: "40px" }}>🎬</span>
            <span style={{ fontSize: "14px" }}>
              Upload a video file to start detection
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Tip: Use a construction site video for best results
            </span>
          </div>
        )}

        {detecting && (
          <div style={{ position: "absolute", top: "8px", left: "8px" }}>
            <span style={{
              background: "#ef4444",
              color: "white",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "700",
            }}>
              ● REC
            </span>
          </div>
        )}

        <div style={{
          position: "absolute",
          bottom: "8px",
          left: "8px",
          display: "flex",
          gap: "6px",
        }}>
          <span style={{
            background: "rgba(0,0,0,0.7)",
            color: "#f1f5f9",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "11px",
          }}>
            👤 {stats.persons}
          </span>
          <span style={{
            background: stats.violations > 0
              ? "rgba(239,68,68,0.8)"
              : "rgba(34,197,94,0.8)",
            color: "white",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "11px",
            fontWeight: "600",
          }}>
            {stats.violations > 0
              ? `⚠ ${stats.violations} Violation`
              : "✓ Compliant"}
          </span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px",
        marginTop: "12px",
      }}>
        <div style={{
          background: "#0f172a",
          borderRadius: "8px",
          padding: "10px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#f1f5f9",
          }}>
            {stats.persons}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
            Persons Detected
          </div>
        </div>
        <div style={{
          background: "#0f172a",
          borderRadius: "8px",
          padding: "10px",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "20px",
            fontWeight: "700",
            color: stats.violations > 0 ? "#ef4444" : "#22c55e",
          }}>
            {stats.violations}
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Violations</div>
        </div>
      </div>
    </div>
  );
};

export default LiveFeed;