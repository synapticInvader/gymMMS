from fastapi import FastAPI

from app.routers import members

app = FastAPI(title="Gym MMS API")

app.include_router(members.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}