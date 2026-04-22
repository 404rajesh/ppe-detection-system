#!/bin/bash
echo "==============================="
echo " PPE Detection System"
echo "==============================="

mkdir -p /home/x/ppe-detection-system/logs

# Start AI Service
echo "Starting AI Service..."
cd /home/x/ppe-detection-system
source ai-service/venv/bin/activate
nohup python3 ai-service/main.py > logs/ai.log 2>&1 &
AI_PID=$!
echo "AI Service PID: $AI_PID"

sleep 3

# Start Backend
echo "Starting Backend..."
cd /home/x/ppe-detection-system/backend
nohup node src/index.js > /home/x/ppe-detection-system/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

# Start Frontend
echo "Starting Frontend..."
cd /home/x/ppe-detection-system/frontend
nohup npm run dev > /home/x/ppe-detection-system/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 5

echo ""
echo "==============================="
echo "System is ready!"
echo "Open: http://localhost:3000"
echo "Login: admin / admin123"
echo "==============================="
echo ""
echo "To stop everything run:"
echo "pkill -f 'python3 ai-service/main.py'"
echo "pkill -f 'node.*backend/src/index.js'"
echo "pkill -f vite"