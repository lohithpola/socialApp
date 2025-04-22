import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Home,
  Search,
  AddCircleOutline,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

export default function Navbar() {
  const navigate = useNavigate();
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const [responseData, setData] = useState({});
  const [userId, setUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
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
        if (!localStorage.getItem("user")) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        connectWebSocket(response.data.id);
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      });

    fetchUnreadCount();
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting WebSocket:", e);
        }
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (notificationsRead) {
      setUnreadCount(0);
      setNotificationsRead(false); 
    }
  }, [notificationsRead]);

  const connectWebSocket = (userId) => {
    if (!userId) return;

    try {
      const socket = new SockJS("http://localhost:8080/ws");
      stompClientRef.current = Stomp.over(socket);
      stompClientRef.current.debug = null;

      stompClientRef.current.connect(
        {},
        () => {
          setWebsocketConnected(true);
          stompClientRef.current.subscribe(
            `/topic/notifications/${userId}`,
            onNotificationReceived
          );
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = setInterval(fetchUnreadCount, 60000);
          }
        },
        (error) => {
          console.error("WebSocket error:", error);
          setWebsocketConnected(false);
        }
      );
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setWebsocketConnected(false);
    }
  };

  const onNotificationReceived = (payload) => {
    try {
      const notification = JSON.parse(payload.body);
      if (!notification.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error processing notification:", error);
    }
  };

  const fetchUnreadCount = () => {

    axios
      .get("http://localhost:8080/notifications/count", header)
      .then((response) => {
        setUnreadCount(response.data.count);
      })
      .catch((error) => {
        console.error("Error fetching notification count:", error);
      });
  };

  const navIconStyle = {
    color: "black",
    mx: 1,
  };

  const navLinkStyle = {
    textDecoration: "none",
    color: "inherit",
  };

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "white", color: "black", boxShadow: 1 }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton sx={navIconStyle}>
            <Link to="/" style={navLinkStyle}>
              <Home />
            </Link>
          </IconButton>

          <IconButton sx={navIconStyle} onClick={() => navigate("/search")}>
            <Search />
          </IconButton>

          <IconButton sx={navIconStyle}>
            <Link to="/friends" style={navLinkStyle}>
              <PeopleIcon />
            </Link>
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            sx={navIconStyle}
            onClick={() => {
              navigate("/notifications");
              setNotificationsRead(true); 
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton sx={navIconStyle} component={Link} to="/create-post">
            <AddCircleOutline />
          </IconButton>

          <IconButton
            sx={navIconStyle}
            component={Link}
            to={`/profile/${responseData.id}`}
          >
            <Avatar
              src={
                responseData.imageData
                  ? `data:image/png;base64,${responseData.imageData}`
                  : ""
              }
              sx={{ width: 32, height: 32 }}
            />
          </IconButton>

          <IconButton sx={navIconStyle} onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
