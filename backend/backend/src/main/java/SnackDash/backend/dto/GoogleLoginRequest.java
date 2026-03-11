package SnackDash.backend.dto;

import SnackDash.backend.entity.Role;

public class GoogleLoginRequest {
    private String token;
    private Role role;

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}