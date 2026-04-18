from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Bác sĩ'),
        ('PATIENT', 'Bệnh nhân'),
        ('STAFF', 'Nhân viên'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PATIENT')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)