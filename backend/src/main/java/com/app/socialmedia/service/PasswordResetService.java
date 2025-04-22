package com.app.socialmedia.service;

import com.app.socialmedia.model.PasswordResetToken;
import com.app.socialmedia.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;

    public void saveToken(String email, String token) {
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setEmail(email);
        resetToken.setToken(token);
        resetToken.setExpirationTime(LocalDateTime.now().plusMinutes(30));
        tokenRepo.save(resetToken);
    }

    public String getEmailByToken(String token) {
        Optional<PasswordResetToken> opt = tokenRepo.findByToken(token);
        if (opt.isEmpty()) return null;

        PasswordResetToken resetToken = opt.get();
        if (resetToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            tokenRepo.deleteByToken(token);
            return null;
        }

        return resetToken.getEmail();
    }

    public void removeToken(String token) {
        tokenRepo.deleteByToken(token);
    }
}