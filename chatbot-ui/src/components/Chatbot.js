import React, { useState } from "react";
import axios from "axios";
import "../styles.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); ;
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let botResponse = "Sorry, no response found.";
      const ruleBasedAPI = "https://localhost:44350/api/Chatbot";
      const faissAPI = "http://127.0.0.1:5001/chatbot";

      const userQuery = input.toLowerCase().trim();

      try {
        const ruleResponse = await axios.post(
          ruleBasedAPI,
          { message: userQuery },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("🔹 Rule-Based API Response:", ruleResponse.data);

        if (ruleResponse.status === 200 && ruleResponse.data.response) {
          botResponse = ruleResponse.data.response; // ✅ Use rule-based response if available
        } else {
          console.log("⚠️ No match found in Rule-Based API. Calling FAISS...");
          
          const faissResponse = await axios.post(
            faissAPI,
            { query: userQuery },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("🔹 FAISS API Response:", faissResponse.data);

          botResponse = faissResponse.data.response || "No matching response found.";
        }
      } catch (error) {
        console.error("⚠️ Rule-Based API Error:", error.message);

        // ✅ If rule-based API fails, directly call FAISS API
        try {
          const faissResponse = await axios.post(
            faissAPI,
            { query: userQuery },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("🔹 FAISS API Response (After Rule-Based API Failure):", faissResponse.data);

          botResponse = faissResponse.data.response || "No matching response found.";
        } catch (faissError) {
          console.error("⚠️ FAISS API Error:", faissError.message);
        }
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("❌ Error calling chatbot API:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error: Unable to connect to chatbot.", sender: "bot" },
      ]);
    }

    setInput(""); 
  };

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="chatbot-button">
        {isOpen ? "Close Chat" : "Chat with Assistant"}
      </button>

      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">Chat Assistant</div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                <p
                  style={{
                    background: msg.sender === "user" ? "#007bff" : "#f1f1f1",
                    color: msg.sender === "user" ? "#fff" : "#000",
                    padding: "8px",
                    borderRadius: "5px",
                    display: "inline-block",
                  }}
                >
                  {msg.text}
                </p>
              </div>
            ))}
            {/* ✅ Typing Indicator (Show only when Chatbot is typing) */}
            {isTyping && <div className="typing-indicator">Chatbot is typing...</div>}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="chatbot-input"
            />
            <button onClick={handleSendMessage} className="chatbot-send-button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
