package com.dopaming.backend.api.user.service;

import com.dopaming.backend.api.user.dto.LoginRequest;
import com.dopaming.backend.api.user.dto.SignupRequest;
import com.dopaming.backend.api.user.dto.TokenResponse;
import com.dopaming.backend.api.user.entity.User;
import com.dopaming.backend.api.user.repository.UserRepository;
import com.dopaming.backend.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // SecurityConfig에서 등록한 암호화 도구
    private final JwtTokenProvider jwtTokenProvider;

    // 1. 아이디 중복 확인
    @Transactional(readOnly = true)
    public boolean checkIdAvailable(String loginId) {
        // 존재하면 false(사용불가), 존재하지 않으면 true(사용가능) 반환
        return !userRepository.existsByLoginId(loginId);
    }

    // 2. 회원가입
    @Transactional
    public Map<String, String> signup(SignupRequest request) {
        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 비밀번호를 암호화(BCrypt)하여 엔티티 생성
        User user = User.builder()
                .loginId(request.getLoginId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .nickname(request.getNickname())
                .build();

        userRepository.save(user); // DB에 저장

        return Map.of(
                "loginId", user.getLoginId(),
                "nickname", user.getNickname()
        );
    }

    // 3. 로그인
    @Transactional
    public TokenResponse login(LoginRequest request) {
        // 아이디로 사용자 찾기
        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

        // 비밀번호 일치 여부 확인 (입력받은 평문 비번 vs DB의 암호화된 비번)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        // Access & Refresh 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getLoginId());
        String refreshToken = jwtTokenProvider.createRefreshToken(); // 필요시 DB나 Redis에 저장하는 로직 추가

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .nickname(user.getNickname())
                .build();
    }

    // 4. 토큰 재발급
    @Transactional
    public TokenResponse reissueToken(String refreshToken) {
        // Refresh 토큰이 유효한지 검사
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않거나 만료된 Refresh Token 입니다.");
        }

        // 실제 서비스에서는 Refresh 토큰을 까서 유저 정보를 알아낸 뒤 새 토큰을 만듭니다.
        // 현재는 토큰에서 이름을 꺼내와서 새 AccessToken을 발급하는 기본 로직입니다.
        String loginId = jwtTokenProvider.getAuthentication(refreshToken).getName();
        String newAccessToken = jwtTokenProvider.createAccessToken(loginId);
        String newRefreshToken = jwtTokenProvider.createRefreshToken();

        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    // 5. 로그아웃
    public void logout(String accessToken) {
        // JWT는 상태를 저장하지 않으므로, 완벽한 로그아웃을 위해서는
        // Redis 같은 메모리 DB를 사용해 해당 AccessToken을 '블랙리스트'에 등록해야 합니다.
        // 이 부분은 추후 기능 고도화 시 추가하시면 됩니다!
    }
}