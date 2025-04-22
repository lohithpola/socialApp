import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation
    if (!passwordValidationRegex.test(password)) {
      setMessage("Password must be at least 8 characters long, contain uppercase, lowercase, numbers, and a special character.");
      return;
    }

    if (password !== confirmed) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8080/reset-password", { token, password });
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err.response?.data || "Something went wrong");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Box component="form" onSubmit={handleSubmit} p={3} boxShadow={3} borderRadius={2} width="100%" maxWidth="400px">
        <Typography variant="h5" gutterBottom color="primary">
          Reset Password
        </Typography>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={confirmed}
          onChange={(e) => setConfirmed(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Reset Password
        </Button>
        {message && (
          <Typography color={message.includes("successful") ? "green" : "error"} mt={2}>
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;
