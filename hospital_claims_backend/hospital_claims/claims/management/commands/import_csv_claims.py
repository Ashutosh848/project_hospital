import csv
import os
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.db import transaction
from claims.models import Claim


class Command(BaseCommand):
    help = 'Import claims from CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Path to the CSV file')

    def handle(self, *args, **options):
        csv_file_path = options['csv_file']
        
        if not os.path.exists(csv_file_path):
            self.stdout.write(
                self.style.ERROR(f'CSV file not found: {csv_file_path}')
            )
            return

        # Check if we should clear existing claims first
        existing_count = Claim.objects.count()
        if existing_count > 0:
            self.stdout.write(
                self.style.WARNING(f'Found {existing_count} existing claims. Clearing them first...')
            )
            Claim.objects.all().delete()

        imported_count = 0
        errors = []

        with open(csv_file_path, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row_num, row in enumerate(reader, start=2):  # Start from 2 because row 1 is header
                try:
                    with transaction.atomic():
                        # Parse date fields
                        date_of_discharge = self.parse_date(row.get('date_of_discharge', ''))
                        
                        # Parse numeric fields
                        bill_amount = self.parse_decimal(row.get('bill_amount', ''))
                        approved_amount = self.parse_decimal(row.get('approved_amount', ''))
                        mou_discount = self.parse_decimal(row.get('mou_discount', ''))
                        co_pay = self.parse_decimal(row.get('co_pay', ''))
                        consumable_deduction = self.parse_decimal(row.get('consumable_deduction', ''))
                        hospital_discount = self.parse_decimal(row.get('hospital_discount', ''))
                        paid_by_patient = self.parse_decimal(row.get('paid_by_patient', ''))
                        tds = self.parse_decimal(row.get('tds', ''))
                        amount_settled_in_ac = self.parse_decimal(row.get('amount_settled_in_ac', ''))

                        # Create claim object
                        claim = Claim(
                            date_of_discharge=date_of_discharge,
                            tpa_name=row.get('tpa_name', '').strip(),
                            parent_insurance=row.get('parent_insurance', '').strip(),
                            claim_id=row.get('claim_id', '').strip(),
                            uhid_ip_no=row.get('uhid_ip_no', '').strip(),
                            patient_name=row.get('patient_name', '').strip(),
                            utr_number=row.get('utr_number', '').strip(),
                            bill_amount=bill_amount,
                            approved_amount=approved_amount,
                            mou_discount=mou_discount or 0,
                            co_pay=co_pay or 0,
                            consumable_deduction=consumable_deduction or 0,
                            hospital_discount=hospital_discount or 0,
                            paid_by_patient=paid_by_patient or 0,
                            tds=tds or 0,
                            amount_settled_in_ac=amount_settled_in_ac or 0,
                            total_settled_amount=amount_settled_in_ac or 0,
                            physical_file_dispatch='pending',
                            claim_settled_software=False,
                            receipt_verified_bank=False
                        )
                        
                        claim.save()
                        imported_count += 1
                        
                        if imported_count % 10 == 0:
                            self.stdout.write(f'Imported {imported_count} claims...')

                except Exception as e:
                    error_msg = f'Row {row_num}: {str(e)}'
                    errors.append(error_msg)
                    self.stdout.write(
                        self.style.ERROR(error_msg)
                    )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully imported {imported_count} claims')
        )
        
        if errors:
            self.stdout.write(
                self.style.WARNING(f'Encountered {len(errors)} errors during import')
            )
            for error in errors[:10]:  # Show first 10 errors
                self.stdout.write(f'  - {error}')

    def parse_date(self, date_str):
        """Parse date string in various formats"""
        if not date_str or date_str.strip() == '':
            return None
            
        date_str = date_str.strip()
        
        # Try different date formats
        date_formats = [
            '%d/%m/%Y',    # 23/02/2024
            '%d-%m-%Y',    # 29-03-2023
            '%d/%m/%y',    # 23/02/24
            '%d-%m-%y',    # 29-03-23
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                continue
                
        return None

    def parse_decimal(self, value):
        """Parse decimal value, handling empty strings and invalid values"""
        if not value or value.strip() == '':
            return None
            
        try:
            # Remove quotes and any non-numeric characters except decimal point and minus
            cleaned_value = str(value).strip().strip('"').strip("'")
            
            # Handle special cases like "...." or text
            if cleaned_value in ['....', '...', '..', '.'] or not any(c.isdigit() for c in cleaned_value):
                return None
                
            # Remove any text in parentheses or other non-numeric content
            if '(' in cleaned_value or 'NOT DEPOSITE' in cleaned_value.upper() or any(keyword in cleaned_value.upper() for keyword in ['SIR', 'API', 'DEPOSITE']):
                # Extract only numeric part
                import re
                numeric_match = re.search(r'^[\d.,]+', cleaned_value)
                if numeric_match:
                    cleaned_value = numeric_match.group()
                else:
                    return None
            
            # Remove commas from numbers (e.g., "53,394.30" -> "53394.30")
            cleaned_value = cleaned_value.replace(',', '')
            
            # Remove asterisks and other special characters that might be in numbers
            cleaned_value = cleaned_value.replace('*', '').replace('#', '').replace('@', '')
            
            return Decimal(cleaned_value)
        except (ValueError, TypeError):
            return None
