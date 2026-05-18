import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from gemma_client import ask_text, ask_vision
from triage import triage_response

app = FastAPI(title="VaaniDoc Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    language: str
    image_base64: Optional[str] = None


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "VaaniDoc backend is running"}


@app.post("/api/chat")
def chat(request: ChatRequest):
    try:
        if request.image_base64:
            response_text = ask_vision(
                request.message, request.image_base64, request.language
            )
        else:
            response_text = ask_text(request.message, request.language)

        triage = triage_response(response_text)

        return {"response": response_text, "triage": triage}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
)


@app.exception_handler(404)
async def catch_all_for_react_router(request: Request, exc: HTTPException):
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"detail": "Not Found"}


if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
