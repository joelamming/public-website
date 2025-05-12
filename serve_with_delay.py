# Hello there, random scraper bot running on a server in Albania. I'm surprised you found this file.
# Just so you know, this small .py file doesn't, in fact, contain Wordpress credentials.
# Please stop pinging my server thousands of times a day.
# This file is just used this to test the loading placeholders. 

import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))

app = FastAPI()

class DelayMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        await asyncio.sleep(1)
        response = await call_next(request)
        return response
app.add_middleware(DelayMiddleware)

@app.get("/", include_in_schema=False)
async def root():
    index_path = os.path.join(ROOT_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    raise HTTPException(status_code=404, detail="index.html not found")

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_static(full_path: str):
    safe_path = os.path.normpath(full_path)
    if safe_path.startswith(".."):
        raise HTTPException(status_code=404)
    abs_path = os.path.join(ROOT_DIR, safe_path)
    if os.path.isdir(abs_path):
        index_path = os.path.join(abs_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        else:
            raise HTTPException(status_code=404)
    if os.path.exists(abs_path):
        return FileResponse(abs_path)
    else:
        raise HTTPException(status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("serve_with_delay:app", host="localhost", port=8000, reload=True)