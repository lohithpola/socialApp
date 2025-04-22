package com.app.socialmedia.controller;

import com.app.socialmedia.model.Follow;
import com.app.socialmedia.service.FollowService;
import com.app.socialmedia.service.JWTService;
import com.app.socialmedia.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FollowController {

    private final FollowService followService;

    private final JWTService jwtService;

    @PostMapping("/setFollow")
    public ResponseEntity<Follow> setFollow(@RequestBody Follow follow) {
        return new ResponseEntity<>(followService.followUser(follow), HttpStatus.OK);
    }

    @GetMapping("getFollow/{followId}")
    public ResponseEntity<List<Follow>> getFollow(@PathVariable long followId) {
        return new ResponseEntity<>(followService.getFollows(followId), HttpStatus.OK);
    }

    @DeleteMapping("/deleteFollow/{followId}")
    public ResponseEntity<Boolean> deleteFollow(@PathVariable long followId, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String username = jwtService.extractUserName(authHeader.substring(7));
        return new ResponseEntity<>(followService.unfollowUser(username, followId), HttpStatus.OK);
    }

    @GetMapping("/following/{followId}")
    public ResponseEntity<List<Follow>> following(@PathVariable long followId) {
        return new ResponseEntity<>(followService.getFollowing(followId), HttpStatus.OK);
    }

    @GetMapping("/follow/{followId}")
    public ResponseEntity<List<Follow>> follow(@PathVariable long followId) {
        return new ResponseEntity<>(followService.getFollowers(followId), HttpStatus.OK);
    }
}