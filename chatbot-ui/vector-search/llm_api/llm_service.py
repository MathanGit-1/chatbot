import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# 🔑 Set your Gemini API Key
GENAI_API_KEY = "AIzaSyBsc05c1xVfhwl9mUAlo1XobP-uHtw9jTY"
genai.configure(api_key=GENAI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

# Function to call Gemini API
def generate_llm_response(query):
    try:
        response = model.generate_content(query)
        return response.text if response else "I couldn't find an answer."
    except Exception as e:
        print(f"Error with LLM API: {e}")
        return "Sorry, I couldn't process that request."

# ✅ FastAPI Endpoint (Fixing request handling)
@app.post("/llm-response")
async def llm_response(request: Request):
    try:
        data = await request.json()  # ✅ Correct FastAPI way to read JSON
        query = data.get("query", "")
        response = generate_llm_response(query)
        return JSONResponse(content={"response": response})
    except Exception as e:
        print(f"Error processing LLM request: {e}")
        return JSONResponse(content={"error": "Internal Server Error"}, status_code=500)

# ✅ Run FastAPI with: uvicorn llm_service:app --host 127.0.0.1 --port 5002 --reload
