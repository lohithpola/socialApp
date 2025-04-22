import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Link,
} from "@mui/material";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

  
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
  
    try {
      const response = await axios.post(
        "http://localhost:8080/login",
        JSON.stringify(logData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.status === 200 && response.data) {
        localStorage.setItem("jwt", JSON.stringify(response.data));
        navigate("/");
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (error) {
     alert("wrong credintals");
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
      bgcolor="#f5f5f5"
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        p={4}
        bgcolor="white"
        boxShadow={4}
        borderRadius={3}
        maxWidth="420px"
        width="100%"
      >
        <Typography variant="h5" gutterBottom color="primary" textAlign="center">
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
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          required
          fullWidth
          margin="normal"
          onChange={dataHandle}
        />

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
          mb={2}
        >
          <Link
            onClick={() => navigate("/forgotpassword")}
            underline="hover"
            sx={{
              fontSize: "0.8rem",
              textTransform: "lowercase",
              cursor: "pointer",
            }}
          >
            forgot password?
          </Link>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/signup")}
          >
            Register
          </Button>
          <Button type="submit" variant="contained">
           Log In
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
