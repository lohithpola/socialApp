package com.app.socialmedia.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String type;
    private String content;
    @Column(name = "time_stamp")
    private Date timeStamp;
    @Column(name = "is_read")
    private boolean isRead;

    @ManyToOne
    @JsonBackReference("user-notifications")
    @JoinColumn(name = "userId")
    private Users user;

    @JsonProperty("isRead")
    public boolean isRead() {
        return isRead;
    }
}
