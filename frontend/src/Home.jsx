// import { useEffect, useState, useRef, useCallback } from "react";
// import Navbar from "./Navbar";
// import Media from "./Media";
// import { Box, Typography, Button, CircularProgress } from "@mui/material";
// import RefreshIcon from '@mui/icons-material/Refresh';
// import api from "./api/axios";
// import SockJS from "sockjs-client";
// import { Stomp } from "@stomp/stompjs";

// const Home = () => {
//   const [userName1, setUserName] = useState("");
//   const [userId, setUserId] = useState(0);
//   const [followList, SetFollowList] = useState([]);
//   const [allUsers, setAllUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [refreshing, setRefreshing] = useState(false);
//   const [websocketConnected, setWebsocketConnected] = useState(false);
//   const stompClientRef = useRef(null);
//   const pollIntervalRef = useRef(null);
//   const lastUpdateRef = useRef(Date.now());

//   useEffect(() => {
//     initialFetch();
//     return () => {
//       if (stompClientRef.current) {
//         try {
//           stompClientRef.current.disconnect();
//         } catch (e) {
//           console.error("Error disconnecting from WebSocket:", e);
//         }
//       }
//       if (pollIntervalRef.current) {
//         clearInterval(pollIntervalRef.current);
//       }
//     };
//   }, []);

//   const initialFetch = async () => {
//     setLoading(true);
//     try {
//       const userResponse = await api.get("/getUser");
//       setUserName(userResponse.data.username || userResponse.data.userName);
//       setUserId(userResponse.data.id);

//       const usersResponse = await api.get("/getAllUsers");
//       if (Array.isArray(usersResponse.data)) {
//         setAllUsers(usersResponse.data);
//       } else if (usersResponse.data && typeof usersResponse.data === 'object') {
//         const arrayData = Object.values(usersResponse.data);
//         setAllUsers(arrayData);
//       } else {
//         setAllUsers([]);
//       }

//       if (userResponse.data.id) {
//         try {
//           const followResponse = await api.get(`/getFollow/${userResponse.data.id}`);
//           SetFollowList(followResponse.data || []);
//           connectWebSocket(userResponse.data.id);
//         } catch (error) {
//           SetFollowList([]);
//         }
//       }

//       setError("");
//     } catch (error) {
//       setError("Failed to load data. Please check your connection and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const connectWebSocket = useCallback((userId) => {
//     if (!userId) return;

//     try {
//       const socket = new SockJS('http://localhost:8080/ws');
//       const client = Stomp.over(socket);
//       client.debug = () => {};
//       stompClientRef.current = client;

//       client.connect({}, () => {
//         setWebsocketConnected(true);
//         client.subscribe('/topic/feed', onFeedUpdate);
//         client.subscribe(`/topic/feed/${userId}`, onFeedUpdate);

//         if (pollIntervalRef.current) {
//           clearInterval(pollIntervalRef.current);
//         }
//         pollIntervalRef.current = setInterval(fetchFeedQuietly, 60000);
//       }, () => {
//         setWebsocketConnected(false);
//         if (pollIntervalRef.current) {
//           clearInterval(pollIntervalRef.current);
//         }
//         pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
//       });
//     } catch (error) {
//       setWebsocketConnected(false);
//       if (pollIntervalRef.current) {
//         clearInterval(pollIntervalRef.current);
//       }
//       pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
//     }
//   }, []);

//   const onFeedUpdate = (payload) => {
//     const now = Date.now();
//     if (now - lastUpdateRef.current < 1000) return;
//     lastUpdateRef.current = now;

//     try {
//       const message = JSON.parse(payload.body);
//       if (message.action === "create") {
//         fetchNewPost(message.postId, message.userId);
//       } else if (
//         message.action === "like" ||
//         message.action === "unlike" ||
//         message.action === "comment" ||
//         message.action === "deleteComment"
//       ) {
//         fetchUpdatedPost(message.postId);
//       } else {
//         fetchFeedQuietly();
//       }
//     } catch (error) {
//       fetchFeedQuietly();
//     }
//   };

