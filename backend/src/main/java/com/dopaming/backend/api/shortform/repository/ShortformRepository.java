package com.dopaming.backend.api.shortform.repository;

import com.dopaming.backend.api.shortform.entity.Shortform;
import com.dopaming.backend.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;

public interface ShortformRepository extends JpaRepository<Shortform, Long> {

    // 특정 사용자의 특정 날짜 숏폼 총 사용 시간을 초 단위로 합산한다.
    // 사용 기록이 없는 경우 sum 결과가 null이 될 수 있으므로 coalesce로 0을 반환한다.
    @Query("""
            select coalesce(sum(s.durationSeconds), 0)
            from Shortform s
            where s.user = :user
              and s.usageDate = :usageDate
            """)
    int sumDurationSecondsByUserAndUsageDate(User user, LocalDate usageDate);
}