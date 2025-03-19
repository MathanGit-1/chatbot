import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from faiss_index import load_faiss_index, search_faiss  # Import FAISS functions

# ✅ Load FAISS index at startup
load_faiss_index()

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for frontend integration

# ✅ Load predefined responses from a specific sheet in rules.xlsx
def load_responses():
    try:
        # Read only the 'PredefinedResponses' sheet
        df = pd.read_excel("rules.xlsx", sheet_name="predefined_responses")
        return dict(zip(df["query"].str.lower(), df["response"]))
    except Exception as e:
        print(f"Error loading predefined responses from Excel: {e}")
        return {}

predefined_responses = load_responses()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "FAISS API is running. Use POST /chatbot"}), 200

@app.route("/chatbot", methods=["POST"])
def chatbot():
    if not request.is_json:
        return jsonify({"error": "Invalid request format. Use JSON."}), 400

    data = request.get_json()
    user_query = data.get("query", "").strip().lower()

    if not user_query:
        return jsonify({"error": "Query is missing"}), 400

    # ✅ Step 1: Check for greetings with partial matching
    for greeting in predefined_responses.keys():
        if greeting in user_query:  # ✅ More flexible matching
            return jsonify({"response": predefined_responses[greeting]})

    # ✅ Step 2: If not a greeting, proceed with FAISS search
    response = search_faiss(user_query)
    return jsonify({"response": response})

@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"error": "Invalid endpoint. Use /chatbot with POST."}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5001)
