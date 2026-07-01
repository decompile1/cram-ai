import os
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ValidationError

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


class Flashcard(BaseModel):
    question: str
    answer: str


class QuizItem(BaseModel):
    question: str
    options: list[str]
    answer: str


class CramResponse(BaseModel):
    flashcards: list[Flashcard]
    quiz: list[QuizItem]

class PDFRequest(BaseModel):
    text: str

@app.post("/api/summarize-pdf")
async def summarize_pdf(request: PDFRequest):

    system_prompt = """
You are an expert study assistant.

Your job:
1. Summarize the given document clearly
2. Extract key concepts
3. Create flashcards for studying

Return ONLY valid JSON:

{
  "summary": "...",
  "flashcards": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}

Rules:
- No markdown
- No extra text
- Keep summary concise but complete
"""

@app.post("/api/generate-cram-set")
async def generate_cram_set(request: CramRequest):
    system_prompt = f"""
You are a strict educational extraction engine.

You MUST ONLY use information found in the provided study material.
Do NOT add outside knowledge.

If something is not in the text, do NOT include it.

Transform ONLY the given content into structured learning material.

Constraints:
- Study Goal: {request.studyGoal}
- Output Type: {request.outputType}
- Difficulty: {request.difficulty}

IMPORTANT RULE:
Everything in flashcards and quiz MUST come directly from the study material.

Return ONLY valid JSON:

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
"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.study_material},
        {"role": "user", "content": request.text[:12000]}
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

        raw = response.json()["message"]["content"]

        if isinstance(raw, dict):
            parsed = raw
        else:
            text = str(raw).strip()

            # safe cleanup only (no over-reliance)
            if text.startswith("```"):
                text = text.replace("```json", "").replace("```", "").strip()

            try:
                parsed = json.loads(text)
            except json.JSONDecodeError:
                # final fallback for double-encoded outputs
                parsed = json.loads(json.loads(text))

        validated = CramResponse.model_validate(parsed)

        return validated.model_dump()

    except ValidationError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid model structure: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate cram set: {str(e)}"
        )