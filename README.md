# SnackDash 🍔📱
**Multi-Tenant Canteen Pre-Ordering System**

SnackDash is a comprehensive solution designed to eliminate long canteen queues. It allows students to pre-order meals via a mobile app while providing kitchen staff with a real-time dashboard to manage orders across multiple canteen locations.

---

## 🚀 Project Overview
SnackDash is built as a multi-tenant platform, meaning multiple different canteens can use the system simultaneously, each managing its own menu, staff, and order flow.

### Key Features
* **Student App (Mobile):** Menu browsing, Google OAuth login, virtual wallet top-ups, and real-time order tracking.
* **Kitchen Dashboard (Web):** Live order queue with status toggles (Cooking/Ready) and instant inventory management.
* **Multi-Tenancy:** Data isolation ensuring Canteen A cannot see Canteen B's orders or revenue.
* **Real-Time Sync:** Instant updates between the student and kitchen using Firebase/Supabase.

---

## 🛠️ Mandatory Features (IT342 Requirements)
This project implements all required system integrations:
* **Auth & Security:** JWT-based authentication with BCrypt password hashing.
* **Role-Based Access Control (RBAC):** Distinct permissions for Students and Kitchen Staff.
* **External API:** Integration with a Nutritional API for real-time food data.
* **Google OAuth:** Secure social login integration.
* **File Upload:** Support for uploading product images (stored on server).
* **Payment Gateway:** Sandbox integration (Stripe/PayPal) for virtual wallet top-ups.
* **SMTP Email:** Automated email receipts and account notifications.

---

## 📂 Repository Structure
Following the required project organization:

```text
IT342_SnackDash_<Section>_<Lastname>/
├── backend/        # Node.js/Spring Boot API (Controller-Service-Repository)
├── web/            # Kitchen Dashboard (React/Vue)
├── mobile/         # Student Application (Flutter/React Native)
├── docs/           # SDD, ERD, and Architecture Diagrams
└── README.md       # Project documentation