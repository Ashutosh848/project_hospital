from rest_framework import serializers
from .models import Claim

class ClaimSerializer(serializers.ModelSerializer):
    difference_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    month = serializers.CharField(read_only=True)
    
    # Make all fields optional with proper null/blank handling
    date_of_admission = serializers.DateField(required=False, allow_null=True)
    date_of_discharge = serializers.DateField(required=False, allow_null=True)
    query_reply_date = serializers.DateField(required=False, allow_null=True)
    settlement_date = serializers.DateField(required=False, allow_null=True)
    tpa_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    parent_insurance = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    claim_id = serializers.CharField(required=True, allow_blank=False, allow_null=False)
    uhid_ip_no = serializers.CharField(required=True, allow_blank=False, allow_null=False)
    patient_name = serializers.CharField(required=True, allow_blank=False, allow_null=False)
    utr_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bill_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    approved_amount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    mou_discount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    co_pay = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    consumable_deduction = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    hospital_discount = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    paid_by_patient = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    hospital_discount_authority = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    other_deductions = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    tds = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, allow_null=True)
    amount_settled_in_ac = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
    total_settled_amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
    reason_less_settlement = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    claim_settled_software = serializers.BooleanField(required=False, default=False)
    receipt_verified_bank = serializers.BooleanField(required=False, default=False)
    physical_file_dispatch = serializers.ChoiceField(choices=Claim.PHYSICAL_FILE_DISPATCH_CHOICES, required=False, default='pending')
    
    # File upload status fields (boolean checkboxes)
    approval_letter_uploaded = serializers.BooleanField(required=False, default=False)
    physical_file_uploaded = serializers.BooleanField(required=False, default=False)
    query_on_claim_uploaded = serializers.BooleanField(required=False, default=False)
    query_reply_uploaded = serializers.BooleanField(required=False, default=False)
    
    class Meta:
        model = Claim
        fields = '__all__'
        
    def validate(self, data):
        # Validate date range - only if both dates are provided
        if data.get('date_of_admission') and data.get('date_of_discharge'):
            if data['date_of_admission'] > data['date_of_discharge']:
                raise serializers.ValidationError(
                    "Date of admission cannot be after date of discharge."
                )
        
        # Validate settlement date - only if both dates are provided
        if data.get('settlement_date') and data.get('date_of_discharge'):
            if data['settlement_date'] < data['date_of_discharge']:
                raise serializers.ValidationError(
                    "Settlement date cannot be before discharge date."
                )
        
        # Handle file upload status fields (boolean checkboxes)
        file_status_fields = ['approval_letter_uploaded', 'physical_file_uploaded', 'query_on_claim_uploaded', 'query_reply_uploaded']
        for field in file_status_fields:
            if field in data:
                # Ensure boolean values
                if isinstance(data[field], str):
                    data[field] = data[field].lower() in ['true', '1', 'yes', 'on']
                elif data[field] is None:
                    data[field] = False
        
        # Handle empty string values - convert them to None for nullable fields
        nullable_fields = [
            'date_of_admission', 'date_of_discharge', 'query_reply_date', 'settlement_date', 
            'claim_id', 'bill_amount', 'approved_amount', 'mou_discount', 'co_pay', 
            'consumable_deduction', 'hospital_discount', 'paid_by_patient', 
            'hospital_discount_authority', 'other_deductions', 'tds', 
            'amount_settled_in_ac', 'total_settled_amount', 'reason_less_settlement',
            'tpa_name', 'parent_insurance', 'uhid_ip_no', 'patient_name', 'utr_number'
        ]
        for field in nullable_fields:
            if field in data and (data[field] == '' or data[field] == 'null' or data[field] == 'undefined'):
                data[field] = None
        
        # Handle numeric fields - convert empty strings to None
        numeric_fields = [
            'bill_amount', 'approved_amount', 'mou_discount', 'co_pay', 
            'consumable_deduction', 'hospital_discount', 'paid_by_patient', 
            'other_deductions', 'tds', 'amount_settled_in_ac', 'total_settled_amount'
        ]
        for field in numeric_fields:
            if field in data and (data[field] == '' or data[field] == 'null' or data[field] == 'undefined'):
                data[field] = None
        
        return data

class ClaimListSerializer(serializers.ModelSerializer):
    """Serializer for claim list view with essential fields only"""
    
    class Meta:
        model = Claim
        fields = [
            'id', 'claim_id', 'patient_name', 'tpa_name', 'parent_insurance',
            'date_of_admission', 'date_of_discharge', 'bill_amount', 
            'approved_amount', 'total_settled_amount', 'difference_amount',
            'settlement_date', 'month', 'created_at', 'utr_number'
        ]