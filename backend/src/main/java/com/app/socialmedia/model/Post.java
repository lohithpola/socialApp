package com.app.socialmedia.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String content;
    @Lob
    private byte[] mediaUrl;
    private Date timeStamp;
    private Integer likes;
    
    @ManyToOne
    @JsonBackReference("user-posts")
    @JoinColumn(name = "userId")
    private Users user;
    
    @OneToMany(mappedBy = "post",cascade = CascadeType.ALL)
    @JsonManagedReference("post-comments")
    private List<Comment> comments;
    
    @OneToMany(mappedBy = "post",cascade = CascadeType.ALL)
    @JsonManagedReference("post-likes")
    private List<Likes> like;
}