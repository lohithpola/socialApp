package com.app.socialmedia.controller;

import com.app.socialmedia.model.Comment;
import com.app.socialmedia.service.CommentService;
import com.app.socialmedia.service.UserService;
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
public class CommentController {

    private final CommentService commentService;

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/setComment/{postId}")
    public ResponseEntity<Comment> setComment(@PathVariable long postId, @RequestBody Comment comment) {
        Comment savedComment = commentService.addComment(comment, postId);
        
        // Broadcast feed update via WebSocket with comment details
        Map<String, Object> message = new HashMap<>();
        message.put("action", "comment");
        message.put("postId", postId);
        message.put("commentId", savedComment.getId());
        message.put("username", comment.getUserName());
        messagingTemplate.convertAndSend("/topic/feed", message);
        
        return new ResponseEntity<>(savedComment, HttpStatus.OK);
    }

    @GetMapping("getComments/{postId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable long postId) {
        return new ResponseEntity<>(commentService.getComments(postId), HttpStatus.OK);
    }

    @DeleteMapping("/deleteComment/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable long commentId) {
        // Get the comment's post ID before deletion
        long postId = commentService.getCommentPostId(commentId);
        String username = commentService.getCommentUsername(commentId);
        
        commentService.deleteComment(commentId);
        
        // Broadcast feed update via WebSocket with comment details
        Map<String, Object> message = new HashMap<>();
        message.put("action", "deleteComment");
        message.put("postId", postId);
        message.put("commentId", commentId);
        message.put("username", username);
        messagingTemplate.convertAndSend("/topic/feed", message);
        
        return ResponseEntity.ok().build();
    }
}