import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Badge, 
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Favorite, 
  Comment, 
  Person, 
  NotificationsNone, 
  CheckCircleOutline,
  RefreshOutlined
} from '@mui/icons-material';
import Navbar from './Navbar';
import { formatDistanceToNow } from 'date-fns';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

let stompClient = null;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const retryTimeoutRef = useRef(null);
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    connectWebSocket();
    startPolling();
    return () => {
      if (stompClient !== null) {
        try {
          stompClient.disconnect();
        } catch (e) {
          console.error('Error disconnecting from WebSocket:', e);
        }
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    pollIntervalRef.current = setInterval(() => {
      if (!websocketConnected) {
        fetchNotifications();
        setLastRefresh(Date.now());
      } else {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    }, 3000);
  };

  const connectWebSocket = () => {
    try {
      const jwt = JSON.parse(localStorage.getItem('jwt'));
      if (!jwt) return;
      const socket = new SockJS('http://localhost:8080/ws');
      stompClient = Stomp.over(socket);
      stompClient.debug = null;
      stompClient.connect({}, onConnected, onError);
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setWebsocketConnected(false);
      startPolling();
    }
  };

  const onConnected = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        stompClient.subscribe(`/topic/notifications/${user.id}`, onNotificationReceived);
        setWebsocketConnected(true);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setWebsocketConnected(false);
      startPolling();
    }
  };

  const onError = (err) => {
    console.error('WebSocket error:', err);
    setWebsocketConnected(false);
    startPolling();
  };

  const onNotificationReceived = (payload) => {
    try {
      const notification = JSON.parse(payload.body);
      setNotifications(prev => [notification, ...prev]);
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  };

  const fetchNotifications = async () => {
    if (loading && notifications.length > 0) {
      setLoading(false);
    } else if (notifications.length === 0) {
      setLoading(true);
    }
    setError('');
    try {
      const jwt = JSON.parse(localStorage.getItem('jwt'));
      if (!jwt) {
        setError('You must be logged in to view notifications');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:8080/notifications', {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    setLastRefresh(Date.now());
  };

  const markAsRead = async (notificationId) => {
    try {
      const jwt = JSON.parse(localStorage.getItem('jwt'));
      await axios.put(`http://localhost:8080/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const jwt = JSON.parse(localStorage.getItem('jwt'));
      await axios.put('http://localhost:8080/notifications/read-all', {}, {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      });
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      window.dispatchEvent(new CustomEvent('notificationsRead'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'LIKE':
        return <Favorite color="error" />;
      case 'COMMENT':
        return <Comment color="primary" />;
      case 'FOLLOW':
        return <Person color="success" />;
      default:
        return <NotificationsNone />;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              Notifications 
            </Typography>
            <IconButton onClick={handleRefresh} size="small" sx={{ ml: 1 }}>
              <RefreshOutlined />
            </IconButton>
          </Box>
          {notifications.length > 0 && (
            <Button 
              variant="outlined" 
              size="small" 
              onClick={markAllAsRead}
              startIcon={<CheckCircleOutline />}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <NotificationsNone sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          <List>
            {notifications.map((notification) => (
              <Box key={notification.id}>
                <ListItem 
                  alignItems="flex-start"
                  sx={{ 
                    bgcolor: notification.isRead ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                    transition: 'background-color 0.3s'
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      variant="dot"
                      invisible={notification.isRead}
                      color="primary"
                      overlap="circular"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <Avatar>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.content}
                    secondary={formatTimestamp(notification.timeStamp)}
                  />
                  {!notification.isRead && (
                    <IconButton 
                      size="small" 
                      onClick={() => markAsRead(notification.id)}
                      aria-label="Mark as read"
                    >
                      <CheckCircleOutline />
                    </IconButton>
                  )}
                </ListItem>
                <Divider variant="inset" component="li" />
              </Box>
            ))}
          </List>
        )}
      </Box>
    </>
  );
};

export default Notifications;
