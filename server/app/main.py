from fastapi import FastAPI

app = FastAPI(title="Stocker-UVO API")

@app.get("/")
async def root():
    return {"message": "Welcome to Stocker-UVO API!"}