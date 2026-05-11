let _accessToken: string | null = null;
let _refreshToken: string | null = null;
let _nickname: string | null = null;

export const tokenStore = {
  set(access: string, refresh: string, nickname?: string) {
    _accessToken = access;
    _refreshToken = refresh;
    _nickname = nickname ?? null;
  },
  getAccess: () => _accessToken,
  getRefresh: () => _refreshToken,
  getNickname: () => _nickname,
  clear() {
    _accessToken = null;
    _refreshToken = null;
    _nickname = null;
  },
  isLoggedIn: () => _accessToken !== null,
};
