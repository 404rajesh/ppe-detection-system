from ultralytics import YOLO
import torch

print("="*50)
print("PPE Detection Model Training")
print("="*50)
print(f"CUDA Available: {torch.cuda.is_available()}")
print(f"GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}")
print("="*50)

import os
MODEL_SAVE_DIR = "/home/x/ppe-detection-system/ai-service/models"
os.makedirs(MODEL_SAVE_DIR, exist_ok=True)

model = YOLO("yolov8n.pt")

print("\nStarting training on Construction PPE dataset...")
print("Classes: helmet, vest, gloves, boots, goggles + missing PPE variants")
print("="*50)

results = model.train(
    data="construction-ppe.yaml",
    epochs=100,
    imgsz=640,
    batch=12,
    device=0,
    project=MODEL_SAVE_DIR,
    name="ppe_model_final",
    patience=20,
    save=True,
    plots=True,
    verbose=True,
    workers=4,
    cache=False,
    amp=True,
    augment=True,
    degrees=10.0,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.1,
)

print("\n" + "="*50)
print("Training Complete!")
print(f"Best model saved at: {MODEL_SAVE_DIR}/ppe_model_final/weights/best.pt")
print("="*50)

metrics = model.val()
print(f"\nFinal Results:")
print(f"mAP50:    {metrics.box.map50:.3f}")
print(f"mAP50-95: {metrics.box.map:.3f}")
print(f"Precision: {metrics.box.mp:.3f}")
print(f"Recall:    {metrics.box.mr:.3f}")