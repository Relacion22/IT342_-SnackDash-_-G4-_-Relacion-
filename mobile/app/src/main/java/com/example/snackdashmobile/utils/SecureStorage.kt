package com.example.snackdashmobile.utils

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureStorage(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun saveToken(token: String) {
        sharedPreferences.edit().putString("jwt_token", token).apply()
    }

    fun getToken(): String? {
        return sharedPreferences.getString("jwt_token", null)
    }

    fun saveUserData(email: String, name: String, role: String) {
        sharedPreferences.edit()
            .putString("user_email", email)
            .putString("user_name", name)
            .putString("user_role", role)
            .apply()
    }

    fun getUserEmail(): String? {
        return sharedPreferences.getString("user_email", null)
    }

    fun getUserName(): String? {
        return sharedPreferences.getString("user_name", null)
    }

    fun getUserRole(): String? {
        return sharedPreferences.getString("user_role", null)
    }

    fun clearAll() {
        sharedPreferences.edit().clear().apply()
    }
}