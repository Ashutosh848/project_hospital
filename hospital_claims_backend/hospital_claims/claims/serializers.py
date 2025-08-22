from rest_framework import serializers
from .models import Claim

class ClaimSerializer(serializers.ModelSerializer):
    difference_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    month = serializers.CharField(read_only=True)
    
    # Make file fields optional and handle empty files
    approval_letter = serializers.FileField(required=False, allow_null=True, allow_empty_file=False)
    physical_file_upload = serializers.FileField(required=False, allow_null=True, allow_empty_file=False)
    query_on_claim = serializers.FileField(required=False, allow_null=True, allow_empty_file=False)
    
    class Meta:
        model = Claim
        fields = '__all__'
        
    def validate(self, data):
        # Validate date range
        if data.get('date_of_admission') and data.get('date_of_discharge'):
            if data['date_of_admission'] > data['date_of_discharge']:
                raise serializers.ValidationError(
                    "Date of admission cannot be after date of discharge."
                )
        
        # Validate settlement date
        if data.get('settlement_date') and data.get('date_of_discharge'):
            if data['settlement_date'] < data['date_of_discharge']:
                raise serializers.ValidationError(
                    "Settlement date cannot be before discharge date."
                )
        
        # Handle empty files - remove them from data if they're empty
        file_fields = ['approval_letter', 'physical_file_upload', 'query_on_claim']
        for field in file_fields:
            if field in data and data[field] is not None:
                # Check if file is empty (no name or size 0)
                if hasattr(data[field], 'name') and (not data[field].name or data[field].size == 0):
                    data.pop(field, None)
        
        return data

class ClaimListSerializer(serializers.ModelSerializer):
    """Serializer for claim list view with essential fields only"""
    
    class Meta:
        model = Claim
        fields = [
            'id', 'claim_id', 'patient_name', 'tpa_name', 'parent_insurance',
            'date_of_admission', 'date_of_discharge', 'bill_amount', 
            'approved_amount', 'total_settled_amount', 'difference_amount',
            'settlement_date', 'month', 'created_at'
        ]