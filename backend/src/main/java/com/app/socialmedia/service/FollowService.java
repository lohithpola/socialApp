package com.app.socialmedia.service;

import com.app.socialmedia.controller.NotificationController;
import com.app.socialmedia.exception.FollowNotFoundException;
import com.app.socialmedia.exception.UserNotFoundException;
import com.app.socialmedia.model.Follow;
import com.app.socialmedia.model.Users;
import com.app.socialmedia.repository.FollowRepo;
import com.app.socialmedia.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FollowService {


    private final FollowRepo followRepo;

    private final UserRepo userRepo;

    private final NotificationController notificationController;

    public Follow followUser(Follow follow) {
        // Get the user being followed to create a notification
        Users followingUser = userRepo.findById(follow.getFollowingId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + follow.getFollowingId()));
        
        // Get the follower's username for the notification
        Users followerUser = userRepo.findById(follow.getFollowerId())
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + follow.getFollowerId()));
        
        // Create notification
        String content = followerUser.getUserName() + " started following you";
        notificationController.createAndSendNotification("FOLLOW", content, followingUser);
        
        return followRepo.save(follow);
    }

    public List<Follow> getFollows(long followerId) {
        List<Follow> follows = followRepo.findByFollowerId(followerId);
        if (follows.isEmpty()) {
            throw new FollowNotFoundException("No follows found for user with ID: " + followerId);
        }
        return follows;
    }

    public boolean unfollowUser(String username, long followingId) {
        Users user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UserNotFoundException("User not found with username: " + username);
        }

        long deleted = followRepo.deleteByFollowerIdAndFollowingId(user.getId(), followingId);
        if (deleted == 0) {
            throw new FollowNotFoundException("Follow relationship not found between " + username + " and user ID " + followingId);
        }
        return true;
    }

    public List<Follow> getFollowing(long userId) {
        if (!userRepo.existsById(userId)) {
            throw new UserNotFoundException("User with ID " + userId + " not found");
        }
        return followRepo.findByFollowerId(userId);
    }

    public List<Follow> getFollowers(long userId) {
        if (!userRepo.existsById(userId)) {
            throw new UserNotFoundException("User with ID " + userId + " not found");
        }
        return followRepo.findByFollowingId(userId);
    }
}