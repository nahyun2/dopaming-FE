package com.dopaming.backend.api.shortform.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
public class ShortformLimitUpdateRequest {

    @Schema(description = "하루 숏폼 제한 시간, 초 단위", example = "3600")
    private int dailyLimitSeconds;
}