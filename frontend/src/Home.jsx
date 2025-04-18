import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "./Navbar";
import Media from "./Media";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import api from "./api/axios";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const Home = () => {
  const [userName1, setUserName] = useState("");
  const [userId, setUserId] = useState(0);
  const [followList, SetFollowList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [websocketConnected, setWebsocketConnected] = useState(false);
  const stompClientRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    initialFetch();
    
    // Clean up function
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
    };
  }, []);

  // Initial data fetch - doesn't show refresh indicator
  const initialFetch = async () => {
    setLoading(true);
    try {
      // Fetch user data
      const userResponse = await api.get("/getUser");
      setUserName(userResponse.data.username || userResponse.data.userName);
      setUserId(userResponse.data.id);
      
      // Fetch all users
      const usersResponse = await api.get("/getAllUsers");
      if (Array.isArray(usersResponse.data)) {
        setAllUsers(usersResponse.data);
      } else if (usersResponse.data && typeof usersResponse.data === 'object') {
        const arrayData = Object.values(usersResponse.data);
        setAllUsers(arrayData);
      } else {
        console.error("getAllUsers did not return valid data:", usersResponse.data);
        setAllUsers([]);
      }
      
      // If we got the user ID, fetch follow list
      if (userResponse.data.id) {
        try {
          const followResponse = await api.get(`/getFollow/${userResponse.data.id}`);
          SetFollowList(followResponse.data || []);
          
          // Connect to WebSocket after getting user data
          connectWebSocket(userResponse.data.id);
        } catch (error) {
          console.error("Error fetching follow list:", error);
          SetFollowList([]);
        }
      }
      
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = useCallback((userId) => {
    if (!userId) return;
    
    try {
      // Create a new SockJS instance
      const socket = new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socket);
      
      // Fix for "this.debug is not a function" error
      client.debug = () => {}; // Empty function instead of null
      
      stompClientRef.current = client;
      
      client.connect({}, () => {
        // Successfully connected
        setWebsocketConnected(true);
        console.log("WebSocket connected for real-time feed updates");
        
        // Subscribe to feed updates topic
        client.subscribe('/topic/feed', onFeedUpdate);
        
        // Also subscribe to specific user feed
        client.subscribe(`/topic/feed/${userId}`, onFeedUpdate);
        
        // Set up polling as a backup but less frequently (every 60 seconds)
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        pollIntervalRef.current = setInterval(fetchFeedQuietly, 60000);
      }, (error) => {
        console.error("WebSocket error:", error);
        setWebsocketConnected(false);
        
        // Start more frequent polling as fallback
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
        pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setWebsocketConnected(false);
      
      // Start polling as fallback
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
    }
  }, []);
  
  const onFeedUpdate = (payload) => {
    // Prevent multiple rapid updates by checking time since last update
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) {
      console.log("Debouncing feed update, too soon after last update");
      return;
    }
    
    console.log("Feed update received via WebSocket", payload);
    lastUpdateRef.current = now;
    
    try {
      // Parse the message payload
      const message = JSON.parse(payload.body);
      console.log("Parsed WebSocket message:", message);
      
      // Handle different types of updates
      if (message.action === "create") {
        // If a new post is created, fetch the specific post immediately
        fetchNewPost(message.postId, message.userId);
      } else if (message.action === "like" || message.action === "unlike" || 
                message.action === "comment" || message.action === "deleteComment") {
        // For interactions, just update the specific post
        fetchUpdatedPost(message.postId);
      } else {
        // For unknown actions, refresh the full feed
        fetchFeedQuietly();
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      // Fallback to full refresh
      fetchFeedQuietly();
    }
  };
  
  // Fetch a specific new post and add it to the feed
  const fetchNewPost = async (postId, postUserId) => {
    try {
      console.log(`Fetching new post ${postId} from user ${postUserId}`);
      
      // First check if this user is in our following list or is ourselves
      const followingIds = Array.isArray(followList) 
        ? followList.map(follow => follow.followingId) 
        : [];
      
      if (userId !== 0) {
        followingIds.push(userId);
      }
      
      if (!followingIds.includes(postUserId)) {
        console.log("Post creator is not followed by current user, skipping update");
        return;
      }
      
      // Fetch the specific post and the user who created it
      try {
        const postResponse = await api.get(`/getPost/${postId}`);
        const post = postResponse.data;
        
        if (!post) {
          console.error("Failed to fetch post data");
          return;
        }
        
        // Get the user from our current allUsers state if possible
        let user = allUsers.find(u => u.id === postUserId);
        
        // If we don't have the user, fetch them
        if (!user) {
          const userResponse = await api.get(`/getUserById/${postUserId}`);
          user = userResponse.data;
          
          if (!user) {
            console.error("Failed to fetch user data");
            return;
          }
        }
        
        // Update the allUsers state to include this new post
        setAllUsers(prevUsers => {
          // First check if the user exists in our state
          const userExists = prevUsers.some(u => u.id === postUserId);
          
          if (userExists) {
            // Update existing user
            return prevUsers.map(u => {
              if (u.id === postUserId) {
                // Check if posts array exists
                const posts = Array.isArray(u.posts) ? u.posts : [];
                
                // Check if post already exists in the posts array
                const postExists = posts.some(p => p.id === post.id);
                
                if (!postExists) {
                  // Add the new post to the user's posts
                  return {
                    ...u,
                    posts: [post, ...posts]
                  };
                }
              }
              return u;
            });
          } else {
            // Add the new user to our state
            return [...prevUsers, {
              ...user,
              posts: [post]
            }];
          }
        });
        
        console.log("Successfully added new post to feed");
      } catch (error) {
        console.error("Error fetching post or user:", error);
      }
    } catch (error) {
      console.error("Error in fetchNewPost:", error);
      // Fallback to full refresh if there's an error
      fetchFeedQuietly();
    }
  };
  
  // Fetch a specific post that was updated (liked, commented, etc.)
  const fetchUpdatedPost = async (postId) => {
    try {
      console.log(`Fetching updated post ${postId}`);
      
      try {
        const postResponse = await api.get(`/getPost/${postId}`);
        const updatedPost = postResponse.data;
        
        if (!updatedPost) {
          console.error("Failed to fetch updated post");
          return;
        }
        
        // Update the allUsers state with the updated post
        setAllUsers(prevUsers => {
          let updated = false;
          
          const newUsers = prevUsers.map(u => {
            if (Array.isArray(u.posts)) {
              const updatedPosts = u.posts.map(p => {
                if (p.id === postId) {
                  updated = true;
                  return updatedPost;
                }
                return p;
              });
              
              if (updatedPosts.some(p => p.id === postId)) {
                return {
                  ...u,
                  posts: updatedPosts
                };
              }
            }
            return u;
          });
          
          // If we didn't find the post to update, we need to refresh everything
          if (!updated) {
            setTimeout(fetchFeedQuietly, 100);
          }
          
          return newUsers;
        });
        
        console.log("Successfully updated post in feed");
      } catch (error) {
        console.error("Error fetching updated post:", error);
        fetchFeedQuietly();
      }
    } catch (error) {
      console.error("Error in fetchUpdatedPost:", error);
      // Fallback to full refresh if there's an error
      fetchFeedQuietly();
    }
  };
  
  // Fetch feed without showing loading indicators
  const fetchFeedQuietly = async () => {
    try {
      console.log("Fetching feed data quietly...");
      
      // Fetch all users
      const usersResponse = await api.get("/getAllUsers");
      if (Array.isArray(usersResponse.data)) {
        setAllUsers(usersResponse.data);
      } else if (usersResponse.data && typeof usersResponse.data === 'object') {
        const arrayData = Object.values(usersResponse.data);
        setAllUsers(arrayData);
      }
      
      // If we have the user ID, fetch follow list
      if (userId) {
        try {
          const followResponse = await api.get(`/getFollow/${userId}`);
          SetFollowList(followResponse.data || []);
        } catch (error) {
          console.error("Error fetching follow list:", error);
        }
      }
      
      console.log("Feed data updated silently");
    } catch (error) {
      console.error("Error fetching data quietly:", error);
    }
  };

  // Manual refresh - shows refresh indicator
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch user data
      const userResponse = await api.get("/getUser");
      setUserName(userResponse.data.username || userResponse.data.userName);
      setUserId(userResponse.data.id);
      
      // Fetch all users
      const usersResponse = await api.get("/getAllUsers");
      if (Array.isArray(usersResponse.data)) {
        setAllUsers(usersResponse.data);
      } else if (usersResponse.data && typeof usersResponse.data === 'object') {
        const arrayData = Object.values(usersResponse.data);
        setAllUsers(arrayData);
      } else {
        console.error("getAllUsers did not return valid data:", usersResponse.data);
        setAllUsers([]);
      }
      
      // If we got the user ID, fetch follow list
      if (userResponse.data.id) {
        try {
          const followResponse = await api.get(`/getFollow/${userResponse.data.id}`);
          SetFollowList(followResponse.data || []);
          
          // Reconnect WebSocket if not connected
          if (!websocketConnected) {
            connectWebSocket(userResponse.data.id);
          }
        } catch (error) {
          console.error("Error fetching follow list:", error);
          SetFollowList([]);
        }
      }
      
      setError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please check your connection and try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Safely filter users
  const followingIds = Array.isArray(followList) 
    ? followList.map((follow) => follow.followingId) 
    : [];
    
  if (userId !== 0) {
    followingIds.push(userId);
  }
  
  // Only try to filter if allUsers is an array and has items
  const followedUsers = Array.isArray(allUsers) && allUsers.length > 0
    ? allUsers.filter((user) => user && user.id && followingIds.includes(user.id))
    : [];

  // Generate posts from users
  const posts = followedUsers
    .flatMap((user) => {
      // Check if user.posts exists and is an array
      if (!user || !user.posts || !Array.isArray(user.posts)) {
        return [];
      }
      
      return user.posts.map((post) => ({
        ...post,
        userName: user.userName,
        profilePic: user.imageData,
        userId1: user.id,
      }));
    })
    .sort((a, b) => {
      // Safely handle date comparison
      try {
        return new Date(b.timeStamp) - new Date(a.timeStamp);
      } catch (e) {
        console.error("Error sorting posts by date:", e);
        return 0;
      }
    });

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
        </Box>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
        }}
      >
        {/* <Box sx={{ width: '100%', maxWidth: 600, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h1" sx={{ ml: 2 }}>
            Home Feed
          </Typography>
          <Button 
            variant="text" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ mr: 2 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box> */}
        
        {error && (
          <Box sx={{ width: '100%', maxWidth: 600, mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.dark">{error}</Typography>
            <Button variant="outlined" onClick={handleRefresh} sx={{ mt: 1 }}>
              Try Again
            </Button>
          </Box>
        )}

        {posts.length === 0 ? (
          <Box sx={{ textAlign: "center", marginTop: "50px", p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts to show
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Follow some users to see their posts or create your own!
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRefresh}>
              Refresh
            </Button>
          </Box>
        ) : (
          posts.map((post, index) => (
            <Media
              key={`${post.userId1}-${post.id}-${index}`}
              userName={post.userName}
              profilePic={post.profilePic}
              content={post.content}
              postImage={post.mediaUrl}
              postId={post.id}
              userId1={post.userId1}
              timeStamp={post.timeStamp}
              likes={post.likes}
              onFeedUpdate={fetchFeedQuietly}
            />
          ))
        )}
      </Box>
    </>
  );
};

export default Home;