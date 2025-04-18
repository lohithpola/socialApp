import axios from "axios";
import { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import Navbar from "./Navbar";

const Follow = () => {
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const [userData, setUserData] = useState([]);
  const [userName1, setUserName] = useState("");
  const [userId, setUserId] = useState(0);
  const [followList, setFollowList] = useState([]);
  const [followFlag, setFollowFlag] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/getAllUsers`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.log("Error fetching user data");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response1 = await axios.get("http://localhost:8080/getUser", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setUserName(response1.data.username);
        setUserId(response1.data.id);
        console.log(response1.data.username);
        console.log(response1.data.id);
      } catch (error) {
        console.log("Error fetching username,Id");
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    if (userId !== 0) {
      const fetchFollowList = async () => {
        try {
          const response4 = await axios.get(`http://localhost:8080/getFollow/${userId}`, {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          });
          setFollowList(response4.data);
          console.log("Follow list:", response4.data);
        } catch (error) {
          console.log("Error fetching follow list");
        }
      };
      fetchFollowList();
    }
  }, [userId, followFlag]);

  const handleFollow = async (id, content) => {
    if (content === "Follow") {
      try {
        const response3 = await axios.post("http://localhost:8080/setFollow", {
          followerId: userId,
          followingId: id,
        }, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setFollowList([...followList, {followerId: userId, followingId: id}]);
      } catch (error) {
        console.log("Error posting followId");
      }
    } else {
      try {
        const response3 = await axios.delete(`http://localhost:8080/deleteFollow/${id}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        setFollowList(followList.filter(follow => follow.followingId !== id));
      } catch (error) {
        console.log("Error while deleting followid");
      }
    }
    setFollowFlag(!followFlag);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 600, margin: "20px auto" }}>
        {userData.map((user, index) => (
          user.userName !== userName1 ?
            <Card
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 2,
                marginBottom: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={`data:image/png;base64,${user.imageData}`}
                  alt={user.userName}
                  sx={{ width: 50, height: 50, marginRight: 2 }}
                />
                <Typography variant="subtitle1">{user.userName}</Typography>
              </Box>
              <Button
                onClick={(e) => handleFollow(user.id, e.currentTarget.textContent)}
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 3,
                  backgroundColor: "#0095f6",
                  "&:hover": { backgroundColor: "#0077cc" },
                }}
              >
                {followList.some(follow => follow.followingId === user.id) ? "Following" : "Follow"}
              </Button>
            </Card> : <></>
        ))}
      </Box>
    </>
  );
};

export default Follow;