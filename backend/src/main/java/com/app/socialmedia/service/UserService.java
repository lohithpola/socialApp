package com.app.socialmedia.service;

import com.app.socialmedia.dto.UserDto;
import com.app.socialmedia.exception.UserNotFoundException;
import com.app.socialmedia.mapper.UserMapper;
import com.app.socialmedia.model.*;
import com.app.socialmedia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepo userRepo;

    private final JWTService jwtService;

    private final AuthenticationManager authManager;



    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    public Users userAdd(MultipartFile image, String fullName, String userName, String email, String password) throws IOException {
        byte[] imageData = image.getBytes();
        Users user = new Users();
        user.setFullName(fullName);
        user.setUserName(userName);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setImageData(imageData);

        return userRepo.save(user);
    }

    public List<Users> getallUsers() {
        List<Users> users = userRepo.findAll();

        for (Users user : users) {
            if (user.getPosts() != null) {
                user.getPosts().sort((p1, p2) -> Long.compare(p2.getId(), p1.getId()));
            }
        }

        return users;
    }

    public UserDto getuser(String username){
        Users user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UserNotFoundException("User not found with username: " + username);
        }

        return new UserDto(user.getId(), user.getUserName(), user.getImageData());
    }

    public Users getUserByUserName(String username) {
        Users user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UserNotFoundException("User not found with username: " + username);
        }
        return user;
    }


    public Users getfulluser(long userId) {
        Users user = userRepo.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        if (user.getPosts() != null) {
            user.getPosts().sort((p1, p2) -> Long.compare(p2.getId(), p1.getId()));
        }

        return user;
    }

    public List<Users> searchUser() {
        List<Users> user=userRepo.findAll();
        return user;
    }
    
    /**
     * Updates the bio for a user
     * @param username The username of the user to update
     * @param bio The new bio text
     * @return The updated user object
     */
    public Users updateBio(String username, String bio) {
        Users user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UserNotFoundException("User not found with username: " + username);
        }
        
        user.setBio(bio);
        return userRepo.save(user);
    }
    

    public Users updateProfilePicture(String username, MultipartFile image) throws IOException {
        Users user = userRepo.findByUserName(username);
        if (user == null) {
            throw new UserNotFoundException("User not found with username: " + username);
        }
        
        byte[] imageData = image.getBytes();
        user.setImageData(imageData);
        return userRepo.save(user);
    }
}