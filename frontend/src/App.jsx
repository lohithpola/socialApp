import { useState } from "react";
import Register from "./Register";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./Login";
import ProctectedRoute from "./ProtectedRoute";
import Home from "./Home";
import Navbar from "./Navbar";
import CreatePost from "./CreatePost";
import Profile from "./Profile";
import SinglePost from "./SinglePost";
import Follow from "./Follow";
import Search from "./Search";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Notifications from "./Notifications";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />


          <Route element={<ProctectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/navbar" element={<Navbar />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post/:postId" element={<SinglePost/>}/>
            <Route path="/friends" element={<Follow/>}/>
            <Route path="/search" element={<Search/>}/>
            <Route path="/notifications" element={<Notifications/>}/>
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
