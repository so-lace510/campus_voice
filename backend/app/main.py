import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import complaints, admin

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Campus Voice API",
    description="Anonymous faculty complaint collection and analytics backend.",
    version="1.0.0",
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(complaints.router)
app.include_router(admin.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