//   const fetchNewPost = async (postId, postUserId) => {
//     try {
//       const followingIds = Array.isArray(followList)
//         ? followList.map(follow => follow.followingId)
//         : [];

//       if (userId !== 0) {
//         followingIds.push(userId);
//       }

//       if (!followingIds.includes(postUserId)) return;

//       const postResponse = await api.get(`/getPost/${postId}`);
//       const post = postResponse.data;
//       if (!post) return;

//       let user = allUsers.find(u => u.id === postUserId);
//       if (!user) {
//         const userResponse = await api.get(`/getUserById/${postUserId}`);
//         user = userResponse.data;
//         if (!user) return;
//       }

//       setAllUsers(prevUsers => {
//         const userExists = prevUsers.some(u => u.id === postUserId);
//         if (userExists) {
//           return prevUsers.map(u => {
//             if (u.id === postUserId) {
//               const posts = Array.isArray(u.posts) ? u.posts : [];
//               const postExists = posts.some(p => p.id === post.id);
//               if (!postExists) {
//                 return {
//                   ...u,
//                   posts: [post, ...posts]
//                 };
//               }
//             }
//             return u;
//           });
//         } else {
//           return [...prevUsers, {
//             ...user,
//             posts: [post]
//           }];
//         }
//       });
//     } catch (error) {
//       fetchFeedQuietly();
//     }
//   };

//   const fetchUpdatedPost = async (postId) => {
//     try {
//       const postResponse = await api.get(`/getPost/${postId}`);
//       const updatedPost = postResponse.data;
//       if (!updatedPost) return;

//       setAllUsers(prevUsers => {
//         let updated = false;
//         const newUsers = prevUsers.map(u => {
//           if (Array.isArray(u.posts)) {
//             const updatedPosts = u.posts.map(p => {
//               if (p.id === postId) {
//                 updated = true;
//                 return updatedPost;
//               }
//               return p;
//             });

//             if (updatedPosts.some(p => p.id === postId)) {
//               return {
//                 ...u,
//                 posts: updatedPosts
//               };
//             }
//           }
//           return u;
//         });

//         if (!updated) {
//           setTimeout(fetchFeedQuietly, 100);
//         }

//         return newUsers;
//       });
//     } catch (error) {
//       fetchFeedQuietly();
//     }
//   };

//   const fetchFeedQuietly = async () => {
//     try {
//       const usersResponse = await api.get("/getAllUsers");
//       if (Array.isArray(usersResponse.data)) {
//         setAllUsers(usersResponse.data);
//       } else if (usersResponse.data && typeof usersResponse.data === 'object') {
//         const arrayData = Object.values(usersResponse.data);
//         setAllUsers(arrayData);
//       }

//       if (userId) {
//         try {
//           const followResponse = await api.get(`/getFollow/${userId}`);
//           SetFollowList(followResponse.data || []);
//         } catch (error) {
//           //
//         }
//       }
//     } catch (error) {
//       //
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       const userResponse = await api.get("/getUser");
//       setUserName(userResponse.data.username || userResponse.data.userName);
//       setUserId(userResponse.data.id);

//       const usersResponse = await api.get("/getAllUsers");
//       if (Array.isArray(usersResponse.data)) {
//         setAllUsers(usersResponse.data);
//       } else if (usersResponse.data && typeof usersResponse.data === 'object') {
//         const arrayData = Object.values(usersResponse.data);
//         setAllUsers(arrayData);
//       } else {
//         setAllUsers([]);
//       }

//       if (userResponse.data.id) {
//         try {
//           const followResponse = await api.get(`/getFollow/${userResponse.data.id}`);
//           SetFollowList(followResponse.data || []);
//           if (!websocketConnected) {
//             connectWebSocket(userResponse.data.id);
//           }
//         } catch (error) {
//           SetFollowList([]);
//         }
//       }

