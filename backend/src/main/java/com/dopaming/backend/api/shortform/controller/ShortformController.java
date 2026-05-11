package com.dopaming.backend.api.shortform.controller;

import com.dopaming.backend.api.shortform.dto.request.ShortformLimitUpdateRequest;
import com.dopaming.backend.api.shortform.dto.request.ShortformUsageRequest;
import com.dopaming.backend.api.shortform.service.ShortformService;
import com.dopaming.backend.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Shortform", description = "숏폼 사용 시간 및 제한 시간 API")
@RestController
@RequestMapping("/api/shortform")
@RequiredArgsConstructor
public class ShortformController {

    private final ShortformService shortformService;

    @Operation(summary = "숏폼 사용 시간 기록", description = "사용자의 숏폼 사용 시간을 저장하고 오늘 누적 사용 시간과 제한 초과 여부를 반환합니다.")
    @PostMapping("/usage")
    public ResponseEntity<?> recordUsage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ShortformUsageRequest request
    ) {
        Long userId = userDetails.getUserId(); // User 엔티티의 id

        var response = shortformService.recordUsage(userId, request);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "숏폼 사용 시간이 기록되었습니다.",
                "data", response
        ));
    }

    @Operation(summary = "오늘 사용 시간 조회", description = "로그인한 사용자의 오늘 숏폼 누적 사용 시간과 남은 제한 시간을 조회합니다.")    @GetMapping("/usage/today")
    public ResponseEntity<?> getTodayUsage(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        var response = shortformService.getTodayUsage(userId);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "오늘 숏폼 사용 시간이 조회되었습니다.",
                "data", response
        ));
    }

    @Operation(summary = "하루 제한 시간 조회", description = "로그인한 사용자의 하루 숏폼 제한 시간을 초 단위로 조회합니다.")    @GetMapping("/limit")
    public ResponseEntity<?> getLimit(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails.getUserId();

        var response = shortformService.getLimit(userId);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "하루 숏폼 제한 시간이 조회되었습니다.",
                "data", response
        ));
    }

    @Operation(summary = "하루 제한 시간 변경", description = "로그인한 사용자의 하루 숏폼 제한 시간을 초 단위로 변경합니다.")    @PutMapping("/limit")
    public ResponseEntity<?> updateLimit(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ShortformLimitUpdateRequest request
    ) {
        Long userId = userDetails.getUserId();

        var response = shortformService.updateLimit(userId, request);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "하루 숏폼 제한 시간이 변경되었습니다.",
                "data", response
        ));
    }
}