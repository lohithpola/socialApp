package com.app.socialmedia.repository;

import com.app.socialmedia.model.Post;
import com.app.socialmedia.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends JpaRepository<Users, Long> {
    Users findByUserName(String username);
    Users findByEmail(String email);

}