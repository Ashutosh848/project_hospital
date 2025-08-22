from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import login_view, UserListCreateView, UserRetrieveUpdateDestroyView, get_current_user

urlpatterns = [
    path('login/', login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', get_current_user, name='current-user'),
    path('users/', UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user-detail'),
]
