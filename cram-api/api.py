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
    studyGoal: str
    outputType: str
    difficulty: str
    study_material: str


@app.post("/api/generate-cram-set")
async def generate_cram_set(request: CramRequest):
    system_prompt = f"""
You are an expert AI tutor.

Your job is to transform study material into structured learning content.

Follow these strict rules:
- Focus on the user's study goal: {request.studyGoal}
- Adapt difficulty to: {request.difficulty}
- Output style: {request.outputType}

You are not limited to any single curriculum or exam system.
You can generate content for any academic subject, exam, or learning context.

Return ONLY valid JSON with this exact structure:

{{
  "flashcards": [
    {{
      "question": "...",
      "answer": "..."
    }}
  ],
  "quiz": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "answer": "..."
    }}
  ]
}}

Rules:
- No markdown
- No explanations
- No extra keys
- Ensure flashcards are concise but conceptually complete
- Difficulty must influence depth of explanations
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
        "temperature": 0.3,
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

        if result.startswith("```"):
            result = re.sub(r"^```json\s*|\s*```$", "", result, flags=re.MULTILINE)

        parsed = json.loads(result)

        if "flashcards" not in parsed:
            raise ValueError("Missing flashcards in model output")

        return parsed

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cram set: {str(e)}"
        )

# ./venv/bin/uvicorn api:app --host 0.0.0.0 --port 8003
# docker compose -f docker-compose.gpu up -d --build