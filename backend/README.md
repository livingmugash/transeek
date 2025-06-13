# AuraTranslate Backend

This directory contains the complete Django backend for the AuraTranslate application.

## Core Responsibilities

-   **API Server**: Provides all API endpoints for user authentication (signup, login, logout), user status checks, and payment processing.
-   **Database Interaction**: Manages all communication with the MySQL database through the Django ORM, handling user data, subscriptions, and trial statuses.
-   **Frontend Serving**: Serves the main `index.html` (landing/auth page) and the `transeek.html` (main application dashboard).
-   **Security**: Implements Django's built-in security features, including CSRF protection, secure password hashing, and session management.

## Getting Started

To run the backend locally, please follow the instructions in the main `DEPLOYMENT_GUIDE.md` located in the project's root directory. The guide covers environment setup, dependency installation, database configuration, and how to start the server.

