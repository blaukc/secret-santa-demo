from django.db import models
from django.contrib.auth.models import User
import uuid
import json

# Create your models here.

class Event(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, null=False, blank=False)
    host = models.TextField(null=False, blank=False)
    participant_details_list = models.TextField(null=False, blank=False)
    giving_list = models.TextField(null=True, blank=True)
    num_participants = models.IntegerField(null=False, blank=False)
    names_drawn = models.BooleanField(default=False)
    emails_sent = models.BooleanField(default=False)
    date = models.DateField(null=True, blank=True)
    budget = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    location = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
