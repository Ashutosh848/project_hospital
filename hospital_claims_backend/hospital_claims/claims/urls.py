from django.urls import path
from .views import (
    dashboard_companywise,
    dashboard_monthwise,
    dashboard_summary,
    ClaimListCreateView,
    ClaimRetrieveUpdateDestroyView,
    delete_claim_file,
)

urlpatterns = [
    # Claims CRUD
    path('', ClaimListCreateView.as_view(), name='claim-list-create'),
    path('<int:pk>/', ClaimRetrieveUpdateDestroyView.as_view(), name='claim-detail'),
    
    # File management
    path('<int:claim_id>/delete-file/<str:file_field>/', delete_claim_file, name='delete-claim-file'),
    
    # Dashboard endpoints
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'),
    path('dashboard/monthwise/', dashboard_monthwise, name='dashboard-monthwise'),
    path('dashboard/companywise/', dashboard_companywise, name='dashboard-companywise'),
]
