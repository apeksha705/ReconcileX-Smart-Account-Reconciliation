export const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-1042",
    date: "2026-08-18",
    vendor: "ABC Supplies",
    category: "Office & Operations",
    amount: 12500,
    bankAmount: 12500,
    invoiceAmount: 12500,
    paymentAmount: 12500,
    reference: "INV-2048",
    status: "matched",
    confidence: 98,
    matchReasons: [
      "Exact amount matched across all 3 source documents (₹12,500)",
      "Vendor name verified: ABC Supplies Pvt Ltd",
      "Invoice date within 24h bank settlement window",
      "Invoice reference 'INV-2048' detected in bank narration"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-18",
      description: "NEFT-ABC SUPPLIES-INV-2048-HDFC000123",
      amount: 12500,
      reference: "HDFC9823412",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-17",
      invoiceNo: "INV-2048",
      vendor: "ABC Supplies",
      amount: 12500,
      gstNo: "27AAACB1234L1Z9",
      dueDate: "2026-08-25"
    },
    paymentRecord: {
      date: "2026-08-18",
      paymentRef: "PAY-882910",
      method: "NEFT Bank Transfer",
      amount: 12500,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1087",
    date: "2026-08-19",
    vendor: "Zeta Tech Solutions",
    category: "Cloud & Software",
    amount: 18500,
    bankAmount: 18500,
    invoiceAmount: 19000,
    paymentAmount: 18500,
    reference: "INV-8831",
    status: "needs_review",
    confidence: 74,
    exceptionType: "amount_mismatch",
    severity: "High",
    matchReasons: [
      "Vendor name matched with 96% string similarity",
      "Invoice reference 'INV-8831' found in payment metadata",
      "Payment date matches bank statement debit date"
    ],
    issues: [
      "Amount mismatch: Bank debit is ₹18,500 while Invoice is ₹19,000 (₹500 TDS / withholding discrepancy suspected)",
      "TDS certificate reference not found in payment remarks"
    ],
    bankRecord: {
      date: "2026-08-19",
      description: "IMPS/ZETA TECH/INV8831/RATN00021",
      amount: 18500,
      reference: "RATN29100412",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-16",
      invoiceNo: "INV-8831",
      vendor: "Zeta Tech Solutions LLP",
      amount: 19000,
      gstNo: "29AADCB4821M1Z2",
      dueDate: "2026-08-30"
    },
    paymentRecord: {
      date: "2026-08-19",
      paymentRef: "PAY-991201",
      method: "IMPS Instant",
      amount: 18500,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1092",
    date: "2026-08-20",
    vendor: "AWS Cloud India",
    category: "Cloud Infrastructure",
    amount: 45200,
    bankAmount: 45200,
    invoiceAmount: 45200,
    paymentAmount: 45200,
    reference: "AWS-IN-90812",
    status: "matched",
    confidence: 99,
    matchReasons: [
      "Exact amount matched across bank, tax invoice, and credit charge (₹45,200)",
      "GSTIN and PAN matched: 27AABCA1234F1Z8",
      "Auto-charge reference matched AWS billing account"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-20",
      description: "POS-AMAZON WEB SERVICES IN-MUMBAI",
      amount: 45200,
      reference: "POS99238411",
      account: "ICICI Corporate Card ••••9102"
    },
    invoiceRecord: {
      date: "2026-08-20",
      invoiceNo: "AWS-IN-90812",
      vendor: "AWS Cloud India Pvt Ltd",
      amount: 45200,
      gstNo: "27AABCA1234F1Z8",
      dueDate: "2026-08-20"
    },
    paymentRecord: {
      date: "2026-08-20",
      paymentRef: "PAY-AWS-4412",
      method: "Corporate Credit Card",
      amount: 45200,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1095",
    date: "2026-08-21",
    vendor: "Global Logistics Hub",
    category: "Shipping & Logistics",
    amount: 32000,
    bankAmount: 32000,
    invoiceAmount: 32000,
    paymentAmount: 32000,
    reference: "GLH-7749",
    status: "needs_review",
    confidence: 82,
    exceptionType: "date_mismatch",
    severity: "Medium",
    matchReasons: [
      "Exact amount matched (₹32,000)",
      "Vendor name and GST number verified",
      "Invoice reference matched in payment slip"
    ],
    issues: [
      "Settlement date gap: Bank debit is 6 days after the recorded invoice due date",
      "Potential delayed clearance or late payment surcharge assessment needed"
    ],
    bankRecord: {
      date: "2026-08-21",
      description: "RTGS-GLOBAL LOGISTICS HUB-GLH7749",
      amount: 32000,
      reference: "RTGS8812903",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-14",
      invoiceNo: "GLH-7749",
      vendor: "Global Logistics Hub",
      amount: 32000,
      gstNo: "33AAACG5512N1Z3",
      dueDate: "2026-08-15"
    },
    paymentRecord: {
      date: "2026-08-21",
      paymentRef: "PAY-771829",
      method: "RTGS",
      amount: 32000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1104",
    date: "2026-08-21",
    vendor: "Apex Consulting Partners",
    category: "Professional Services",
    amount: 75000,
    bankAmount: 75000,
    invoiceAmount: 0,
    paymentAmount: 75000,
    reference: "UNKNOWN-DEBIT",
    status: "unmatched",
    confidence: 32,
    exceptionType: "missing_invoice",
    severity: "High",
    matchReasons: [
      "Bank debit confirmed with recipient bank",
      "Payment gateway record exists"
    ],
    issues: [
      "Missing Invoice: No vendor tax invoice uploaded for this ₹75,000 debit",
      "High compliance risk: Expense cannot be claimed for GST input tax credit without tax invoice"
    ],
    bankRecord: {
      date: "2026-08-21",
      description: "NEFT-APEX CONSULTING PARTNERS-ADVANCE",
      amount: 75000,
      reference: "NEFT7712093",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: null,
    paymentRecord: {
      date: "2026-08-21",
      paymentRef: "PAY-993810",
      method: "NEFT",
      amount: 75000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1108",
    date: "2026-08-22",
    vendor: "Metro Office Furnishings",
    category: "Office & Operations",
    amount: 24600,
    bankAmount: 24600,
    invoiceAmount: 24600,
    paymentAmount: 24600,
    reference: "MOF-5521",
    status: "needs_review",
    confidence: 68,
    exceptionType: "vendor_mismatch",
    severity: "Medium",
    matchReasons: [
      "Exact amount matched (₹24,600)",
      "Invoice date matches payment order date",
      "Bank debit matches payment gateway transaction ID"
    ],
    issues: [
      "Vendor name difference: Bank statement says 'METRO ENTERPRISES' vs Invoice says 'METRO OFFICE FURNISHINGS PVT LTD'",
      "Fuzzy entity matching flagged a sister company trade name"
    ],
    bankRecord: {
      date: "2026-08-22",
      description: "UPI/METRO ENTERPRISES/98213712/PAY",
      amount: 24600,
      reference: "UPI2981023",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-22",
      invoiceNo: "MOF-5521",
      vendor: "Metro Office Furnishings Pvt Ltd",
      amount: 24600,
      gstNo: "27AABCM9912K1Z5",
      dueDate: "2026-08-22"
    },
    paymentRecord: {
      date: "2026-08-22",
      paymentRef: "PAY-UPI-8812",
      method: "UPI QR Code",
      amount: 24600,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1115",
    date: "2026-08-22",
    vendor: "Tata Tele Business",
    category: "Utilities & Internet",
    amount: 8850,
    bankAmount: 8850,
    invoiceAmount: 8850,
    paymentAmount: 8850,
    reference: "TTBS-AUG-26",
    status: "matched",
    confidence: 97,
    matchReasons: [
      "Exact amount matched across all 3 source documents (₹8,850)",
      "Bill account number verified against recurring telecom mandate",
      "TDS threshold exempt (<₹30k per bill)"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-22",
      description: "ACH-DEBIT-TATA TELESERVICES LTD",
      amount: 8850,
      reference: "ACH0918231",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-20",
      invoiceNo: "TTBS-AUG-26",
      vendor: "Tata Teleservices Ltd",
      amount: 8850,
      gstNo: "27AAACT2727Q1ZT",
      dueDate: "2026-08-25"
    },
    paymentRecord: {
      date: "2026-08-22",
      paymentRef: "AUTO-ACH-9912",
      method: "NACH Auto Debit",
      amount: 8850,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1120",
    date: "2026-08-23",
    vendor: "Urban Sprint Courier",
    category: "Shipping & Logistics",
    amount: 4200,
    bankAmount: 4200,
    invoiceAmount: 4200,
    paymentAmount: 4200,
    reference: "USC-9912",
    status: "matched",
    confidence: 95,
    matchReasons: [
      "Amount matches exactly (₹4,200)",
      "Invoice and Payment reference aligned",
      "UPI transaction ID linked to vendor verified VPA"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-23",
      description: "UPI-URBANSPRINT-USC9912-ICICI",
      amount: 4200,
      reference: "UPI3901239",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-23",
      invoiceNo: "USC-9912",
      vendor: "Urban Sprint Courier",
      amount: 4200,
      gstNo: "27AAACU1190R1ZQ",
      dueDate: "2026-08-23"
    },
    paymentRecord: {
      date: "2026-08-23",
      paymentRef: "PAY-UPI-3312",
      method: "UPI Instant",
      amount: 4200,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1129",
    date: "2026-08-23",
    vendor: "Google Workspace India",
    category: "Cloud & Software",
    amount: 14750,
    bankAmount: 14750,
    invoiceAmount: 14750,
    paymentAmount: 14750,
    reference: "GOOG-WS-2608",
    status: "matched",
    confidence: 98,
    matchReasons: [
      "Exact amount matched with 18% GST calculation (₹14,750)",
      "Subscription ID confirmed in bank auto-debit narration",
      "Invoice tax breakdown matches registered GST profile"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-23",
      description: "POS-GOOGLE CLOUD INDIA-GSUITE",
      amount: 14750,
      reference: "POS8812904",
      account: "ICICI Corporate Card ••••9102"
    },
    invoiceRecord: {
      date: "2026-08-23",
      invoiceNo: "GOOG-WS-2608",
      vendor: "Google Cloud India Pvt Ltd",
      amount: 14750,
      gstNo: "29AABCG0192Q1ZV",
      dueDate: "2026-08-23"
    },
    paymentRecord: {
      date: "2026-08-23",
      paymentRef: "PAY-CARD-0912",
      method: "Corporate Credit Card",
      amount: 14750,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1134",
    date: "2026-08-24",
    vendor: "Kavita Marketing Agency",
    category: "Marketing & Ads",
    amount: 50000,
    bankAmount: 50000,
    invoiceAmount: 50000,
    paymentAmount: 100000,
    reference: "KMA-AUG-01",
    status: "needs_review",
    confidence: 62,
    exceptionType: "duplicate_transaction",
    severity: "High",
    matchReasons: [
      "Invoice amount (₹50,000) and Bank debit (₹50,000) match",
      "Vendor GSTIN verified"
    ],
    issues: [
      "Duplicate Payment Alert: Two separate payment records of ₹50,000 generated for the same invoice KMA-AUG-01",
      "Payment gateway shows 2 successful transactions within 3 minutes (Potential double-charge)"
    ],
    bankRecord: {
      date: "2026-08-24",
      description: "NEFT-KAVITA MARKETING-KMAAUG01",
      amount: 50000,
      reference: "NEFT8812930",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-20",
      invoiceNo: "KMA-AUG-01",
      vendor: "Kavita Marketing Agency",
      amount: 50000,
      gstNo: "27AADCK8812J1Z1",
      dueDate: "2026-08-25"
    },
    paymentRecord: {
      date: "2026-08-24",
      paymentRef: "PAY-DUP-9912 & PAY-DUP-9913",
      method: "NEFT Transfer",
      amount: 100000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1142",
    date: "2026-08-24",
    vendor: "Swift Security Solutions",
    category: "Office & Operations",
    amount: 16800,
    bankAmount: 16800,
    invoiceAmount: 16800,
    paymentAmount: 16800,
    reference: "SSS-2026-89",
    status: "matched",
    confidence: 96,
    matchReasons: [
      "Exact amount matched across all 3 source documents (₹16,800)",
      "Vendor name and address matched on registered vendor list",
      "Bank narration includes invoice number SSS-2026-89"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-24",
      description: "IMPS-SWIFT SECURITY-SSS202689",
      amount: 16800,
      reference: "IMPS882109",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-22",
      invoiceNo: "SSS-2026-89",
      vendor: "Swift Security Solutions",
      amount: 16800,
      gstNo: "27AAACS9981K1Z4",
      dueDate: "2026-08-28"
    },
    paymentRecord: {
      date: "2026-08-24",
      paymentRef: "PAY-IMPS-0092",
      method: "IMPS Instant",
      amount: 16800,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1150",
    date: "2026-08-24",
    vendor: "Reliance Power Discom",
    category: "Utilities & Internet",
    amount: 38400,
    bankAmount: 38400,
    invoiceAmount: 38400,
    paymentAmount: 38400,
    reference: "REL-ELEC-8812",
    status: "matched",
    confidence: 99,
    matchReasons: [
      "Exact amount matched (₹38,400)",
      "Consumer Account # CA992102 verified in utility gateway",
      "Automated mandate deduction matches electricity bill"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-24",
      description: "ACH-DEBIT-RELIANCE ENERGY LTD",
      amount: 38400,
      reference: "ACH9912041",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-18",
      invoiceNo: "REL-ELEC-8812",
      vendor: "Reliance Energy Discom",
      amount: 38400,
      gstNo: "27AAACR1290L1ZO",
      dueDate: "2026-08-26"
    },
    paymentRecord: {
      date: "2026-08-24",
      paymentRef: "PAY-NACH-8819",
      method: "NACH Auto Debit",
      amount: 38400,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1156",
    date: "2026-08-25",
    vendor: "Unregistered Merchant Cash",
    category: "Miscellaneous",
    amount: 6500,
    bankAmount: 6500,
    invoiceAmount: 0,
    paymentAmount: 0,
    reference: "ATM-WDL-9912",
    status: "unmatched",
    confidence: 28,
    exceptionType: "missing_records",
    severity: "High",
    matchReasons: [
      "ATM cash withdrawal recorded on debit statement"
    ],
    issues: [
      "Missing Invoice & Missing Expense Voucher: Cash withdrawal has no supporting petty cash voucher or GST bill",
      "Requires manual expense reimbursement slip attachment"
    ],
    bankRecord: {
      date: "2026-08-25",
      description: "ATM-CASH WDL-HDFC ATM BANDRA",
      amount: 6500,
      reference: "ATM8812901",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: null,
    paymentRecord: null
  },
  {
    id: "TXN-1162",
    date: "2026-08-25",
    vendor: "DevCraft Software Tools",
    category: "Cloud & Software",
    amount: 22000,
    bankAmount: 22000,
    invoiceAmount: 22000,
    paymentAmount: 22000,
    reference: "DC-SUB-881",
    status: "matched",
    confidence: 94,
    matchReasons: [
      "Exact amount match ₹22,000",
      "Software license key ID matches invoice notes",
      "Corporate card auth code verified"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-25",
      description: "POS-DEVCRAFT SOFTWARE TOOLS-BANGALORE",
      amount: 22000,
      reference: "POS229102",
      account: "ICICI Corporate Card ••••9102"
    },
    invoiceRecord: {
      date: "2026-08-25",
      invoiceNo: "DC-SUB-881",
      vendor: "DevCraft Software Tools",
      amount: 22000,
      gstNo: "29AABCD9912E1Z8",
      dueDate: "2026-08-25"
    },
    paymentRecord: {
      date: "2026-08-25",
      paymentRef: "PAY-CC-9912",
      method: "Corporate Credit Card",
      amount: 22000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1168",
    date: "2026-08-25",
    vendor: "Prime Legal Advisors",
    category: "Professional Services",
    amount: 60000,
    bankAmount: 54000,
    invoiceAmount: 60000,
    paymentAmount: 54000,
    reference: "PLA-RET-AUG",
    status: "needs_review",
    confidence: 86,
    exceptionType: "amount_mismatch",
    severity: "Medium",
    matchReasons: [
      "10% TDS Section 194J calculation matches exactly (₹60,000 gross - ₹6,000 TDS = ₹54,000 net)",
      "Vendor name and contract ID verified",
      "Invoice reference matched in bank narration"
    ],
    issues: [
      "Net payout ₹54,000 differs from Gross invoice ₹60,000 due to 10% professional TDS deduction",
      "Requires one-click confirmation to map ₹6,000 to TDS Payable ledger"
    ],
    bankRecord: {
      date: "2026-08-25",
      description: "RTGS-PRIME LEGAL ADVISORS-NET TDS",
      amount: 54000,
      reference: "RTGS9921029",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-20",
      invoiceNo: "PLA-RET-AUG",
      vendor: "Prime Legal Advisors LLP",
      amount: 60000,
      gstNo: "27AAAFP8812R1Z3",
      dueDate: "2026-08-30"
    },
    paymentRecord: {
      date: "2026-08-25",
      paymentRef: "PAY-RTGS-8821",
      method: "RTGS Bank Transfer",
      amount: 54000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1175",
    date: "2026-08-26",
    vendor: "Swiggy For Business",
    category: "Office & Operations",
    amount: 5420,
    bankAmount: 5420,
    invoiceAmount: 5420,
    paymentAmount: 5420,
    reference: "SWIG-CORP-4821",
    status: "matched",
    confidence: 97,
    matchReasons: [
      "Exact amount matched ₹5,420",
      "Corporate meal wallet balance top-up confirmed",
      "UPI reference matches merchant settlement"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "UPI-SWIGGY BUSINESS-MUMBAI",
      amount: 5420,
      reference: "UPI8812903",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-26",
      invoiceNo: "SWIG-CORP-4821",
      vendor: "Swiggy Bundl Technologies",
      amount: 5420,
      gstNo: "29AAGCB8819Q1Z9",
      dueDate: "2026-08-26"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-UPI-99120",
      method: "UPI",
      amount: 5420,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1180",
    date: "2026-08-26",
    vendor: "InfraSpace Co-Working",
    category: "Rent & Real Estate",
    amount: 112000,
    bankAmount: 112000,
    invoiceAmount: 112000,
    paymentAmount: 112000,
    reference: "INFRA-RENT-0826",
    status: "matched",
    confidence: 99,
    matchReasons: [
      "Exact monthly rental amount matched (₹1,12,000)",
      "Lease agreement contract # L-2026-MUM verified",
      "RTGS UTR matched on bank confirmation"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "RTGS-INFRASPACE COWORKING-RENT",
      amount: 112000,
      reference: "RTGS0019283",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-22",
      invoiceNo: "INFRA-RENT-0826",
      vendor: "InfraSpace Co-Working Pvt Ltd",
      amount: 112000,
      gstNo: "27AAACI9912D1Z6",
      dueDate: "2026-08-28"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-RTGS-9912",
      method: "RTGS",
      amount: 112000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1188",
    date: "2026-08-26",
    vendor: "Zenith Cloud Hosting",
    category: "Cloud Infrastructure",
    amount: 29500,
    bankAmount: 0,
    invoiceAmount: 29500,
    paymentAmount: 29500,
    reference: "ZEN-HOST-991",
    status: "unmatched",
    confidence: 41,
    exceptionType: "missing_records",
    severity: "High",
    matchReasons: [
      "Vendor invoice and payment slip uploaded"
    ],
    issues: [
      "Missing Bank Debit: Payment of ₹29,500 made via external net banking is not appearing in the current HDFC bank statement",
      "Possible settlement lag or debited from another unlinked bank account"
    ],
    bankRecord: null,
    invoiceRecord: {
      date: "2026-08-24",
      invoiceNo: "ZEN-HOST-991",
      vendor: "Zenith Cloud Hosting India",
      amount: 29500,
      gstNo: "36AAACZ8819L1Z2",
      dueDate: "2026-08-30"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-NETB-4412",
      method: "Net Banking (SBI)",
      amount: 29500,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1192",
    date: "2026-08-26",
    vendor: "BlueDart Express Courier",
    category: "Shipping & Logistics",
    amount: 7850,
    bankAmount: 7850,
    invoiceAmount: 7850,
    paymentAmount: 7850,
    reference: "BDE-882190",
    status: "matched",
    confidence: 96,
    matchReasons: [
      "Exact amount matched ₹7,850",
      "Waybill tracking numbers match invoice line items",
      "Automated debit transaction matched corporate account"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "ACH-BLUEDART EXPRESS LTD",
      amount: 7850,
      reference: "ACH8812903",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-25",
      invoiceNo: "BDE-882190",
      vendor: "BlueDart Express Ltd",
      amount: 7850,
      gstNo: "27AAACB0081Q1Z4",
      dueDate: "2026-08-30"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-ACH-9912",
      method: "ACH Auto Debit",
      amount: 7850,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1199",
    date: "2026-08-26",
    vendor: "Airtel Enterprise Fiber",
    category: "Utilities & Internet",
    amount: 15340,
    bankAmount: 15340,
    invoiceAmount: 15340,
    paymentAmount: 15340,
    reference: "AIRTEL-FIB-89",
    status: "matched",
    confidence: 98,
    matchReasons: [
      "Exact amount match ₹15,340",
      "Dedicated leased line account ID matched",
      "Invoice and payment receipt cross-verified"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "NEFT-BHARTI AIRTEL LTD-ENTERPRISE",
      amount: 15340,
      reference: "NEFT9912048",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-24",
      invoiceNo: "AIRTEL-FIB-89",
      vendor: "Bharti Airtel Ltd",
      amount: 15340,
      gstNo: "27AAACB2894G1ZN",
      dueDate: "2026-08-31"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-NEFT-8812",
      method: "NEFT",
      amount: 15340,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1205",
    date: "2026-08-26",
    vendor: "Razorpay Software Gateway",
    category: "Payment Gateway & Fees",
    amount: 3890,
    bankAmount: 3890,
    invoiceAmount: 3890,
    paymentAmount: 3890,
    reference: "RZP-FEE-AUG26",
    status: "matched",
    confidence: 99,
    matchReasons: [
      "Monthly MDR fee invoice matches automatic settlement deduction",
      "GST input breakdown verified",
      "Merchant MID matched"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "SETTLEMENT-RAZORPAY SOFTWARE-MDR DED",
      amount: 3890,
      reference: "RZP9921029",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-26",
      invoiceNo: "RZP-FEE-AUG26",
      vendor: "Razorpay Software Pvt Ltd",
      amount: 3890,
      gstNo: "29AADCR9812N1Z7",
      dueDate: "2026-08-26"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-RZP-AUTO",
      method: "MDR Settlement Offset",
      amount: 3890,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1212",
    date: "2026-08-26",
    vendor: "Slack Technologies UK",
    category: "Cloud & Software",
    amount: 18200,
    bankAmount: 18200,
    invoiceAmount: 18200,
    paymentAmount: 18200,
    reference: "SLACK-INV-9912",
    status: "matched",
    confidence: 95,
    matchReasons: [
      "Exact amount matched with FX conversion rate (₹18,200 / $219)",
      "Subscription team ID matches billing profile",
      "Corporate credit card transaction verified"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "POS-SLACK TECHNOLOGIES-SAN FRANCISCO",
      amount: 18200,
      reference: "POS9912048",
      account: "ICICI Corporate Card ••••9102"
    },
    invoiceRecord: {
      date: "2026-08-26",
      invoiceNo: "SLACK-INV-9912",
      vendor: "Slack Technologies LLC",
      amount: 18200,
      gstNo: "9917USA29003OS8",
      dueDate: "2026-08-26"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-CC-9910",
      method: "Corporate Credit Card",
      amount: 18200,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1218",
    date: "2026-08-26",
    vendor: "Evergreen Facility Care",
    category: "Office & Operations",
    amount: 28000,
    bankAmount: 28000,
    invoiceAmount: 28000,
    paymentAmount: 28000,
    reference: "EFC-CLEAN-88",
    status: "matched",
    confidence: 96,
    matchReasons: [
      "Exact amount matched (₹28,000)",
      "Vendor GSTIN verified and active on GST Portal",
      "Cheque clearance reference matches bank record"
    ],
    issues: [],
    bankRecord: {
      date: "2026-08-26",
      description: "CTS-CHEQUE CLG-EVERGREEN FACILITY",
      amount: 28000,
      reference: "CHQ009182",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-24",
      invoiceNo: "EFC-CLEAN-88",
      vendor: "Evergreen Facility Care",
      amount: 28000,
      gstNo: "27AAACE8812L1Z9",
      dueDate: "2026-08-28"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-CHQ-009182",
      method: "Bank Cheque Clearance",
      amount: 28000,
      status: "SUCCESS"
    }
  },
  {
    id: "TXN-1224",
    date: "2026-08-26",
    vendor: "Kolkata Printing Press",
    category: "Marketing & Print",
    amount: 13500,
    bankAmount: 13500,
    invoiceAmount: 13500,
    paymentAmount: 13500,
    reference: "KPP-CATALOG-26",
    status: "needs_review",
    confidence: 79,
    exceptionType: "vendor_mismatch",
    severity: "Low",
    matchReasons: [
      "Amount ₹13,500 matches exactly",
      "Catalog printing description found in invoice remarks",
      "Date matches within 1 day"
    ],
    issues: [
      "Vendor trading name 'KOLKATA OFFSET PRINTERS' registered under proprietor 'RAJESH SEN'",
      "Requires one-time alias confirmation"
    ],
    bankRecord: {
      date: "2026-08-26",
      description: "IMPS-RAJESH SEN-PRINTING",
      amount: 13500,
      reference: "IMPS881290",
      account: "HDFC Current A/C ••••4829"
    },
    invoiceRecord: {
      date: "2026-08-25",
      invoiceNo: "KPP-CATALOG-26",
      vendor: "Kolkata Printing Press",
      amount: 13500,
      gstNo: "19AADFS8812N1Z4",
      dueDate: "2026-08-28"
    },
    paymentRecord: {
      date: "2026-08-26",
      paymentRef: "PAY-IMPS-8812",
      method: "IMPS",
      amount: 13500,
      status: "SUCCESS"
    }
  }
];

export const SAMPLE_FILES = {
  bankStatement: {
    name: "HDFC_Current_Account_Stmt_Aug2026.csv",
    size: "248 KB",
    rows: 1248,
    type: "Bank Statement (HDFC Bank)",
    dateRange: "01 Aug 2026 - 26 Aug 2026"
  },
  invoices: {
    name: "Vendor_Tax_Invoices_Q3_Batch.csv",
    size: "412 KB",
    rows: 1195,
    type: "Vendor Invoices (GST Compliant)",
    dateRange: "01 Aug 2026 - 26 Aug 2026"
  },
  payments: {
    name: "Payouts_Gateway_Records_Aug2026.csv",
    size: "189 KB",
    rows: 1230,
    type: "Payment Gateway & NEFT Ledger",
    dateRange: "01 Aug 2026 - 26 Aug 2026"
  }
};

export const INITIAL_HISTORY = [
  {
    id: "BATCH-2026-0826-01",
    name: "August 2026 Q3 Primary Run",
    date: "2026-08-26T21:30:00.000Z",
    period: "01 Aug 2026 - 26 Aug 2026",
    status: "Completed",
    totalTransactions: 1248,
    matched: 1043,
    needsReview: 127,
    unmatched: 78,
    matchRate: 94.2,
    totalAmount: 589250,
    matchedAmount: 520000,
    reviewAmount: 42500,
    unmatchedAmount: 26750,
    executionTime: "4.2s",
    initiatedBy: "Ananya Deshmukh (Head of Finance)",
    files: [
      "HDFC_Current_Account_Stmt_Aug2026.csv",
      "Vendor_Tax_Invoices_Q3_Batch.csv",
      "Payouts_Gateway_Records_Aug2026.csv"
    ],
    notes: "3-Way automated correlation completed with 7-stage engine. 127 exceptions isolated for TDS & alias approval."
  },
  {
    id: "BATCH-2026-0815-02",
    name: "Mid-August 2026 Interim Audit",
    date: "2026-08-15T18:15:00.000Z",
    period: "01 Aug 2026 - 15 Aug 2026",
    status: "Audit Complete",
    totalTransactions: 640,
    matched: 611,
    needsReview: 19,
    unmatched: 10,
    matchRate: 95.5,
    totalAmount: 312400,
    matchedAmount: 298300,
    reviewAmount: 9600,
    unmatchedAmount: 4500,
    executionTime: "3.1s",
    initiatedBy: "Ananya Deshmukh (Head of Finance)",
    files: [
      "HDFC_Statement_MidAug26.csv",
      "GST_Invoices_Batch_A.csv",
      "Razorpay_Payouts_MidAug.csv"
    ],
    notes: "Fortnightly interim reconciliation verified before statutory GST advance payment."
  },
  {
    id: "BATCH-2026-0731-01",
    name: "July 2026 Full Monthly Reconciliation",
    date: "2026-07-31T20:45:00.000Z",
    period: "01 Jul 2026 - 31 Jul 2026",
    status: "Audit Complete",
    totalTransactions: 1180,
    matched: 1097,
    needsReview: 58,
    unmatched: 25,
    matchRate: 93.0,
    totalAmount: 544800,
    matchedAmount: 506664,
    reviewAmount: 26800,
    unmatchedAmount: 11336,
    executionTime: "5.4s",
    initiatedBy: "Ananya Deshmukh (Head of Finance)",
    files: [
      "HDFC_Statement_Jul2026.csv",
      "Vendor_Invoices_Jul2026.xlsx",
      "Gateway_Settlement_Jul2026.csv"
    ],
    notes: "All 58 exceptions resolved manually. GSTR-2B ITC claim reconciled and locked."
  },
  {
    id: "BATCH-2026-0630-01",
    name: "June 2026 Full Monthly Reconciliation",
    date: "2026-06-30T19:20:00.000Z",
    period: "01 Jun 2026 - 30 Jun 2026",
    status: "Audit Complete",
    totalTransactions: 1040,
    matched: 948,
    needsReview: 62,
    unmatched: 30,
    matchRate: 91.2,
    totalAmount: 492100,
    matchedAmount: 448795,
    reviewAmount: 29500,
    unmatchedAmount: 13805,
    executionTime: "4.8s",
    initiatedBy: "Ananya Deshmukh (Head of Finance)",
    files: [
      "HDFC_Statement_Jun2026.csv",
      "Vendor_Invoices_Jun2026.csv",
      "Payouts_Ledger_Jun2026.csv"
    ],
    notes: "Q1 FY27 closing batch reconciled. Approved by Statutory Auditor."
  },
  {
    id: "BATCH-2026-0531-01",
    name: "May 2026 Opening Cycle",
    date: "2026-05-31T17:00:00.000Z",
    period: "01 May 2026 - 31 May 2026",
    status: "Archived",
    totalTransactions: 890,
    matched: 787,
    needsReview: 71,
    unmatched: 32,
    matchRate: 88.4,
    totalAmount: 410000,
    matchedAmount: 362440,
    reviewAmount: 32500,
    unmatchedAmount: 15060,
    executionTime: "3.9s",
    initiatedBy: "Ananya Deshmukh (Head of Finance)",
    files: [
      "HDFC_Statement_May2026.csv",
      "Vendor_Invoices_May2026.csv",
      "Bank_Transfers_May2026.csv"
    ],
    notes: "Initial deployment baseline run. Reconciled with legacy accounting ledger."
  }
];

