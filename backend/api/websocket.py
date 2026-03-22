"""WebSocket endpoint for real-time state streaming."""

from __future__ import annotations

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Literal

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from starlette.websockets import WebSocketState

from services.connection_manager import connection_manager
from services.stream_processor import StreamProcessor

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


# Pydantic models for WebSocket messages
class WSMessage(BaseModel):
    """Base WebSocket message format."""
    type: Literal["state_update", "alert", "audit_log", "heartbeat", "init", "pong"]
    location_id: str
    timestamp: datetime
    data: dict | None = None


class StateUpdateMessage(WSMessage):
    """State update message."""
    type: Literal["state_update"] = "state_update"
    data: dict  # Contains rho, sigma, delta, state_score, status, etc.


class AlertMessage(WSMessage):
    """Alert notification message."""
    type: Literal["alert"] = "alert"
    alert_type: str
    priority: Literal["INFO", "WARNING", "CRITICAL"]
    message: str


class AuditLogMessage(WSMessage):
    """Audit log entry message."""
    type: Literal["audit_log"] = "audit_log"
    log_id: str
    level: Literal["INFO", "WARNING", "ERROR", "SUCCESS"]
    component: str
    message: str
    details: str | None = None


class HeartbeatMessage(WSMessage):
    """Heartbeat/ping message."""
    type: Literal["heartbeat", "pong"] = "heartbeat"


# Legacy manager for backward compatibility (will be replaced by connection_manager)
class LegacyConnectionManager:
    """Manages WebSocket connections with connection pooling."""

    def __init__(self):
        # location_id -> list of connected websockets
        self._connections: dict[str, list[WebSocket]] = {}
        # websocket -> location_id mapping for fast lookup
        self._websocket_map: dict[WebSocket, str] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket, location_id: str) -> bool:
        """Accept and register a new WebSocket connection."""
        try:
            await websocket.accept()

            async with self._lock:
                if location_id not in self._connections:
                    self._connections[location_id] = []
                self._connections[location_id].append(websocket)
                self._websocket_map[websocket] = location_id

            logger.info(f"WebSocket connected: {location_id} (total: {len(self._connections[location_id])})")
            return True
        except Exception as e:
            logger.exception(f"Failed to accept WebSocket connection: {e}")
            return False

    async def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        async with self._lock:
            location_id = self._websocket_map.pop(websocket, None)
            if location_id and location_id in self._connections:
                if websocket in self._connections[location_id]:
                    self._connections[location_id].remove(websocket)
                # Clean up empty location entries
                if not self._connections[location_id]:
                    del self._connections[location_id]

        try:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.close()
        except Exception:
            pass

        if location_id:
            logger.info(f"WebSocket disconnected: {location_id}")

    async def broadcast_to_location(self, location_id: str, message: dict) -> int:
        """Broadcast message to all connections for a location.

        Returns number of successful sends.
        """
        if location_id not in self._connections:
            return 0

        sent_count = 0
        disconnected = []

        for websocket in list(self._connections[location_id]):
            try:
                if websocket.client_state == WebSocketState.CONNECTED:
                    await websocket.send_json(message)
                    sent_count += 1
            except Exception:
                # Mark for removal
                disconnected.append(websocket)

        # Clean up disconnected clients
        for ws in disconnected:
            await self.disconnect(ws)

        return sent_count

    async def send_to_client(self, websocket: WebSocket, message: dict) -> bool:
        """Send message to a specific client."""
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.send_json(message)
                return True
        except Exception as e:
            logger.exception(f"Failed to send to client: {e}")
            await self.disconnect(websocket)
        return False

    def get_connection_count(self, location_id: str | None = None) -> int:
        """Get total connection count, optionally filtered by location."""
        if location_id:
            return len(self._connections.get(location_id, []))
        return sum(len(conns) for conns in self._connections.values())

    def get_active_locations(self) -> list[str]:
        """Get list of locations with active connections."""
        return list(self._connections.keys())


# Global connection manager
manager = LegacyConnectionManager()


async def handle_state_update(location_id: str, state_data: dict) -> None:
    """Callback for StreamProcessor to broadcast state updates."""
    await manager.broadcast_to_location(location_id, state_data)


