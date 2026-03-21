import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from redis import Redis
from api import density_router, sensory_router

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://crowdstate:crowdstate@postgres:5432/crowdstate",
)
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


@asynccontextmanager
async def lifespan(_: FastAPI):
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    redis_client.ping()
    yield


app = FastAPI(title="CrowdState AI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(density_router)
app.include_router(sensory_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "backend"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_json({"event": "connected", "service": "backend"})
    await websocket.close()
