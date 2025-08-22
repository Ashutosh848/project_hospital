from django.urls import path
from .views import (
    dashboard_companywise,
    dashboard_monthwise,
    dashboard_summary,
    ClaimListCreateView,
    ClaimRetrieveUpdateDestroyView,
)

urlpatterns = [
    # Claims CRUD
    path('', ClaimListCreateView.as_view(), name='claim-list-create'),
    path('<int:pk>/', ClaimRetrieveUpdateDestroyView.as_view(), name='claim-detail'),
    
    # Dashboard endpoints
    path('dashboard/summary/', dashboard_summary, name='dashboard-summary'),
    path('dashboard/monthwise/', dashboard_monthwise, name='dashboard-monthwise'),
    path('dashboard/companywise/', dashboard_companywise, name='dashboard-companywise'),
]
