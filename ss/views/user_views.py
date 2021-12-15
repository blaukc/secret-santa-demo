from ss.serializer import UserSerializer, UserRegisterSerializer
from django.contrib.auth.models import  User
from django.core import exceptions

from rest_framework.views import APIView
# from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, permissions, authentication

from django.contrib.auth.hashers import make_password


class UsersList(APIView):

    permission_classes = [permissions.IsAdminUser]

    def get(self, request, format=None):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class AddUser(APIView):

    def is_email_exist(self, email):
        try:
            check = User.objects.get(email=email)
            return True
        except User.DoesNotExist:              #email not found
            return False

    def post(self, request, format=None):
        # request.data: first_name, email, password
        if self.is_email_exist(request.data["email"]):
            return Response('Email is already being used.', status=status.HTTP_409_CONFLICT)

        if request.data["email"]:
            user_data = request.data
            user_data["username"] = request.data["email"]

        user_data["password"] = make_password(user_data["password"])
        print(user_data)

        serializer = UserRegisterSerializer(data=user_data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UserDetails(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_objectByID(self, id):
        try:
            return User.objects.get(id=id)
        except User.DoesNotExist:              #id not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get_objectByEmail(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:              #email not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def check_requester(self, user, requester):
        if user.email == requester.email or requester.is_staff:
            return True
        else:                                   #unauthorised user access
            return False


    def get(self, request, id, format=None):
        user = self.get_objectByID(id)
        requester = self.get_objectByEmail(request.user)
        try:
            if self.check_requester(user, requester):
                serializer = UserSerializer(user)
                return Response(serializer.data)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return user


    def put(self, request, id, format=None):
        user = self.get_objectByID(id)
        requester = self.get_objectByEmail(request.user)
        try:
            user_data = request.data

            if request.data["email"]:           #set username same as email
                user_data["username"] = request.data["email"]


            if self.check_requester(user, requester):
                serializer = UserSerializer(user, data=user_data)

                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)

                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return user


    def delete(self, request, id, format=None):
        user = self.get_objectByID(id)
        requester = self.get_objectByEmail(request.user)
        try:
            if self.check_requester(user, requester):
                user.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return user

class UserDetailsByEmail(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_objectByEmail(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:              #email not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def check_requester(self, user, requester):
        if user.email == requester.email or requester.is_staff:
            return True
        else:                               #unauthorised user access
            return False

    def get(self, request, email, format=None):
        user = self.get_objectByEmail(email)
        requester = self.get_objectByEmail(request.user)

        try:
            if self.check_requester(user, requester):
                serializer = UserSerializer(user)
                return Response(serializer.data)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return user
