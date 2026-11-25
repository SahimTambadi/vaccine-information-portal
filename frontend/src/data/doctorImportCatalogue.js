
const BHATE_SOURCE =
  "https://bhatemultispecialityhospitalbelagavi.com/doctors";

const LAKEVIEW_SOURCE =
  "https://lakeviewhospitals.in/doctors/";

const BHATE_LOCATION = {
  hospital_name: "Bhate Hospital",
  address: "Dr B R Ambedkar Road, Belagavi, Karnataka 590002, India",
  locality: "Dr B R Ambedkar Road",
  city: "Belagavi",
  state: "Karnataka",
  pincode: "590002",
};

const LAKEVIEW_LOCATION = {
  hospital_name: "BHS Lakeview Hospitals",
  address:
    "R.S No. 73/7, Gokak Road, opposite Fort Lake, Gandhi Nagar, Belagavi, Karnataka 590016, India",
  locality: "Gandhi Nagar",
  city: "Belagavi",
  state: "Karnataka",
  pincode: "590016",
};

const bhateDoctors = [
  ["Dr. Shoaib Mulla", "Anesthetist"],
  ["Dr. Sajid Nadaf", "Anesthetist"],
  ["Dr. Abhijeet Hiremath", "Cardiologist"],
  ["Dr. Santosh Honnavar", "Chest Physician"],
  ["Dr. Pradeep Goudar", "Consulting Doctor"],
  ["Dr. Virupaxi Hattiholi", "Consulting Doctor"],
  ["Dr. Bhavana Doshi", "Dermatologist"],
  ["Dr. Shivkumar Patil", "Dermatologist"],
  ["Dr. Chaitanya Khemalapure", "ENT"],
  ["Dr. Vanishree Ganakumar", "Endocrinologist"],
  ["Dr. Anand Totagi", "Gastroenterology"],
  ["Dr. Sudarshan Chougule", "Gastro Surgery"],
  ["Dr. Ganesh Koppad", "Gastroenterologist"],
  ["Dr. Akshay Gokak", "General Surgeon"],
  ["Dr. Sudhir Bhat", "General Surgeon"],
  ["Dr. Shruti Goudar", "Gynaecologist"],
  ["Dr. Sunil Udigeri", "Haematologist"],
  ["Dr. S G Bhate", "Medicine"],
  ["Dr. Amit S Bhate", "Medicine"],
  ["Dr. Vijaykumar Patil", "Nephrologist"],
  ["Dr. Sanjeev R T", "Neurosurgeon"],
  ["Dr. Sooraj Patil", "Neurologist"],
  ["Dr. Milind Shetty", "Oncologist"],
  ["Dr. Siddarth Pujari", "Ophthalmologist"],
  ["Dr. Azhar Amin", "Orthopaedic"],
  ["Dr. Moionoddin Nadaf", "Orthopaedic"],
  ["Dr. Abhineet Samant", "Pediatrician"],
  ["Dr. Kaustub Desai", "Plastic Surgeon"],
  ["Dr. Vishwas Yadawad", "Psychiatrist"],
  ["Dr. Archana Uppin", "Rheumatologist"],
  ["Dr. Goutam Taralekar", "Spine Surgeon"],
  ["Dr. Anand Khatavi", "Spine Surgeon"],
  ["Dr. Amit Katti", "Urologist"],
  ["Dr. Amey Pathade", "Urologist"],
  ["Dr. Shivappa Anushetru", "Vascular Surgeon"],
];

