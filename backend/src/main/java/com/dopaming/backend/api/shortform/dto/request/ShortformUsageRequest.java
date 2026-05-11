package com.dopaming.backend.api.shortform.dto.request;

import com.dopaming.backend.api.shortform.entity.ShortformPlatform;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ShortformUsageRequest {

    @Schema(description = "숏폼 플랫폼", example = "YOUTUBE_SHORTS")
    private ShortformPlatform platform;

    @Schema(description = "사용 시작 시각", example = "2026-05-11T14:00:00")
    private LocalDateTime startedAt;

    @Schema(description = "사용 종료 시각", example = "2026-05-11T14:05:00")
    private LocalDateTime endedAt;

    @Schema(description = "사용 시간, 초 단위", example = "300")
    private int durationSeconds;
}