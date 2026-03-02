# CrowdState AI 🛰️

**CrowdState AI** is a tri-axial crowd prediction and sensory-weighted navigation engine designed for high-density urban environments. It uses computer vision, acoustic analysis, and deep learning to model urban dynamics and provide "Calm Path" routing (AuraPath).

## 🚀 Key Features

- **Tri-Axial State Vector**: Real-time assembly of Physical Density ($\rho$), Sensory Load ($\Sigma$), and Volatility ($\Delta$).
- **Predictive Forecasting**: PyTorch LSTM model predicting crowd states with a 10-minute horizon.
- **AuraPath™ Navigation**: Sensory-weighted routing that optimizes for psychological safety rather than just distance.
- **Mission Control Dashboard**: High-fidelity Bento Grid interface with real-time Radar Chart visualization and Time-Travel scrubbers.
- **Design DNA**: Deep Navy (#1E3A8A) and Electric Teal (#0891B2) forensic aesthetic.

## 🏗️ Monorepo Architecture

```text
/backend          # FastAPI + YOLOv8 + Librosa + PyTorch
/frontend         # Next.js 14 + Tailwind + Framer Motion + Recharts
/docs             # PRD, Design Docs, Tech Stack (Internal)
setup.bat         # Windows automated setup script
package.json      # Monorepo orchestration
```

## 🛠️ Tech Stack

- **Backend**: Python (FastAPI), YOLOv8 (Ultralytics), Librosa, PyTorch, NumPy.
- **Frontend**: TypeScript, React, Next.js 14 (App Router), Tailwind CSS, Framer Motion, Recharts, Lucide Icons.
- **Orchestration**: Docker & Docker Compose (Production), Node.js scripts (Dev).

## ⚡ Quick Start

### Windows (Automated)
Run the setup script from the root directory to install all dependencies and start the dev environment:
```powershell
.\setup.bat
```

### Manual Setup

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📡 API & WebSockets

- **WebSocket Stream**: `ws://localhost:8000/ws/stream`
  - Streams real-time JSON: `{ rho, sigma, delta, predictions: [...] }`
- **Health Check**: `GET http://localhost:8000/docs`

## 🎨 Design Principles

- **Forensic Discovery**: High-contrast dark mode with glowing accents.
- **Mathematical Precision**: JetBrains Mono for numerical data, Inter for typography.
- **Interactive Depth**: Scroll-triggered reveals, parallax motion, and micro-interactions.

---
© 2026 CrowdState AI Group. Proprietary Forensic Engine.