//       setError("");
//     } catch (error) {
//       setError("Failed to load data. Please check your connection and try again.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const followingIds = Array.isArray(followList)
//     ? followList.map((follow) => follow.followingId)
//     : [];

//   if (userId !== 0) {
//     followingIds.push(userId);
//   }

//   const followedUsers = Array.isArray(allUsers) && allUsers.length > 0
//     ? allUsers.filter((user) => user && user.id && followingIds.includes(user.id))
//     : [];

//   const posts = followedUsers
//     .flatMap((user) => {
//       if (!user || !user.posts || !Array.isArray(user.posts)) {
//         return [];
//       }

//       return user.posts.map((post) => ({
//         ...post,
//         userName: user.userName,
//         profilePic: user.imageData,
//         userId1: user.id,
//       }));
//     })
//     .sort((a, b) => {
//       try {
//         return new Date(b.timeStamp) - new Date(a.timeStamp);
//       } catch {
//         return 0;
//       }
//     });

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
//           <CircularProgress />
//         </Box>
//       </>
//     );
//   }

//   return (
//     <>
//       <Navbar />
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           padding: "20px",
//         }}
//       >
//         {error && (
//           <Box sx={{ width: '100%', maxWidth: 600, mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
//             <Typography color="error.dark">{error}</Typography>
//             <Button variant="outlined" onClick={handleRefresh} sx={{ mt: 1 }}>
//               Try Again
//             </Button>
//           </Box>
//         )}

//         {posts.length === 0 ? (
//           <Box sx={{ textAlign: "center", marginTop: "50px", p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
//             <Typography variant="h6" color="text.secondary" gutterBottom>
//               No posts to show
//             </Typography>
//             <Typography color="text.secondary" sx={{ mb: 2 }}>
//               Follow some users to see their posts or create your own!
//             </Typography>
//             <Button variant="contained" color="primary" onClick={handleRefresh}>
//               Refresh
//             </Button>
//           </Box>
//         ) : (
//           posts.map((post, index) => (
//             <Media
//               key={`${post.userId1}-${post.id}-${index}`}
//               userName={post.userName}
//               profilePic={post.profilePic}
//               content={post.content}
//               postImage={post.mediaUrl}
//               postId={post.id}
//               userId1={post.userId1}
//               timeStamp={post.timeStamp}
//               likes={post.likes}
//               onFeedUpdate={fetchFeedQuietly}
//             />
//           ))
//         )}
//       </Box>
//     </>
//   );
// };

