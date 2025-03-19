import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
import pickle
import re

# Read CSV file
df = pd.read_excel("rules.xlsx", sheet_name="rules")

# Convert to dictionary
faq_dict = dict(zip(df["query"], df["response"]))

# Load SentenceTransformer model (paraphrase model for better matching)
model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

queries = list(faq_dict.keys())
responses = list(faq_dict.values())

# Generate embeddings
query_embeddings = model.encode(queries, convert_to_numpy=True)
dimension = query_embeddings.shape[1]

# Create FAISS index
index = faiss.IndexFlatL2(dimension)
index.add(query_embeddings)

print("Indexed Queries in FAISS:")
for query in queries:
    print(query)

# Save FAISS index and responses
faiss.write_index(index, "faiss_index.bin")

# Save responses using pickle
with open("responses.pkl", "wb") as f:
    pickle.dump(responses, f)

print("FAISS index and responses saved successfully.")

def load_faiss_index():
    """Loads FAISS index and responses"""
    global index, responses, query_embeddings
    index = faiss.read_index("faiss_index.bin")
    with open("responses.pkl", "rb") as f:
        responses = pickle.load(f)
    # Reload query embeddings
    query_embeddings = model.encode(queries, convert_to_numpy=True)

def preprocess_query(query):
    """Normalize user queries by simplifying structure."""
    query = query.lower().strip()

    # Remove unnecessary words
    query = re.sub(r"\b(to|the|a|an|team)\b", "", query)

    # Convert statement into a question
    if "contact" in query:
        query = "How do I contact support?"

    if len(query.split()) <= 2:
        query = f"How can I {query}?"  # Add context for short queries

    return query

def cosine_similarity(vec1, vec2):
    """Compute cosine similarity between two vectors"""
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def search_faiss(query, threshold=0.75):  # Adjusted threshold from 0.9 to 0.75
    """Search FAISS and compute cosine similarity properly"""
    query = preprocess_query(query)  # Preprocess short queries
    query_embedding = model.encode([query], convert_to_numpy=True)
    D, I = index.search(query_embedding, 1)
    
    best_match_index = I[0][0]

    if best_match_index == -1:
        return "Sorry, I don't know the answer to that."

    best_match_query = queries[best_match_index]
    best_match_vector = query_embeddings[best_match_index]  # Get best match vector

    # Compute correct cosine similarity
    similarity_score = cosine_similarity(query_embedding[0], best_match_vector)

    print(f"User Query: {query}")
    print(f"Best Match Query: {best_match_query}")
    print(f"Cosine Similarity Score: {similarity_score}")

    if similarity_score < threshold:  # If score < 0.75, return fallback
        print("⚠️ Low similarity score! Returning fallback response.")
        return "Sorry, I don't know the answer to that."

    return responses[best_match_index]

if __name__ == "__main__":
    print("FAISS setup complete!")
