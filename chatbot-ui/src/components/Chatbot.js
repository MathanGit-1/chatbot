import React, { useState } from "react";
import axios from "axios";
import "../styles.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user's message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    setIsTyping(true); // ✅ Show "Chatbot is typing..."

    try {
      const API_URL = "https://localhost:44350/api/Chatbot"; // ✅ Ensure correct API port

      const response = await axios.post(API_URL, 
        { message: input }, // ✅ Correct request body format
        { headers: { "Content-Type": "application/json" } } // ✅ Ensure JSON format
      );
      setIsTyping(false); // ✅ Hide "Chatbot is typing..."

      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setMessages((prev) => [...prev, { text: "Error: Unable to connect to chatbot.", sender: "bot" }]);
    }

    setInput(""); // Clear input field
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
