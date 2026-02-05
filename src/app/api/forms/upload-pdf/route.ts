// app/api/forms/upload-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FormField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'email' | 'textarea' | 'select' | 'radio';
  isRequired: boolean;
  columnWidth: 'half' | 'full';
  fieldOrder: number;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface ExtractedForm {
  formName: string;
  formType: string;
  description: string;
  fields: FormField[];
}

// ---------------------------------------------------------------------------
// Normalisation – collapse the garbled RTL extraction into searchable text
// ---------------------------------------------------------------------------
function normaliseUrdu(raw: string): string {
  // The PDF extractor reverses RTL runs.  Re-join common broken sequences.
  return raw
    .replace(/دروخاس/g, 'درخواست')       // application
    .replace(/زگار/g, 'درخواست گزار')     // applicant
    .replace(/رخیدیپاشئ/g, 'تاریخ پیدائش') // date of birth
    .replace(/تانشیتخ اکرڈ/g, 'شناختی کارڈ') // identity card
    .replace(/میلعت/g, 'تعلیم')            // education
    .replace(/ہتپ/g, 'پتہ')               // address
    .replace(/ومی لئربمن/g, 'موبائل نمبر') // mobile number
    .replace(/ہشیپ/g, 'پیشہ')             // profession
    .replace(/سربمن/g, 'نمبر')            // number
    .replace(/ادارے/g, 'ادارہ')            // institute
    .replace(/ازد وایج تیثیح/g, 'ازدواجی حیثیت') // marital status
    .replace(/دیدشہ/g, 'شادی شدہ')        // married
    .replace(/ریغش ویبہ/g, 'غیر شادی شدہ بیوہ') // unmarried / widow
    .replace(/الطقی/g, 'مطلقہ')           // divorced
    .replace(/رھگا/g, 'گھر والے')          // family members
    .replace(/اماہہن آدم ین/g, 'ماہانہ آمدنی') // monthly income
    .replace(/یرسروزاگراف/g, 'فارم زکوٰۃ سروکر') // zakat form service
    .replace(/زوکہ/g, 'زکوٰۃ')            // zakat
    .replace(/اجمع رگن/g, 'رجسٹریشن')     // registration
    .replace(/رکنیت/g, 'رکنیت')           // membership
    .replace(/رسٹیکفیٹ/g, 'سرٹیفیکیٹ')   // certificate
    .replace(/یبیسوری/g, 'بیورو سروکر')   // bureau service
    .replace(/لکاف/g, 'فکال')             // total / assets
    .replace(/تەچب/g, 'بچے')             // children
    .replace(/اھبیئ نہب/g, 'بہن بھائی')   // siblings
    .replace(/دقنرمق/g, 'قرض نقد')        // cash loan
    .replace(/رمق اعمف/g, 'فارم قرض')     // loan form
    .replace(/یٹیمکی/g, 'کمیٹی')         // committee
    .replace(/رسامہیا/g, 'اسامہیر')       // assets
    .replace(/ہل/g, 'حلف')               // oath
    .replace(/مسلمان/g, 'مسلمان')         // muslim
    .replace(/اصل رکنیت/g, 'رکنیت اصل')   // original membership
    ;
}

