package com.dopaming.backend.api.shortform.entity;

import com.dopaming.backend.api.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "shortform")
public class Shortform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 사용자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // YOUTUBE_SHORTS, INSTAGRAM_REELS, TIKTOK, ETC
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShortformPlatform platform;

    // 사용 날짜
    @Column(nullable = false)
    private LocalDate usageDate;

    // 사용 시작 시간
    @Column(nullable = false)
    private LocalDateTime startedAt;

    // 사용 종료 시간
    @Column(nullable = false)
    private LocalDateTime endedAt;

    // 사용 시간, 초 단위
    @Column(nullable = false)
    private int durationSeconds;

    @Builder
    public Shortform(
            User user,
            ShortformPlatform platform,
            LocalDate usageDate,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            int durationSeconds
    ) {
        this.user = user;
        this.platform = platform;
        this.usageDate = usageDate;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.durationSeconds = durationSeconds;
    }
}