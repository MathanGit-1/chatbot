import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";
import "../styles.css";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("isAuthenticated")) {
      navigate("/");
    }
  }, [navigate]);

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("isAuthenticated"); // Clear authentication
        navigate("/"); // Redirect to Login
      };

      return (
        <div>
          <div className="overlay"></div>
          <h1 style={{ textAlign: "center", marginTop: "50px", color: "white" }}>
            Welcome to Home
          </h1>
          
          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
    
          <Chatbot />
        </div>
      );
    };
export default Home;
