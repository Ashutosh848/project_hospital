from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from claims.models import Claim
import random
from datetime import datetime, timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create test claims data spread across different months'

    def add_arguments(self, parser):
        parser.add_argument(
            '--months',
            type=int,
            default=6,
            help='Number of months to create data for (default: 6)'
        )

    def handle(self, *args, **options):
        months = options['months']
        
        # Sample data
        tpa_names = [
            'Star Health Insurance', 'HDFC ERGO Health Insurance', 'ICICI Lombard Health Insurance',
            'Max Bupa Health Insurance', 'Apollo Munich Health Insurance', 'Bajaj Allianz Health Insurance',
            'Future Generali Health Insurance', 'Reliance General Insurance', 'United India Insurance'
        ]

        parent_insurances = [
            'LIC of India', 'HDFC Life Insurance', 'ICICI Prudential Life Insurance',
            'SBI Life Insurance', 'Max Life Insurance', 'Bajaj Allianz Life Insurance',
            'Tata AIA Life Insurance', 'Kotak Mahindra Life Insurance'
        ]

        patient_names = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Patel', 'Vikash Gupta',
            'Meera Agarwal', 'Ravi Verma', 'Kavita Joshi', 'Suresh Yadav', 'Pooja Mishra'
        ]

        hospital_authorities = ['CMO Approval', 'Medical Director', 'Senior Consultant', 'Department Head']
        physical_file_statuses = ['pending', 'dispatched', 'received', 'not_required']

        self.stdout.write(f'Creating claims for the last {months} months...')

        total_created = 0
        existing_count = Claim.objects.count()

        for month_offset in range(months):
            # Calculate month
            target_date = timezone.now().date() - timedelta(days=30 * month_offset)
            month_str = target_date.strftime('%Y-%m')
            
            # Create 3-8 claims per month
            claims_for_month = random.randint(3, 8)
            
            self.stdout.write(f'Creating {claims_for_month} claims for {target_date.strftime("%B %Y")}...')

            for i in range(claims_for_month):
                # Generate dates within the month
                day_in_month = random.randint(1, 28)  # Safe day range
                admission_date = target_date.replace(day=day_in_month)
                discharge_date = admission_date + timedelta(days=random.randint(1, 12))
                
                # Sometimes add settlement date (85% of claims are settled)
                settlement_date = None
                if random.random() < 0.85:
                    settlement_date = discharge_date + timedelta(days=random.randint(1, 25))

                # Generate amounts
                bill_amount = Decimal(random.randint(75000, 450000))
                approved_amount = bill_amount * Decimal(random.uniform(0.75, 0.95))
                
                # Calculate deductions
                mou_discount = approved_amount * Decimal(random.uniform(0, 0.04))
                co_pay = approved_amount * Decimal(random.uniform(0, 0.08))
                consumable_deduction = approved_amount * Decimal(random.uniform(0, 0.06))
                hospital_discount = approved_amount * Decimal(random.uniform(0, 0.025))
                paid_by_patient = approved_amount * Decimal(random.uniform(0, 0.12))
                other_deductions = approved_amount * Decimal(random.uniform(0, 0.015))
                tds = approved_amount * Decimal(random.uniform(0.008, 0.018))
                
                # Calculate settled amount
                total_deductions = (mou_discount + co_pay + consumable_deduction + 
                                  hospital_discount + paid_by_patient + other_deductions + tds)
                amount_settled_in_ac = approved_amount - total_deductions
                total_settled_amount = amount_settled_in_ac

                # Generate unique claim ID
                import uuid
                unique_suffix = str(uuid.uuid4().hex[:6]).upper()
                claim_id = f"CLM{datetime.now().year}{unique_suffix}"
                
                # Generate UHID
                uhid = f"UHID{str(random.randint(100000, 999999))}"

                # Create claim
                Claim.objects.create(
                    month=month_str,
                    date_of_admission=admission_date,
                    date_of_discharge=discharge_date,
                    tpa_name=random.choice(tpa_names),
                    parent_insurance=random.choice(parent_insurances),
                    claim_id=claim_id,
                    uhid_ip_no=uhid,
                    patient_name=random.choice(patient_names),
                    bill_amount=bill_amount,
                    approved_amount=approved_amount,
                    mou_discount=mou_discount,
                    co_pay=co_pay,
                    consumable_deduction=consumable_deduction,
                    hospital_discount=hospital_discount,
                    paid_by_patient=paid_by_patient,
                    hospital_discount_authority=random.choice(hospital_authorities),
                    other_deductions=other_deductions,
                    physical_file_dispatch=random.choice(physical_file_statuses),
                    query_reply_date=discharge_date + timedelta(days=random.randint(1, 8)) if random.random() < 0.25 else None,
                    settlement_date=settlement_date,
                    tds=tds,
                    amount_settled_in_ac=amount_settled_in_ac,
                    total_settled_amount=total_settled_amount,
                    reason_less_settlement='Insurance policy terms' if random.random() < 0.15 else '',
                    claim_settled_software=random.choice([True, False]),
                    receipt_verified_bank=random.choice([True, False])
                )

            total_created += claims_for_month

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {total_created} claims across {months} months!')
        )
        
        # Show summary
        total_claims = Claim.objects.count()
        monthly_summary = Claim.objects.values('month').annotate(
            count=models.Count('id'),
            total_bill=models.Sum('bill_amount'),
            total_approved=models.Sum('approved_amount')
        ).order_by('month')
        
        self.stdout.write(f'\nMonthly Summary:')
        for month_data in monthly_summary:
            self.stdout.write(
                f"{month_data['month']}: {month_data['count']} claims, "
                f"₹{month_data['total_bill']:,.2f} bill amount, "
                f"₹{month_data['total_approved']:,.2f} approved"
            )
        
        self.stdout.write(f'\nTotal claims in database: {total_claims}')
