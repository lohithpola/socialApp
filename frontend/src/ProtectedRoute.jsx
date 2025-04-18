import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProctectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const tokenString = localStorage.getItem("jwt");
      
      if (!tokenString) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Try to parse the token
        const token = JSON.parse(tokenString);
        
        if (!token) {
          throw new Error("Invalid token format");
        }
        
        // Validate token by making a request to a protected endpoint
        const response = await axios.get("http://localhost:8080/getUser", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // If we get here without error, token is valid
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Token validation failed:", error);
        // Clear invalid token
        localStorage.removeItem("jwt");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);
  
  if (isLoading) {
    // You could add a loading spinner here
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Verifying authentication...
    </div>;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProctectedRoute;