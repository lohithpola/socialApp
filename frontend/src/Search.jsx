import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  Avatar,
  ListItemText,
  CircularProgress,
  ListItemButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const debounceTimeout = useRef(null);

  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const header = {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim() === "") {
      setResults([]);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 2000);
  }, [query]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/getAllUsers", header);
      const sanitizedQuery = query
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "");

      const filtered = res.data.filter((user) => {
        const sanitizedUserName = user.userName
          .toLowerCase()
          .replace(/[^a-z0-9]/gi, "");
        return sanitizedUserName.includes(sanitizedQuery);
      });

      setResults(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

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

        {loading && <CircularProgress sx={{ mt: 2 }} />}

        <List>
          {results.map((user) => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={() => navigate(`/profile/${user.id}`)}>
                <Avatar
                  src={
                    user.imageData
                      ? `data:image/png;base64,${user.imageData}`
                      : ""
                  }
                  sx={{ mr: 2 }}
                />
                <ListItemText primary={user.userName} />
              </ListItemButton>
            </ListItem>
          ))}

          {query && !loading && results.length === 0 && (
            <Typography sx={{ p: 2 }}>No users found.</Typography>
          )}
        </List>
      </Box>
    </>
  );
}
