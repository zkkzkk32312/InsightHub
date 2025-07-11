from insighthub.core.main import ask
from fastapi import FastAPI, Query
import uvicorn
import asyncio

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/ask")
async def ask_question(q: str = Query(..., description="The question to ask")):
    """Call the core.ask function with a string query."""
    result = await asyncio.to_thread(ask, q)
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
