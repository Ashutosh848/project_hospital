from django.contrib import admin
from .models import Claim

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = [
        'claim_id', 'patient_name', 'tpa_name', 'date_of_discharge', 
        'bill_amount', 'approved_amount', 'total_settled_amount', 'settlement_date'
    ]
    list_filter = ['tpa_name', 'parent_insurance', 'month', 'physical_file_dispatch', 'settlement_date']
    search_fields = ['claim_id', 'patient_name', 'uhid_ip_no']
    readonly_fields = ['month', 'difference_amount', 'created_at', 'updated_at']
    date_hierarchy = 'date_of_discharge'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('claim_id', 'uhid_ip_no', 'patient_name', 'month')
        }),
        ('Dates', {
            'fields': ('date_of_admission', 'date_of_discharge', 'query_reply_date', 'settlement_date')
        }),
        ('Insurance Details', {
            'fields': ('tpa_name', 'parent_insurance')
        }),
        ('Financial Information', {
            'fields': (
                'bill_amount', 'approved_amount', 'mou_discount', 'co_pay',
                'consumable_deduction', 'hospital_discount', 'hospital_discount_authority',
                'paid_by_patient', 'other_deductions', 'tds', 'amount_settled_in_ac',
                'total_settled_amount', 'difference_amount', 'reason_less_settlement'
            )
        }),
        ('File Management', {
            'fields': (
                'approval_letter', 'physical_file_dispatch', 'physical_file_upload', 
                'query_on_claim'
            )
        }),
        ('Status', {
            'fields': ('claim_settled_software', 'receipt_verified_bank')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
