package com.app.socialmedia.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String content;
    @Column(name = "time_stamp")
    private Date timeStamp;
    @Column(name = "user_name")
    private String userName;
    
    @ManyToOne
    @JsonBackReference("post-comments")
    @JoinColumn(name = "postId")
    private Post post;

    @ManyToOne
    @JsonBackReference("user-comments")
    @JoinColumn(name = "userId")
    private Users user;
    
    // Helper method to get user if userName is provided but user is not
    public Users getUser() {
        if (user == null && userName != null) {
            // Create a temporary user object with userName
            Users tempUser = new Users();
            tempUser.setUserName(userName);
            return tempUser;
        }
        return user;
    }
}