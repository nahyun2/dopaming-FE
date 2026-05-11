package com.dopaming.backend.api.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor // Jackson(JSON 파서)이 객체를 생성할 때 필요합니다.
public class SignupRequest {
    private String loginId;
    private String password;
    private String name;
    private String nickname;
}