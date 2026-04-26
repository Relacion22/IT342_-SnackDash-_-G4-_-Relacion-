package com.example.snackdashmobile.network

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.IOException

object ApiClient {
    // Use 10.0.2.2 to connect to your PC's localhost from the Android Emulator
    private const val BASE_URL = "http://10.0.2.2:8080/api"

    private val authInterceptor = Interceptor { chain ->
        val original = chain.request()
        val token = getStoredToken()
        val request = if (token != null) {
            original.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            original
        }
        chain.proceed(request)
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .build()

    val retrofit: Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(client)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val authService: AuthApiService by lazy {
        retrofit.create(AuthApiService::class.java)
    }

    // Helper function to get stored token (implement based on your storage)
    private fun getStoredToken(): String? {
        // This will be set by the application
        return null
    }

    fun setTokenProvider(provider: () -> String?) {
        // For now, we'll handle token in individual calls
    }
}