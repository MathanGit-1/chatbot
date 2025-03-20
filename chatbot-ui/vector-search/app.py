import pandas as pd
import requests
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from faiss_index import load_faiss_index, search_faiss  # FAISS functions

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ Enable CORS (Fixes React API Call Issues)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (React frontend)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (POST, GET, OPTIONS)
    allow_headers=["*"],  # Allow all headers
)

# ✅ Load FAISS index at startup
load_faiss_index()

# ✅ Load predefined responses from Excel
def load_responses():
    try:
        df = pd.read_excel("rules.xlsx", sheet_name="predefined_responses")
        return dict(zip(df["query"].str.lower(), df["response"]))
    except Exception as e:
        print(f"❌ Error loading predefined responses from Excel: {e}")
        return {}

predefined_responses = load_responses()

# ✅ Define LLM API URL (COMMENTED OUT)
# LLM_API_URL = "http://127.0.0.1:5002/llm-response"

@app.get("/")
async def home():
    return JSONResponse(content={"message": "FAISS API is running. Use POST /chatbot"}, status_code=200)

# ✅ Fix for "405 Method Not Allowed" (Allows OPTIONS request for CORS)
@app.options("/chatbot")
async def options_handler():
    return JSONResponse(content={}, status_code=200)

@app.post("/chatbot")
async def chatbot(request: Request):
    data = await request.json()
    user_query = data.get("query", "").strip().lower()

    if not user_query:
        return JSONResponse(content={"error": "Query is missing"}, status_code=400)

    print(f"📢 Received Query: {user_query}")  # ✅ Debugging Log

    # ✅ Step 1: Check Rule-Based Responses from Excel
    for query in predefined_responses.keys():
        if query in user_query:
            print("✅ Matched Rule-Based Response")
            return JSONResponse(content={"response": predefined_responses[query]})

    # ✅ Step 2: If no match, Perform FAISS Vector Search
    print("🔍 Searching in FAISS...")
    faiss_result = search_faiss(user_query)

    if faiss_result:
        print("✅ FAISS Found Match")
        return JSONResponse(content={"response": faiss_result})
    else:
        print("⚠️ FAISS No Match Found")

    # ✅ Step 3: COMMENTED OUT GEMINI LLM LOGIC
    """
    print("🔮 FAISS returned None! Calling Gemini LLM API...")  # ✅ Debugging log
    try:
        llm_response = requests.post(LLM_API_URL, json={"query": user_query})
        print(f"🟢 LLM API Response Status: {llm_response.status_code}")  # ✅ Check if LLM is called
        llm_result = llm_response.json().get("response", "Sorry, no AI response available.")
        print(f"✅ LLM Response: {llm_result}")  # ✅ Print AI-generated response
    except Exception as e:
        print(f"❌ Error calling LLM API: {e}")
        llm_result = "Sorry, the AI model couldn't generate a response."
    
    return JSONResponse(content={"response": llm_result})
    """

    # ✅ If no FAISS result and LLM is removed, return a fallback response
    return JSONResponse(content={"response": "Sorry, I couldn't find a suitable response."})

# ✅ Handle 404 errors
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(content={"error": "Invalid endpoint. Use /chatbot with POST."}, status_code=404)

# ✅ Run using Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001, reload=True)
