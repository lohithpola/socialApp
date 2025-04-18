package com.app.socialmedia.repository;

import com.app.socialmedia.model.Likes;
import com.app.socialmedia.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LikeRepo extends JpaRepository<Likes,Long> {
    Likes findByUserNameAndPost(String username,Post post);
    List<Likes> findByPostId(long postId);
}