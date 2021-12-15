from django.urls import path, include
from .views.event_views import EventsList, EventDetails, EventDrawNames
from .views.user_views import UsersList, AddUser, UserDetails, UserDetailsByEmail
from .views.token_views import IsAuthenticated
# from rest_framework import routers

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('events/', EventsList.as_view(), name="events"),
    path('events/<slug:slug>/', EventDetails.as_view(), name="event"),
    path('draw-names/<slug:slug>/', EventDrawNames.as_view(), name="eventDrawNames"),

    path('users/', AddUser.as_view(), name="users"),
    # path('users/<str:id>/', UserDetails.as_view(), name="user"),
    path('usersByEmail/<str:email>/', UserDetailsByEmail.as_view(), name="userByEmail"),
    path('usersAll/', UsersList.as_view(), name="usersAll"),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', IsAuthenticated.as_view(), name='is_auth')
]
