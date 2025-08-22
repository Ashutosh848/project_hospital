import django_filters
from .models import Claim

class ClaimFilter(django_filters.FilterSet):
    date_of_discharge_from = django_filters.DateFilter(field_name='date_of_discharge', lookup_expr='gte')
    date_of_discharge_to = django_filters.DateFilter(field_name='date_of_discharge', lookup_expr='lte')
    settlement_date_from = django_filters.DateFilter(field_name='settlement_date', lookup_expr='gte')
    settlement_date_to = django_filters.DateFilter(field_name='settlement_date', lookup_expr='lte')
    bill_amount_min = django_filters.NumberFilter(field_name='bill_amount', lookup_expr='gte')
    bill_amount_max = django_filters.NumberFilter(field_name='bill_amount', lookup_expr='lte')
    approved_amount_min = django_filters.NumberFilter(field_name='approved_amount', lookup_expr='gte')
    approved_amount_max = django_filters.NumberFilter(field_name='approved_amount', lookup_expr='lte')
    has_settlement_date = django_filters.BooleanFilter(field_name='settlement_date', lookup_expr='isnull', exclude=True)
    
    class Meta:
        model = Claim
        fields = {
            'tpa_name': ['exact', 'icontains'],
            'parent_insurance': ['exact', 'icontains'],
            'claim_id': ['exact', 'icontains'],
            'patient_name': ['icontains'],
            'month': ['exact'],
            'physical_file_dispatch': ['exact'],
            'claim_settled_software': ['exact'],
            'receipt_verified_bank': ['exact'],
        }