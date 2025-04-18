import * as React from 'react';
import { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Media({
  userName,
  profilePic,
  content,
  postImage,
  postId,
  userId1,
  timeStamp,
  likes,
  onFeedUpdate
}) {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(likes);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [commentDialog, setCommentDialog] = useState(false);
    const [likeDialog, setLikeDialog] = useState(false);
    const [likedUsers, setLikedUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState('');
    const [currentUserId, setCurrentUserId] = useState(0);
    const [error, setError] = useState('');
    
    const jwt = JSON.parse(localStorage.getItem("jwt"));
    
    const formattedTime = new Date(timeStamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    useEffect(() => {
        // Fetch current user
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get("http://localhost:8080/getUser", {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setCurrentUser(response.data.username);
                setCurrentUserId(response.data.id);
            } catch (error) {
                console.error("Error fetching current user:", error);
            }
        };

        // Check if post is liked by current user
        const checkLiked = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/getLike/${postId}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setLiked(response.data);
            } catch (error) {
                console.error("Error checking if post is liked:", error);
            }
        };

        // Fetch post likes count
        const fetchLikes = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/getPost/${postId}`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                });
                setLikesCount(response.data.likes);
            } catch (error) {
                console.error("Error fetching post likes:", error);
            }
        };

        fetchCurrentUser();
        checkLiked();
        fetchLikes();
    }, [postId, jwt]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/getComments/${postId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleOpenComments = () => {
        fetchComments();
        setCommentDialog(true);
    };

    const handleLike = async () => {
        try {
            if (!jwt) {
                setError("Please log in to like posts");
                return;
            }

            // Optimistically update UI first for better user experience
            const newLikedState = !liked;
            const newCount = newLikedState ? likesCount + 1 : likesCount - 1;
            
            setLiked(newLikedState);
            setLikesCount(newCount);

            // Then perform the actual API call
            if (newLikedState) {
                await axios.post(
                    `http://localhost:8080/updateLike/${postId}`,
                    { userName: currentUser },
                    {
                        headers: {
                            Authorization: `Bearer ${jwt}`,
                        },
                    }
                );
            } else {
                await axios.delete(`http://localhost:8080/deleteLike/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });
            }
            
            // No need to update the likesCount again here since we're handling it through WebSocket
            
            // Call the feed update function to ensure real-time updates
            if (onFeedUpdate) {
                onFeedUpdate();
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert UI changes if the API call fails
            setLiked(!liked);
            setLikesCount(liked ? likesCount - 1 : likesCount + 1);
            setError("Failed to update like. Please try again.");
        }
    };

    const handleComment = async () => {
        try {
            if (!jwt) {
                setError("Please log in to comment");
                return;
            }

            if (!newComment.trim()) return;

            const response = await axios.post(
                `http://localhost:8080/setComment/${postId}`,
                {
                    userName: currentUser,
                    content: newComment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                }
            );

            setComments([...comments, response.data]);
            setNewComment("");
            
            // Call the feed update function to ensure real-time updates
            if (onFeedUpdate) {
                onFeedUpdate();
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            setError("Failed to add comment. Please try again.");
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            if (!jwt) {
                setError("Please log in to delete comments");
                return;
            }

            await axios.delete(`http://localhost:8080/deleteComment/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                },
            });

            setComments(comments.filter((comment) => comment.id !== commentId));
            
            // Call the feed update function to ensure real-time updates
            if (onFeedUpdate) {
                onFeedUpdate();
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            setError("Failed to delete comment. Please try again.");
        }
    };

    const handleShowLikes = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/getLikeData/${postId}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            setLikedUsers(response.data);
            setLikeDialog(true);
        } catch (error) {
            console.error("Error fetching liked users:", error);
        }
    };

    return (
        <Card sx={{ width: '100%', maxWidth: 600, m: 2 }}>
            <Link to={`/profile/${userId1}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <CardHeader
                    avatar={<Avatar alt={userName} src={`data:image/png;base64,${profilePic}`} />}
                    action={
                        <IconButton aria-label="settings">
                            <MoreVertIcon />
                        </IconButton>
                    }
                    title={userName}
                    subheader={formattedTime}
                />
            </Link>

            <Link to={`/post/${postId}`}>
                <CardMedia
                    component="img"
                    height="400"
                    image={`data:image/png;base64,${postImage}`}
                    alt="Post"
                />
            </Link>

            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <IconButton 
                        color={liked ? "error" : "default"} 
                        onClick={handleLike}
                    >
                        <FavoriteIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        <Button 
                            onClick={handleShowLikes}
                            size="small" 
                            sx={{ textTransform: 'none', minWidth: 'auto', padding: 0 }}
                        >
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </Button>
                    </Typography>
                    <IconButton onClick={handleOpenComments}>
                        <CommentIcon />
                    </IconButton>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                    <strong>{userName}</strong> {content}
                </Typography>
            </CardContent>

            {/* Comments Dialog */}
            <Dialog 
                open={commentDialog} 
                onClose={() => setCommentDialog(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Comments</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2, maxHeight: '300px', overflow: 'auto' }}>
                        {comments.length > 0 ? (
                            [...comments]
                                .sort(
                                  (a, b) => {
                                    // Check various possible timestamp field names
                                    const dateA = a.timestamp || a.timeStamp || a.createdAt || a.created_at || 0;
                                    const dateB = b.timestamp || b.timeStamp || b.createdAt || b.created_at || 0;
                                    return new Date(dateB) - new Date(dateA);
                                  }
                                )
                                .map((comment) => (
                                <Box key={comment.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="body2">
                                        <strong>{comment.userName}</strong> {comment.content}
                                    </Typography>
                                    {comment.userName === currentUser && (
                                        <IconButton 
                                            size="small" 
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Box>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                No comments yet
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <IconButton 
                        disabled={!newComment.trim()} 
                        onClick={handleComment}
                        color="primary"
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Dialog>

            {/* Likes Dialog */}
            <Dialog open={likeDialog} onClose={() => setLikeDialog(false)}>
                <DialogTitle>Liked by</DialogTitle>
                <DialogContent>
                    {likedUsers.length === 0 ? (
                        <DialogContentText>No likes yet</DialogContentText>
                    ) : (
                        likedUsers.map((user, index) => (
                            <Typography key={index}>{user.userName}</Typography>
                        ))
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLikeDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}