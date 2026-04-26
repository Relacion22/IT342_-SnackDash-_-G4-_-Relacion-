# Stall Owner Dashboard 403 Fix
## Steps:
1. Create CustomUserDetails.java implementing UserDetails wrapping entity.User.
2. Create CustomUserDetailsService.java impl UserDetailsService using UserRepository.
3. Update JwtAuthenticationFilter.java to use UserDetailsService, set proper authorities.
4. Add @EnableMethodSecurity to SecurityConfig.java, add .requestMatchers("/api/stall/**", "/api/menu/**", "/api/orders/owner**").hasRole("OWNER").
5. Restart backend.
6. Test stall owner login, dashboard load.
7. If no stall, frontend redirects to create-stall gracefully.
8. [ ] Complete

✅ Step 1-4 complete: CustomUserDetails.java, CustomUserDetailsService.java created. JwtAuthenticationFilter.java and SecurityConfig.java updated with UserDetailsService injection and role-based access (/api/stall/**, /api/menu/**, /api/orders/owner -> hasRole("OWNER")).

Next:
5. Restart backend server (cd backend/backend && mvn spring-boot:run).
6. Test stall owner login and dashboard.
7. [ ] Test complete

