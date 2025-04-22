// import { useState } from "react";
// import axios from "axios";
// import { TextField, Button, Box, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//     const navigate=useNavigate();
//     const [formData, setFormData] = useState({
//         fullName: "",
//         userName: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         image: null
//     });

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleFileChange = (e) => {
//         console.log(e.target.files);
//         setFormData({ ...formData, image: e.target.files[0] });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (formData.password !== formData.confirmPassword) {
//             alert("Passwords do not match!");
//             return;
//         }

//         const data = new FormData();
//         console.log(data);
//         data.append("fullName", formData.fullName);
//         data.append("userName", formData.userName);
//         data.append("email", formData.email);
//         data.append("password", formData.password);
//         data.append("image", formData.image);

//         try {
//             await axios.post("http://localhost:8080/addUser", data, {
//                 headers: { "Content-Type": "multipart/form-data" }
//             });
//             alert("Registration Successful");
//             navigate("/login");
//         } catch (error) {
//             console.error("Error:", error.response?.data || error.message);
//             alert("Registration Failed");
//         }
//     };

//     return (
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//             <form onSubmit={handleSubmit}>
//                 <Typography variant="h6" textAlign="center" mb={2}>
//                     SignUp
//                 </Typography>

//                 <TextField label="Full Name" name="fullName" onChange={handleChange} required margin="dense" fullWidth /><br/>
//                 <TextField label="Username" name="userName" onChange={handleChange} required margin="dense" fullWidth /><br/>
//                 <TextField label="Email" name="email" type="email" onChange={handleChange} required margin="dense" fullWidth /><br/>
//                 <TextField label="Password" name="password" type="password" onChange={handleChange} required margin="dense" fullWidth /><br/>
//                 <TextField label="Confirm Password" name="confirmPassword" type="password" onChange={handleChange} required margin="dense" fullWidth /><br/>

//                 <input type="file" accept="image/*" onChange={handleFileChange} required style={{ margin: "10px 0" }} /><br/>

//                 <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
//                     Sign In
//                 </Button>
//             </form>
//         </Box>
//     );
// }
import { useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  InputLabel
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  

    const fullName = formData.fullName.trim();
    const userName = formData.userName.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
  
    if (!fullName || !userName) {
      alert("Full Name and Username cannot be empty!");
      return;
    }
  

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!passwordRegex.test(password)) {
      alert(
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
      );
      return;
    }
  
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    const data = new FormData();
    data.append("fullName", fullName);
    data.append("userName", userName);
    data.append("email", formData.email);
    data.append("password", password);
    data.append("image", formData.image);
  
    try {
      await axios.post("http://localhost:8080/addUser", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Registration Successful");
      navigate("/login");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert("Registration Failed");
    }
  };
  

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f0f2f5"
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: 400,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" align="center" mb={3} color="primary">
          Create Account
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="fullName"
            onChange={handleChange}
            required
            margin="normal"
            fullWidth
          />
          <TextField
            label="Username"
            name="userName"
            onChange={handleChange}
            required
            margin="normal"
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            onChange={handleChange}
            required
            margin="normal"
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            onChange={handleChange}
            required
            margin="normal"
            fullWidth
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            onChange={handleChange}
            required
            margin="normal"
            fullWidth
          />

          <Box mt={2} mb={2}>
            <InputLabel sx={{ mb: 1 }}>Upload Profile Picture</InputLabel>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{ width: "100%" }}
            />
          </Box>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 2, py: 1.5 }}
          >
            Sign Up
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
