import { useState } from "react";
import axios from "axios";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate=useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
        image: null
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        console.log(e.target.files);
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        const data = new FormData();
        console.log(data);
        data.append("fullName", formData.fullName);
        data.append("userName", formData.userName);
        data.append("email", formData.email);
        data.append("password", formData.password);
        data.append("image", formData.image);

        try {
            await axios.post("http://localhost:8080/addUser", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Registration Successful");
            navigate("/login");
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            alert("Registration Failed");
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <form onSubmit={handleSubmit}>
                <Typography variant="h6" textAlign="center" mb={2}>
                    SignUp
                </Typography>

                <TextField label="Full Name" name="fullName" onChange={handleChange} required margin="dense" fullWidth /><br/>
                <TextField label="Username" name="userName" onChange={handleChange} required margin="dense" fullWidth /><br/>
                <TextField label="Email" name="email" type="email" onChange={handleChange} required margin="dense" fullWidth /><br/>
                <TextField label="Password" name="password" type="password" onChange={handleChange} required margin="dense" fullWidth /><br/>
                <TextField label="Confirm Password" name="confirmPassword" type="password" onChange={handleChange} required margin="dense" fullWidth /><br/>

                <input type="file" accept="image/*" onChange={handleFileChange} required style={{ margin: "10px 0" }} /><br/>

                <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>
                    Sign In
                </Button>
            </form>
        </Box>
    );
}
