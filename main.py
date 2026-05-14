from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv

SYSTEM_PROMPT = 'You are an expert QA automation engineer. Your task is to analyze a webpage and generate Playwright (Python) test code.'

app = FastAPI()

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

origins = [
    "http://localhost:5173",
    "http://localhost:5172",
    "http://localhost:5171",
    "http://localhost:5170",
    "https://test-gen-black.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
  url: str
  page_content: str  

@app.post("/generate")
async def generate(request: GenerateRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "gemini-2.5-flash",
                "max_tokens": 100000,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Generate tests for:\n\n{request.page_content}"}
                ]
            },
            timeout=30.0,
        )
    data = response.json()
    code = data["choices"][0]["message"]["content"]
    usage = data.get("usage", {})
    return {
        "code": code,
        "prompt_tokens": usage.get("prompt_tokens", 0),
        "completion_tokens": usage.get("completion_tokens", 0),
        "total_tokens": usage.get("total_tokens", 0),
    }