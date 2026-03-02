from fastapi import FastAPI

app = FastAPI(title="CrowdState AI Backend")

@app.get("/")
async def root():
    return {"message": "CrowdState AI Engine is Online", "status": "Ready"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
