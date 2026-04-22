# AI-Based PPE Compliance Detection System

A real-time AI-powered system that detects Personal Protective Equipment (PPE) compliance for industrial safety using computer vision.

## Demo

![PPE Detection Dashboard](docs/dashboard.png)

## Features

- Real-time PPE detection using YOLOv8
- Detects: Helmet, Safety Vest, Gloves, Boots, Goggles
- Live video feed with bounding boxes (Green = Safe, Red = Violation)
- Risk level classification (SAFE / LOW / MEDIUM / HIGH)
- Configurable PPE rules via dashboard toggles
- Violation logging with timestamps and camera ID
- Analytics dashboard with 7-day compliance trends
- JWT authenticated admin login
- Multi-camera support
- One-command startup

## Tech Stack

| Layer | Technology |
|---|---|
| AI Model | YOLOv8 (Ultralytics) |
| Inference API | Python + FastAPI + WebSocket |
| Backend API | Node.js + Express + JWT |
| Frontend | React + Tailwind CSS + Recharts |
| Database | PostgreSQL |
| Video Processing | OpenCV |

## System Architecture

```
React Frontend (port 3000)
        ↓ WebSocket + REST API
Node.js Backend (port 5000)
        ↓ REST API
FastAPI AI Service (port 8000)
        ↓
YOLOv8 Model (GPU accelerated)
        ↓
PostgreSQL Database (port 5432)

## Installation

### Prerequisites
- Ubuntu 20.04+
- Python 3.10+
- Node.js 20+
- PostgreSQL 14+
- NVIDIA GPU with CUDA (recommended)

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/ppe-detection-system.git
cd ppe-detection-system
```

2. Set up Python environment
```bash
python3 -m venv ai-service/venv
source ai-service/venv/bin/activate
pip install -r ai-service/requirements.txt
```

3. Set up Node.js backend
```bash
cd backend && npm install
```

4. Set up React frontend
```bash
cd frontend && npm install
```

5. Set up PostgreSQL
```bash
sudo -u postgres psql
CREATE USER ppeadmin WITH PASSWORD 'ppe123secure';
CREATE DATABASE ppe_detection OWNER ppeadmin;
GRANT ALL PRIVILEGES ON DATABASE ppe_detection TO ppeadmin;
\q
PGPASSWORD=ppe123secure psql -U ppeadmin -h localhost -d ppe_detection -f database/schema.sql
```

6. Download the trained model
The trained YOLOv8 model (`ppe_best.pt`) is available at:
[Google Drive Link - Add your link here]

Place it at: `ai-service/models/ppe_best.pt`

### Start the system

```bash
./start.sh
```

Open browser at `http://localhost:3000`
Login with: `admin / admin123`

### Stop the system

```bash
./stop.sh
```

## Model Performance

| Class | mAP50 |
|---|---|
| Helmet | 0.806 |
| Safety Vest | 0.850 |
| Gloves | 0.784 |
| Boots | 0.787 |
| Goggles | 0.743 |
| Person | 0.880 |
| **Overall** | **0.555** |

## Project Structure


ppe-detection-system/
├── ai-service/          # Python FastAPI + YOLOv8
│   ├── main.py          # FastAPI server + WebSocket
│   ├── models/          # Trained model weights
│   └── requirements.txt
├── backend/             # Node.js Express API
│   └── src/
│       ├── controllers/ # Business logic
│       ├── routes/      # API endpoints
│       └── middleware/  # JWT auth
├── frontend/            # React dashboard
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Dashboard, Analytics, Cameras
│       └── services/    # API calls
├── database/
│   └── schema.sql       # PostgreSQL schema
├── docker/              # Docker configuration
├── start.sh             # One-command startup
└── stop.sh              # One-command shutdown

## Author

BTech Final Year Project — 2026