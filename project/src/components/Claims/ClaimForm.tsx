import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Upload } from 'lucide-react';
import { Claim, ClaimFormData } from '../../types';
import { format } from 'date-fns';

const schema = yup.object<ClaimFormData>({
  date_of_admission: yup.string().required('Date of admission is required'),
  date_of_discharge: yup.string().required('Date of discharge is required'),
  tpa_name: yup.string().required('TPA name is required'),
  parent_insurance: yup.string().required('Parent insurance is required'),
  claim_id: yup.string().required('Claim ID is required'),
  uhid_ip_no: yup.string().required('UHID/IP No is required'),
  patient_name: yup.string().required('Patient name is required'),
  bill_amount: yup.number().positive('Bill amount must be positive').required('Bill amount is required'),
  approved_amount: yup.number().positive('Approved amount must be positive').required('Approved amount is required'),
  mou_discount: yup.number().min(0, 'MOU discount cannot be negative').required('MOU discount is required'),
  co_pay: yup.number().min(0, 'Co-pay cannot be negative').required('Co-pay is required'),
  consumable_deduction: yup.number().min(0, 'Consumable deduction cannot be negative').required('Consumable deduction is required'),
  hospital_discount: yup.number().min(0, 'Hospital discount cannot be negative').required('Hospital discount is required'),
  paid_by_patient: yup.number().min(0, 'Paid by patient cannot be negative').required('Paid by patient is required'),
  hospital_discount_authority: yup.string().required('Hospital discount authority is required'),
  other_deductions: yup.number().min(0, 'Other deductions cannot be negative').required('Other deductions is required'),
  physical_file_dispatch: yup.string().oneOf(['pending', 'dispatched', 'received', 'not_required']).required('Physical file dispatch status is required'),
  query_reply_date: yup.string().optional(),
  settlement_date: yup.string().optional(),
  tds: yup.number().min(0, 'TDS cannot be negative').required('TDS is required'),
  amount_settled_in_ac: yup.number().min(0, 'Amount settled in account cannot be negative').required('Amount settled in account is required'),
  total_settled_amount: yup.number().min(0, 'Total settled amount cannot be negative').required('Total settled amount is required'),
  reason_less_settlement: yup.string(),
  claim_settled_software: yup.boolean().required(),
  receipt_verified_bank: yup.boolean().required(),
  approval_letter: yup.mixed().optional(),
  physical_file_upload: yup.mixed().optional(),
  query_on_claim: yup.mixed().optional()
});



interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claim: Partial<Claim>) => void;
  initialData?: Claim | null;
  title: string;
}