@router.websocket("/ws/live/{location_id}")
async def websocket_endpoint(websocket: WebSocket, location_id: str):
    """WebSocket endpoint for real-time state streaming.

    - Handles client connections
    - Sends initial state on connect
    - Streams updates every 5s (via StreamProcessor)
    - Handles disconnections gracefully
    - Heartbeat/ping-pong for connection health
    """
    # Accept connection using new connection manager
    await connection_manager.connect(websocket, location_id)

    try:
        # Get or create stream processor for this location
        processor = StreamProcessor.get_instance(location_id)

        # If no active processor, we can still serve cached state
        if not processor:
            # Send initial message indicating no active stream
            await connection_manager.send_to_client(websocket, {
                "type": "init",
                "location_id": location_id,
                "timestamp": datetime.now().isoformat(),
                "data": {
                    "status": "connected",
                    "stream_active": False,
                    "message": "Connected. No active stream for this location.",
                },
            })
        else:
            # Register callback for this connection
            processor.add_update_callback(handle_state_update)

            # Send initial current state if available
            current_state = processor.update_state_vector()
            await connection_manager.send_to_client(websocket, {
                "type": "state_update",
                "location_id": location_id,
                "timestamp": datetime.now().isoformat(),
                "data": current_state,
            })

        # Keep connection alive and handle client messages
        while True:
            try:
                # Wait for messages from client (with timeout)
                data = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0,
                )

                # Handle client commands
                try:
                    message = json.loads(data)
                    msg_type = message.get("type") or message.get("command")

                    if msg_type == "ping":
                        # Update heartbeat and respond with pong
                        connection_manager.update_heartbeat(websocket)
                        await connection_manager.send_to_client(websocket, {
                            "type": "pong",
                            "location_id": location_id,
                            "timestamp": datetime.now().isoformat(),
                            "data": {
                                "client_timestamp": message.get("timestamp"),
                                "server_timestamp": datetime.now().isoformat(),
                            },
                        })

                    elif msg_type == "get_state":
                        # Request current state
                        if processor:
                            state = processor.update_state_vector()
                            await connection_manager.send_to_client(websocket, {
                                "type": "state_update",
                                "location_id": location_id,
                                "timestamp": datetime.now().isoformat(),
                                "data": state,
                            })

                    elif msg_type == "subscribe_alerts":
                        # Client wants alert filtering
                        alert_level = message.get("level", "INFO")
                        await connection_manager.send_to_client(websocket, {
                            "type": "init",
                            "location_id": location_id,
                            "timestamp": datetime.now().isoformat(),
                            "data": {
                                "subscription_confirmed": True,
                                "alerts_level": alert_level,
                            },
                        })

                    elif msg_type == "init":
                        # Client initialization
                        await connection_manager.send_to_client(websocket, {
                            "type": "init",
                            "location_id": location_id,
                            "timestamp": datetime.now().isoformat(),
                            "data": {
                                "status": "initialized",
                                "connection_id": id(websocket),
                            },
                        })

                    else:
                        await connection_manager.send_to_client(websocket, {
                            "type": "error",
                            "location_id": location_id,
                            "timestamp": datetime.now().isoformat(),
                            "data": {"message": f"Unknown message type: {msg_type}"},
                        })

                except json.JSONDecodeError:
                    await connection_manager.send_to_client(websocket, {
                        "type": "error",
                        "location_id": location_id,
                        "timestamp": datetime.now().isoformat(),
                        "data": {"message": "Invalid JSON"},
                    })

            except asyncio.TimeoutError:
                # Send heartbeat to keep connection alive
                try:
                    await connection_manager.send_to_client(websocket, {
                        "type": "heartbeat",
                        "location_id": location_id,
                        "timestamp": datetime.now().isoformat(),
                        "data": {},
                    })
                except Exception:
                    break

    except WebSocketDisconnect:
        logger.info(f"[WebSocket] Client disconnected: {location_id}")
    except Exception as e:
        logger.exception(f"[WebSocket] Error for {location_id}: {e}")
    finally:
        # Cleanup
        if processor:
            processor.remove_update_callback(handle_state_update)
        connection_manager.disconnect(websocket)


@router.get("/ws/stats")
async def websocket_stats() -> dict[str, Any]:
    """Get WebSocket connection statistics."""
    return connection_manager.get_connection_stats()
