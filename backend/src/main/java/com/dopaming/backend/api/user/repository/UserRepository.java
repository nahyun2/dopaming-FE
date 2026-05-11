package com.dopaming.backend.api.user.repository;

import com.dopaming.backend.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository<엔티티 클래스, PK의 타입> 을 상속받습니다.
public interface UserRepository extends JpaRepository<User, Long> {

    // 1. 아이디 중복 확인용 기능 (명세서의 아이디 중복 확인 API에서 사용할 예정)
    // DB에 해당 loginId가 존재하는지 true/false로 반환해줍니다.
    boolean existsByLoginId(String loginId);

    // 2. 로그인할 때 아이디로 회원 정보 찾기 기능
    // 회원이 없을 수도 있으므로 안전하게 Optional로 감싸서 반환합니다.
    Optional<User> findByLoginId(String loginId);
}