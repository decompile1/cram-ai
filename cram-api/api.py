import os
import json
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11435")
MODEL_NAME = "qwen2.5:1.5b-instruct"

class CramRequest(BaseModel):
    course: str
    study_material: str

@app.post("/api/generate-cram-set")
async def generate_cram_set(request: CramRequest):
    system_prompt = f"""
You are an AI specialized in the College Board {request.course} curriculum.
Extract key concepts strictly aligned to the official Course and Exam Description (CED).

Output a JSON object with exactly two keys: "flashcards" and "quiz". Do not include any conversational text.
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.study_material}
    ]

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        "format": "json", 
        "temperature": 0.2,
        "options": {
            "top_p": 0.9,
            "repeat_penalty": 1.1
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_URL}/api/chat",
            json=payload,
            timeout=120
        )
        response.raise_for_status()
        
        result = response.json()["message"]["content"].strip()
        print(result)

        # Clean markdown code blocks if the model still insists on including them
        if result.startswith("```"):
            result = re.sub(r"^```json\s*|\s*```$", "", result, flags=re.MULTILINE)

# ./venv/bin/uvicorn api:app --host 0.0.0.0 --port 8003
# docker compose -f docker-compose.gpu up -d --build