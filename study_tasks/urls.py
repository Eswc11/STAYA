from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, UserRegistrationView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'register', UserRegistrationView, basename='register')

urlpatterns = [
    path('', include(router.urls)),
] 