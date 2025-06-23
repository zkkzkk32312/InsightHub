from insighthub.core.main import ask
from fastapi import FastAPI, Query
import uvicorn
import asyncio

app = FastAPI()

@app.get("/async-endpoint")
async def read_async_data():
    return {"message": "This is an async endpoint"}

@app.get("/ask")
async def ask_question(q: str = Query(..., description="The question to ask")):
    """Call the core.ask function with a string query."""
    result = await asyncio.to_thread(ask, q)
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
