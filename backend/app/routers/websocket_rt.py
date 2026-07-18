from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
from datetime import datetime

router = APIRouter()

class ConnectionManager:
    """Manages WebSocket connections per trip."""
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, trip_id: str, websocket: WebSocket):
        await websocket.accept()
        if trip_id not in self.active_connections:
            self.active_connections[trip_id] = []
        self.active_connections[trip_id].append(websocket)

    def disconnect(self, trip_id: str, websocket: WebSocket):
        if trip_id in self.active_connections:
            if websocket in self.active_connections[trip_id]:
                self.active_connections[trip_id].remove(websocket)
            if not self.active_connections[trip_id]:
                del self.active_connections[trip_id]

    async def broadcast(self, trip_id: str, message: dict):
        if trip_id in self.active_connections:
            dead = []
            for ws in self.active_connections[trip_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.active_connections[trip_id].remove(ws)

class NotificationManager:
    """Manages global WebSocket connections per user for real-time notifications."""
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            dead = []
            for ws in self.active_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.active_connections[user_id].remove(ws)

manager = ConnectionManager()
notifier = NotificationManager()

@router.websocket("/ws/trip/{trip_id}")
async def trip_websocket(websocket: WebSocket, trip_id: str):
    await manager.connect(trip_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message["timestamp"] = datetime.utcnow().isoformat()
            await manager.broadcast(trip_id, message)
    except WebSocketDisconnect:
        manager.disconnect(trip_id, websocket)

@router.websocket("/ws/notifications/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: str):
    await notifier.connect(user_id, websocket)
    try:
        while True:
            # Notifications are generally one-way (server to client)
            # But we can keep the socket alive by waiting for text
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        notifier.disconnect(user_id, websocket)
