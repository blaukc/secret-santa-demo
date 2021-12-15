from ss.models import Event
from ss.serializer import EventSerializer, GetEventsSerializer, DrawNamesEventSerializer
from django.contrib.auth.models import  User
from django.core import exceptions
from django.core.mail import send_mass_mail

from rest_framework.views import APIView
# from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, permissions, authentication

import json
import random

# from django.contrib.auth.hashers import make_password


class EventsList(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_objectByEmail(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:              #email not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get(self, request, format=None):
        events = Event.objects.filter(host=request.user).order_by('date')
        # filter events based on ones you are in
        serializer = GetEventsSerializer(events, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # request.data: host id, details list, num participants, date, budget, location
        user = self.get_objectByEmail(request.user)
        host = self.get_objectByEmail(request.data["host"])
        print('posting!')
        try:
            if host != user:
                return Response('Invalid host being used', status=status.HTTP_401_UNAUTHORIZED)

            event_data = request.data
            if event_data["date"] == '':
                event_data["date"] = None
            event_data["participant_details_list"] = json.dumps(event_data["participant_details_list"])
            print(event_data)

            serializer = EventSerializer(data=event_data)
            print(serializer.is_valid())
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return user

class EventDetails(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_eventByID(self, slug):
        try:
            return Event.objects.get(id=slug)
        except User.DoesNotExist:              #id not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get_userByEmail(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:              #email not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def check_requester(self, event, requester):
        if event.host == requester.email or requester.is_staff:
            return True
        else:                                   #unauthorised user access
            return False

    def get(self, request, slug, format=None):
        event = self.get_eventByID(slug)
        requester = self.get_userByEmail(request.user)
        try:
            if self.check_requester(event, requester):
                serializer = GetEventsSerializer(event)
                return Response(serializer.data)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return event

    def put(self, request, slug, format=None):
        event = self.get_eventByID(slug)
        requester = self.get_userByEmail(request.user)
        try:
            if self.check_requester(event, requester):

                event_data = request.data
                if event_data["date"] == '':
                    event_data["date"] = None
                event_data["participant_details_list"] = json.dumps(event_data["participant_details_list"])
                print(event_data)

                serializer = EventSerializer(event, data=event_data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)

        except:
            return event

    def delete(self, request, slug, format=None):
        event = self.get_eventByID(slug)
        requester = self.get_userByEmail(request.user)
        try:
            if self.check_requester(event, requester):
                event.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return event

class EventDrawNames(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get_eventByID(self, slug):
        try:
            return Event.objects.get(id=slug)
        except User.DoesNotExist:              #id not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def get_userByEmail(self, email):
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:              #email not found
            return Response(status=status.HTTP_404_NOT_FOUND)

    def check_requester(self, event, requester):
        if event.host == requester.email or requester.is_staff:
            return True
        else:                                   #unauthorised user access
            return False

    def draw_names(self, participant_details_list):
        #create giver and receiver list that are randomised of the pparticipant details
        giver = json.loads(participant_details_list)
        random.shuffle(giver)
        receiver = giver.copy()
        #shift places of receivers up by 1
        receiver = [receiver[-1]] + receiver[:-1]
        #combine both lists to get giving list
        giving_list = []
        for i in range(len(giver)):
            giving_list.append([giver[i], receiver[i]])

        return giving_list

    def get_email_tuple(self, giving_list, email_data):
        email_list = ()
        for i in range(len(giving_list)):
            giver = giving_list[i][0][0]
            giver_email = giving_list[i][0][1]
            receiver = giving_list[i][1][0]
            receiver_email = giving_list[i][1][1]

            #replace $giver and $receiver with names
            subject = email_data["subject"].replace("$giver", giver).replace("$receiver", receiver)
            body = email_data["body"].replace("$giver", giver).replace("$receiver", receiver)

            #create tuple
            email_list = email_list + ((subject, body, "blaukc.secret.santa@gmail.com", [giver_email]), )
        print(email_list)
        return email_list

    def get(self, request, slug, format=None):
        event = self.get_eventByID(slug)
        requester = self.get_userByEmail(request.user)
        try:
            if self.check_requester(event, requester):
                #draw names function
                giving_list = self.draw_names(event.participant_details_list)

                #set database giving_list
                draw_names_data = {
                    "giving_list": json.dumps(giving_list),
                    "names_drawn": True
                }
                serializer = DrawNamesEventSerializer(event, data=draw_names_data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:                               #unauthorised user access
                return Response(status=status.HTTP_401_UNAUTHORIZED)
        except:
            return event

    def post(self, request, slug, format=None):
        event = self.get_eventByID(slug)
        requester = self.get_userByEmail(request.user)
        email_data = request.data
        try:
            valid_requester = self.check_requester(event, requester)
        except:
            return event

        if not event.names_drawn:
            return Response('Names not drawn yet', status=status.HTTP_400_BAD_REQUEST)

        if valid_requester:
            #get email bodies
            giving_list = json.loads(event.giving_list)
            email_list = self.get_email_tuple(giving_list, email_data)

            #send emails
            try:
                print('sending mails')
                send_mass_mail(email_list, fail_silently=False)
            except Exception as e:
                print(e)
                return Response('Failed to send emails', status=status.HTTP_400_BAD_REQUEST)

            draw_names_data = {
                "giving_list": json.dumps(giving_list),
                "names_drawn": True,
                "emails_sent": True
            }
            serializer = DrawNamesEventSerializer(event, data=draw_names_data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:                               #unauthorised user access
            return Response(status=status.HTTP_401_UNAUTHORIZED)
