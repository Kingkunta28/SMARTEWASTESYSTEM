import json
from datetime import date, timedelta

from django.contrib.auth.models import User
from django.test import Client, TestCase

from .models import UserProfile


class AuthAndRequestTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_login_and_create_request(self):
        response = self.client.post(
            "/api/auth/register/",
            data=json.dumps(
                {
                    "first_name": "Student",
                    "last_name": "One",
                    "email": "student1@example.com",
                    "password": "StrongPass123!",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(UserProfile.objects.get(user__email="student1@example.com").role, UserProfile.ROLE_USER)

        response = self.client.post(
            "/api/auth/login/",
            data=json.dumps({"email": "student1@example.com", "password": "StrongPass123!"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)

        pickup_date = (date.today() + timedelta(days=1)).isoformat()
        response = self.client.post(
            "/api/requests/",
            data=json.dumps(
                {
                    "item_type": "Laptop",
                    "quantity": 1,
                    "pickup_address": "Stone Town",
                    "pickup_date": pickup_date,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["status"], "pending")

    def test_admin_can_list_collectors(self):
        admin_user = User.objects.create_user(username="admin1", password="StrongPass123!")
        admin_profile = UserProfile.objects.get(user=admin_user)
        admin_profile.role = UserProfile.ROLE_ADMIN
        admin_profile.save()

        collector_user = User.objects.create_user(username="collector1", password="StrongPass123!")
        collector_profile = UserProfile.objects.get(user=collector_user)
        collector_profile.role = UserProfile.ROLE_COLLECTOR
        collector_profile.save()

        self.client.post(
            "/api/auth/login/",
            data=json.dumps({"username": "admin1", "password": "StrongPass123!"}),
            content_type="application/json",
        )
        response = self.client.get("/api/collectors/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
