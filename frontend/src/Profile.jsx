import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Avatar,
  Box,
  Grid,
  Card,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from "./Navbar";
import { Link, useParams } from "react-router-dom";

const Profile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [allUsersData, setAllUsers] = useState([]);
  const [followerUsernames, setFollowerUsernames] = useState([]);
  const [followerDialogOpen, setFollowerDialogOpen] = useState(false);
  const [followingDialogOpen, setFollowingDialogOpen] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  const [editBioDialogOpen, setEditBioDialogOpen] = useState(false);
  const [bio, setBio] = useState("");
  const [editPhotoDialogOpen, setEditPhotoDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:8080/getUser", {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setCurrentUserId(response.data.id);
        setIsCurrentUser(Number(userId) === response.data.id);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
    
    const getAllUsersData = async () => {
      try {
        const response3 = await axios.get("http://localhost:8080/getAllUsers", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setAllUsers(response3.data);
      } catch (error) {
        console.log("error fetching all users data");
      }
    };
    getAllUsersData();

    const getUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/getFullUser/${userId}`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        setUserData(response.data);
        setBio(response.data.bio || "");
      } catch (error) {
        console.error("Error fetching user data:",error);
      }
    };

    getUserData();

    const getFollowing = async () => {
      try {
        const response1 = await axios.get(
          `http://localhost:8080/following/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        setFollowing(response1.data);
      } catch (error) {
        console.log("error fetching following data",error);
      }
    };
    getFollowing();

    const getFollower = async () => {
      try {
        const response2 = await axios.get(
          `http://localhost:8080/follow/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );
        setFollowers(response2.data);
      } catch (error) {
        console.log("error fetching follower count",error);
      }
    };
    getFollower();
  }, [jwt, userId]);

  const handleFollowersClick = () => {
    const matchingUsers = followers
      .filter((f) => f.followingId === userData.id)
      .map((f) => allUsersData.find((u) => u.id === f.followerId))
      .filter(Boolean);

    setFollowerUsernames(matchingUsers);
    setFollowerDialogOpen(true);
  };

  const handleFollowingClick = () => {
    const matched = following
      .filter((f) => f.followerId === userData.id)
      .map((f) => allUsersData.find((u) => u.id === f.followingId))
      .filter(Boolean);

    setFollowingUsers(matched);
    setFollowingDialogOpen(true);
  };
  const handleEditBio = () => {
    setEditBioDialogOpen(true);
  };

  const handleSaveBio = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/updateBio`,
        { bio },
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        setUserData({ ...userData, bio });
        setEditBioDialogOpen(false);
        showSnackbar("Bio updated successfully", "success");
      }
    } catch (error) {
      console.error("Error updating bio:", error);
      showSnackbar("Failed to update bio", "error");
    }
  };

  const handleEditPhoto = () => {
    setEditPhotoDialogOpen(true);
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axios.post(
        `http://localhost:8080/updateProfilePic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      if (response.status === 200) {
        setUserData({ 
          ...userData, 
          imageData: response.data.imageData || response.data.profilePic 
        });
        setEditPhotoDialogOpen(false);
        setSelectedImage(null);
        setPreviewImage(null);
        showSnackbar("Profile picture updated successfully", "success");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      showSnackbar("Failed to update profile picture", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (!userData) return <Typography>Loading...</Typography>;

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            mb: 4,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={`data:image/png;base64,${userData.imageData}`}
              sx={{ width: 120, height: 120, border: "2px solid #ddd" }}
            />
            {isCurrentUser && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                }}
                onClick={handleEditPhoto}
              >
                <PhotoCameraIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box>
            <Typography variant="h5">{userData.userName}</Typography>
            
            <Box sx={{ display: "flex", gap: 4, mt: 1 }}>
              <Typography variant="body1">
                <strong>{userData.posts.length}</strong> posts
              </Typography>
              <Typography
                variant="body1"
                onClick={handleFollowersClick}
                sx={{ cursor: "pointer" }}
              >
                <strong>{followers.length}</strong> followers
              </Typography>
              <Typography
                variant="body1"
                onClick={handleFollowingClick}
                sx={{ cursor: "pointer" }}
              >
                <strong>{following.length}</strong> following
              </Typography>
            </Box>
            
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                {userData.bio || "No bio yet"}
              </Typography>
              {isCurrentUser && (
                <IconButton size="small" onClick={handleEditBio}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {userData.posts && userData.posts.length > 0 ? (
            userData.posts.map((post, index) => (
              <Grid item xs={4} key={index}>
                <Card
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {post.mediaUrl && (
                    <Link to={`/post/${post.id}`}>
                      <CardMedia
                        component="img"
                        image={`data:image/png;base64,${post.mediaUrl}`}
                        sx={{
                          width: "100%",
                          height: "200px",
                          aspectRatio: "1 / 1",
                          objectFit: "cover",
                        }}
                      />
                    </Link>
                  )}
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>No posts available</Typography>
          )}
        </Grid>
      </Container>

      <Dialog open={editBioDialogOpen} onClose={() => setEditBioDialogOpen(false)}>
        <DialogTitle>Edit Bio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="bio"
            label="Bio"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBioDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveBio} color="primary" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editPhotoDialogOpen} onClose={() => setEditPhotoDialogOpen(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            {previewImage ? (
              <Avatar
                src={previewImage}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
            ) : (
              <Avatar
                src={`data:image/png;base64,${userData.imageData}`}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handlePhotoSelect}
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current.click()}
              startIcon={<PhotoCameraIcon />}
            >
              Select Image
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditPhotoDialogOpen(false);
            setSelectedImage(null);
            setPreviewImage(null);
          }} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadPhoto} 
            color="primary" 
            disabled={!selectedImage}
            startIcon={<SaveIcon />}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Followers Dialog */}
      <Dialog
        open={followerDialogOpen}
        onClose={() => setFollowerDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Followers</DialogTitle>
        <DialogContent dividers>
          {followerUsernames.length > 0 ? (
            followerUsernames.map((user, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <Avatar
                  src={`data:image/png;base64,${user.imageData}`}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Typography variant="body1">{user.userName}</Typography>
              </Box>
            ))
          ) : (
            <Typography>No followers found</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog
        open={followingDialogOpen}
        onClose={() => setFollowingDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Following</DialogTitle>
        <DialogContent dividers>
          {followingUsers.length > 0 ? (
            followingUsers.map((user, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", alignItems: "center", mb: 2 }}
              >
                <Avatar
                  src={`data:image/png;base64,${user.imageData}`}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Typography variant="body1">
                  {user.userName}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography>No following users found</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Profile;