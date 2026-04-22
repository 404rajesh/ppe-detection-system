#!/bin/bash
echo "Stopping PPE Detection System..."
pkill -f "python3 ai-service/main.py"
pkill -f "node.*backend/src/index.js"
pkill -f vite
echo "All services stopped."