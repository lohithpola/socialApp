package com.app.socialmedia.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JWTService {
    private final String secretkey = "565bb597991b41ef59edef42c7cb2816cdcbb6b2977d451caf7c8d6d92e3d34ab1ac5fd8020f6acca068cdb80b2c4994a4c0498e2272c501d0dd5a0f833c15f97b5aff532be3e9e26f306cd05b59a6303107d4bfe778068d8e853ff4122f566d9fb1257b96fee599d9561a3e6e801b9963916609bb8a1ace96e96eaadea125e37dceb486a18129b45fef68f9fca20da24e7a3224f77f07e7f4af967c67bd6b70b66c01553cd464afbc78d6ca1756e53ae58b06abfd17852d9f034f49ca0df32153e2a02a505b36fa6d6e79d0ec6c25a152087c9551dc08568a9bbc9a4e4f83bcdbd4b794927d5de07528bfa5da4302ec096e4750f740e7549a7aa1673aebd6d7";

    // Constructor with no key generation to maintain consistent secret key
    public JWTService() {
        // Using the static secretkey defined above
    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
                .signWith(getKey())
                .compact();

    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secretkey.getBytes());
    }

    public String extractUserName(String token) {
        // extract the username from jwt token
        return extractClaim(token, Claims::getSubject);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimResolver) {
        final Claims claims = extractAllClaims(token);
        return claimResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return  Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public boolean validateToken(String token, UserDetails userDetails) {
        final String userName = extractUserName(token);
        return (userName.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}