import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/forgot-password", { email });
      setMessage(res.data);
    } catch (err) {
      setMessage(err.response?.data || "Something went wrong");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box component="form" onSubmit={handleSubmit} p={3} boxShadow={3} borderRadius={2} maxWidth={400} width="100%">
        <Typography variant="h5" color="primary" gutterBottom>
          Forgot Password
        </Typography>
        <TextField
          label="Enter your registered email"
          type="email"
          required
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Send Reset Link
        </Button>
        {message && (
          <Typography mt={2} color={message.includes("sent") ? "green" : "error"}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ForgetPassword;
