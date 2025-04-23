from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Task
from .serializers import TaskSerializer, UserSerializer

# Create your views here.

class UserRegistrationView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the new user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_201_CREATED)

class UserProfileView(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        completed_tasks = tasks.filter(completed=True)
        
        return Response({
            'username': user.username,
            'email': user.email,
            'created_at': user.date_joined,
            'task_count': tasks.count(),
            'completed_tasks': completed_tasks.count(),
            'completion_rate': (completed_tasks.count() / tasks.count() * 100) if tasks.count() > 0 else 0
        })

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        return Response(self.get_serializer(task).data)
