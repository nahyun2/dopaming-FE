package com.dopaming.backend.api.user.controller;

import com.dopaming.backend.api.user.dto.LoginRequest;
import com.dopaming.backend.api.user.dto.SignupRequest;
import com.dopaming.backend.api.user.dto.TokenRequest;
import com.dopaming.backend.api.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. 아이디 중복 확인
    @GetMapping("/check-id")
    public ResponseEntity<?> checkId(@RequestParam("loginId") String loginId) {
        boolean isAvailable = authService.checkIdAvailable(loginId);

        if (isAvailable) {
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "사용 가능한 아이디입니다.",
                    "data", Map.of("isAvailable", true)
            ));
        } else {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", "error",
                    "message", "이미 사용 중인 아이디입니다.",
                    "code", "DUPLICATE_ID",
                    "data", Map.of("isAvailable", false)
            ));
        }
    }

    // 2. 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        var responseData = authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "status", "success",
                "message", "회원가입이 성공적으로 완료되었습니다.",
                "data", responseData
        ));
    }

    // 3. 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        var tokenData = authService.login(request);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "로그인에 성공하였습니다.",
                "data", tokenData
        ));
    }

    // 4. 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody TokenRequest request) {
        var newTokenData = authService.reissueToken(request.getRefreshToken());
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "토큰이 성공적으로 재발급되었습니다.",
                "data", newTokenData
        ));
    }

    // 5. 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String accessToken) {
        // 실제 운영에서는 Redis 등을 활용해 토큰을 블랙리스트에 등록하는 로직이 들어갑니다.
        authService.logout(accessToken);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "성공적으로 로그아웃되었습니다."
        ));
    }
}