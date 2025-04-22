package com.app.socialmedia.controller;

import com.app.socialmedia.model.Users;
import com.app.socialmedia.repository.UserRepo;
import com.app.socialmedia.service.MailService;
import com.app.socialmedia.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepo userRepository;


    private final PasswordResetService passwordResetService;

    private final JavaMailSender mailSender;

    @Value("${frontend.base.url}")
    private String frontendBaseUrl;
    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No user with this email.");
        }

        String token = UUID.randomUUID().toString();
        passwordResetService.saveToken(email, token);

        String resetLink = frontendBaseUrl + "/reset-password/" + token;

        sendResetEmail(email, resetLink);

        return ResponseEntity.ok("Reset link sent to your email.");
    }

    @Transactional
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");

        String email = passwordResetService.getEmailByToken(token);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired token");
        }

        Users user = userRepository.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        user.setPassword(encoder.encode((password)));
        userRepository.save(user);
        passwordResetService.removeToken(token);

        return ResponseEntity.ok("Password reset successfully");
    }

    private void sendResetEmail(String toEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Password Reset Request");
        message.setText("Click the following link to reset your password:\n" + resetLink + "\n\nIf you did not request this, please ignore.");
        mailSender.send(message);
    }
}
