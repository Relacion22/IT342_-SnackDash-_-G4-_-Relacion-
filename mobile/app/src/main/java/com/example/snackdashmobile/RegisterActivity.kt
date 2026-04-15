package com.example.snackdashmobile

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.snackdashmobile.network.ApiClient
import com.example.snackdashmobile.network.RegisterRequest
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etName = findViewById<EditText>(R.id.etName)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val tvGoToLogin = findViewById<TextView>(R.id.tvGoToLogin)

        btnRegister.setOnClickListener {
            val name = etName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val request = RegisterRequest(name, email, password, "STUDENT")
                    val response = ApiClient.authService.register(request)

                    if (response.isSuccessful) {
                        // 1. Show the success message
                        Toast.makeText(this@RegisterActivity, "Registration Successful!", Toast.LENGTH_LONG).show()

                        // 2. Explicitly redirect to the Login screen
                        val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
                        startActivity(intent)

                        // 3. Close the registration screen so they can't click "back" to it
                        finish()
                    } else {
                        // If the backend rejects it (e.g., email already exists), show the exact error
                        val errorMessage = response.errorBody()?.string() ?: "Registration failed"
                        Toast.makeText(this@RegisterActivity, "Error: $errorMessage", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(this@RegisterActivity, "Connection Failed. Is Spring Boot running?", Toast.LENGTH_LONG).show()
                }
            }
        }

        tvGoToLogin.setOnClickListener {
            val intent = Intent(this@RegisterActivity, LoginActivity::class.java)
            startActivity(intent)
            finish()
        }
    }
}