const lakeviewDoctors = [
  {
    full_name: "Dr Girish K. Sonwalkar",
    specialization: "Internal Medicine",
    qualifications: "MD (Gen Med)",
    experience_years: 22,
  },
  {
    full_name: "Surg Cdr (Dr.) Ravikumar N Hiremath",
    specialization: "Internal Medicine",
    qualifications: "MBBS, MD, DNB, MNAMS",
    experience_years: 6,
  },
  {
    full_name: "Dr. Raviraj Ghorpade",
    specialization: "Neurosurgery",
    qualifications: "MBBS, M.Ch (NIMHANS)",
    experience_years: 18,
  },
  {
    full_name: "Dr. Vishwanath G Uppaladinni",
    specialization: "Neurosurgery",
    qualifications: "MS, M.Ch (Neurosurgeon)",
    experience_years: 10,
  },
  {
    full_name: "Dr. Basavaraj F Patil",
    specialization: "Orthopedics",
    qualifications: "DOrtho, DNB, MNAMS",
    experience_years: 25,
  },
  {
    full_name: "Dr. Anilkumar B Patil",
    specialization: "Orthopedics",
    qualifications: "DOrtho, DNB, MNAMS",
    experience_years: 24,
  },
  {
    full_name: "Dr. Kirtyraya S Mane",
    specialization: "Orthopedics & Spine",
    qualifications: "D.Ortho, MS Ortho",
    experience_years: 15,
  },
  {
    full_name: "Dr. Ravi B Patil",
    specialization: "Gastroenterology",
    qualifications: "MS, FAMS (AUS)(USA), FSGEI",
    experience_years: 36,
  },
  {
    full_name: "Dr. Pradeep G Vagarali",
    specialization: "Gastroenterology",
    qualifications: "MS (Gen Surgeon)",
    experience_years: null,
  },
  {
    full_name: "Dr. Shashikant Y Kulgod",
    specialization: "Gastroenterology",
    qualifications: "MS, FRCS(Ed), FRCS (Glasg)",
    experience_years: 29,
  },
  {
    full_name: "Dr. Chidanand Chavan",
    specialization: "Radiology",
    qualifications: "MD (Radiology)",
    experience_years: 9,
  },
  {
    full_name: "Dr. Sanjay Hosalli",
    specialization: "Radiology",
    qualifications: "DMRD, DNB (Radiology)",
    experience_years: 17,
  },
  {
    full_name: "Dr. Mallikarjun Halabhavi",
    specialization: "Critical Care",
    qualifications: "DA, PGDHS, FICM",
    experience_years: 23,
  },
  {
    full_name: "Dr. Veeranna Bevinagidad",
    specialization: "Critical Care",
    qualifications: "MD (Anae)",
    experience_years: 31,
  },
  {
    full_name: "Dr. Sanjeevkumar Durdi",
    specialization: "Critical Care",
    qualifications: "Anaesthesia (DA)",
    experience_years: null,
  },
  {
    full_name: "Dr. Mahantesh Todakar",
    specialization: "Urology",
    qualifications: "MS (Gen), M.Ch (Urology)",
    experience_years: 10,
  },
  {
    full_name: "Dr. Anjaney Yadur",
    specialization: "Nephrology",
    qualifications: "MBBS, DNB (Int Med), DNB (Nephrology)",
    experience_years: 2,
  },
  {
    full_name: "Dr. Jayashree B Patil",
    specialization: "Obstetrics & Gynaecology",
    qualifications: "MBBS, DGO, PGT (ART)",
    experience_years: 23,
  },
  {
    full_name: "Dr. Geeta Durdi",
    specialization: "Obstetrics & Gynaecology",
    qualifications: "MD, FICOG",
    experience_years: 21,
  },
  {
    full_name: "Dr. Vijayalakshmi S Kulgod",
    specialization: "Pediatrics",
    qualifications: "MD, MRCPCH",
    experience_years: null,
  },
  {
    full_name: "Dr. Sharad V Shresti",
    specialization: "Pediatrics",
    qualifications: "MD (Paed), IDCCM",
    experience_years: 8,
  },
  {
    full_name: "Dr. Arun Dhumale",
    specialization: "Pediatrics",
    qualifications: "MD, DCH (Paed)",
    experience_years: 14,
  },
  {
    full_name: "Dr. Govind P Hanchinamani",
    specialization: "Physiotherapy",
    qualifications: "MPT",
    experience_years: 15,
  },
  {
    full_name: "Dr. Kaustubh Desai",
    specialization: "Plastic Surgery",
    qualifications: "MS, M.Ch (Plastic Surgery)",
    experience_years: 10,
  },
  {
    full_name: "Dr. Shruti V S",
    specialization: "ENT",
    qualifications: "MBBS, MS (ENT & HNS)",
    experience_years: null,
  },
  {
    full_name: "Dr. Amruta Shreshti",
    specialization: "Dermatology",
    qualifications: "MD (Dermatology)",
    experience_years: null,
  },
  {
    full_name: "Dr. Rahul Desai",
    specialization: "Critical Care",
    qualifications: null,
    experience_years: 15,
  },
];

export const DOCTOR_IMPORT_CATALOGUE = [
  ...bhateDoctors.map(([full_name, specialization]) => ({
    full_name,
    specialization,
    qualifications: null,
    experience_years: null,
    source_name: "Bhate Hospital",
    source_type: "Hospital",
    source_title: "Our Doctors",
    source_url: BHATE_SOURCE,
    location: BHATE_LOCATION,
  })),

  ...lakeviewDoctors.map((doctor) => ({
    ...doctor,
    source_name: "BHS Lakeview Hospitals",
    source_type: "Hospital",
    source_title: "Our Expert Medical Team",
    source_url: LAKEVIEW_SOURCE,
    location: LAKEVIEW_LOCATION,
  })),
];
