package com.app.socialmedia.service;

import com.app.socialmedia.controller.NotificationController;
import com.app.socialmedia.exception.LikeNotFoundException;
import com.app.socialmedia.exception.PostNotFoundException;
import com.app.socialmedia.model.Likes;
import com.app.socialmedia.model.Post;
import com.app.socialmedia.model.Users;
import com.app.socialmedia.repository.LikeRepo;
import com.app.socialmedia.repository.PostRepo;
import com.app.socialmedia.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {


    private final PostRepo postRepo;

    private final LikeRepo likeRepo;

    private final UserRepo userRepo;

    private final NotificationController notificationController;

    public Likes likePost(Likes likes, long postId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new PostNotFoundException("Post not found with Id"+postId));
        likes.setPost(post);
        
        // Create notification for post owner if it's not the same user
        if (!likes.getUserName().equals(post.getUser().getUserName())) {
            Users postOwner = post.getUser();
            String content = likes.getUserName() + " liked your post";
            notificationController.createAndSendNotification("LIKE", content, postOwner);
        }
        
        // Update post likes count
        int currentLikes = post.getLikes() != null ? post.getLikes() : 0;
        post.setLikes(currentLikes + 1);
        postRepo.save(post);
        
        return likeRepo.save(likes);
    }

    public boolean isPostLiked(String username, long postId) {
        Post post = postRepo.findById(postId).orElseThrow(()->new PostNotFoundException("Post not found with Id"+postId));
        return likeRepo.findByUserNameAndPost(username, post) != null;
    }

    public boolean removeLike(String username, long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with ID: " + postId));

        Likes like = likeRepo.findByUserNameAndPost(username, post);
        if (like == null) {
            throw new LikeNotFoundException("Like not found for user: " + username + " on post ID: " + postId);
        }

        likeRepo.delete(like);
        
        // Update post likes count
        int currentLikes = post.getLikes() != null ? post.getLikes() : 0;
        if (currentLikes > 0) {
            post.setLikes(currentLikes - 1);
            postRepo.save(post);
        }
        
        return true;
    }


    public List<Likes> getLikes(long postId) {
        if (!postRepo.existsById(postId)) {
            throw new PostNotFoundException("Post not found with ID: " + postId);
        }
        return likeRepo.findByPostId(postId);
    }
}