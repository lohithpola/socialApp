import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const header = {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }
  
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8080/getAllUsers", header);
  
        const sanitizedQuery = query.trim().toLowerCase().replace(/[^a-z0-9]/gi, "");
  
        const filtered = res.data.filter((user) => {
          const sanitizedUserName = user.userName.toLowerCase().replace(/[^a-z0-9]/gi, "");
          return sanitizedUserName.includes(sanitizedQuery);
        });
  
        setResults(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
  
    fetchUsers();
  }, [query]);
  
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Search Users
      </Typography>

      <TextField
        fullWidth
        placeholder="Search by username..."
        variant="outlined"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      <List>
        {results.map((user) => (
          <ListItem
            key={user.id}
            button
            onClick={() => navigate(`/profile/${user.id}`)}
          >
            <Avatar
              src={
                user.imageData
                  ? `data:image/png;base64,${user.imageData}`
                  : ""
              }
              sx={{ mr: 2 }}
            />
            <ListItemText primary={user.userName} />
          </ListItem>
        ))}
        {query && results.length === 0 && (
          <Typography>No users found.</Typography>
        )}
      </List>
    </Box>
  );
}
