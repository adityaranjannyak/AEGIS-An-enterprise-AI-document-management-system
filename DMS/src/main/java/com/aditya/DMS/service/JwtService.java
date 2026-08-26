package com.aditya.DMS.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.aditya.DMS.entity.User;
import com.aditya.DMS.repository.UserRepo;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final UserRepo userRepo;
    private final SecretKey secretKey;

    public JwtService(
            UserRepo userRepo,
            @Value("${dms.jwt.secret}") String jwtSecret) {

        this.userRepo = userRepo;

        this.secretKey = Keys.hmacShaKeyFor(
                jwtSecret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(UserDetails userDetails) {

        Instant now = Instant.now();

        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(authority ->
                        authority.getAuthority().replace("ROLE_", "")
                )
                .toList();

        User user = userRepo.findByUsername(
                userDetails.getUsername()
        );

        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("roles", roles)
                .claim("userId", user == null ? null : user.getId())
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(
                        now.plus(1, ChronoUnit.HOURS)
                ))
                .signWith(secretKey, Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(
            String token,
            UserDetails userDetails) {

        String username = extractUsername(token);

        return username.equals(userDetails.getUsername());
    }
}