from rest_framework import generics, filters, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncMonth
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Claim
from claims.serializers import ClaimSerializer, ClaimListSerializer
from authentication.permissions import IsDataEntryOrManager, IsManager
import calendar
import os

class ClaimListCreateView(generics.ListCreateAPIView):
    queryset = Claim.objects.all()
    permission_classes = [IsDataEntryOrManager]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tpa_name', 'parent_insurance', 'month', 'physical_file_dispatch']
    search_fields = ['claim_id', 'patient_name', 'uhid_ip_no']
    ordering_fields = ['date_of_discharge', 'settlement_date', 'bill_amount', 'approved_amount']
    ordering = ['-created_at']
    def get_serializer_class(self):
        # if self.request.method == 'GET':
        #     return ClaimListSerializer
        return ClaimSerializer

class ClaimRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [IsDataEntryOrManager]
    
    def update(self, request, *args, **kwargs):
        """Override update to handle partial updates properly"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)
    
    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests for partial updates"""
        return self.update(request, *args, **kwargs)

@api_view(['PATCH'])
@permission_classes([IsDataEntryOrManager])
def update_file_status(request, claim_id, file_field):
    """Update file upload status for a claim"""
    try:
        claim = get_object_or_404(Claim, id=claim_id)
        
        # Valid file status fields
        valid_fields = ['approval_letter_uploaded', 'physical_file_uploaded', 'query_on_claim_uploaded', 'query_reply_uploaded']
        
        if file_field not in valid_fields:
            return Response(
                {'error': 'Invalid file field'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the new status from request
        new_status = request.data.get('uploaded', False)
        if isinstance(new_status, str):
            new_status = new_status.lower() in ['true', '1', 'yes', 'on']
        
        # Update the file status
        setattr(claim, file_field, new_status)
        claim.save()
        
        return Response({
            'message': f'File status updated successfully',
            'field': file_field,
            'uploaded': new_status
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Error updating file status: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsManager])
def dashboard_summary(request):
    """Dashboard summary with key metrics"""
    try:
        claims = Claim.objects.all()
        
        # Basic statistics
        total_claims = claims.count()
        total_bill_amount = claims.aggregate(Sum('bill_amount'))['bill_amount__sum'] or 0
        total_approved_amount = claims.aggregate(Sum('approved_amount'))['approved_amount__sum'] or 0
        total_settled_amount = claims.aggregate(Sum('total_settled_amount'))['total_settled_amount__sum'] or 0
        total_tds = claims.aggregate(Sum('tds'))['tds__sum'] or 0
        total_consumable_deduction = claims.aggregate(Sum('consumable_deduction'))['consumable_deduction__sum'] or 0
        total_paid_by_patient = claims.aggregate(Sum('paid_by_patient'))['paid_by_patient__sum'] or 0
        
        # Claims with difference (potential issues)
        claims_with_difference = claims.exclude(difference_amount=0).count()
        
        # Settlement status
        settled_claims = claims.exclude(settlement_date__isnull=True).count()
        pending_claims = claims.filter(settlement_date__isnull=True).count()
        
        # Average processing time (for settled claims)
        settled_claims_qs = claims.exclude(settlement_date__isnull=True).exclude(date_of_discharge__isnull=True)
        avg_processing_days = 0
        if settled_claims_qs.exists():
            processing_times = []
            for claim in settled_claims_qs:
                try:
                    days = (claim.settlement_date - claim.date_of_discharge).days
                    if days >= 0:  # Only include valid processing times
                        processing_times.append(days)
                except (TypeError, AttributeError):
                    # Skip claims with invalid dates
                    continue
            avg_processing_days = sum(processing_times) / len(processing_times) if processing_times else 0
        
        summary_data = {
            'totalBillAmount': float(total_bill_amount),
            'totalApprovedAmount': float(total_approved_amount),
            'totalTds': float(total_tds),
            'totalRejections': pending_claims,  # Using pending claims as rejections for now
            'totalConsumables': float(total_consumable_deduction),
            'totalPaidByPatients': float(total_paid_by_patient),
        }
        
        return Response(summary_data)
    
    except Exception as e:
        return Response(
            {'error': f'Error generating summary: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsManager])
def dashboard_monthwise(request):
    """Monthly statistics for charts"""
    try:
        # Group claims by month, excluding null months
        monthly_data = (
            Claim.objects
            .exclude(month__isnull=True)  # Exclude claims with null month
            .values('month')
            .annotate(
                claim_count=Count('id'),
                total_bill=Sum('bill_amount'),
                total_approved=Sum('approved_amount'),
                total_settled=Sum('total_settled_amount'),
                total_tds=Sum('tds'),
            )
            .order_by('month')
        )
        
        # Format data for frontend charts
        chart_data = []
        for item in monthly_data:
            try:
                # Convert month string to readable format
                if item['month'] and '-' in item['month']:
                    year, month_num = item['month'].split('-')
                    month_name = calendar.month_name[int(month_num)]
                    
                    chart_data.append({
                        'month': f"{month_name} {year}",
                        'month_code': item['month'],
                        'claim_count': item['claim_count'],
                        'total_bill': float(item['total_bill'] or 0),
                        'total_approved': float(item['total_approved'] or 0),
                        'total_settled': float(item['total_settled'] or 0),
                        'total_tds': float(item['total_tds'] or 0),
                    })
            except (ValueError, TypeError, AttributeError) as e:
                # Skip invalid month data
                continue
        
        # Format for frontend ChartData[] format
        formatted_data = []
        for item in chart_data:
            formatted_data.append({
                'name': item['month'],
                'value': item['total_approved'],
                'month': item['month_code']
            })
        
        return Response(formatted_data)
    
    except Exception as e:
        return Response(
            {'error': f'Error generating monthly data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsManager])
def dashboard_companywise(request):
    """Company/TPA wise statistics for pie charts"""
    try:
        # TPA wise data
        tpa_data = (
            Claim.objects
            .exclude(tpa_name__isnull=True)
            .exclude(tpa_name='')
            .values('tpa_name')
            .annotate(
                claim_count=Count('id'),
                total_approved=Sum('approved_amount'),
                total_settled=Sum('total_settled_amount'),
            )
            .order_by('-total_approved')[:10]  # Top 10 TPAs
        )
        
        # Insurance wise data
        insurance_data = (
            Claim.objects
            .exclude(parent_insurance__isnull=True)
            .exclude(parent_insurance='')
            .values('parent_insurance')
            .annotate(
                claim_count=Count('id'),
                total_approved=Sum('approved_amount'),
                total_settled=Sum('total_settled_amount'),
            )
            .order_by('-total_approved')[:10]  # Top 10 Insurance companies
        )
        
        # Format for pie charts
        tpa_chart = []
        for item in tpa_data:
            tpa_chart.append({
                'name': item['tpa_name'] or 'Unknown TPA',
                'value': float(item['total_approved'] or 0),
                'claim_count': item['claim_count'],
                'total_settled': float(item['total_settled'] or 0),
            })
        
        insurance_chart = []
        for item in insurance_data:
            insurance_chart.append({
                'name': item['parent_insurance'] or 'Unknown Insurance',
                'value': float(item['total_approved'] or 0),
                'claim_count': item['claim_count'],
                'total_settled': float(item['total_settled'] or 0),
            })
        
        # Return insurance data as ChartData[] format for frontend
        return Response(insurance_chart)
    
    except Exception as e:
        return Response(
            {'error': f'Error generating company data: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )