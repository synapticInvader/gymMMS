from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import branches, members

app = FastAPI(title="Gym MMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.0.101:3000",
        "https://frontend-lyart-beta-42.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(members.router)
app.include_router(branches.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}