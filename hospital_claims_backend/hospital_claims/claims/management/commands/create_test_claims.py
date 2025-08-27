from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import models
from claims.models import Claim
import random
from datetime import datetime, timedelta
from decimal import Decimal

class Command(BaseCommand):
    help = 'Create test claims data for development and testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=25,
            help='Number of test claims to create (default: 25)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing claims before creating new ones'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        if options['clear']:
            self.stdout.write('Clearing existing claims...')
            Claim.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing claims cleared.'))

        # Sample data
        tpa_names = [
            'Star Health Insurance',
            'HDFC ERGO Health Insurance',
            'ICICI Lombard Health Insurance',
            'Max Bupa Health Insurance',
            'Apollo Munich Health Insurance',
            'Bajaj Allianz Health Insurance',
            'Future Generali Health Insurance',
            'Reliance General Insurance',
            'United India Insurance',
            'National Insurance Company'
        ]

        parent_insurances = [
            'LIC of India',
            'HDFC Life Insurance',
            'ICICI Prudential Life Insurance',
            'SBI Life Insurance',
            'Max Life Insurance',
            'Bajaj Allianz Life Insurance',
            'Tata AIA Life Insurance',
            'Kotak Mahindra Life Insurance',
            'Birla Sun Life Insurance',
            'Reliance Nippon Life Insurance'
        ]

        patient_names = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Patel', 'Vikash Gupta',
            'Meera Agarwal', 'Ravi Verma', 'Kavita Joshi', 'Suresh Yadav', 'Pooja Mishra',
            'Manoj Tiwari', 'Rekha Sinha', 'Ashok Pandey', 'Geeta Rani', 'Dinesh Chandra',
            'Sita Devi', 'Ramesh Prasad', 'Anita Kumari', 'Vijay Kumar', 'Shanti Devi',
            'Mukesh Singh', 'Radha Sharma', 'Sunil Kumar', 'Pushpa Devi', 'Naresh Gupta'
        ]

        hospital_authorities = [
            'CMO Approval', 'Medical Director', 'Senior Consultant', 'Department Head',
            'Chief Medical Officer', 'Medical Superintendent', 'Senior Doctor'
        ]

        physical_file_statuses = ['pending', 'dispatched', 'received', 'not_required']

        self.stdout.write(f'Creating {count} test claims...')

        for i in range(count):
            # Generate dates
            admission_date = timezone.now().date() - timedelta(days=random.randint(1, 180))
            discharge_date = admission_date + timedelta(days=random.randint(1, 15))
            
            # Sometimes add settlement date (80% of claims are settled)
            settlement_date = None
            if random.random() < 0.8:
                settlement_date = discharge_date + timedelta(days=random.randint(1, 30))

            # Generate amounts
            bill_amount = Decimal(random.randint(50000, 500000))
            approved_amount = bill_amount * Decimal(random.uniform(0.7, 0.95))
            
            # Calculate deductions
            mou_discount = approved_amount * Decimal(random.uniform(0, 0.05))
            co_pay = approved_amount * Decimal(random.uniform(0, 0.1))
            consumable_deduction = approved_amount * Decimal(random.uniform(0, 0.08))
            hospital_discount = approved_amount * Decimal(random.uniform(0, 0.03))
            paid_by_patient = approved_amount * Decimal(random.uniform(0, 0.15))
            other_deductions = approved_amount * Decimal(random.uniform(0, 0.02))
            tds = approved_amount * Decimal(random.uniform(0.005, 0.02))
            
            # Calculate settled amount
            total_deductions = (mou_discount + co_pay + consumable_deduction + 
                              hospital_discount + paid_by_patient + other_deductions + tds)
            amount_settled_in_ac = approved_amount - total_deductions
            total_settled_amount = amount_settled_in_ac

            # Generate unique claim ID
            existing_count = Claim.objects.count()
            claim_id = f"CLM{datetime.now().year}{str(existing_count + i + 1).zfill(6)}"
            
            # Generate UHID
            uhid = f"UHID{str(random.randint(100000, 999999))}"

            # Generate month
            month = admission_date.strftime('%Y-%m')

            # Create claim
            claim = Claim.objects.create(
                month=month,
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
                query_reply_date=discharge_date + timedelta(days=random.randint(1, 10)) if random.random() < 0.3 else None,
                settlement_date=settlement_date,
                tds=tds,
                amount_settled_in_ac=amount_settled_in_ac,
                total_settled_amount=total_settled_amount,
                reason_less_settlement='Insurance policy terms' if random.random() < 0.2 else '',
                claim_settled_software=random.choice([True, False]),
                receipt_verified_bank=random.choice([True, False])
            )

            if (i + 1) % 5 == 0:
                self.stdout.write(f'Created {i + 1} claims...')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {count} test claims!')
        )
        
        # Show summary
        total_claims = Claim.objects.count()
        total_bill_amount = Claim.objects.aggregate(total=models.Sum('bill_amount'))['total'] or 0
        total_approved_amount = Claim.objects.aggregate(total=models.Sum('approved_amount'))['total'] or 0
        
        self.stdout.write(f'\nSummary:')
        self.stdout.write(f'Total claims in database: {total_claims}')
        self.stdout.write(f'Total bill amount: ₹{total_bill_amount:,.2f}')
        self.stdout.write(f'Total approved amount: ₹{total_approved_amount:,.2f}')
