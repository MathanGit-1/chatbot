import React, { useState } from "react";
import axios from "axios";
import "../styles.css";

const Chatbot = () => {
  // ✅ State Variables
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ✅ API Endpoints
  const ruleBasedAPI = "https://localhost:44350/api/Chatbot";
  const faissAPI = "http://127.0.0.1:5001/chatbot";
  
  // ✅ Define LLM API URL (COMMENTED OUT)
  // const llmAPI = "http://127.0.0.1:5002/llm-response";

  // ✅ Send Message Function
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // ✅ Add User Message to Chat
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    let botResponse = "Sorry, I couldn't find a response.";
    const userQuery = input.toLowerCase().trim();

    setInput(""); // ✅ Clear input field immediately

    try {
      console.log("📢 Calling Rule-Based API...");
      const ruleResponse = await axios.post(
        ruleBasedAPI,
        { message: userQuery },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("📌 Rule-Based API Response:", ruleResponse.data);

      if (ruleResponse.status === 200 && ruleResponse.data.response) {
        botResponse = ruleResponse.data.response;
      } else {
        console.log("⚠️ No rule-based match, calling FAISS...");

        try {
          console.log("🟢 Sending request to FAISS API:", faissAPI, "with query:", userQuery);
          const faissResponse = await axios.post(
            faissAPI,
            { query: userQuery },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("📌 FAISS API Response:", faissResponse.data);

          if (faissResponse.status === 200 && faissResponse.data.response) {
            botResponse = faissResponse.data.response;
          } else {
            console.log("⚠️ No FAISS match found.");

            // ✅ Step 3: COMMENTED OUT GEMINI LLM LOGIC
            /*
            console.log("🔮 FAISS returned None! Calling Gemini LLM API...");
            try {
              console.log("🟢 Sending request to LLM API:", llmAPI, "with query:", userQuery);
              const llmResponse = await axios.post(
                llmAPI,
                { query: userQuery },
                { headers: { "Content-Type": "application/json" } }
              );

              console.log("📌 LLM API Raw Response:", llmResponse);
              console.log("📌 LLM API Response Data:", llmResponse.data);

              if (llmResponse.status === 200 && llmResponse.data.response) {
                botResponse = llmResponse.data.response;
              } else {
                console.log("❌ No AI response found from LLM.");
                botResponse = "Sorry, I couldn't find a suitable response.";
              }
            } catch (llmError) {
              console.error("❌ Error calling LLM API:", llmError);
              botResponse = "AI service unavailable. Please try again later.";
            }
            */
          }
        } catch (faissError) {
          console.error("❌ Error calling FAISS API:", faissError);
          botResponse = "Error processing your request.";
        }
      }
    } catch (ruleError) {
      console.error("❌ Error calling Rule-Based API:", ruleError);
      botResponse = "Unexpected error. Please try again.";
    }

    // ✅ Update Chatbot Messages
    setIsTyping(false);
    setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
  };

  // ✅ Handle "Enter" key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // ✅ Prevents page refresh
      handleSendMessage(); // ✅ Triggers send function
    }
  };

  return (
    <div>
      {/* ✅ Chatbot Toggle Button */}
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
            {/* ✅ Typing Indicator */}
            {isTyping && <div className="typing-indicator">Chatbot is typing...</div>}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress} // ✅ Detect "Enter" key press
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
