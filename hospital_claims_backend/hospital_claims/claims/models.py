import os
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal

def claim_file_upload_path(instance, filename):
    """Generate upload path for claim files"""
    return f'uploads/claims/{instance.claim_id}/{filename}'

class Claim(models.Model):
    PHYSICAL_FILE_DISPATCH_CHOICES = [
        ('pending', 'Pending'),
        ('dispatched', 'Dispatched'),
        ('received', 'Received'),
        ('not_required', 'Not Required'),
    ]
    
    # Auto-generated fields
    id = models.AutoField(primary_key=True)
    month = models.CharField(max_length=7, editable=False)  # YYYY-MM format, auto from discharge date
    
    # Date fields
    date_of_admission = models.DateField()
    date_of_discharge = models.DateField()
    query_reply_date = models.DateField(null=True, blank=True)
    settlement_date = models.DateField(null=True, blank=True)
    
    # Basic claim info
    tpa_name = models.CharField(max_length=200)
    parent_insurance = models.CharField(max_length=200)
    claim_id = models.CharField(max_length=100, unique=True)
    uhid_ip_no = models.CharField(max_length=100)
    patient_name = models.CharField(max_length=200)
    
    # Financial fields
    bill_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    approved_amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(Decimal('0'))])
    mou_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    co_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    consumable_deduction = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    hospital_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    paid_by_patient = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    hospital_discount_authority = models.CharField(max_length=200, blank=True)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    tds = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    amount_settled_in_ac = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    total_settled_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(Decimal('0'))])
    difference_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, editable=False)  # calculated field
    reason_less_settlement = models.TextField(blank=True)
    
    # File fields
    approval_letter = models.FileField(upload_to=claim_file_upload_path, null=True, blank=True)
    physical_file_dispatch = models.CharField(max_length=20, choices=PHYSICAL_FILE_DISPATCH_CHOICES, default='pending')
    physical_file_upload = models.FileField(upload_to=claim_file_upload_path, null=True, blank=True)
    query_on_claim = models.FileField(upload_to=claim_file_upload_path, null=True, blank=True)
    
    # Boolean fields
    claim_settled_software = models.BooleanField(default=False)
    receipt_verified_bank = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['claim_id']),
            models.Index(fields=['patient_name']),
            models.Index(fields=['month']),
            models.Index(fields=['tpa_name']),
            models.Index(fields=['settlement_date']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-generate month from discharge date
        if self.date_of_discharge:
            self.month = self.date_of_discharge.strftime('%Y-%m')
        
        # Calculate difference amount
        self.difference_amount = self.approved_amount - self.total_settled_amount
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.claim_id} - {self.patient_name}"