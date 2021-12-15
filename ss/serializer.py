from django.contrib.auth.models import User
from .models import Event
from rest_framework import serializers
import json

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'first_name', 'username', 'email', 'is_staff']

class UserRegisterSerializer(UserSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'username', 'email', 'is_staff', 'password']

class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = '__all__'

class GetEventsSerializer(EventSerializer):
    participant_details = serializers.SerializerMethodField(read_only=True)
    participant_names = serializers.SerializerMethodField(read_only=True)
    participant_emails = serializers.SerializerMethodField(read_only=True)
    giving_list = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'host', 'participant_details_list', 'giving_list', 'num_participants', 'names_drawn', 'date', 'budget', 'location', 'created_at',
         'participant_names', 'participant_emails', 'participant_details', 'giving_list', 'emails_sent']

    def get_participant_details(self, obj):
        return json.loads(obj.participant_details_list)

    def get_participant_names(self, obj):
        return [item[0] for item in json.loads(obj.participant_details_list)]

    def get_participant_emails(self, obj):
        return [item[1] for item in json.loads(obj.participant_details_list)]

    def get_giving_list(self,obj):
        if (obj.giving_list):
            return json.loads(obj.giving_list)
        else:
            return []


class DrawNamesEventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = ['giving_list', 'names_drawn', 'emails_sent']
