from insighthub.core.main import ask
from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
import ipaddress
from urllib.parse import urlparse
import uvicorn
import asyncio

app = FastAPI()
ALLOWED_STATIC_ORIGINS = {
    "https://zkkzkk32312.github.io",
    "null",  # allow null origin (e.g., file://)
}

def is_allowed_origin(origin: str) -> bool:
    if origin is None:
        # Allow requests with no Origin header (e.g., curl or internal tools)
        return True

    if origin in ALLOWED_STATIC_ORIGINS:
        # Allow explicitly whitelisted origins (e.g., GitHub Pages, null)
        return True

    try:
        parsed = urlparse(origin)
        host = parsed.hostname.lower() if parsed.hostname else ""

        # Allow subdomains of zackcheng.com
        if host.endswith(".zackcheng.com"):
            return True
        
        if host.startswith("https://zkkzkk32312.github.io"):
            return True

        # Allow LAN IPs only in 192.168.1.0/24
        ip = ipaddress.ip_address(host)
        if ip.is_private:
            subnet = ipaddress.ip_network("192.168.1.0/24")
            if ip in subnet:
                return True
    except Exception:
        return False

    return False

@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    if is_allowed_origin(origin):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = request.headers.get("access-control-request-headers", "*")
        response.headers["Access-Control-Allow-Methods"] = request.headers.get("access-control-request-method", "*")
        return response
    else:
        return JSONResponse(
            status_code=403,
            content={"detail": "CORS policy does not allow this origin"},
        )

@app.get("/ask")
async def ask_question(q: str = Query(..., description="The question to ask")):
    """Call the core.ask function with a string query."""
    result = await asyncio.to_thread(ask, q)
    return {"answer": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
