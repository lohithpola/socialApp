package com.app.socialmedia.controller;

import com.app.socialmedia.model.Likes;
import com.app.socialmedia.service.JWTService;
import com.app.socialmedia.service.LikeService;
import com.app.socialmedia.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LikeController {


    private final LikeService likeService;

    private final JWTService jwtService;

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/updateLike/{postId}")
    public ResponseEntity<Likes> updateLike(@RequestBody Likes likes, @PathVariable long postId) {
        Likes createdLike = likeService.likePost(likes, postId);
        
        // Broadcast feed update via WebSocket with post details
        Map<String, Object> message = new HashMap<>();
        message.put("action", "like");
        message.put("postId", postId);
        message.put("username", likes.getUserName());
        messagingTemplate.convertAndSend("/topic/feed", message);
        
        return new ResponseEntity<>(createdLike, HttpStatus.CREATED);
    }

    @GetMapping("/getLikeData/{postId}")
    public ResponseEntity<List<Likes>> getLikeData(@PathVariable long postId) {
        return new ResponseEntity<>(likeService.getLikes(postId), HttpStatus.OK);
    }

    @GetMapping("/getLike/{postId}")
    public ResponseEntity<Boolean> getLike(HttpServletRequest request, @PathVariable long postId) {
        String authHeader = request.getHeader("Authorization");
        String username = jwtService.extractUserName(authHeader.substring(7));
        return new ResponseEntity<>(likeService.isPostLiked(username, postId), HttpStatus.OK);
    }

    @DeleteMapping("/deleteLike/{postId}")
    public ResponseEntity<Boolean> deleteLike(HttpServletRequest request, @PathVariable long postId) {
        String authHeader = request.getHeader("Authorization");
        String username = jwtService.extractUserName(authHeader.substring(7));
        Boolean result = likeService.removeLike(username, postId);
        
        // Broadcast feed update via WebSocket with post details
        Map<String, Object> message = new HashMap<>();
        message.put("action", "unlike");
        message.put("postId", postId);
        message.put("username", username);
        messagingTemplate.convertAndSend("/topic/feed", message);
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}