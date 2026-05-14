## TestGen

## Description
App generates automatic test cases in Python (Playwright). 

## Demo
https://test-gen-black.vercel.app/

## Screenshot
TBD

## Tech stack
React, Vite, FastAPI, Python, Playwright, Gemini API, Vercel, Render

## Functions
Generating tests from URL, syntax highlighting, download .py, token counter

## How to launch locally
1 step - frontend: npm run dev
2 step - backend: uvicorn main:app --reload

Ubuntu 22.04 LTS
VS Code 0958016b
Brave Browser 148.1.90.121 

## Architecture
Fronted on Vercel communicates with backend FastAPI on Render, which then proxy requests to Gemini API
