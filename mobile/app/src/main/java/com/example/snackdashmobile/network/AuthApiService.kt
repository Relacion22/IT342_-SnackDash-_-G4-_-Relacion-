package com.example.snackdashmobile.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApiService {

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<Void>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<Void>>
}