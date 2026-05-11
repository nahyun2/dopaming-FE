package com.dopaming.backend.global.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final CustomUserDetailsService customUserDetailsService;

    // Access Token 만료 시간: 30분
    private final long accessTokenValidityTime = 30 * 60 * 1000L;
    // Refresh Token 만료 시간: 7일
    private final long refreshTokenValidityTime = 7 * 24 * 60 * 60 * 1000L;

    // application.yml에 설정한 jwt.secret 값을 가져옵니다.
    public JwtTokenProvider(
            @Value("${jwt.secret}") String secretKey,
            CustomUserDetailsService customUserDetailsService
    ) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.customUserDetailsService = customUserDetailsService;
    }

    // Access 토큰 생성
    public String createAccessToken(String loginId) {
        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityTime);

        return Jwts.builder()
                .setSubject(loginId)
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Refresh 토큰 생성
    public String createRefreshToken() {
        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityTime);

        return Jwts.builder()
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 토큰에서 인증 정보(Authentication) 가져오기
    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 로그인 ID (Subject) 추출
        String loginId = claims.getSubject();
        UserDetails principal = customUserDetailsService.loadUserByUsername(loginId);

        return new UsernamePasswordAuthenticationToken(
                principal,
                token,
                principal.getAuthorities()
        );
    }

    // 토큰의 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // 토큰이 만료되었거나, 조작되었거나, 비어있는 경우 false
            return false;
        }
    }
}