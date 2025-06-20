from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/async-endpoint")
async def read_async_data():
    return {"message": "This is an async endpoint"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
