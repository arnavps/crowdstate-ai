import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for real-time state updates.
    Handles multiple clients per location with efficient broadcasting.
    """
    
    def __init__(self):
        # location_id -> set of connected websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # websocket -> location_id mapping for quick lookup
        self.websocket_locations: Dict[WebSocket, str] = {}
        # Heartbeat tracking: websocket -> last pong timestamp
        self.last_heartbeat: Dict[WebSocket, float] = {}
        # Connection metadata: websocket -> connection info
        self.connection_info: Dict[WebSocket, dict] = {}
        
    async def connect(self, websocket: WebSocket, location_id: str):
        """
        Accept a new WebSocket connection and register it.
        
        Args:
            websocket: The WebSocket connection object
            location_id: The location this client is monitoring
        """
        await websocket.accept()
        
        # Initialize location set if needed
        if location_id not in self.active_connections:
            self.active_connections[location_id] = set()
        
        # Register connection
        self.active_connections[location_id].add(websocket)
        self.websocket_locations[websocket] = location_id
        self.last_heartbeat[websocket] = asyncio.get_event_loop().time()
        self.connection_info[websocket] = {
            'connected_at': asyncio.get_event_loop().time(),
            'client_ip': websocket.client.host if websocket.client else 'unknown',
            'location_id': location_id,
        }
        
        client_count = len(self.active_connections[location_id])
        logger.info(
            f"[ConnectionManager] Client connected to {location_id}. "
            f"Total clients for location: {client_count}"
        )
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection and clean up.
        
        Args:
            websocket: The WebSocket connection to remove
        """
        location_id = self.websocket_locations.get(websocket)
        
        if location_id and location_id in self.active_connections:
            self.active_connections[location_id].discard(websocket)
            
            # Clean up empty location sets
            if not self.active_connections[location_id]:
                del self.active_connections[location_id]
        
        # Clean up all tracking
        self.websocket_locations.pop(websocket, None)
        self.last_heartbeat.pop(websocket, None)
        self.connection_info.pop(websocket, None)
        
        if location_id:
            remaining = len(self.active_connections.get(location_id, set()))
            logger.info(
                f"[ConnectionManager] Client disconnected from {location_id}. "
                f"Remaining clients: {remaining}"
            )
    
    async def broadcast_to_location(
        self, 
        location_id: str, 
        message: dict,
        exclude: WebSocket = None
    ):
        """
        Broadcast a message to all connected clients for a location.
        
        Args:
            location_id: The location to broadcast to
            message: The message to send (will be JSON serialized)
            exclude: Optional websocket to exclude from broadcast
        """
        if location_id not in self.active_connections:
            return
        
        disconnected = []
        message_json = None
        
        for websocket in self.active_connections[location_id]:
            if websocket == exclude:
                continue
                
            try:
                # Only serialize once
                if message_json is None:
                    import json
                    message_json = json.dumps(message)
                
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"[ConnectionManager] Failed to send to client: {e}")
                disconnected.append(websocket)
        
        # Clean up any disconnected clients
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def send_to_client(self, websocket: WebSocket, message: dict):
        """
        Send a message to a specific client.
        
        Args:
            websocket: The target WebSocket
            message: The message to send
        """
        try:
            import json
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"[ConnectionManager] Failed to send to client: {e}")
            self.disconnect(websocket)
    
    def update_heartbeat(self, websocket: WebSocket):
        """Update the last heartbeat timestamp for a connection."""
        if websocket in self.last_heartbeat:
            self.last_heartbeat[websocket] = asyncio.get_event_loop().time()
    
    def get_stale_connections(self, timeout_seconds: float = 60.0) -> List[WebSocket]:
        """
        Get connections that haven't sent a heartbeat recently.
        
        Args:
            timeout_seconds: How long before considering a connection stale
            
        Returns:
            List of stale WebSocket connections
        """
        current_time = asyncio.get_event_loop().time()
        stale = []
        
        for websocket, last_pong in self.last_heartbeat.items():
            if current_time - last_pong > timeout_seconds:
                stale.append(websocket)
        
        return stale
    
    async def cleanup_stale_connections(self, timeout_seconds: float = 60.0):
        """Remove connections that haven't responded to heartbeats."""
        stale = self.get_stale_connections(timeout_seconds)
        
        for websocket in stale:
            logger.warning("[ConnectionManager] Removing stale connection")
            try:
                await websocket.close(code=1001, reason="Heartbeat timeout")
            except:
                pass
            self.disconnect(websocket)
    
    def get_connection_stats(self) -> dict:
        """
        Get statistics about current connections.
        
        Returns:
            Dictionary with connection statistics
        """
        total_connections = sum(
            len(clients) for clients in self.active_connections.values()
        )
        
        return {
            'total_connections': total_connections,
            'active_locations': len(self.active_connections),
            'connections_per_location': {
                loc_id: len(clients)
                for loc_id, clients in self.active_connections.items()
            },
        }
    
    def get_location_clients(self, location_id: str) -> Set[WebSocket]:
        """Get all connected clients for a specific location."""
        return self.active_connections.get(location_id, set()).copy()


# Global connection manager instance
connection_manager = ConnectionManager()
