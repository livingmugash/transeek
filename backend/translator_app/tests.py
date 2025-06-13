from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthAPITests(TestCase):
    """
    Tests for the authentication API endpoints.
    """

    def setUp(self):
        """Set up a test user for login tests."""
        self.test_user = User.objects.create_user(
            username='testuser', 
            email='test@example.com', 
            password='strong-password123'
        )
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')

    def test_successful_signup(self):
        """
        Ensure a new user can be created successfully.
        """
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'strong-password123'
        }
        response = self.client.post(self.signup_url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='new@example.com').exists())

    def test_signup_with_existing_email(self):
        """
        Ensure signup fails if the email already exists.
        """
        data = {
            'username': 'anotheruser',
            'email': 'test@example.com', # Existing email
            'password': 'strong-password123'
        }
        response = self.client.post(self.signup_url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_successful_login(self):
        """
        Ensure an existing user can log in successfully.
        """
        data = {
            'email': 'test@example.com',
            'password': 'strong-password123'
        }
        response = self.client.post(self.login_url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_with_wrong_password(self):
        """
        Ensure login fails with an incorrect password.
        """
        data = {
            'email': 'test@example.com',
            'password': 'wrong-password'
        }
        response = self.client.post(self.login_url, data, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

