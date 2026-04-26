package com.example.snackdashmobile.network

import java.time.LocalDateTime

// Role must match the Enum in your Spring Boot backend
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val role: String = "STUDENT" // Defaulting to student for the mobile app
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class ApiResponse<T>(
    val success: Boolean,
    val data: T?,
    val error: String?,
    val timestamp: LocalDateTime
)