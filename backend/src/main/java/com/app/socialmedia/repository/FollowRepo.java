package com.app.socialmedia.repository;

import com.app.socialmedia.model.Follow;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowRepo extends JpaRepository<Follow,Long>{
    List<Follow> findByFollowerId(long followId);
    List<Follow> findByFollowingId(long followId);
    @Transactional
    long deleteByFollowerIdAndFollowingId(long followId,long FollowingId);
}