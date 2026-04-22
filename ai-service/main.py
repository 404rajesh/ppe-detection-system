from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import numpy as np
from ultralytics import YOLO
import base64
import json
import time
from datetime import datetime
import os

app = FastAPI(title="PPE Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "/home/x/ppe-detection-system/ai-service/models/ppe_best.pt"
SNAPSHOT_DIR = "/home/x/ppe-detection-system/ai-service/snapshots"
CONF_THRESHOLD = 0.55
IOU_THRESHOLD = 0.10
os.makedirs(SNAPSHOT_DIR, exist_ok=True)

print("Loading YOLO model...")
model = YOLO(MODEL_PATH)
print("Model loaded successfully")
print("Classes:", model.names)

PPE_CLASSES = ["helmet", "gloves", "vest", "boots", "goggles"]
NO_PPE_CLASSES = ["no_helmet", "no_goggle", "no_gloves", "no_boots"]
PERSON_CLASS = "Person"

def calculate_iou(box1, box2):
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    intersection = max(0, x2 - x1) * max(0, y2 - y1)
    if intersection == 0:
        return 0
    area1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    area2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    union = area1 + area2 - intersection
    return intersection / union if union > 0 else 0

def is_inside_or_overlapping(ppe_box, person_box, threshold=0.10):
    iou = calculate_iou(ppe_box, person_box)
    if iou >= threshold:
        return True
    px1, py1, px2, py2 = person_box
    bx1, by1, bx2, by2 = ppe_box
    cx = (bx1 + bx2) / 2
    cy = (by1 + by2) / 2
    if px1 <= cx <= px2 and py1 <= cy <= py2:
        return True
    return False

def get_risk_level(missing_ppe, direct_violations):
    if len(missing_ppe) == 0:
        return "SAFE"
    has_no_helmet = "no_helmet" in direct_violations
    if has_no_helmet or "helmet" in missing_ppe:
        return "HIGH"
    count = len(missing_ppe)
    if count == 1:
        return "LOW"
    elif count == 2:
        return "MEDIUM"
    else:
        return "HIGH"

def process_frame(frame, ppe_rules):
    results = model.predict(
        source=frame,
        conf=CONF_THRESHOLD,
        verbose=False
    )[0]

    persons = []
    ppe_detections = []
    no_ppe_detections = []

    for box in results.boxes:
        cls_id = int(box.cls[0])
        cls_name = model.names[cls_id]
        conf = float(box.conf[0])
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        if cls_name == PERSON_CLASS:
            persons.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 2),
                "ppe_found": [],
                "direct_violations": [],
                "missing_ppe": [],
                "risk_level": "SAFE"
            })
        elif cls_name in PPE_CLASSES:
            ppe_detections.append({
                "class": cls_name,
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 2)
            })
        elif cls_name in NO_PPE_CLASSES:
            no_ppe_detections.append({
                "class": cls_name,
                "bbox": [x1, y1, x2, y2],
                "confidence": round(conf, 2)
            })

    for person in persons:
        for ppe in ppe_detections:
            if is_inside_or_overlapping(ppe["bbox"], person["bbox"], IOU_THRESHOLD):
                if ppe["class"] not in person["ppe_found"]:
                    person["ppe_found"].append(ppe["class"])

        for no_ppe in no_ppe_detections:
            if is_inside_or_overlapping(no_ppe["bbox"], person["bbox"], IOU_THRESHOLD):
                if no_ppe["class"] not in person["direct_violations"]:
                    person["direct_violations"].append(no_ppe["class"])

        required_ppe = [
            item for item, required in ppe_rules.items()
            if required and item in PPE_CLASSES
        ]

        person["missing_ppe"] = [
            p for p in required_ppe
            if p not in person["ppe_found"]
        ]

        person["risk_level"] = get_risk_level(
            person["missing_ppe"],
            person["direct_violations"]
        )

    annotated = results.plot()
    overall_violation = any(p["risk_level"] != "SAFE" for p in persons)

    if overall_violation and len(persons) > 0:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        snapshot_path = f"{SNAPSHOT_DIR}/violation_{timestamp}.jpg"
        cv2.imwrite(snapshot_path, annotated)

    _, buffer = cv2.imencode(".jpg", annotated)
    frame_base64 = base64.b64encode(buffer).decode("utf-8")

    return {
        "timestamp": datetime.now().isoformat(),
        "total_persons": len(persons),
        "persons": persons,
        "overall_violation": overall_violation,
        "frame_base64": frame_base64
    }

@app.get("/")
def root():
    return {"status": "PPE Detection API running", "model": "YOLOv8"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return JSONResponse(status_code=400, content={"error": "Invalid image"})
    ppe_rules = {
        "helmet": True,
        "vest": True,
        "gloves": False,
        "goggles": False,
        "boots": False
    }
    result = process_frame(frame, ppe_rules)
    result.pop("frame_base64", None)
    return result

@app.websocket("/ws/detect")
async def websocket_detect(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected")
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            ppe_rules = message.get("ppe_rules", {
                "helmet": True,
                "vest": True,
                "gloves": False,
                "goggles": False,
                "boots": False
            })

            frame_data = message.get("frame", "")
            if not frame_data:
                continue

            if "," in frame_data:
                frame_data = frame_data.split(",")[1]

            frame_bytes = base64.b64decode(frame_data)
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            result = process_frame(frame, ppe_rules)
            await websocket.send_text(json.dumps(result))

    except WebSocketDisconnect:
        print("WebSocket client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)