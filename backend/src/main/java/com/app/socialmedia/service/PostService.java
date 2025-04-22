package com.app.socialmedia.service;

import com.app.socialmedia.exception.PostNotFoundException;
import com.app.socialmedia.model.Post;
import com.app.socialmedia.model.Users;
import com.app.socialmedia.repository.PostRepo;
import com.app.socialmedia.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.app.socialmedia.dto.PostDto;

import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final UserRepo userRepo;

    private final PostRepo postRepo;

    public Post createpost(String username, PostDto postDto) {
        Users user = userRepo.findByUserName(username);
        Post post = new Post();
        post.setContent(postDto.content());
        try {
            post.setMediaUrl(Base64.getDecoder().decode(postDto.mediaUrl()));
        } catch (IllegalArgumentException e) {
            post.setMediaUrl(null);
        }
        post.setTimeStamp(new Date());
        post.setLikes(0);
        post.setUser(user);
        return postRepo.save(post);
    }

    public Post getpost(long id) {
        return postRepo.findById(id).orElseThrow(()->new PostNotFoundException("Post not found with ID:"+id));
    }


    public Post updatepost(long id, Integer like) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new PostNotFoundException("Post not found with ID: " + id));

        post.setLikes(like);
        return postRepo.save(post);
    }
}