export const FORM_TEMPLATES = {
  zakat_application: {
    name: 'Zakat Application Form (زکوٰۃ کے لیے درخواست)',
    description: 'Application form for Zakat assistance - Jamia Masjid Noor-e-Huda',
    formType: 'zakat_application',
    fields: [
      // Basic Information
      {
        fieldName: 'applicantName',
        fieldLabel: 'نام (Name)',
        fieldType: 'text',
        fieldOrder: 0,
        isRequired: true,
        placeholder: 'درخواست گزار کا نام',
        columnWidth: 'full'
      },
      {
        fieldName: 'fatherHusbandName',
        fieldLabel: 'والد/زوج کا نام (Father/Husband Name)',
        fieldType: 'text',
        fieldOrder: 1,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'identificationNumber',
        fieldLabel: 'شناخت (CNIC)',
        fieldType: 'text',
        fieldOrder: 2,
        isRequired: true,
        placeholder: 'XXXXX-XXXXXXX-X',
        validationRule: JSON.stringify({ minLength: 13, maxLength: 15 }),
        columnWidth: 'half'
      },
      {
        fieldName: 'membershipNumber',
        fieldLabel: 'ممبرشپ نمبر (Membership Number)',
        fieldType: 'text',
        fieldOrder: 3,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'nicCardNumber',
        fieldLabel: 'شناختی کارڈ نمبر (NIC Card Number)',
        fieldType: 'text',
        fieldOrder: 4,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'dateOfBirth',
        fieldLabel: 'تاریخ پیدائش (Date of Birth)',
        fieldType: 'date',
        fieldOrder: 5,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'education',
        fieldLabel: 'تعلیم (Education)',
        fieldType: 'select',
        fieldOrder: 6,
        isRequired: false,
        options: JSON.stringify([
          { value: 'illiterate', label: 'ناخواندہ (Illiterate)' },
          { value: 'primary', label: 'پرائمری (Primary)' },
          { value: 'middle', label: 'مڈل (Middle)' },
          { value: 'matric', label: 'میٹرک (Matric)' },
          { value: 'intermediate', label: 'انٹرمیڈیٹ (Intermediate)' },
          { value: 'graduate', label: 'گریجویٹ (Graduate)' },
          { value: 'postgraduate', label: 'پوسٹ گریجویٹ (Post Graduate)' }
        ]),
        columnWidth: 'half'
      },
      
      // Contact Information
      {
        fieldName: 'currentAddress',
        fieldLabel: 'مکمل موجودہ رہائشی پتہ (Complete Current Address)',
        fieldType: 'textarea',
        fieldOrder: 7,
        isRequired: true,
        placeholder: 'مکمل پتہ درج کریں',
        columnWidth: 'full'
      },
      {
        fieldName: 'mobileNumber',
        fieldLabel: 'موبائل نمبر (Mobile Number)',
        fieldType: 'text',
        fieldOrder: 8,
        isRequired: true,
        placeholder: '03XX-XXXXXXX',
        columnWidth: 'half'
      },
      {
        fieldName: 'applicationDate',
        fieldLabel: 'درخواست کی تاریخ (Application Date)',
        fieldType: 'date',
        fieldOrder: 9,
        isRequired: true,
        columnWidth: 'half'
      },
      
      // Occupation Details
      {
        fieldName: 'occupationProfession',
        fieldLabel: 'پیشہ/ہنر (Occupation/Profession)',
        fieldType: 'text',
        fieldOrder: 10,
        isRequired: true,
        placeholder: 'اپنا پیشہ درج کریں',
        columnWidth: 'full'
      },
      {
        fieldName: 'workplaceInstitution',
        fieldLabel: 'ادارے/شعبہ کا نام (Workplace/Institution)',
        fieldType: 'text',
        fieldOrder: 11,
        isRequired: false,
        placeholder: 'اگر کہیں کام کرتے ہیں',
        columnWidth: 'half'
      },
      {
        fieldName: 'institutionAddress',
        fieldLabel: 'ادارے کا مکمل پتہ (Institution Address)',
        fieldType: 'textarea',
        fieldOrder: 12,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'institutionContact',
        fieldLabel: 'ادارے کا رابطہ (Institution Contact)',
        fieldType: 'text',
        fieldOrder: 13,
        isRequired: false,
        columnWidth: 'half'
      },
      
      // Marital Status
      {
        fieldName: 'maritalStatus',
        fieldLabel: 'ازدواجی حیثیت (Marital Status)',
        fieldType: 'select',
        fieldOrder: 14,
        isRequired: true,
        options: JSON.stringify([
          { value: 'married', label: 'شادی شدہ (Married)' },
          { value: 'unmarried', label: 'غیر شادی شدہ (Unmarried)' },
          { value: 'widow', label: 'بیوہ (Widow)' },
          { value: 'divorced', label: 'مطلقہ/طلاق یافتہ (Divorced)' }
        ]),
        columnWidth: 'full'
      },
      
      // Residence Details
      {
        fieldName: 'residenceType',
        fieldLabel: 'رہائشی تفصیلات (Residence Details)',
        fieldType: 'select',
        fieldOrder: 15,
        isRequired: true,
        options: JSON.stringify([
          { value: 'owned', label: 'ذاتی ملکیت (Own Property)' },
          { value: 'rented', label: 'کرائے دار (Rented)' },
          { value: 'other', label: 'دیگر (Other)' }
        ]),
        columnWidth: 'full'
      },
      
      // Household Details
      {
        fieldName: 'parentsLivingWith',
        fieldLabel: 'والدین ساتھ ہیں؟ (Parents Living With?)',
        fieldType: 'select',
        fieldOrder: 16,
        isRequired: false,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'third'
      },
      {
        fieldName: 'numberOfBrothers',
        fieldLabel: 'بھائی بہن (Brothers/Sisters)',
        fieldType: 'number',
        fieldOrder: 17,
        isRequired: false,
        placeholder: 'تعداد',
        columnWidth: 'third'
      },
      {
        fieldName: 'numberOfChildren',
        fieldLabel: 'بچے (Children)',
        fieldType: 'number',
        fieldOrder: 18,
        isRequired: false,
        placeholder: 'تعداد',
        columnWidth: 'third'
      },
      {
        fieldName: 'totalFamilyMembers',
        fieldLabel: 'کل فیملی ممبرز (Total Family Members)',
        fieldType: 'number',
        fieldOrder: 19,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'earningFamilyMembers',
        fieldLabel: 'کل سرپرست/ روزگار (Earning Members)',
        fieldType: 'number',
        fieldOrder: 20,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'monthlyIncome',
        fieldLabel: 'ماہانہ آمدنی (Monthly Income)',
        fieldType: 'number',
        fieldOrder: 21,
        isRequired: true,
        placeholder: 'روپے میں',
        columnWidth: 'full'
      },
      
      // Assets - Gold
      {
        fieldName: 'hasGold',
        fieldLabel: 'کیا آپ کے پاس سونا موجود ہے؟ (Do you have gold?)',
        fieldType: 'select',
        fieldOrder: 22,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'goldAmount',
        fieldLabel: 'مقدار (Amount)',
        fieldType: 'text',
        fieldOrder: 23,
        isRequired: false,
        placeholder: 'اگر ہاں تو تفصیل',
        columnWidth: 'half'
      },
      
      // Assets - Silver
      {
        fieldName: 'hasSilver',
        fieldLabel: 'کیا آپ کے پاس چاندی موجود ہے؟ (Do you have silver?)',
        fieldType: 'select',
        fieldOrder: 24,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'silverAmount',
        fieldLabel: 'مقدار (Amount)',
        fieldType: 'text',
        fieldOrder: 25,
        isRequired: false,
        columnWidth: 'half'
      },
      
      // Assets - Cash
      {
        fieldName: 'hasCash',
        fieldLabel: 'کیا آپ کے پاس نقد رقم موجود ہے؟ (Do you have cash?)',
        fieldType: 'select',
        fieldOrder: 26,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'cashAmount',
        fieldLabel: 'مقدار (Amount)',
        fieldType: 'text',
        fieldOrder: 27,
        isRequired: false,
        placeholder: 'روپے یا غیر ملکی کرنسی',
        columnWidth: 'half'
      },
      
      // Assets - Prize Bonds
      {
        fieldName: 'hasPrizeBonds',
        fieldLabel: 'کیا آپ کے پاس پرائز بانڈز/این ایس سی موجود ہے؟',
        fieldType: 'select',
        fieldOrder: 28,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'prizeBondsAmount',
        fieldLabel: 'مقدار (Amount)',
        fieldType: 'text',
        fieldOrder: 29,
        isRequired: false,
        columnWidth: 'half'
      },
      
      // Assets - Excess Items
      {
        fieldName: 'hasExcessItems',
        fieldLabel: 'ضرورت سے زائد اشیاء (Excess items beyond needs?)',
        fieldType: 'select',
        fieldOrder: 30,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'excessItemsDetails',
        fieldLabel: 'تفصیلات (Details)',
        fieldType: 'text',
        fieldOrder: 31,
        isRequired: false,
        columnWidth: 'half'
      },
      
      // Business
      {
        fieldName: 'hasBusiness',
        fieldLabel: 'کیا آپ کسی قسم کا کاروبار/تجارت کرتے ہیں؟',
        fieldType: 'select',
        fieldOrder: 32,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'businessCapital',
        fieldLabel: 'اگر کاروبار کرتے ہیں تو ذاتی سرمایہ کتنا ہے؟',
        fieldType: 'text',
        fieldOrder: 33,
        isRequired: false,
        placeholder: 'روپے میں',
        columnWidth: 'half'
      },
      
      // Loans Given
      {
        fieldName: 'hasGivenLoan',
        fieldLabel: 'کیا آپ نے کسی کو رقم بطور قرض دی ہے؟',
        fieldType: 'select',
        fieldOrder: 34,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'givenLoanRecovered',
        fieldLabel: 'کیا قرض دہندہ نے مذکورہ رقم معاف کر دی ہے؟',
        fieldType: 'select',
        fieldOrder: 35,
        isRequired: false,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      
      // Committee/Savings
      {
        fieldName: 'hasCommittee',
        fieldLabel: 'کیا آپ نے کہیں کمیٹی یا بیسی وغیرہ جمع کروائی ہے؟',
        fieldType: 'select',
        fieldOrder: 36,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'committeeAmountPending',
        fieldLabel: 'اگر کمیٹی کی رقم وصول کر لی ہے تو کتنی رقم ادا کرنی باقی ہے؟',
        fieldType: 'text',
        fieldOrder: 37,
        isRequired: false,
        columnWidth: 'half'
      },
      
      // Loans Taken
      {
        fieldName: 'hasTakenLoan',
        fieldLabel: 'کیا آپ نے کسی سے رقم بطور قرض لی ہے؟',
        fieldType: 'select',
        fieldOrder: 38,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'takenLoanForgiven',
        fieldLabel: 'کیا قرض خواہ نے مذکورہ رقم معاف کر دی ہے؟',
        fieldType: 'select',
        fieldOrder: 39,
        isRequired: false,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'half'
      },
      
      // Investments
      {
        fieldName: 'hasInvestments',
        fieldLabel: 'کیا آپ کہیں سرمایہ لگا رہے ہیں؟',
        fieldType: 'select',
        fieldOrder: 40,
        isRequired: true,
        options: JSON.stringify([
          { value: 'yes', label: 'ہاں (Yes)' },
          { value: 'no', label: 'نہیں (No)' }
        ]),
        columnWidth: 'full'
      },
      
      // Note Section
      {
        fieldName: 'noteAcknowledgement',
        fieldLabel: 'نوٹ: فارم کے ساتھ درخواست گزار کے ممبرشپ کارڈ کی کاپی ضرور منسلک کریں',
        fieldType: 'checkbox',
        fieldOrder: 41,
        isRequired: true,
        helpText: 'I acknowledge that I must attach membership card copy',
        columnWidth: 'full'
      },
      
      // Declaration - Full text from PDF
      {
        fieldName: 'declaration',
        fieldLabel: 'حلف نامہ اور اہمیت (Declaration and Importance)',
        fieldType: 'checkbox',
        fieldOrder: 42,
        isRequired: true,
        helpText: 'میں اللہ تعالیٰ کو حاضر و ناظر جان کر تصدیق کرتا/کرتی ہوں کہ میں مسلمان ہوں اور سُنڈیس نہیں ہوں اور میری ملکیت میں اتنا مال نہیں ہے جو نصاب تک پہنچتا ہو یعنی میری ملکیت میں فرضوں کو ہٹانے کے بعد نہ ساڑھے سات تولہ سونا ہے اور نہ ساڑھے باون تولہ چاندی ہے اور نہ ہی ساڑھے باون تولہ چاندی کی مالیت کے برابر نقد رقم یا سامان تجارت یا ضرورت سے زائد سامان ہے',
        columnWidth: 'full'
      },
      
      // Consent for Committee Collection
      {
        fieldName: 'zakatCommitteeConsent',
        fieldLabel: 'زکوٰۃ کمیٹی کو اجازت (Permission to Zakat Committee)',
        fieldType: 'checkbox',
        fieldOrder: 43,
        isRequired: true,
        helpText: 'میں جامع مسجد نورالہدیٰ منیم جماعت کراچی کی زکوٰۃ کمیٹی کو یا چیئرمین کو اجازت دیتا/دیتی ہوں کہ وہ میری طرف سے زکوٰۃ، صدقات وغیرہ وصول کر کے میری حسن نیت میں خرچ کریں اور میری ضروریات پر، درگر مستحق لوگوں کی ضروریات پر معالجہ، تعلیم، معاشی قیام وغیرہ میں خرچ کریں یا جامع مسجد نورالہدیٰ منیم جماعت کی ملکیت میں دے دیں',
        columnWidth: 'full'
      },
      
      // Applicant Signature Section
      {
        fieldName: 'applicantSignatureDate',
        fieldLabel: 'تاریخ (Date of Signature)',
        fieldType: 'date',
        fieldOrder: 44,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'applicantThumbSignature',
        fieldLabel: 'درخواست گزار کے دستخط/انگوٹھا (Applicant Signature/Thumb)',
        fieldType: 'text',
        fieldOrder: 45,
        isRequired: true,
        placeholder: 'نام درج کریں',
        helpText: 'Digital signature placeholder - actual signature to be collected physically',
        columnWidth: 'half'
      }
    ]
  },
  
  widow_female_assistance: {
    name: 'Widow/Female Assistance Form (بیوہ/خواتین امداد)',
    description: 'Application form for widow and female assistance - Jamia Masjid Noor-e-Huda',
    formType: 'widow_female',
    fields: [
      // This would have the same fields as zakat_application
      // Since the PDF shows it's the same form structure
      // Just with a different purpose/category
    ]
  },
  
  business_loan: {
    name: 'Business Loan Application (کاروباری قرضہ)',
    description: 'Application form for business loan assistance',
    formType: 'business_loan',
    fields: [
      {
        fieldName: 'businessName',
        fieldLabel: 'کاروبار کا نام (Business Name)',
        fieldType: 'text',
        fieldOrder: 0,
        isRequired: true,
        columnWidth: 'full'
      },
      {
        fieldName: 'ownerName',
        fieldLabel: 'مالک کا نام (Owner Name)',
        fieldType: 'text',
        fieldOrder: 1,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'cnic',
        fieldLabel: 'شناختی کارڈ نمبر (CNIC)',
        fieldType: 'text',
        fieldOrder: 2,
        isRequired: true,
        validationRule: JSON.stringify({ minLength: 13, maxLength: 15 }),
        columnWidth: 'half'
      },
      {
        fieldName: 'businessType',
        fieldLabel: 'کاروبار کی قسم (Type of Business)',
        fieldType: 'text',
        fieldOrder: 3,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'yearsInBusiness',
        fieldLabel: 'کاروبار کی مدت (Years in Business)',
        fieldType: 'number',
        fieldOrder: 4,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'loanAmount',
        fieldLabel: 'مطلوبہ قرضہ (Requested Loan Amount PKR)',
        fieldType: 'number',
        fieldOrder: 5,
        isRequired: true,
        placeholder: 'روپے میں',
        columnWidth: 'half'
      },
      {
        fieldName: 'loanPurpose',
        fieldLabel: 'قرضے کا مقصد (Purpose of Loan)',
        fieldType: 'textarea',
        fieldOrder: 6,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'monthlyRevenue',
        fieldLabel: 'ماہانہ آمدنی (Monthly Revenue PKR)',
        fieldType: 'number',
        fieldOrder: 7,
        isRequired: true,
        placeholder: 'روپے میں',
        columnWidth: 'half'
      },
      {
        fieldName: 'businessAddress',
        fieldLabel: 'کاروبار کا پتہ (Business Address)',
        fieldType: 'textarea',
        fieldOrder: 8,
        isRequired: true,
        columnWidth: 'full'
      },
      {
        fieldName: 'businessDocuments',
        fieldLabel: 'کاروباری دستاویزات (Business Documents)',
        fieldType: 'file',
        fieldOrder: 9,
        isRequired: true,
        helpText: 'رجسٹریشن، ٹیکس دستاویزات وغیرہ',
        columnWidth: 'full'
      },
      {
        fieldName: 'guarantorName',
        fieldLabel: 'ضامن کا نام (Guarantor Name)',
        fieldType: 'text',
        fieldOrder: 10,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'guarantorCNIC',
        fieldLabel: 'ضامن کا شناختی کارڈ (Guarantor CNIC)',
        fieldType: 'text',
        fieldOrder: 11,
        isRequired: false,
        columnWidth: 'half'
      }
    ]
  },
  
  membership: {
    name: 'Membership Form (ممبرشپ فارم)',
    description: 'Standard membership application form',
    formType: 'membership',
    fields: [
      {
        fieldName: 'fullName',
        fieldLabel: 'مکمل نام (Full Name)',
        fieldType: 'text',
        fieldOrder: 0,
        isRequired: true,
        columnWidth: 'full'
      },
      {
        fieldName: 'fatherName',
        fieldLabel: 'والد کا نام (Father Name)',
        fieldType: 'text',
        fieldOrder: 1,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'motherName',
        fieldLabel: 'والدہ کا نام (Mother Name)',
        fieldType: 'text',
        fieldOrder: 2,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'cnic',
        fieldLabel: 'شناختی کارڈ (CNIC)',
        fieldType: 'text',
        fieldOrder: 3,
        isRequired: true,
        validationRule: JSON.stringify({ minLength: 13, maxLength: 15 }),
        columnWidth: 'half'
      },
      {
        fieldName: 'dateOfBirth',
        fieldLabel: 'تاریخ پیدائش (Date of Birth)',
        fieldType: 'date',
        fieldOrder: 4,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'gender',
        fieldLabel: 'صنف (Gender)',
        fieldType: 'select',
        fieldOrder: 5,
        isRequired: true,
        options: JSON.stringify([
          { value: 'male', label: 'مرد (Male)' },
          { value: 'female', label: 'عورت (Female)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'maritalStatus',
        fieldLabel: 'ازدواجی حیثیت (Marital Status)',
        fieldType: 'select',
        fieldOrder: 6,
        isRequired: true,
        options: JSON.stringify([
          { value: 'single', label: 'غیر شادی شدہ (Single)' },
          { value: 'married', label: 'شادی شدہ (Married)' },
          { value: 'divorced', label: 'مطلقہ (Divorced)' },
          { value: 'widowed', label: 'بیوہ (Widowed)' }
        ]),
        columnWidth: 'half'
      },
      {
        fieldName: 'email',
        fieldLabel: 'ای میل (Email Address)',
        fieldType: 'email',
        fieldOrder: 7,
        isRequired: false,
        columnWidth: 'half'
      },
      {
        fieldName: 'phone',
        fieldLabel: 'فون نمبر (Phone Number)',
        fieldType: 'text',
        fieldOrder: 8,
        isRequired: true,
        placeholder: '03XX-XXXXXXX',
        columnWidth: 'half'
      },
      {
        fieldName: 'address',
        fieldLabel: 'ڈاک کا پتہ (Postal Address)',
        fieldType: 'textarea',
        fieldOrder: 9,
        isRequired: true,
        columnWidth: 'full'
      },
      {
        fieldName: 'occupation',
        fieldLabel: 'پیشہ (Occupation/Profession)',
        fieldType: 'text',
        fieldOrder: 10,
        isRequired: true,
        columnWidth: 'half'
      },
      {
        fieldName: 'qualification',
        fieldLabel: 'تعلیمی قابلیت (Education Qualification)',
        fieldType: 'select',
        fieldOrder: 11,
        isRequired: false,
        options: JSON.stringify([
          { value: 'primary', label: 'پرائمری (Primary)' },
          { value: 'secondary', label: 'سیکنڈری (Secondary)' },
          { value: 'intermediate', label: 'انٹرمیڈیٹ (Intermediate)' },
          { value: 'bachelor', label: 'بیچلر (Bachelor)' },
          { value: 'master', label: 'ماسٹر (Master)' },
          { value: 'phd', label: 'پی ایچ ڈی (PhD)' }
        ]),
        columnWidth: 'half'
      }
    ]
  }
};