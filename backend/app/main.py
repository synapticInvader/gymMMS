from fastapi import FastAPI

app = FastAPI(title="Gym MMS API")

@app.get("/health")
def health_check():
    return {"status": "ok"}