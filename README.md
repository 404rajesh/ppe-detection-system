# 🦺 AI-Based PPE Compliance Detection System

> A real-time AI-powered industrial safety system that automatically detects PPE compliance using computer vision and deep learning.

[![Python](https://img.shields.io/badge/Python-3.10-blue)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-orange)](https://ultralytics.com)
[![React](https://img.shields.io/badge/React-18-61dafb)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 🎯 Problem Statement

<<<<<<< HEAD
- Real-time PPE detection using YOLOv8
- Detects: Helmet, Safety Vest, Gloves, Boots, Goggles
- Live video feed with bounding boxes 
- Risk level classification (SAFE / LOW / MEDIUM / HIGH)
- Configurable PPE rules via dashboard toggles
- Violation logging with timestamps and camera ID
- Analytics dashboard with 7-day compliance trends
- JWT authenticated admin login
- Multi-camera support
- One-command startup
=======
Manual PPE monitoring in industrial environments is **inefficient, error-prone, and unscalable**. CCTV cameras exist but are passive — no one watches them in real time. Workers skip safety gear, accidents happen.
>>>>>>> 337b005 (Update README with professional documentation)

**This system solves it by making CCTV intelligent.**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 Real-time AI Detection | YOLOv8 detects PPE at 23ms per frame |
| 🎨 Smart Bounding Boxes | Green = Safe, Red = Violation |
| ⚠️ Risk Classification | SAFE / LOW / MEDIUM / HIGH |
| 🔧 Configurable Rules | Toggle PPE requirements from dashboard |
| 📊 Analytics Dashboard | 7-day compliance trends and charts |
| 🔔 Instant Alerts | Real-time violation banner + sound |
| 📷 Multi-Camera Support | Monitor multiple locations |
| 🔐 Secure Login | JWT authenticated admin access |
| 💾 Violation Logging | Every incident saved with timestamp |
| 🚀 One-Command Start | `./start.sh` launches everything |

---

## 🧠 PPE Detection Classes

| PPE Item | mAP50 | Status |
|---|---|---|
| ⛑️ Helmet | 0.806 | ✅ |
| 🦺 Safety Vest | 0.850 | ✅ |
| 🧤 Gloves | 0.784 | ✅ |
| 👢 Boots | 0.787 | ✅ |
| 🥽 Goggles | 0.743 | ✅ |
| 👤 Person | 0.880 | ✅ |
| **Overall** | **0.555** | ✅ |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│         React Dashboard (port 3000)      │
│   Login │ Live Feed │ Analytics │ Cams   │
└──────────────────┬──────────────────────┘
                   │ WebSocket + REST API
┌──────────────────▼──────────────────────┐
│       Node.js + Express (port 5000)      │
│   Auth │ Cameras │ Violations │ Stats    │
└──────────────────┬──────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────┐
│      FastAPI + Python (port 8000)        │
│   YOLOv8 │ IoU Logic │ Risk Engine       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│         PostgreSQL (port 5432)           │
│  Detections │ Violations │ PPE Rules     │
└─────────────────────────────────────────┘
```

---

## 🔄 How It Works

```
Camera Input → Frame Extraction → YOLOv8 Detection
      ↓
Detect: Person + Helmet + Vest + Gloves + Boots + Goggles
      ↓
IoU-based PPE-Person Association
      ↓
Apply Dashboard PPE Rules
      ↓
Calculate Missing PPE → Assign Risk Level
      ↓
Display Bounding Boxes + Trigger Alert + Save to DB
      ↓
Update Analytics Dashboard (autonomous loop)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| AI Model | YOLOv8n (Ultralytics) | PPE Object Detection |
| Inference | FastAPI + WebSocket | Real-time frame processing |
| Video | OpenCV | Frame extraction |
| Backend | Node.js + Express | REST API + Business logic |
| Auth | JWT | Secure authentication |
| Frontend | React + Vite | Dashboard UI |
| Charts | Recharts | Analytics visualization |
| Styling | Tailwind CSS | Modern dark UI |
| Database | PostgreSQL | Structured data storage |
| Deployment | Docker Compose | Containerized deployment |

---

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+
- Python 3.10+
- Node.js 20+
- PostgreSQL 14+
- NVIDIA GPU + CUDA (recommended for real-time inference)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/404rajesh/ppe-detection-system.git
cd ppe-detection-system
```

**2. Set up Python environment**
```bash
python3 -m venv ai-service/venv
source ai-service/venv/bin/activate
pip install -r ai-service/requirements.txt
```

**3. Set up Node.js backend**
```bash
cd backend && npm install && cd ..
```

**4. Set up React frontend**
```bash
cd frontend && npm install && cd ..
```

**5. Set up PostgreSQL database**
```bash
sudo -u postgres psql -c "CREATE USER ppeadmin WITH PASSWORD 'ppe123secure';"
sudo -u postgres psql -c "CREATE DATABASE ppe_detection OWNER ppeadmin;"
PGPASSWORD=ppe123secure psql -U ppeadmin -h localhost -d ppe_detection -f database/schema.sql
PGPASSWORD=ppe123secure psql -U ppeadmin -h localhost -d ppe_detection -f database/seed.sql
```

**6. Get the trained model**

The trained YOLOv8 model is included in the repository at `ai-service/models/ppe_best.pt`

### ▶️ Start the System

```bash
./start.sh
```

Open browser: **http://localhost:3000**
Login: `admin` / `admin123`

### ⏹️ Stop the System

```bash
./stop.sh
```

---

## 📁 Project Structure

```
ppe-detection-system/
│
├── 🤖 ai-service/              # Python AI Service
│   ├── main.py                 # FastAPI server + WebSocket endpoint
│   ├── models/
│   │   └── ppe_best.pt         # Trained YOLOv8 weights (6MB)
│   └── requirements.txt
│
├── ⚙️ backend/                 # Node.js REST API
│   └── src/
│       ├── controllers/        # Business logic
│       ├── routes/             # API endpoints
│       ├── middleware/         # JWT authentication
│       └── config/             # Database connection
│
├── 🎨 frontend/                # React Dashboard
│   └── src/
│       ├── components/         # LiveFeed, PPEToggle, Alerts
│       ├── pages/              # Dashboard, Analytics, Cameras
│       ├── services/           # API service layer
│       └── context/            # Auth context
│
├── 🗄️ database/
│   ├── schema.sql              # Full database schema
│   └── seed.sql                # Sample data for demo
│
├── 🐳 docker/                  # Docker deployment
│   ├── docker-compose.yml
│   ├── Dockerfile.ai
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── start.sh                    # ▶️ Start all services
└── stop.sh                     # ⏹️ Stop all services
```

---

<<<<<<< HEAD
BTech Final Year Project — 2026
=======
## 📊 Database Schema

| Table | Purpose |
|---|---|
| `users` | Admin authentication |
| `cameras` | Camera registry |
| `ppe_rules` | Configurable PPE requirements |
| `detections` | Frame detection records |
| `ppe_status` | Per-person PPE status |
| `violations` | Violation log with risk level |
| `daily_stats` | Analytics cache |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/cameras` | List cameras |
| GET | `/api/violations` | Get violations |
| GET | `/api/analytics/stats` | Dashboard stats |
| GET | `/api/analytics/compliance-trend` | 7-day trend |
| PUT | `/api/analytics/ppe-rules` | Update PPE rules |
| WS | `ws://localhost:8000/ws/detect` | Live detection |

---

## 🎓 Academic Information

**Project Title:** AI-Based PPE Compliance Detection for Industrial Safety Using Computer Vision

**Degree:** Bachelor of Technology (B.Tech)

**Semester:** 8th (Final Year Major Project) — 2026

**Dataset:** Construction-PPE Dataset (Ultralytics) — 1132 training images

**Training:** YOLOv8n, 100 epochs, GTX 1650 GPU, ~2 hours

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Built with ❤️ for Industrial Safety</strong><br>
  BTech Final Year Project — 2026
</div>
```

Save, then push to GitHub:

```bash
cd ~/ppe-detection-system && git add README.md && git commit -m "Update README with professional documentation" && git push
```
>>>>>>> 337b005 (Update README with professional documentation)
