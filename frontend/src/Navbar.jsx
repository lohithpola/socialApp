import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Button,
  Badge,
} from "@mui/material";
import {
  Home,
  Search,
  AddCircleOutline,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import PeopleIcon from "@mui/icons-material/People";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function Navbar() {
  
  const navigate = useNavigate();
  const [responseData, setData] = useState({});
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const stompClientRef = useRef(null);
  const pollIntervalRef = useRef(null);
  
  const header = {
    headers: { Authorization: `Bearer ${jwt}` },
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/getUser", header)
      .then((response) => {
        setData(response.data);
        setUserId(response.data.id);
        // Save user to localStorage for access in other components
        if (!localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        // Connect to WebSocket after getting user ID
        connectWebSocket(response.data.id);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });
      
    // Fetch unread notification count initially
    fetchUnreadCount();
    
    // Set up interval to check for new notifications as fallback
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);
    
    // Listen for notifications being read from the Notifications component
    const handleNotificationsRead = () => {
      setUnreadCount(0);
    };
    
    window.addEventListener('notificationsRead', handleNotificationsRead);
    
    // Clean up
    return () => {
      // Clean up WebSocket connection
      if (stompClientRef.current) {
        try {
          stompClientRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting from WebSocket:", e);
        }
      }
      
      // Clear the polling interval
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      
      // Remove event listener
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, []);
  
  const connectWebSocket = (userId) => {
    if (!userId) return;
    
    try {
      // Create a new SockJS instance
      const socket = new SockJS('http://localhost:8080/ws');
      stompClientRef.current = Stomp.over(socket);
      
      // Disable debug logging
      stompClientRef.current.debug = null;
      
      stompClientRef.current.connect({}, () => {
        // Successfully connected
        setWebsocketConnected(true);
        
        // Subscribe to user's notification topic
        stompClientRef.current.subscribe(`/topic/notifications/${userId}`, onNotificationReceived);
        
        // If WebSocket is connected, we can reduce polling frequency
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          // Keep polling as backup but less frequently
          pollIntervalRef.current = setInterval(fetchUnreadCount, 60000);
        }
      }, (error) => {
        console.error("WebSocket error:", error);
        setWebsocketConnected(false);
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setWebsocketConnected(false);
    }
  };
  
  const onNotificationReceived = (payload) => {
    try {
      // When we get a notification, increment the counter
      // Parse the notification payload
      const notification = JSON.parse(payload.body);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  };
  
  const fetchUnreadCount = () => {
    if (!jwt) return;
    
    axios
      .get("http://localhost:8080/notifications/count", header)
      .then((response) => {
        setUnreadCount(response.data.count);
      })
      .catch((error) => {
        console.error("Error fetching notification count:", error);
      });
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <IconButton>
          <Link to={"/"}>
            <Home />
          </Link>
        </IconButton>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f1f1f1",
            borderRadius: 2,
            px: 2,
          }}
        >
          <IconButton onClick={() => navigate("/search")}>
            <Search />
          </IconButton>
        </Box>

        <Link to={"/friends"}>
          <PeopleIcon />
        </Link>

        <Box>
          <IconButton onClick={() => {
            navigate("/notifications");
            // Reset the notification count when navigating to the notifications page
            setUnreadCount(0);
          }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton>
            <Link to={"/create-post"}>
              <AddCircleOutline />
            </Link>
          </IconButton>
          <IconButton>
            <Link to={`/profile/${responseData.id}`}>
              <Avatar
                src={
                  responseData.imageData
                    ? `data:image/png;base64,${responseData.imageData}`
                    : ""
                }
              />
            </Link>
          </IconButton>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}