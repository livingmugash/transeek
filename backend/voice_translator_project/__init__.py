# File Location: backend/voice_translator_project/__init__.py
# This file is intentionally left empty.
# It tells Python that 'voice_translator_project' is a Python package.

# ---

# File Location: backend/voice_translator_project/asgi.py
"""
ASGI config for voice_translator_project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voice_translator_project.settings')
application = get_asgi_application()

# ---

# File Location: backend/voice_translator_project/wsgi.py
"""
WSGI config for voice_translator_project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'voice_translator_project.settings')
application = get_wsgi_application()

# ---

# File Location: backend/translator_app/__init__.py
# This file is intentionally left empty.
# It tells Python that 'translator_app' is a Python package.

# ---

# File Location: backend/translator_app/apps.py
from django.apps import AppConfig

class TranslatorAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'translator_app'

# ---

# File Location: backend/translator_app/tests.py
from django.test import TestCase

# Create your tests here.
# For a production application, you would add tests to ensure
# all API endpoints and models work as expected.

class UserModelTests(TestCase):
    def test_user_creation(self):
        """
        A basic test to ensure a user can be created.
        """
        from .models import CustomUser
        user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpassword123'))
        self.assertEqual(user.trial_count, 3)

# ---

# File Location: .gitignore
# This file tells Git which files and directories to ignore.
# It's crucial for keeping your repository clean and secure.

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtualenv
.env
venv/
env/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Static files
/static/

# Media files
/media/

# IDE / Editor specific
.vscode/
.idea/
*.swp
*.swo