// export default Home;
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "./Navbar";
import Media from "./Media";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import axios from "axios";
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

  const jwt = JSON.parse(localStorage.getItem("jwt"));

  useEffect(() => {
    initialFetch();
    return () => {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting from WebSocket:", e);
        }
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const initialFetch = async () => {
    setLoading(true);
    try {
      const userResponse = await axios.get("http://localhost:8080/getUser", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      setUserName(userResponse.data.username || userResponse.data.userName);
      setUserId(userResponse.data.id);

      const usersResponse = await axios.get("http://localhost:8080/getAllUsers", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = usersResponse.data;
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else if (data && typeof data === 'object') {
        setAllUsers(Object.values(data));
      } else {
        setAllUsers([]);
      }

      if (userResponse.data.id) {
        try {
          const followResponse = await axios.get(`http://localhost:8080/getFollow/${userResponse.data.id}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          SetFollowList(followResponse.data || []);
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
      const socket = new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socket);
      client.debug = () => {};
      stompClientRef.current = client;
      client.connect({}, () => {
        setWebsocketConnected(true);
        client.subscribe('/topic/feed', onFeedUpdate);
        client.subscribe(`/topic/feed/${userId}`, onFeedUpdate);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(fetchFeedQuietly, 60000);
      }, () => {
        setWebsocketConnected(false);
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
      });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setWebsocketConnected(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(fetchFeedQuietly, 15000);
    }
  }, []);

  const onFeedUpdate = (payload) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 1000) return;
    lastUpdateRef.current = now;
    try {
      const message = JSON.parse(payload.body);
      if (message.action === "create") {
        fetchNewPost(message.postId, message.userId);
      } else if (["like", "unlike", "comment", "deleteComment"].includes(message.action)) {
        fetchUpdatedPost(message.postId);
      } else {
        fetchFeedQuietly();
      }
    } catch (error) {
      fetchFeedQuietly();
    }
  };

  const fetchNewPost = async (postId, postUserId) => {
    try {
      const followingIds = Array.isArray(followList) ? followList.map(f => f.followingId) : [];
      if (userId !== 0) followingIds.push(userId);
      if (!followingIds.includes(postUserId)) return;
      const postResponse = await axios.get(`http://localhost:8080/getPost/${postId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const post = postResponse.data;
      let user = allUsers.find(u => u.id === postUserId);
      if (!user) {
        const userResponse = await axios.get(`http://localhost:8080/getUserById/${postUserId}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        user = userResponse.data;
      }
      setAllUsers(prevUsers => {
        const userExists = prevUsers.some(u => u.id === postUserId);
        if (userExists) {
          return prevUsers.map(u => {
            if (u.id === postUserId) {
              const posts = Array.isArray(u.posts) ? u.posts : [];
              if (!posts.some(p => p.id === post.id)) {
                return { ...u, posts: [post, ...posts] };
              }
            }
            return u;
          });
        } else {
          return [...prevUsers, { ...user, posts: [post] }];
        }
      });
    } catch {
      fetchFeedQuietly();
    }
  };

  const fetchUpdatedPost = async (postId) => {
    try {
      const postResponse = await axios.get(`http://localhost:8080/getPost/${postId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const updatedPost = postResponse.data;
      setAllUsers(prevUsers => {
        let updated = false;
        const newUsers = prevUsers.map(u => {
          if (Array.isArray(u.posts)) {
            const updatedPosts = u.posts.map(p => p.id === postId ? (updated = true, updatedPost) : p);
            if (updated) return { ...u, posts: updatedPosts };
          }
          return u;
        });
        if (!updated) setTimeout(fetchFeedQuietly, 100);
        return newUsers;
      });
    } catch {
      fetchFeedQuietly();
    }
  };

  const fetchFeedQuietly = async () => {
    try {
      const usersResponse = await axios.get("http://localhost:8080/getAllUsers", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const data = usersResponse.data;
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else if (data && typeof data === 'object') {
        setAllUsers(Object.values(data));
      }
      if (userId) {
        const followResponse = await axios.get(`http://localhost:8080/getFollow/${userId}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        SetFollowList(followResponse.data || []);
      }
    } catch (error) {
      console.error("Error fetching data quietly:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initialFetch();
    setRefreshing(false);
  };

  const followingIds = Array.isArray(followList) ? followList.map(f => f.followingId) : [];
  if (userId !== 0) followingIds.push(userId);
  const followedUsers = Array.isArray(allUsers) ? allUsers.filter(user => user && user.id && followingIds.includes(user.id)) : [];

  const posts = followedUsers
    .flatMap(user => Array.isArray(user.posts) ? user.posts.map(post => ({
      ...post,
      userName: user.userName,
      profilePic: user.imageData,
      userId1: user.id,
    })) : [])
    .sort((a, b) => new Date(b.timeStamp) - new Date(a.timeStamp));

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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
        {error && (
          <Box sx={{ width: '100%', maxWidth: 600, mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.dark">{error}</Typography>
            <Button variant="outlined" onClick={handleRefresh} sx={{ mt: 1 }}>Try Again</Button>
          </Box>
        )}
        {posts.length === 0 ? (
          <Box sx={{ textAlign: "center", marginTop: "50px", p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No posts to show</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>Follow some users to see their posts or create your own!</Typography>
            <Button variant="contained" color="primary" onClick={handleRefresh}>Refresh</Button>
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
