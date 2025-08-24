#!/bin/bash

echo "🌱 Starting Virtual Garden with Real Plant Detection..."

# Check if Python backend directory exists
if [ ! -d "ml-backend" ]; then
    echo "❌ Backend directory not found. Run this script from the project root."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Start Python backend
echo "🐍 Starting Python backend..."
cd ml-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if backend port is available
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Backend may already be running."
    echo "   If you need to restart, kill the process using port 8000 first."
else
    echo "🚀 Starting FastAPI backend on port 8000..."
    # Run backend in background
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    echo "   Backend PID: $BACKEND_PID"
fi

# Return to project root
cd ..

# Start frontend
echo "⚛️  Starting React frontend..."

# Check if frontend port is available
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Frontend may already be running."
    echo "   If you need to restart, kill the process using port 5173 first."
else
    echo "🚀 Starting Vite frontend on port 5173..."
    # Run frontend in background
    npm run dev &
    FRONTEND_PID=$!
    echo "   Frontend PID: $FRONTEND_PID"
fi

echo ""
echo "✅ Virtual Garden is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔌 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "🔍 Plant Detection Features:"
echo "   • Real YOLOv5 plant detection"
echo "   • Bounding box visualization"
echo "   • Confidence scoring"
echo "   • Medicinal properties mapping"
echo "   • 3D garden visualization"
echo ""
echo "To stop both services, press Ctrl+C or run:"
echo "   pkill -f 'uvicorn main:app'"
echo "   pkill -f 'vite'"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "🛑 Shutting down..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
echo "💡 Tip: Upload clear plant images for best detection results!"
echo "   Press Ctrl+C to stop all services"
wait