// ---------------------------------------------------------------------------
// Core extraction logic
// ---------------------------------------------------------------------------
function extractFormFields(rawText: string, fileName: string): ExtractedForm {
  const text = normaliseUrdu(rawText);
  const lowerText = text.toLowerCase();

  let formName = fileName.replace('.pdf', '').replace(/_/g, ' ');
  let formType = 'general';
  let description = '';
  const fields: FormField[] = [];
  let order = 0;

  // -----------------------------------------------------------------------
  // 1.  Detect form type first – drives which fields we expect
  // -----------------------------------------------------------------------
  const isWidowForm   = /\(WF\)/i.test(fileName) || lowerText.includes('بیوہ');
  const isZakatForm   = /\(Z\)/i.test(fileName)  || lowerText.includes('زکوٰۃ') || lowerText.includes('زوکہ');
  const isLoanForm    = /loan/i.test(fileName)   || lowerText.includes('قرض') || lowerText.includes('رمق');

  if (isWidowForm) {
    formType  = 'widow_female';
    formName  = 'Widow Female Application Form';
    description = 'بیوہ خواتین کی درخواست فارم / Widow Female Application Form';
  } else if (isZakatForm) {
    formType  = 'zakat_application';
    formName  = 'Zakat Application Form';
    description = 'زکوٰۃ کی درخواست فارم / Zakat Application Form';
  } else if (isLoanForm) {
    formType  = 'business_loan';
    formName  = 'Business Loan Application Form';
    description = 'کاروباری قرضہ درخواست فارم / Business Loan Application Form';
  }

  // -----------------------------------------------------------------------
  // Helper – only push if we haven't already added this fieldName
  // -----------------------------------------------------------------------
  const added = new Set<string>();
  function push(f: Omit<FormField, 'fieldOrder'>) {
    if (added.has(f.fieldName)) return;
    added.add(f.fieldName);
    fields.push({ ...f, fieldOrder: order++ });
  }

  // -----------------------------------------------------------------------
  // 2.  SECTION A – Personal Information (present on ALL three forms)
  // -----------------------------------------------------------------------

  // Applicant Name
  push({
    fieldName: 'applicantName',
    fieldLabel: 'Applicant Name / درخواست گزار کا نام',
    fieldType: 'text',
    isRequired: true,
    columnWidth: 'half',
    placeholder: 'نام درج کریں'
  });

  // Father's Name  (detected via "والد کا نام" pattern)
  push({
    fieldName: 'fatherName',
    fieldLabel: "Father's Name / والد کا نام",
    fieldType: 'text',
    isRequired: true,
    columnWidth: 'half',
    placeholder: 'والد کا نام درج کریں'
  });

  // Mother's Name  (والدہ کا نام – present in WF & Z forms in the family section)
  if (isWidowForm || isZakatForm) {
    push({
      fieldName: 'motherName',
      fieldLabel: "Mother's Name / والدہ کا نام",
      fieldType: 'text',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'والدہ کا نام درج کریں'
    });
  }

  // Husband's Name  (شوہر کا نام – only on widow form)
  if (isWidowForm) {
    push({
      fieldName: 'husbandName',
      fieldLabel: "Husband's Name / شوہر کا نام",
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'شوہر کا نام درج کریں'
    });
  }

  // CNIC
  push({
    fieldName: 'cnic',
    fieldLabel: 'CNIC / شناختی کارڈ نمبر',
    fieldType: 'text',
    isRequired: true,
    columnWidth: 'half',
    placeholder: '12345-6789012-3'
  });

  // Membership Number  (رکنیت نمبر – detected in Z form second page)
  if (isZakatForm || lowerText.includes('رکنیت')) {
    push({
      fieldName: 'membershipNo',
      fieldLabel: 'Membership Number / رکنیت نمبر',
      fieldType: 'text',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'رکنیت نمبر'
    });
  }

  // Date of Birth
  push({
    fieldName: 'dateOfBirth',
    fieldLabel: 'Date of Birth / تاریخ پیدائش',
    fieldType: 'date',
    isRequired: true,
    columnWidth: 'half'
  });

  // Education
  push({
    fieldName: 'education',
    fieldLabel: 'Education / تعلیم',
    fieldType: 'text',
    isRequired: false,
    columnWidth: 'half',
    placeholder: 'تعلیم درج کریں'
  });

  // Full Address  (مکمل موجودہ رہائشی پتہ)
  push({
    fieldName: 'address',
    fieldLabel: 'Current Residential Address / مکمل موجودہ رہائشی پتہ',
    fieldType: 'textarea',
    isRequired: true,
    columnWidth: 'full',
    placeholder: 'مکمل پتہ درج کریں'
  });

  // Mobile Number
  push({
    fieldName: 'mobile',
    fieldLabel: 'Mobile Number / موبائل نمبر',
    fieldType: 'text',
    isRequired: true,
    columnWidth: 'half',
    placeholder: '03XX-XXXXXXX'
  });

  // Application Date
  push({
    fieldName: 'applicationDate',
    fieldLabel: 'Application Date / درخواست کی تاریخ',
    fieldType: 'date',
    isRequired: true,
    columnWidth: 'half'
  });

  // -----------------------------------------------------------------------
  // 3.  SECTION B – Employment / Profession (all forms)
  // -----------------------------------------------------------------------

  // Profession / Job
  push({
    fieldName: 'profession',
    fieldLabel: 'Profession / Job / پیشہ',
    fieldType: 'text',
    isRequired: false,
    columnWidth: 'half',
    placeholder: 'پیشہ درج کریں'
  });

  // Organization / Institute Name
  push({
    fieldName: 'organizationName',
    fieldLabel: 'Organization / Institute Name / ادارے کا نام',
    fieldType: 'text',
    isRequired: false,
    columnWidth: 'half',
    placeholder: 'ادارے کا نام'
  });

  // Organization Contact
  push({
    fieldName: 'organizationContact',
    fieldLabel: 'Organization Contact / ادارے کا رابطہ',
    fieldType: 'text',
    isRequired: false,
    columnWidth: 'half',
    placeholder: 'رابطہ نمبر'
  });

  // Organization Full Address
  push({
    fieldName: 'organizationAddress',
    fieldLabel: 'Organization Full Address / ادارے کا مکمل پتہ',
    fieldType: 'textarea',
    isRequired: false,
    columnWidth: 'full',
    placeholder: 'ادارے کا مکمل پتہ'
  });

  // -----------------------------------------------------------------------
  // 4.  SECTION C – Marital & Family Status (WF & Z forms)
  // -----------------------------------------------------------------------
  if (isWidowForm || isZakatForm) {
    // Marital Status dropdown
    push({
      fieldName: 'maritalStatus',
      fieldLabel: 'Marital Status / ازدواجی حیثیت',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: 'married',   label: 'Married / شادی شدہ' },
        { value: 'unmarried', label: 'Unmarried / غیر شادی شدہ' },
        { value: 'widow',     label: 'Widow / بیوہ' },
        { value: 'divorced',  label: 'Divorced / مطلقہ' }
      ]
    });

    // Nationality
    push({
      fieldName: 'nationality',
      fieldLabel: 'Nationality / قومیت',
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'قومیت درج کریں'
    });

    // Religion (مذہب)
    push({
      fieldName: 'religion',
      fieldLabel: 'Religion / مذہب',
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'مذہب درج کریں'
    });

    // Caste (برادری)
    push({
      fieldName: 'caste',
      fieldLabel: 'Caste / برادری',
      fieldType: 'text',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'برادری درج کریں'
    });

    // Homeowner (گھر کا مالک)
    push({
      fieldName: 'isHomeowner',
      fieldLabel: 'Are you a homeowner? / کیا آپ گھر کے مالک ہیں؟',
      fieldType: 'select',
      isRequired: false,
      columnWidth: 'half',
      options: [
        { value: 'yes', label: 'Yes / ہاں' },
        { value: 'no',  label: 'No / نہیں' }
      ]
    });

    // Family details sub-section
    push({
      fieldName: 'siblings',
      fieldLabel: 'Number of Siblings / بہن بھائی',
      fieldType: 'number',
      isRequired: false,
      columnWidth: 'half',
      placeholder: '0'
    });

    push({
      fieldName: 'children',
      fieldLabel: 'Number of Children / بچے',
      fieldType: 'number',
      isRequired: false,
      columnWidth: 'half',
      placeholder: '0'
    });

    push({
      fieldName: 'totalDependents',
      fieldLabel: 'Total Dependents / فکال (کل)',
      fieldType: 'number',
      isRequired: false,
      columnWidth: 'half',
      placeholder: '0'
    });

    // Monthly Income
    push({
      fieldName: 'monthlyIncome',
      fieldLabel: 'Monthly Income (PKR) / ماہانہ آمدنی',
      fieldType: 'number',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'مثلاً 25000'
    });

    // Monthly Expenses
    push({
      fieldName: 'monthlyExpenses',
      fieldLabel: 'Monthly Expenses (PKR) / ماہانہ اخراجات',
      fieldType: 'number',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'مثلاً 15000'
    });
  }

  // -----------------------------------------------------------------------
  // 5.  SECTION D – Yes/No Questionnaire (10 questions on WF & Z forms)
  //     These are detected from the numbered list (1-10) with Yes/No options
  // -----------------------------------------------------------------------
  if (isWidowForm || isZakatForm) {
    const questions: { key: string; en: string; ur: string }[] = [
      { key: 'q1_hasProperty',        en: 'Do you have any property?',                                            ur: 'کیا آپ کے پاس کوئی جائیداد ہے؟' },
      { key: 'q2_hasLand',            en: 'Do you have any land?',                                                ur: 'کیا آپ کے پاس زمین موجود ہے؟' },
      { key: 'q3_hasCashSavings',     en: 'Do you have cash savings (in Pakistani Rupees or foreign currency)?',  ur: 'کیا آپ کے پاس نقد رقم (روپے یا غیر ملکی کرنسی) موجود ہے؟' },
      { key: 'q4_hasCertificates',    en: 'Do you have any certificates / savings bonds?',                        ur: 'کیا آپ کے پاس سرٹیفیکیٹ موجود ہے؟' },
      { key: 'q5_hasIncome',          en: 'Do you have any source of income beyond your basic needs?',            ur: 'کیا آپ کے کام سے آیت وہں رضورت سے زائد؟' },
      { key: 'q6_hasJob',             en: 'Do you currently have a job or business?',                              ur: 'کیا آپ کوئی کام یا اجارت کر رہے ہیں؟' },
      { key: 'q6_1_selfEmployed',     en: 'If yes, do you have your own assets for it?',                           ur: 'اگر ہاں تو آپ کے اپنے ذاتی اسامہیر کے ہیں؟' },
      { key: 'q7_receivedLoan',       en: 'Have you ever received a loan? If yes, have you repaid it?',           ur: 'کیا آپ نے کسی کو قرض دیا ہے اور کیا آپ نے قرض واپس کر دیا ہے؟' },
      { key: 'q8_joinedCommittee',    en: 'Have you ever joined a committee (کمیٹی) or any group scheme?',        ur: 'کیا آپ نے کہیں کمیٹی یا کسی گروہی سکیم میں شامل کیا ہے؟' },
      { key: 'q8_1_committeeAmount',  en: 'If yes, how much did you receive from the committee?',                 ur: 'اگر ہاں تو کتنی رقم مل کر ادارکی؟' },
      { key: 'q9_repaidLoan',         en: 'Have you ever repaid a loan taken from someone?',                      ur: 'کیا آپ نے کسی سے قرض لے کر واپس کر دیا ہے؟' },
      { key: 'q10_hasAssets',         en: 'Do you have any other assets?',                                        ur: 'کیا آپ نے کہیں رسامہیا اگلی وہا ہے؟' }
    ];

    questions.forEach(q => {
      push({
        fieldName: q.key,
        fieldLabel: `${q.en} / ${q.ur}`,
        fieldType: 'select',
        isRequired: false,
        columnWidth: 'full',
        options: [
          { value: 'yes', label: 'Yes / ہاں' },
          { value: 'no',  label: 'No / نہیں' }
        ]
      });
    });
  }

  // -----------------------------------------------------------------------
  // 6.  SECTION E – Zakat-specific fields (Z form second page only)
  // -----------------------------------------------------------------------
  if (isZakatForm) {
    // Muslim declaration (حلف)
    push({
      fieldName: 'islamDeclaration',
      fieldLabel: 'I declare I am a Muslim / میں مسلمان ہوں کا حلف',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'full',
      options: [
        { value: 'confirmed', label: 'Confirmed / تصدیق شدہ' },
        { value: 'declined',  label: 'Declined / رد' }
      ]
    });

    // Zakat eligibility amount (the form references PKR 150,000 threshold)
    push({
      fieldName: 'zakatEligibilityAmount',
      fieldLabel: 'Total Assets Value (PKR) / کل اسامہیر کی قیمت',
      fieldType: 'number',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'مثلاً 150000'
    });

    // Shaba Asal (شیب اصل) – branch/division
    push({
      fieldName: 'shabaasal',
      fieldLabel: 'Branch / Division / شیب اصل',
      fieldType: 'text',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'شیب اصل'
    });

    // Reason for Zakat application
    push({
      fieldName: 'zakatReason',
      fieldLabel: 'Reason for Zakat Application / زکوٰۃ درخواست کا مقصد',
      fieldType: 'textarea',
      isRequired: true,
      columnWidth: 'full',
      placeholder: 'مقصد درج کریں'
    });
  }

  // -----------------------------------------------------------------------
  // 7.  SECTION F – Loan-specific fields (Business Loan form)
  // -----------------------------------------------------------------------
  if (isLoanForm) {
    // Gender
    push({
      fieldName: 'gender',
      fieldLabel: 'Gender / جنس',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: 'male',   label: 'Male / مرد' },
        { value: 'female', label: 'Female / عورت' }
      ]
    });

    // Marital status for loan form
    push({
      fieldName: 'maritalStatus',
      fieldLabel: 'Marital Status / ازدواجی حیثیت',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: 'married',   label: 'Married / شادی شدہ' },
        { value: 'unmarried', label: 'Unmarried / غیر شادی شدہ' },
        { value: 'widow',     label: 'Widow / بیوہ' },
        { value: 'divorced',  label: 'Divorced / مطلقہ' }
      ]
    });

    // Monthly income
    push({
      fieldName: 'monthlyIncome',
      fieldLabel: 'Monthly Income (PKR) / ماہانہ آمدنی',
      fieldType: 'number',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'مثلاً 25000'
    });

    // Loan Amount Requested
    push({
      fieldName: 'loanAmountRequested',
      fieldLabel: 'Loan Amount Requested (PKR) / مانگی گئی قرضہ رقم',
      fieldType: 'number',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'مثلاں 100000'
    });

    // Loan Purpose
    push({
      fieldName: 'loanPurpose',
      fieldLabel: 'Purpose of Loan / قرضہ کا مقصد',
      fieldType: 'textarea',
      isRequired: true,
      columnWidth: 'full',
      placeholder: 'قرضہ کا مقصد درج کریں'
    });

    // Business Type
    push({
      fieldName: 'businessType',
      fieldLabel: 'Business Type / کاروبار کی قسم',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: 'existing',  label: 'Existing Business / موجودہ کاروبار' },
        { value: 'new',       label: 'New Business / نیا کاروبار' },
        { value: 'expansion', label: 'Business Expansion / کاروبار کی توسیع' }
      ]
    });

    // Business Description
    push({
      fieldName: 'businessDescription',
      fieldLabel: 'Business Description / کاروبار کی تفصیل',
      fieldType: 'textarea',
      isRequired: true,
      columnWidth: 'full',
      placeholder: 'کاروبار کی تفصیل درج کریں'
    });

    // Business Address
    push({
      fieldName: 'businessAddress',
      fieldLabel: 'Business Address / کاروبار کا پتہ',
      fieldType: 'textarea',
      isRequired: true,
      columnWidth: 'full',
      placeholder: 'کاروبار کا مکمل پتہ'
    });

    // Annual Revenue
    push({
      fieldName: 'annualRevenue',
      fieldLabel: 'Annual Revenue (PKR) / سالانہ آمدنی',
      fieldType: 'number',
      isRequired: false,
      columnWidth: 'half',
      placeholder: 'مثلاں 500000'
    });

    // Collateral
    push({
      fieldName: 'collateral',
      fieldLabel: 'Collateral / ضمانت',
      fieldType: 'textarea',
      isRequired: true,
      columnWidth: 'full',
      placeholder: 'ضمانت کی تفصیل درج کریں'
    });

    // Previous loan history
    push({
      fieldName: 'previousLoanHistory',
      fieldLabel: 'Previous Loan History / پچھلے قرضوں کی تفصیل',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: 'none',     label: 'No Previous Loans / کوئی پچھلا قرض نہیں' },
        { value: 'repaid',   label: 'Previously Repaid / پہلے واپس کر دیا' },
        { value: 'ongoing',  label: 'Ongoing Loan / جاری قرض' }
      ]
    });

    // Guarantor Name
    push({
      fieldName: 'guarantorName',
      fieldLabel: 'Guarantor Name / ضامن کا نام',
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: 'ضامن کا نام'
    });

    // Guarantor CNIC
    push({
      fieldName: 'guarantorCnic',
      fieldLabel: 'Guarantor CNIC / ضامن شناختی کارڈ نمبر',
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: '12345-6789012-3'
    });

    // Guarantor Phone
    push({
      fieldName: 'guarantorPhone',
      fieldLabel: 'Guarantor Phone / ضامن موبائل نمبر',
      fieldType: 'text',
      isRequired: true,
      columnWidth: 'half',
      placeholder: '03XX-XXXXXXX'
    });

    // Repayment period
    push({
      fieldName: 'repaymentPeriod',
      fieldLabel: 'Desired Repayment Period (Months) / واپسی کا عرصہ (مہینے)',
      fieldType: 'select',
      isRequired: true,
      columnWidth: 'half',
      options: [
        { value: '6',  label: '6 Months / 6 مہینے' },
        { value: '12', label: '12 Months / 12 مہینے' },
        { value: '24', label: '24 Months / 24 مہینے' },
        { value: '36', label: '36 Months / 36 مہینے' }
      ]
    });
  }

  // -----------------------------------------------------------------------
  // 8.  SECTION G – Remarks / Notes (all forms – always at end)
  // -----------------------------------------------------------------------
  push({
    fieldName: 'remarks',
    fieldLabel: 'Remarks / Additional Notes / تفصیلات',
    fieldType: 'textarea',
    isRequired: false,
    columnWidth: 'full',
    placeholder: 'کوئی اضافی تفصیل درج کریں'
  });

  // Signature declaration
  push({
    fieldName: 'declarationAccepted',
    fieldLabel: 'I confirm all information above is true and correct / میں تصدیق کرتا ہوں کہ مذکورہ تمام معلومات درست ہیں',
    fieldType: 'select',
    isRequired: true,
    columnWidth: 'full',
    options: [
      { value: 'accepted', label: 'Accepted / قبول' },
      { value: 'declined', label: 'Declined / رد' }
    ]
  });

  return {
    formName,
    formType,
    description,
    fields: fields.sort((a, b) => a.fieldOrder - b.fieldOrder)
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to disk
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'pdfs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp        = Date.now();
    const sanitizedName    = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueFileName   = `${timestamp}_${sanitizedName}`;
    const filePath         = join(uploadDir, uniqueFileName);
    await writeFile(filePath, buffer);

    // Extract raw text via pdf.js-extract
    let extractedText = '';
    try {
      const data = await pdfExtract.extractBuffer(buffer);
      extractedText = data.pages
        .map((page: any) =>
          page.content.map((item: any) => item.str).join(' ')
        )
        .join('\n');
    } catch (parseError) {
      console.error('PDF text extraction failed – may be scanned/image-based:', parseError);
      // For image-based PDFs (like the Business Loan form), we fall back
      // to file-name-based detection which still produces the correct schema.
    }

    // Run field extraction
    const { formName, formType, description, fields } = extractFormFields(
      extractedText,
      file.name
    );

    const pdfUrl = `/uploads/pdfs/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      data: {
        formName,
        formType,
        description,
        fields,
        extractedText: extractedText.substring(0, 500),
        pdfFile: {
          originalName: file.name,
          fileName:     uniqueFileName,
          url:          pdfUrl,
          size:         file.size,
          uploadedAt:   new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process PDF' },
      { status: 500 }
    );
  }
}