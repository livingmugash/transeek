# Local Deployment Guide

This guide explains how to set up and run the AuraTranslate application on your local machine.

## Prerequisites

-   Python 3.8+ and pip
-   MySQL Community Server
-   Git

## Project Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-repo-url>
    cd voice_translator_app
    ```

2.  **Create a Virtual Environment**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

## MySQL Database Setup

1.  **Log into MySQL**
    ```bash
    mysql -u root -p
    ```

2.  **Create Database and User**
    ```sql
    CREATE DATABASE voice_translator_db;
    CREATE USER 'your_mysql_user'@'localhost' IDENTIFIED BY 'your_mysql_password';
    GRANT ALL PRIVILEGES ON voice_translator_db.* TO 'your_mysql_user'@'localhost';
    FLUSH PRIVILEGES;
    EXIT;
    ```

## Django Backend Setup

1.  **Configure `settings.py`**
    -   Open `backend/voice_translator_project/settings.py`.
    -   Update the `DATABASES` section with your MySQL credentials.
    -   Set your `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`.

2.  **Run Database Migrations**
    ```bash
    python backend/manage.py makemigrations translator_app
    python backend/manage.py migrate
    ```

3.  **Create a Superuser**
    ```bash
    python backend/manage.py createsuperuser
    ```

4.  **Run the Development Server**
    ```bash
    python backend/manage.py runserver
    ```

## Accessing the Application

-   Open your web browser and go to `http://127.0.0.1:8000/`.
-   You should see the AuraTranslate landing page.

## Troubleshooting

-   **Database Connection Errors**: Double-check your MySQL credentials in `settings.py`.
-   **Port Conflicts**: If port 8000 is in use, run the server on a different port: `python manage.py runserver 8080`.
