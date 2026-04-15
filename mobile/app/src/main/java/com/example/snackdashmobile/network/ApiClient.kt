package com.example.snackdashmobile.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    // Use 10.0.2.2 to connect to your PC's localhost from the Android Emulator
    private const val BASE_URL = "http://10.0.2.2:8080/"

    val authService: AuthApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(AuthApiService::class.java)
    }
}