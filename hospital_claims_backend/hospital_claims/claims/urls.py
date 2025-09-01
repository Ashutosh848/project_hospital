from django.urls import path
from .views import (
    dashboard_companywise,
    dashboard_monthwise,
    dashboard_summary,
    ClaimListCreateView,
    ClaimRetrieveUpdateDestroyView,
    update_file_status,
)

urlpatterns = [
    # Claims CRUD
    path('', ClaimListCreateView.as_view(), name='claim-list-create'),
    path('<int:pk>/', ClaimRetrieveUpdateDestroyView.as_view(), name='claim-detail'),
    
    # File status management
    path('<int:claim_id>/update-file-status/<str:file_field>/', update_file_status, name='update-file-status'),
    
    # Dashboard endpoints
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'),
    path('dashboard/monthwise/', dashboard_monthwise, name='dashboard-monthwise'),
    path('dashboard/companywise/', dashboard_companywise, name='dashboard-companywise'),
]
