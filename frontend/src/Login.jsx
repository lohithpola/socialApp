import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [logData, setLogData] = useState({
    userName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);
    
    // Remove any existing tokens before attempting to login
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    
    // Create a new axios instance just for this request to avoid any global settings issues
    const instance = axios.create({
      baseURL: 'http://localhost:8080',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    try {
      const response = await instance.post('/login', JSON.stringify(logData));
      
      // Only store JWT and navigate on successful response with valid data
      if (response.status === 200 && response.data) {
        console.log("Login successful:", response);
        localStorage.setItem("jwt", JSON.stringify(response.data));
        navigate("/");
      } else {
        console.log("Login response invalid:", response);
        setError("Invalid response from server. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        console.log("Error data:", error.response.data);
        console.log("Error status:", error.response.status);
        setError(error.response.data?.message || 
                "Login failed. Server returned " + error.response.status);
      } else if (error.request) {
        console.log("Error request:", error.request);
        setError("No response from server. Please try again later.");
      } else {
        console.log("Error message:", error.message);
        setError("Login failed: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dataHandle = (e) => {
    setLogData({ ...logData, [e.target.name]: e.target.value });
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        p={3}
        boxShadow={3}
        borderRadius={2}
        maxWidth="400px"
        width="100%"
      >
        <Typography color="primary" variant="h5" gutterBottom>
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TextField
          name="userName"
          label="Username"
          required
          fullWidth
          margin="normal"
          onChange={dataHandle}
          disabled={isLoading}
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          required
          fullWidth
          margin="normal"
          onChange={dataHandle}
          disabled={isLoading}
        />
        <Box mt={2} display="flex" justifyContent="space-between" flexWrap="wrap">
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </Button>
          <Button
            variant="text"
            onClick={() => navigate("/forgotpassword")}
            sx={{ mt: 1 }}
            disabled={isLoading}
          >
            Forgot Password?
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/signup")}
            sx={{ ml: 2 }}
            disabled={isLoading}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
