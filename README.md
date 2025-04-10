# 🤖 Smart AI Chatbot – Rule-Based + Vector Search + Gemini Fallback

This project is an intelligent **virtual assistant chatbot** designed to support enterprise users by combining:
- ⚡ Predefined rules (for speed)
- 🔍 Vector similarity search using FAISS (for smart context retrieval)
- 🌐 Gemini LLM (for dynamic fallback responses)

It mimics real-world enterprise chatbot systems with layered logic and scalable design.

---

## 🧠 Features

- 📚 **Rule-Based Responses** from local JSON file  
  → Fast answers to known questions like password policies, form validations, etc.

- 🧾 **Person-Aware Memory**
  - Detects logged-in user via `User-ID` header
  - Responds with personalized identity if found (e.g., "You are Mathan!")

- 🔍 **FAISS Vector-Based Search**
  - Uses TF-IDF or embeddings to search indexed documents
  - Handles semantic queries (like "How do I validate an email field?")

- 🌐 **Gemini Fallback**
  - If no good match found in rule or FAISS layers
  - Uses Google Gemini to generate intelligent dynamic answers

- 💬 **React Frontend Chatbot UI**
  - Chat widget integrated in bottom-right corner of the app
  - Minimal, clean design with seamless message handling

---

## 🧱 Tech Stack

| Layer                | Technology             |
|---------------------|------------------------|
| Frontend            | React.js               |
| Rule-Based API      | .NET Core Web API      |
| AI Layer            | Python + FastAPI       |
| Vector DB           | FAISS (Local)          |
| GenAI Integration   | Gemini (Google AI)     |
| User Context        | JSON-based mapping     |

---

## 🧪 How It Works (Chat Flow)

```text
User sends a message ➜

1. Check JSON (Rule-based):
   ✅ Found → Return response
   ❌ Not found ➜

2. Search with FAISS:
   ✅ Close match → Return relevant document
   ❌ No good match ➜

3. Call Gemini API:
   → Generate dynamic AI response
