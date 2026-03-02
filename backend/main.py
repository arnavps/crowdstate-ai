from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from engine import CrowdEngine
import asyncio
import json
import numpy as np

app = FastAPI(title="CrowdState AI Backend")
engine = CrowdEngine()

@app.get("/")
async def root():
    return {"message": "CrowdState AI Engine is Online", "status": "Ready"}

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time processing loop
            # In production, this would receive binary frames from the client
            # For now, we simulate a recurring state update
            
            # Mock frame/audio processing for demonstration
            # engine.process_video_frame(camera_frame)
            # engine.process_audio_buffer(mic_buffer)
            
            # Update state with dummy fluctuations if no data is sent
            engine.rho += np.random.uniform(-0.01, 0.01)
            engine.rho = max(0, engine.rho)
            engine.rho_history.append((asyncio.get_event_loop().time(), engine.rho))
            engine.calculate_delta()
            
            state = engine.get_state_vector()
            await websocket.send_text(json.dumps(state))
            await asyncio.sleep(1) # 1Hz update rate
    except WebSocketDisconnect:
        print("Frontend disconnected")
