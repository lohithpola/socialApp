package com.app.socialmedia.service;

import com.app.socialmedia.dto.LoginRequestDTO;
import com.app.socialmedia.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepo userRepo;
    private final JWTService jwtService;
    private final AuthenticationManager authManager;

    public String verify(LoginRequestDTO dto) {
        try {
            Authentication auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(dto.getUserName(), dto.getPassword())
            );
            return jwtService.generateToken(dto.getUserName());
        } catch (Exception e) {
            return "fail";
        }
    }
}
