import os
import json
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("⏳ Loading LLM weights into memory (this can take a minute on first boot)...")

device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
torch_dtype = torch.bfloat16 if device in ["cuda", "mps"] else torch.float32

generator = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-1.5B-Instruct",
    torch_dtype=torch_dtype,
    device_map="auto" if device in ["cuda", "mps"] else None,
    device=None if device in ["cuda", "mps"] else -1
)

print(f"✅ Model successfully anchored to host computing device: {device.upper()}")

class CramRequest(BaseModel):
    course: str
    study_material: str

@app.post("/api/generate-cram-set")
async def generate_cram_set(request: CramRequest):
    system_prompt = f"""
    You are an AI specialized in the College Board {request.course} curriculum.
    Analyze the user's notes and extract key concepts strictly mapped to the official Course and Exam Description (CED).
    
    You must output a valid JSON object with exactly two keys: "flashcards" and "quiz".
    Do not wrap the response in markdown code blocks. Output raw JSON only.
    
    Format example:
    {{
      "flashcards": [
        {{"front": "Concept Name", "back": "CED-aligned definition and significance"}}
      ],
      "quiz": [
        {{
          "question": "AP-style multiple choice question?",
          "options": ["A", "B", "C", "D"],
          "correct_answer": "A",
          "explanation": "Why this is correct based on the AP rubric."
        }}
      ]
    }}
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": request.study_material}
    ]
    
    tokenizer = generator.tokenizer

    prompt = tokenizer.apply_chat_template(
      messages,
      tokenize=False,
      add_generation_prompt=True,
    )

    # Generate token sequences locally using parameters tuned to minimize formatting drift
    outputs = generator(
      prompt,
      max_new_tokens=512,
      do_sample=True,
      temperature=0.2,
      top_p=0.9,
      repetition_penalty=1.1,
    )
    
    raw_content = outputs[0]["generated_text"][len(prompt):].strip()
    
    if raw_content.startswith("```"):
        raw_content = re.sub(r"http://googleusercontent.com/immersive_entry_chip/0")

# ./venv/bin/uvicorn api:app --host 0.0.0.0 --port 8003