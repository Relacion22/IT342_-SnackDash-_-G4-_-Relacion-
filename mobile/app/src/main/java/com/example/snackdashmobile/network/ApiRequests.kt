package com.example.snackdashmobile.network

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