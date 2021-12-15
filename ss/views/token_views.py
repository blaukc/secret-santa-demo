from ss.serializer import UserSerializer, UserRegisterSerializer
from django.contrib.auth.models import  User
from django.core import exceptions

from rest_framework.views import APIView
# from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, permissions



class IsAuthenticated(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, format=None):
        return Response(True)