export const ClaimForm: React.FC<ClaimFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ClaimFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData || {}
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        date_of_admission: '',
        date_of_discharge: '',
        tpa_name: '',
        parent_insurance: '',
        claim_id: '',
        uhid_ip_no: '',
        patient_name: '',
        bill_amount: 0,
        approved_amount: 0,
        mou_discount: 0,
        co_pay: 0,
        consumable_deduction: 0,
        hospital_discount: 0,
        paid_by_patient: 0,
        hospital_discount_authority: '',
        other_deductions: 0,
        physical_file_dispatch: 'pending',
        query_reply_date: '',
        settlement_date: '',
        tds: 0,
        amount_settled_in_ac: 0,
        total_settled_amount: 0,
        reason_less_settlement: '',
        claim_settled_software: false,
        receipt_verified_bank: false
      });
    }
  }, [initialData, reset]);

  // Auto-calculate fields
  const approvedAmount = watch('approved_amount');
  const tds = watch('tds');
  const otherDeductions = watch('other_deductions');

  useEffect(() => {
    if (approvedAmount && tds >= 0 && otherDeductions >= 0) {
      const totalSettled = approvedAmount - tds - otherDeductions;
      const difference = approvedAmount - totalSettled;
      
      setValue('total_settled_amount', totalSettled);
      setValue('amount_settled_in_ac', totalSettled);
      // Note: difference_amount is calculated by backend
    }
  }, [approvedAmount, tds, otherDeductions, setValue]);

  const handleFormSubmit = (data: any) => {
    // Create FormData and add all form fields
    const formData = new FormData();
    
    // Add all form data - ensure all required fields are included
    Object.keys(data).forEach(key => {
      // Handle file fields
      if (['approval_letter', 'physical_file_upload', 'query_on_claim'].includes(key)) {
        if (data[key] instanceof FileList && data[key].length > 0) {
          const file = data[key][0];
          if (file && file.size > 0 && file.name && file.name.trim() !== '') {
            formData.append(key, file);
          }
        } else if (data[key] instanceof File) {
          if (data[key].size > 0 && data[key].name && data[key].name.trim() !== '') {
            formData.append(key, data[key]);
          }
        }
        // Skip empty file fields completely
        return;
      }
      
      // Handle non-file fields - include all fields even if empty
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, String(data[key]));
      } else {
        // Include empty fields with empty string
        formData.append(key, '');
      }
    });
    
    // Ensure all required fields are present
    const requiredFields = [
      'date_of_admission', 'date_of_discharge', 'tpa_name', 'parent_insurance',
      'claim_id', 'uhid_ip_no', 'patient_name', 'bill_amount', 'approved_amount',
      'mou_discount', 'co_pay', 'consumable_deduction', 'hospital_discount',
      'paid_by_patient', 'hospital_discount_authority', 'other_deductions',
      'physical_file_dispatch', 'tds', 'amount_settled_in_ac', 'total_settled_amount',
      'claim_settled_software', 'receipt_verified_bank'
    ];
    
    requiredFields.forEach(field => {
      if (!formData.has(field)) {
        formData.append(field, data[field] || '');
      }
    });
    
    // Add calculated fields
    formData.append('month', format(new Date(data.date_of_discharge), 'yyyy-MM'));
    formData.append('difference_amount', String(data.approved_amount - data.total_settled_amount));
    
    // Handle timestamps - preserve original created_at, update updated_at
    if (initialData?.created_at) {
      formData.append('created_at', initialData.created_at);
    } else {
      formData.append('created_at', new Date().toISOString());
    }
    formData.append('updated_at', new Date().toISOString());
    
    // Add default values for optional fields if they're empty
    if (!data.query_reply_date) {
      formData.append('query_reply_date', '');
    }
    if (!data.settlement_date) {
      formData.append('settlement_date', '');
    }
    if (!data.reason_less_settlement) {
      formData.append('reason_less_settlement', '');
    }
    

    
    // Debug: Log what's being sent
    console.log('FormData being sent:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    // Pass FormData directly to onSubmit
    onSubmit(formData as any);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="max-h-96 overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Admission *
                    </label>
                    <input
                      type="date"
                      {...register('date_of_admission')}
                      name="date_of_admission"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.date_of_admission && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_admission.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Discharge *
                    </label>
                    <input
                      type="date"
                      {...register('date_of_discharge')}
                      name="date_of_discharge"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.date_of_discharge && (
                      <p className="mt-1 text-sm text-red-600">{errors.date_of_discharge.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TPA Name *
                    </label>
                    <input
                      type="text"
                      {...register('tpa_name')}
                      name="tpa_name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tpa_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.tpa_name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Parent Insurance *
                    </label>
                    <input
                      type="text"
                      {...register('parent_insurance')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.parent_insurance && (
                      <p className="mt-1 text-sm text-red-600">{errors.parent_insurance.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Claim ID *
                    </label>
                    <input
                      type="text"
                      {...register('claim_id')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.claim_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.claim_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UHID/IP No *
                    </label>
                    <input
                      type="text"
                      {...register('uhid_ip_no')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.uhid_ip_no && (
                      <p className="mt-1 text-sm text-red-600">{errors.uhid_ip_no.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      {...register('patient_name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.patient_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.patient_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bill Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('bill_amount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.bill_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.bill_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approved Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('approved_amount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.approved_amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.approved_amount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      MOU Discount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('mou_discount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.mou_discount && (
                      <p className="mt-1 text-sm text-red-600">{errors.mou_discount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Co-pay *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('co_pay', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.co_pay && (
                      <p className="mt-1 text-sm text-red-600">{errors.co_pay.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumable Deduction *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('consumable_deduction', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.consumable_deduction && (
                      <p className="mt-1 text-sm text-red-600">{errors.consumable_deduction.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital Discount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('hospital_discount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospital_discount && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospital_discount.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paid by Patient *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('paid_by_patient', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.paid_by_patient && (
                      <p className="mt-1 text-sm text-red-600">{errors.paid_by_patient.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital Discount Authority *
                    </label>
                    <input
                      type="text"
                      {...register('hospital_discount_authority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.hospital_discount_authority && (
                      <p className="mt-1 text-sm text-red-600">{errors.hospital_discount_authority.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Deductions *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('other_deductions', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.other_deductions && (
                      <p className="mt-1 text-sm text-red-600">{errors.other_deductions.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Approval Letter Upload (PDF)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        {...register('approval_letter')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TDS *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('tds', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.tds && (
                      <p className="mt-1 text-sm text-red-600">{errors.tds.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Settled Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('total_settled_amount', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                {/* Process Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Physical File Dispatch *
                    </label>
                    <select
                      {...register('physical_file_dispatch')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="dispatched">Dispatched</option>
                      <option value="received">Received</option>
                      <option value="not_required">Not Required</option>
                    </select>
                    {errors.physical_file_dispatch && (
                      <p className="mt-1 text-sm text-red-600">{errors.physical_file_dispatch.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Upload/Dispatch *
                    </label>
                    <input
                      type="date"
                      {...register('query_reply_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.query_reply_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.query_reply_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      POD Upload (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        {...register('physical_file_upload')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query on Claim (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        {...register('query_on_claim')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query Reply Date *
                    </label>
                    <input
                      type="date"
                      {...register('settlement_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.settlement_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.settlement_date.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Query Reply Upload (PDF Format)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept=".pdf"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Settlement Date *
                    </label>
                    <input
                      type="date"
                      {...register('settlement_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.settlement_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.settlement_date.message}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Less Settlement
                    </label>
                    <input
                      type="text"
                      {...register('reason_less_settlement')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Boolean Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('claim_settled_software')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Claim Settled on Software
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('receipt_verified_bank')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Receipt Amount Verification in Bank Account
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {initialData ? 'Update' : 'Create'} Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};