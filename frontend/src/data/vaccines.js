
const vaccines = [
  // =====================================================
  // 1. BCG VACCINE
  // =====================================================
  {
    id: 1,
    name: "BCG Vaccine",
    fullName: "Bacillus Calmette–Guérin",
    category: "Childhood",
    purpose: "Helps protect against severe forms of tuberculosis.",
    age: "Newborns",
    icon: "🛡️",

    protection: {
      diseases: [
        "Severe childhood tuberculosis",
        "Tuberculous meningitis",
        "Miliary tuberculosis",
      ],
      howItWorks:
        "BCG is a live attenuated vaccine that helps the immune system develop protection against tuberculosis.",
      limitations:
        "Protection against tuberculosis is not complete. BCG is particularly important for protection against severe forms of childhood TB.",
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in the routine national immunisation schedule",
      eligibility:
        "Infants should receive BCG at birth or as early as possible up to one year of age, according to the national schedule.",
      schedule: [
        {
          age: "At birth",
          dose: "One dose",
          note: "If missed at birth, give as early as possible up to one year of age.",
        },
      ],
      administration: {
        route: "Intradermal",
        site: "Left upper arm",
      },
    },

    whoGuidance: {
      recommendation:
        "WHO recommends a single dose of BCG at birth in settings with a high incidence of tuberculosis.",
      targetGroups: [
        "Healthy neonates in settings where BCG vaccination is recommended",
      ],
      specialConsiderations: [
        "Recommendations may differ in countries with low tuberculosis incidence.",
        "Specific medical conditions require assessment by a qualified healthcare professional.",
      ],
    },

    safety: {
      commonSideEffects: [
        "A small local reaction can occur at the injection site.",
        "A small sore may develop and heal gradually, sometimes leaving a scar.",
      ],
      precautions: [
        "A healthcare professional should assess the infant before vaccination.",
        "The vaccine is live and requires special consideration in certain immune conditions.",
      ],
      seekMedicalAttention:
        "Contact a healthcare professional if there is an unusual or severe reaction after vaccination.",
    },

    storage: {
      information:
        "BCG vaccine requires controlled cold-chain storage and careful handling. Storage and reconstitution must follow the manufacturer's instructions and national immunisation guidelines.",
    },

    faqs: [
      {
        question: "What does BCG protect against?",
        answer:
          "BCG mainly helps protect children against severe forms of tuberculosis.",
      },
      {
        question: "When is BCG usually given in India?",
        answer:
          "It is recommended at birth or as early as possible up to one year of age under the Indian national schedule.",
      },
      {
        question: "Does BCG always leave a scar?",
        answer:
          "A scar may develop at the injection site, but its appearance can vary.",
      },
    ],

    sources: [
      {
    organization: "Press Information Bureau, Government of India",
    title: "National Immunisation Schedule",
    url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf",
  },
  {
    organization: "Ministry of Health and Family Welfare, India",
    title: "Routine Immunization Manual for Health Workers",
    url: "https://www.mohfw.gov.in/sites/default/files/Routine%20Immunization%20Manual%20For%20Health%20Workers.pdf",
  },
  {
    organization: "World Health Organization",
    title: "BCG vaccines: WHO position paper",
    url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/policies/position-papers/bcg",
  },
    ],
  },

  // =====================================================
  // 2. HEPATITIS B VACCINE
  // =====================================================
  {
    id: 2,
    name: "Hepatitis B",
    fullName: "Hepatitis B Vaccine",
    category: "Childhood",
    purpose: "Helps prevent hepatitis B virus infection.",
    age: "Newborns and other eligible age groups",
    icon: "💉",

    protection: {
      diseases: [
        "Hepatitis B virus infection",
        "Chronic hepatitis B infection",
        "Complications associated with chronic hepatitis B, including liver disease",
      ],
      howItWorks:
        "The vaccine helps the immune system produce protective antibodies against the hepatitis B virus.",
      limitations:
        "The vaccine prevents new hepatitis B infections but does not treat an existing infection.",
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in the routine national immunisation schedule",
      eligibility:
        "Infants receive a hepatitis B birth dose followed by additional protection through the pentavalent vaccine schedule.",
      schedule: [
        {
          age: "At birth",
          dose: "Hepatitis B birth dose",
          note: "As early as possible, preferably within 24 hours.",
        },
        {
          age: "6 weeks",
          dose: "Pentavalent dose 1",
          note: "Includes the hepatitis B antigen.",
        },
        {
          age: "10 weeks",
          dose: "Pentavalent dose 2",
          note: "Includes the hepatitis B antigen.",
        },
        {
          age: "14 weeks",
          dose: "Pentavalent dose 3",
          note: "Includes the hepatitis B antigen.",
        },
      ],
      administration: {
        birthDoseRoute: "Intramuscular",
        birthDoseSite: "Anterolateral side of the mid-thigh",
        pentavalentRoute: "Intramuscular",
      },
    },

    whoGuidance: {
      recommendation:
        "WHO recommends that all infants receive their first hepatitis B vaccine dose as soon as possible after birth, preferably within 24 hours.",
      targetGroups: [
        "All infants",
        "Healthcare workers",
        "People who may be at increased risk of hepatitis B exposure",
      ],
      schedule: [
        "Give the birth dose as soon as possible, preferably within 24 hours.",
        "Follow with two or three additional doses to complete the primary series.",
      ],
    },

    safety: {
      commonSideEffects: [
        "Possible reactions vary by vaccine product and recipient.",
        "Refer to the specific vaccine product information for documented adverse reactions.",
      ],
      precautions: [
        "Tell the healthcare professional about any previous severe allergic reaction to a vaccine or its ingredients.",
        "Follow the recommended schedule and advice of the healthcare professional.",
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs after vaccination.",
    },

    storage: {
      information:
        "Hepatitis B vaccines require cold-chain storage. Storage conditions must follow the specific manufacturer's instructions and government guidelines.",
    },

    faqs: [
      {
        question: "Why is the hepatitis B birth dose important?",
        answer:
          "Giving the first dose soon after birth helps protect infants against hepatitis B infection, including infection that may be transmitted from mother to child.",
      },
      {
        question: "Is the pentavalent vaccine related to hepatitis B?",
        answer:
          "Yes. The pentavalent vaccine includes protection against hepatitis B along with four other diseases.",
      },
      {
        question: "Does the hepatitis B vaccine treat an existing infection?",
        answer:
          "No. It helps prevent infection; it is not a treatment for someone who already has hepatitis B.",
      },
    ],

    sources: [
      {
    organization: "Press Information Bureau, Government of India",
    title: "National Immunisation Schedule",
    url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf",
  },
  {
    organization: "Ministry of Health and Family Welfare, India",
    title: "Routine Immunization Manual for Health Workers",
    url: "https://www.mohfw.gov.in/sites/default/files/Routine%20Immunization%20Manual%20For%20Health%20Workers.pdf",
  },
  {
    organization: "World Health Organization",
    title: "Hepatitis B vaccination recommendations",
    url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/hepatitis",
  },
  {
    organization: "World Health Organization",
    title: "Hepatitis B fact sheet",
    url: "https://www.who.int/news-room/fact-sheets/detail/hepatitis-b",
  },
    ],
  },

  // =====================================================
  // 3. INFLUENZA VACCINE
  // =====================================================
  {
    id: 3,
    name: "Influenza Vaccine",
    fullName: "Seasonal Influenza Vaccine",
    category: "Adult",
    purpose: "Helps protect against seasonal influenza.",
    age: "According to age and clinical eligibility",
    icon: "🩺",

    protection: {
      diseases: [
        "Seasonal influenza caused by influenza viruses included in the vaccine formulation",
      ],
      howItWorks:
        "The vaccine prepares the immune system to recognize influenza virus strains targeted by that season's vaccine.",
      limitations:
        "Protection depends on the match between circulating viruses and vaccine strains. Influenza vaccination does not prevent every respiratory infection.",
    },

    indiaGuidance: {
      program: "Separate from the routine UIP schedule",
      status:
        "Not listed in the routine National Immunization Schedule referenced for this project.",
      eligibility:
        "Eligibility and recommendations depend on individual risk factors, vaccine availability and advice from a qualified healthcare professional.",
      schedule: [
        {
          age: "According to clinical guidance",
          dose: "Seasonal vaccination",
          note: "The appropriate formulation and schedule depend on the recipient and product.",
        },
      ],
      administration: {
        route:
          "Depends on the licensed influenza vaccine formulation.",
        site:
          "Follow the specific product instructions and healthcare professional's guidance.",
      },
    },

    whoGuidance: {
      recommendation:
        "WHO recommends seasonal influenza vaccination programmes based on national disease burden, epidemiology and public health priorities.",
      targetGroups: [
        "Healthcare workers",
        "Older adults",
        "Pregnant individuals",
        "People with underlying medical conditions",
        "Children, depending on national priorities",
      ],
      schedule: [
        "Annual vaccination is recommended before the influenza season begins.",
        "The timing should reflect local influenza activity and national guidance.",
      ],
      specialConsiderations: [
        "Vaccine formulation and recommendations can vary between influenza seasons.",
        "The appropriate product depends on age, health status and local availability.",
      ],
    },

    safety: {
      commonSideEffects: [
        "Reactions depend on the influenza vaccine formulation.",
        "Consult the product information for the specific vaccine being used.",
      ],
      precautions: [
        "Tell the healthcare professional about previous severe allergic reactions.",
        "The appropriate formulation should be selected according to age and medical eligibility.",
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs after vaccination.",
    },

    storage: {
      information:
        "Influenza vaccines require product-specific cold-chain handling. Follow the manufacturer's storage instructions.",
    },

    faqs: [
      {
        question: "Why is influenza vaccination repeated?",
        answer:
          "Influenza viruses change over time, so seasonal vaccines are updated and vaccination is generally recommended annually.",
      },
      {
        question: "Is influenza vaccination part of India's routine UIP schedule?",
        answer:
          "It is not listed in the routine National Immunization Schedule referenced here. Separate clinical recommendations may apply.",
      },
      {
        question: "Who should discuss influenza vaccination with a doctor?",
        answer:
          "Older adults, pregnant individuals, healthcare workers and people with underlying medical conditions should discuss their eligibility with a healthcare professional.",
      },
    ],

    sources: [
      {
        organization: "World Health Organization",
        title: "Vaccines against influenza: WHO position paper, May 2022",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/policies/position-papers/influenza",
      },
      {
        organization: "World Health Organization",
        title: "WHO updated influenza vaccine recommendations",
        url: "https://www.who.int/news/item/01-06-2022-who-issues-updated-influenza-vaccines-position-paper",
      },
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "Universal Immunization Programme",
        url: "https://www.mohfw.gov.in/",
      },
    ],
  },

  // =====================================================
  // 4. HPV VACCINE
  // =====================================================
  {
    id: 4,
    name: "HPV Vaccine",
    fullName: "Human Papillomavirus Vaccine",
    category: "Adolescent",
    purpose: "Helps prevent infections from certain HPV types.",
    age: "Adolescents and other eligible groups",
    icon: "🧬",

    protection: {
      diseases: [
        "Cervical cancer caused by vaccine-covered HPV types",
        "Other HPV-associated cancers, depending on vaccine type",
        "Genital warts, depending on vaccine type",
      ],
      howItWorks:
        "HPV vaccines help the immune system develop protection against selected human papillomavirus types.",
      limitations:
        "HPV vaccines do not protect against every HPV type. Vaccination does not replace recommended cervical cancer screening.",
    },

    indiaGuidance: {
      program: "National HPV Vaccination Campaign, 2026",
      status:
        "Nationwide government vaccination campaign launched on 28 February 2026.",
      eligibility:
        "The national campaign targets eligible 14-year-old girls. Vaccination is voluntary and requires parental consent.",
      schedule: [
        {
          age: "14 years",
          dose: "One dose under the national campaign",
          note:
            "India's campaign uses the quadrivalent Gardasil-4 vaccine. Confirm current eligibility and availability with a designated government health facility.",
        },
      ],
      administration: {
        route: "Intramuscular",
        product:
          "Gardasil-4 under the national campaign",
      },
    },

    whoGuidance: {
      recommendation:
        "WHO prioritizes HPV vaccination for girls aged 9–14 years before exposure to HPV. WHO's recommendations have been updated through its 2022 position paper and subsequent SAGE review.",
      targetGroups: [
        "Girls aged 9–14 years as the primary target group",
        "Older girls and women where national policy and resources support vaccination",
        "Immunocompromised individuals require special schedule considerations",
      ],
      schedule: [
        "WHO's December 2022 position paper recommends one or two doses for girls aged 9–14.",
        "It recommends one or two doses for girls and women aged 15–20.",
        "For women older than 21, the 2022 paper recommends two doses six months apart.",
        "Immunocompromised individuals should receive at least two doses and, where feasible, three doses under the 2022 guidance.",
      ],
      specialConsiderations: [
        "WHO reported a further SAGE review in October 2026 that strengthened its recommendation for single-dose use and extended use to a wider age group, up to 30 years.",
        "An updated WHO position paper reflecting that review is expected in 2027.",
        "Follow the latest applicable national guidance and product instructions.",
      ],
    },

    safety: {
      commonSideEffects: [
        "Reactions vary by vaccine product and recipient.",
        "Consult the official product information for the vaccine being administered.",
      ],
      precautions: [
        "India's 2026 campaign requires parental consent.",
        "Medical assessment is important when there is a history of severe allergic reaction to a previous dose or a vaccine ingredient.",
        "Follow government campaign eligibility and screening instructions.",
      ],
      seekMedicalAttention:
        "Vaccination sessions should have arrangements for assessment and management of adverse events. Seek medical attention for a severe or unusual reaction.",
    },

    storage: {
      information:
        "HPV vaccines require controlled cold-chain storage. Storage and handling must follow the manufacturer's instructions and government campaign guidelines.",
    },

    faqs: [
      {
        question: "What does the HPV vaccine help prevent?",
        answer:
          "It helps prevent infections from selected HPV types that can cause cervical cancer and other HPV-related diseases.",
      },
      {
        question: "Who is eligible under India's 2026 campaign?",
        answer:
          "The nationwide campaign targets eligible 14-year-old girls. It is voluntary and requires parental consent.",
      },
      {
        question: "Does HPV vaccination replace cervical cancer screening?",
        answer:
          "No. HPV vaccination does not replace cervical cancer screening recommended by healthcare professionals.",
      },
      {
        question: "Is India's campaign schedule the same as every WHO recommendation?",
        answer:
          "No. India's campaign has its own target group and programme schedule. WHO provides broader global recommendations that may differ by age and individual circumstances.",
      },
    ],

    sources: [
      
      {
        organization: "World Health Organization (WHO)",
        title: "Vaccination Schedule for India",
        url: "https://immunizationdata.who.int/global/wiise-detail-page/vaccination-schedule-for-country_name?ISO_3_CODE=IND",
      },

      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "HPV vaccination campaign update",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2309109",
      },
      {
        organization: "World Health Organization",
        title: "Human papillomavirus vaccines: WHO position paper, December 2022",
        url: "https://www.who.int/Publications/i/item/who-wer9750-645-672",
      },
      {
        organization: "World Health Organization",
        title: "HPV vaccine recommendations and updates",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/human-papillomavirus-vaccines-%28HPV%29",
      },
    ],
    
  },

  // =====================================================
  // 5. ORAL POLIO VACCINE
  // =====================================================
  {
    id: 5,
    name: "Oral Polio Vaccine",
    fullName: "Bivalent Oral Polio Vaccine (bOPV)",
    category: "Childhood",
    purpose: "Helps protect against poliovirus infection.",
    age: "Newborns and infants",
    icon: "🦠",

    protection: {
      diseases: ["Poliomyelitis (polio)"],
      howItWorks:
        "OPV is an oral live attenuated vaccine that helps develop intestinal immunity against the poliovirus types included in the vaccine.",
      limitations:
        "OPV protects against the poliovirus types included in its formulation. It is not a treatment for existing polio infection."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Infants receive OPV doses under the national immunisation schedule.",
      schedule: [
        {
          age: "At birth",
          dose: "OPV-0",
          note: "Birth dose."
        },
        {
          age: "6 weeks",
          dose: "OPV-1",
          note: "First primary dose."
        },
        {
          age: "10 weeks",
          dose: "OPV-2",
          note: "Second primary dose."
        },
        {
          age: "14 weeks",
          dose: "OPV-3",
          note: "Third primary dose."
        },
        {
          age: "16–24 months",
          dose: "OPV Booster",
          note: "Booster dose under the national schedule."
        }
      ],
      administration: {
        route: "Oral",
        method: "Administered by mouth."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO recommends polio vaccination as part of routine childhood immunisation, using appropriate OPV and IPV schedules according to national policy.",
      targetGroups: [
        "Infants and children",
        "Children requiring catch-up vaccination according to national guidance."
      ],
      specialConsiderations: [
        "The type of OPV used depends on the national programme.",
        "OPV is a live attenuated vaccine."
      ]
    },

    safety: {
      commonSideEffects: [
        "Most children tolerate OPV well.",
        "Serious adverse events are rare."
      ],
      precautions: [
        "Inform the healthcare professional about immune system conditions.",
        "Follow the national immunisation schedule."
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs."
    },

    storage: {
      information:
        "OPV is temperature-sensitive and requires strict cold-chain storage according to government and manufacturer instructions."
    },

    faqs: [
      {
        question: "What does OPV protect against?",
        answer:
          "OPV helps protect against poliovirus, which can cause paralysis."
      },
      {
        question: "How is OPV administered?",
        answer:
          "OPV is given orally, as drops by mouth."
      },
      {
        question: "Is OPV included in India's government programme?",
        answer:
          "Yes. It is included in India's Universal Immunisation Programme."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/sites/default/files/Universal%20Immunization%20Programme.pdf"
      },
      {
        organization: "World Health Organization",
        title: "Polio vaccines and immunization",
        url: "https://www.who.int/health-topics/poliomyelitis"
      }
    ]
  },

  // =====================================================
  // 6. INACTIVATED POLIO VACCINE
  // =====================================================
  {
    id: 6,
    name: "Inactivated Polio Vaccine",
    fullName: "IPV / Fractional IPV (fIPV)",
    category: "Childhood",
    purpose: "Helps protect against poliovirus infection and paralytic polio.",
    age: "Infants and children",
    icon: "💉",

    protection: {
      diseases: ["Poliomyelitis (polio)"],
      howItWorks:
        "IPV contains inactivated poliovirus antigens that help the immune system develop protective antibodies.",
      limitations:
        "IPV does not treat an existing polio infection. The recommended schedule depends on national immunisation policy."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Infants receive fractional IPV doses as part of routine immunisation.",
      schedule: [
        {
          age: "6 weeks",
          dose: "fIPV-1",
          note: "First fractional IPV dose."
        },
        {
          age: "14 weeks",
          dose: "fIPV-2",
          note: "Second fractional IPV dose."
        }
      ],
      administration: {
        route: "Intradermal",
        site: "Right upper arm under the Indian fIPV schedule."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO recommends IPV as an important component of global polio eradication and routine immunisation strategies.",
      targetGroups: [
        "Infants and children",
        "People requiring polio vaccination according to national guidance."
      ],
      specialConsiderations: [
        "Fractional and full-dose IPV schedules differ.",
        "Follow the schedule used by the national immunisation programme."
      ]
    },

    safety: {
      commonSideEffects: [
        "Mild pain or redness at the injection site.",
        "Occasional mild fever."
      ],
      precautions: [
        "Inform the healthcare professional about previous severe allergic reactions.",
        "Use the recommended product and schedule."
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs."
    },

    storage: {
      information:
        "IPV requires controlled storage according to the manufacturer's instructions and government cold-chain guidelines."
    },

    faqs: [
      {
        question: "What is the difference between OPV and IPV?",
        answer:
          "OPV is given orally and contains live attenuated virus. IPV is an injectable vaccine containing inactivated virus."
      },
      {
        question: "What is fractional IPV?",
        answer:
          "Fractional IPV is a smaller-volume dose administered intradermally according to the national schedule."
      },
      {
        question: "Is IPV available under India's UIP?",
        answer:
          "Yes. Fractional IPV is included in India's routine childhood immunisation schedule."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/sites/default/files/Universal%20Immunization%20Programme.pdf"
      },
      {
        organization: "World Health Organization",
        title: "Polio vaccines and immunization",
        url: "https://www.who.int/health-topics/poliomyelitis"
      }
    ]
  },

  // =====================================================
  // 7. PENTAVALENT VACCINE
  // =====================================================
  {
    id: 7,
    name: "Pentavalent Vaccine",
    fullName: "DPT-HepB-Hib Combination Vaccine",
    category: "Childhood",
    purpose:
      "Helps protect against five vaccine-preventable diseases.",
    age: "Infants",
    icon: "🛡️",

    protection: {
      diseases: [
        "Diphtheria",
        "Pertussis (whooping cough)",
        "Tetanus",
        "Hepatitis B",
        "Haemophilus influenzae type b (Hib) infections"
      ],
      howItWorks:
        "Pentavalent is a combination vaccine that helps the immune system develop protection against five diseases in a single injection.",
      limitations:
        "It does not protect against every strain or cause of these diseases. It also does not replace other vaccines in the recommended schedule."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Infants receive three primary doses under the national schedule.",
      schedule: [
        {
          age: "6 weeks",
          dose: "Pentavalent-1",
          note: "First primary dose."
        },
        {
          age: "10 weeks",
          dose: "Pentavalent-2",
          note: "Second primary dose."
        },
        {
          age: "14 weeks",
          dose: "Pentavalent-3",
          note: "Third primary dose."
        }
      ],
      administration: {
        route: "Intramuscular",
        site: "Anterolateral side of the mid-thigh."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO supports the use of combination vaccines containing diphtheria, tetanus, pertussis, hepatitis B and Hib antigens as part of routine childhood immunisation.",
      targetGroups: [
        "Infants",
        "Children requiring catch-up vaccination according to national guidance."
      ],
      specialConsiderations: [
        "The combination vaccine reduces the number of separate injections.",
        "Follow the national schedule and product-specific instructions."
      ]
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site.",
        "Mild fever.",
        "Temporary irritability or discomfort."
      ],
      precautions: [
        "Inform the healthcare professional about previous severe allergic reactions.",
        "Discuss any serious reaction to a previous dose before vaccination."
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs."
    },

    storage: {
      information:
        "Pentavalent vaccine requires controlled cold-chain storage. Follow the manufacturer's instructions and national immunisation guidelines."
    },

    faqs: [
      {
        question: "Why is it called a pentavalent vaccine?",
        answer:
          "The word pentavalent refers to its protection against five diseases."
      },
      {
        question: "Which five diseases does it protect against?",
        answer:
          "It protects against diphtheria, pertussis, tetanus, hepatitis B and Hib infections."
      },
      {
        question: "When is it given in India?",
        answer:
          "The routine UIP schedule includes doses at 6, 10 and 14 weeks of age."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/sites/default/files/Universal%20Immunization%20Programme.pdf"
      },
      {
        organization: "World Health Organization",
        title: "Haemophilus influenzae type b (Hib)",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/haemophilus-influenzae-type-b"
      }
    ]
  },

  // =====================================================
  // 8. ROTAVIRUS VACCINE
  // =====================================================
  {
    id: 8,
    name: "Rotavirus Vaccine",
    fullName: "Rotavirus Oral Vaccine",
    category: "Childhood",
    purpose: "Helps prevent severe diarrhoea caused by rotavirus.",
    age: "Infants",
    icon: "💧",

    protection: {
      diseases: [
        "Rotavirus gastroenteritis",
        "Severe rotavirus-associated diarrhoea"
      ],
      howItWorks:
        "The oral vaccine stimulates the immune system to develop protection against rotavirus infection.",
      limitations:
        "It does not prevent diarrhoea caused by every other virus, bacteria or parasite."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Infants receive rotavirus vaccine doses according to the national schedule and product instructions.",
      schedule: [
        {
          age: "6 weeks",
          dose: "Dose 1",
          note: "First oral dose."
        },
        {
          age: "10 weeks",
          dose: "Dose 2",
          note: "Second oral dose."
        },
        {
          age: "14 weeks",
          dose: "Dose 3",
          note: "Third oral dose under the Indian three-dose programme."
        }
      ],
      administration: {
        route: "Oral",
        method: "Administered by mouth."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO recommends including rotavirus vaccination in national immunisation programmes to prevent severe rotavirus disease in infants.",
      targetGroups: [
        "Infants",
        "Children eligible under national immunisation guidance."
      ],
      specialConsiderations: [
        "Product-specific age limits and dose schedules must be followed.",
        "The vaccine is administered orally."
      ]
    },

    safety: {
      commonSideEffects: [
        "Mild temporary irritability.",
        "Occasional mild diarrhoea or vomiting."
      ],
      precautions: [
        "Inform the healthcare professional about previous severe allergic reactions.",
        "Discuss any history of intussusception or relevant immune conditions before vaccination."
      ],
      seekMedicalAttention:
        "Seek urgent medical advice if severe abdominal pain, repeated vomiting, blood in stools or other concerning symptoms develop after vaccination."
    },

    storage: {
      information:
        "Rotavirus vaccine storage requirements depend on the product. Follow the manufacturer's instructions and national cold-chain guidance."
    },

    faqs: [
      {
        question: "What does the rotavirus vaccine prevent?",
        answer:
          "It helps prevent severe diarrhoea caused by rotavirus, especially in infants."
      },
      {
        question: "How is the vaccine given?",
        answer:
          "It is given orally rather than by injection."
      },
      {
        question: "How many doses are given in India's UIP?",
        answer:
          "The national programme uses a three-dose schedule at 6, 10 and 14 weeks."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/"
      },
      {
        organization: "World Health Organization",
        title: "Rotavirus vaccines",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/rotavirus"
      }
    ]
  },

  // =====================================================
  // 9. PNEUMOCOCCAL CONJUGATE VACCINE
  // =====================================================
  {
    id: 9,
    name: "Pneumococcal Conjugate Vaccine",
    fullName: "PCV",
    category: "Childhood",
    purpose:
      "Helps protect against infections caused by pneumococcal bacteria.",
    age: "Infants and other eligible age groups",
    icon: "🛡️",

    protection: {
      diseases: [
        "Pneumococcal pneumonia",
        "Pneumococcal meningitis",
        "Pneumococcal bloodstream infections",
        "Other infections caused by vaccine-covered pneumococcal types"
      ],
      howItWorks:
        "PCV helps the immune system develop protection against selected strains of Streptococcus pneumoniae.",
      limitations:
        "Protection is limited to pneumococcal types included in the vaccine formulation."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Infants receive PCV according to the national immunisation schedule.",
      schedule: [
        {
          age: "6 weeks",
          dose: "PCV-1",
          note: "First primary dose."
        },
        {
          age: "14 weeks",
          dose: "PCV-2",
          note: "Second primary dose."
        },
        {
          age: "9–12 months",
          dose: "PCV Booster",
          note: "Booster dose."
        }
      ],
      administration: {
        route: "Intramuscular",
        site: "Anterolateral side of the mid-thigh."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO recommends including pneumococcal conjugate vaccines in routine childhood immunisation programmes.",
      targetGroups: [
        "Infants and young children",
        "Other age groups according to national recommendations and clinical risk."
      ],
      specialConsiderations: [
        "Different PCV products cover different pneumococcal types.",
        "Schedules depend on product and national policy."
      ]
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site.",
        "Mild fever.",
        "Temporary irritability."
      ],
      precautions: [
        "Inform the healthcare professional about previous severe allergic reactions.",
        "Discuss the appropriate product and schedule with a healthcare professional."
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs."
    },

    storage: {
      information:
        "PCV requires controlled cold-chain storage. Follow the manufacturer's instructions and government guidelines."
    },

    faqs: [
      {
        question: "What does PCV protect against?",
        answer:
          "It helps prevent serious infections caused by selected types of pneumococcal bacteria."
      },
      {
        question: "Does PCV protect against all types of pneumonia?",
        answer:
          "No. It protects against selected pneumococcal types, not every cause of pneumonia."
      },
      {
        question: "When is PCV given in India's UIP?",
        answer:
          "The routine schedule includes doses at 6 weeks, 14 weeks and a booster at 9–12 months."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/"
      },
      {
        organization: "World Health Organization",
        title: "Pneumococcal vaccines",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/pneumonia"
      }
    ]
  },

  // =====================================================
  // 10. MEASLES-RUBELLA VACCINE
  // =====================================================
  {
    id: 10,
    name: "Measles-Rubella Vaccine",
    fullName: "MR Vaccine",
    category: "Childhood",
    purpose:
      "Helps protect against measles and rubella infections.",
    age: "Infants and young children",
    icon: "🌡️",

    protection: {
      diseases: [
        "Measles",
        "Rubella",
        "Congenital rubella syndrome through prevention of rubella infection."
      ],
      howItWorks:
        "MR is a live attenuated combination vaccine that helps the immune system develop protection against measles and rubella viruses.",
      limitations:
        "It does not protect against mumps. MMR is a different combination vaccine that also covers mumps."
    },

    indiaGuidance: {
      program: "Universal Immunisation Programme (UIP)",
      status: "Included in India's routine National Immunisation Schedule.",
      eligibility:
        "Children receive MR doses under the national immunisation schedule.",
      schedule: [
        {
          age: "9–12 months",
          dose: "MR-1",
          note: "First dose."
        },
        {
          age: "16–24 months",
          dose: "MR-2",
          note: "Second dose."
        }
      ],
      administration: {
        route: "Subcutaneous",
        site: "Right upper arm under the routine schedule."
      }
    },

    whoGuidance: {
      recommendation:
        "WHO recommends two doses of measles-containing vaccine as part of routine childhood immunisation. Rubella vaccination is also recommended through national immunisation programmes.",
      targetGroups: [
        "Infants and young children",
        "Eligible children requiring catch-up vaccination."
      ],
      specialConsiderations: [
        "MR is a live attenuated vaccine.",
        "Pregnant individuals should not receive live MR vaccine.",
        "Follow medical guidance for immune conditions and other precautions."
      ]
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site.",
        "Mild fever.",
        "A mild temporary rash may occur."
      ],
      precautions: [
        "Inform the healthcare professional about immune system conditions.",
        "Tell the healthcare professional about previous severe allergic reactions.",
        "Pregnancy is a contraindication to live MR vaccination."
      ],
      seekMedicalAttention:
        "Seek medical advice if a severe or unusual reaction occurs."
    },

    storage: {
      information:
        "MR vaccine requires cold-chain storage and protection from light according to the manufacturer's instructions and national guidelines."
    },

    faqs: [
      {
        question: "What does MR stand for?",
        answer:
          "MR stands for Measles-Rubella."
      },
      {
        question: "Is MR the same as MMR?",
        answer:
          "No. MR protects against measles and rubella. MMR also includes protection against mumps."
      },
      {
        question: "When is MR given in India?",
        answer:
          "The routine UIP schedule includes doses at 9–12 months and 16–24 months."
      }
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://www.mohfw.gov.in/"
      },
      {
        organization: "World Health Organization",
        title: "Measles vaccines",
        url: "https://www.who.int/teams/immunization-vaccines-and-biologicals/diseases/measles"
      },
      {
        organization: "World Health Organization",
        title: "Rubella",
        url: "https://www.who.int/news-room/fact-sheets/detail/rubella"
      }
    ]
  },

  {
    id: 11,
    name: "DPT Booster Vaccine",
    fullName: "Diphtheria, Pertussis and Tetanus Vaccine",
    category: "Childhood",
    purpose:
      "Booster doses help maintain protection against diphtheria, whooping cough and tetanus.",
    age: "16–24 months and 5–6 years",
    icon: "💉",

    protection: {
      diseases: [
        "Diphtheria",
        "Pertussis (Whooping Cough)",
        "Tetanus",
      ],
      howItWorks:
        "The vaccine trains the immune system to recognize the bacteria or their toxins and build protective immunity.",
      limitations:
        "Protection can decrease over time, which is why booster doses are recommended. It does not guarantee complete protection.",
    },

    indiaGuidance: {
      program: "Universal Immunization Programme (UIP), India",
      status:
        "DPT booster doses are included in India's National Immunisation Schedule. The infant primary series is generally provided through the pentavalent vaccine.",
      eligibility:
        "Children eligible for the scheduled booster doses under the national immunisation programme.",
      schedule: [
        {
          age: "16–24 months",
          dose: "DPT Booster 1",
          note: "First booster dose.",
        },
        {
          age: "5–6 years",
          dose: "DPT Booster 2",
          note: "Second booster dose.",
        },
      ],
      administration:
        "Given by injection. The healthcare provider determines the appropriate product, dose and injection site.",
    },

    whoGuidance: {
      recommendation:
        "WHO recommends routine childhood immunisation against diphtheria, pertussis and tetanus, with booster doses according to national schedules.",
      targetGroups: [
        "Infants and young children",
        "Children due for booster doses",
      ],
      specialConsiderations:
        "The exact vaccine formulation and catch-up schedule may differ according to age and previous vaccination history.",
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site",
        "Mild swelling",
        "Low-grade fever",
        "Temporary irritability",
        "Tiredness",
      ],
      precautions:
        "Inform the healthcare provider about previous severe allergic reactions or serious reactions following a vaccine dose.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling, seizures or other severe reactions.",
    },

    storage: {
      information:
        "Vaccine storage must follow the manufacturer's instructions and the applicable immunisation cold-chain requirements. Do not freeze unless the specific product instructions permit it.",
    },

    faqs: [
      {
        question: "What does DPT protect against?",
        answer:
          "DPT protects against diphtheria, pertussis (whooping cough) and tetanus.",
      },
      {
        question: "When are DPT booster doses given in India?",
        answer:
          "The national schedule lists the first booster at 16–24 months and the second at 5–6 years.",
      },
      {
        question: "Is DPT the same as pentavalent vaccine?",
        answer:
          "No. Pentavalent protects against five diseases and is used for the infant primary series in the UIP. DPT booster protects against three diseases.",
      },
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf",
      },
      {
        organization: "UNICEF India",
        title: "Child Vaccination and Immunization Schedule",
        url: "https://www.unicef.org/india/know-your-childs-immunization-schedule",
      },
    ],
  },

  {
    id: 12,
    name: "Japanese Encephalitis Vaccine",
    fullName: "Japanese Encephalitis (JE) Vaccine",
    category: "Childhood",
    purpose:
      "Helps protect against Japanese encephalitis, a mosquito-borne viral infection that can cause inflammation of the brain.",
    age: "9–12 months and 16–24 months in endemic districts",
    icon: "🦟",

    protection: {
      diseases: [
        "Japanese Encephalitis",
      ],
      howItWorks:
        "The vaccine stimulates the immune system to develop protection against the Japanese encephalitis virus.",
      limitations:
        "It does not protect against other mosquito-borne infections such as dengue or malaria. It is not a substitute for mosquito-bite prevention.",
    },

    indiaGuidance: {
      program: "Universal Immunization Programme (UIP), India",
      status:
        "Provided under the national programme in Japanese encephalitis-endemic districts. Availability and eligibility depend on the district and local programme.",
      eligibility:
        "Children living in districts covered by the Japanese encephalitis vaccination programme.",
      schedule: [
        {
          age: "9–12 months",
          dose: "JE Dose 1",
          note: "First scheduled dose in endemic districts.",
        },
        {
          age: "16–24 months",
          dose: "JE Dose 2",
          note: "Second scheduled dose.",
        },
      ],
      administration:
        "Administered by injection. The route and product depend on the vaccine used in the local programme.",
    },

    whoGuidance: {
      recommendation:
        "WHO recommends Japanese encephalitis vaccination in areas where the disease is a public health priority, as part of an appropriate prevention strategy.",
      targetGroups: [
        "Children in Japanese encephalitis-endemic areas",
        "People at increased risk in affected regions",
      ],
      specialConsiderations:
        "Vaccination recommendations depend on local disease transmission, age and the vaccine used.",
    },

    safety: {
      commonSideEffects: [
        "Pain at the injection site",
        "Redness or swelling",
        "Mild fever",
        "Headache",
        "Muscle discomfort",
      ],
      precautions:
        "Inform the healthcare provider about allergies, previous vaccine reactions and any relevant medical conditions. Follow the specific product guidance.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling, seizures or other severe reactions.",
    },

    storage: {
      information:
        "Store according to the specific vaccine manufacturer's instructions and government cold-chain requirements. Do not assume all JE vaccine formulations have identical storage requirements.",
    },

    faqs: [
      {
        question: "What is Japanese encephalitis?",
        answer:
          "It is a mosquito-borne viral infection that can cause inflammation of the brain and, in severe cases, serious neurological complications.",
      },
      {
        question: "Is the JE vaccine given to every child in India?",
        answer:
          "The routine UIP schedule includes JE vaccination in endemic districts. It is not a universal routine dose for every district.",
      },
      {
        question: "Does the JE vaccine prevent dengue?",
        answer:
          "No. It protects against Japanese encephalitis, not dengue or other mosquito-borne diseases.",
      },
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf",
      },
      {
        organization: "National Centre for Vector Borne Diseases Control",
        title: "Is there a vaccine for Japanese Encephalitis?",
        url: "https://ncvbdc.mohfw.gov.in/index1.php?lang=1&level=2&lid=3759&sublinkid=5922",
      },
      {
        organization: "Press Information Bureau, India",
        title: "Steps taken for Prevention and Control of Vector-Borne Diseases",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2241081",
      },
    ],
  },

  {
    id: 13,
    name: "Td Vaccine",
    fullName: "Tetanus and Adult Diphtheria Vaccine",
    category: "Adult",
    purpose:
      "Protects against tetanus and diphtheria. It is included in India's immunisation schedule for adolescents and pregnant women.",
    age: "10 years, 16 years and during pregnancy as recommended",
    icon: "🛡️",

    protection: {
      diseases: [
        "Tetanus",
        "Diphtheria",
      ],
      howItWorks:
        "The vaccine helps the immune system develop antibodies against the toxins responsible for tetanus and diphtheria.",
      limitations:
        "It does not protect against pertussis or other infections. Additional doses may be needed according to vaccination history and medical advice.",
    },

    indiaGuidance: {
      program: "Universal Immunization Programme (UIP), India",
      status:
        "Included in India's National Immunisation Schedule for adolescents and pregnant women.",
      eligibility:
        "Adolescents due for scheduled doses and pregnant women according to their previous tetanus and diphtheria vaccination history.",
      schedule: [
        {
          age: "10 years",
          dose: "Td Dose 1",
          note: "First adolescent dose.",
        },
        {
          age: "16 years",
          dose: "Td Dose 2",
          note: "Second adolescent dose.",
        },
        {
          age: "During pregnancy",
          dose: "Td-1 and Td-2, or Td booster",
          note:
            "The number of doses depends on previous vaccination history. A booster may be given if the recommended previous doses were received within the preceding 3 years.",
        },
      ],
      administration:
        "Given by intramuscular injection. The timing and number of doses during pregnancy should be determined by a healthcare professional.",
    },

    whoGuidance: {
      recommendation:
        "WHO recommends protection against tetanus and diphtheria through age-appropriate vaccination and booster doses.",
      targetGroups: [
        "Adolescents",
        "Pregnant women",
        "People requiring vaccination or booster doses according to their history",
      ],
      specialConsiderations:
        "Pregnancy vaccination schedules and booster requirements depend on previous doses and national recommendations.",
    },

    safety: {
      commonSideEffects: [
        "Pain at the injection site",
        "Redness or swelling",
        "Mild fever",
        "Headache",
        "Tiredness",
      ],
      precautions:
        "Inform the healthcare provider about previous severe allergic reactions or serious reactions after a tetanus- or diphtheria-containing vaccine.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling, seizures or other severe reactions.",
    },

    storage: {
      information:
        "Store according to the manufacturer's instructions and applicable vaccine cold-chain requirements. Protect the vaccine from freezing.",
    },

    faqs: [
      {
        question: "What does Td stand for?",
        answer:
          "Td stands for tetanus and reduced-dose diphtheria vaccine.",
      },
      {
        question: "At what ages is Td given in India's routine schedule?",
        answer:
          "The National Immunisation Schedule lists Td at 10 years and 16 years.",
      },
      {
        question: "Is Td recommended during pregnancy?",
        answer:
          "Yes. India's schedule includes Td doses during pregnancy. The required doses depend on previous vaccination history.",
      },
      {
        question: "Is Td the same as DPT?",
        answer:
          "No. Td protects against tetanus and diphtheria, while DPT also protects against pertussis.",
      },
    ],

    sources: [
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "National Immunisation Schedule",
        url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/mar/doc2026320830601.pdf",
      },
      {
        organization: "National Health Mission, India",
        title: "National Immunization Schedule",
        url: "https://nhm.gov.in/New_Updates_2018/NHM_Components/Immunization/report/National_%20Immunization_Schedule.pdf",
      },
    ],
  },

  {
    id: 14,
    name: "MMR Vaccine",
    fullName: "Measles, Mumps and Rubella Vaccine",
    category: "Childhood",
    purpose:
      "Protects against measles, mumps and rubella, three contagious viral infections.",
    age: "9 months, 15 months and 4–6 years",
    icon: "🛡️",

    protection: {
      diseases: ["Measles", "Mumps", "Rubella"],
      howItWorks:
        "The live attenuated vaccine stimulates the immune system to develop protection against measles, mumps and rubella viruses.",
      limitations:
        "It does not protect against every illness that causes fever or rash. Protection and catch-up requirements depend on previous doses.",
    },

    indiaGuidance: {
      program: "Indian Academy of Pediatrics (IAP) recommendations",
      status:
        "MMR is recommended in India's private immunisation setting. The government UIP provides MR vaccine against measles and rubella; MR does not include protection against mumps.",
      eligibility:
        "Children following the IAP childhood immunisation schedule and individuals advised to receive catch-up vaccination.",
      schedule: [
        {
          age: "9 months",
          dose: "MMR Dose 1",
          note: "First dose in the IAP schedule.",
        },
        {
          age: "15 months",
          dose: "MMR Dose 2",
          note: "Second dose.",
        },
        {
          age: "4–6 years",
          dose: "MMR Dose 3",
          note: "Further dose in the IAP schedule.",
        },
      ],
      administration:
        "A live attenuated vaccine administered by injection. The healthcare provider should confirm the appropriate product and schedule.",
    },

    whoGuidance: {
      recommendation:
        "WHO recommends measles and rubella immunisation through appropriate national vaccination programmes. Mumps protection is included in combination vaccines such as MMR.",
      targetGroups: [
        "Children",
        "Unvaccinated individuals eligible for catch-up vaccination",
      ],
      specialConsiderations:
        "MMR is a live vaccine. It is generally not given during pregnancy or to people with certain severe immune deficiencies.",
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site",
        "Mild fever",
        "Temporary rash",
        "Swelling of glands",
        "Temporary joint discomfort",
      ],
      precautions:
        "Inform the healthcare provider about pregnancy, immune-system conditions, severe allergies and previous vaccine reactions.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling, seizures or other severe reactions.",
    },

    storage: {
      information:
        "Live MMR vaccines require product-specific cold-chain handling. Follow the manufacturer's storage and reconstitution instructions.",
    },

    faqs: [
      {
        question: "What does MMR protect against?",
        answer:
          "MMR protects against measles, mumps and rubella.",
      },
      {
        question: "Is MMR the same as MR?",
        answer:
          "No. MR protects against measles and rubella. MMR also includes protection against mumps.",
      },
      {
        question: "Is MMR part of India's routine government schedule?",
        answer:
          "The UIP provides MR vaccine. MMR is recommended in the IAP schedule and is commonly accessed through private vaccination services.",
      },
      {
        question: "How many MMR doses are recommended in the IAP schedule?",
        answer:
          "The IAP-ACVIP 2025 timetable lists doses at 9 months, 15 months and 4–6 years.",
      },
    ],

    sources: [
      {
        organization: "Indian Academy of Pediatrics",
        title: "IAP-ACVIP Recommended Immunization Schedule 2025",
        url: "https://www.indianpediatrics.net/may2026/311.pdf",
      },
      {
        organization: "Ministry of Health and Family Welfare, India",
        title: "Measles-Rubella Vaccine Operational Guidelines",
        url: "https://www.mohfw.gov.in/sites/default/files/Measles%20rubella%20vaccine%20operational%20guidelines.pdf",
      },
    ],
  },

  {
    id: 15,
    name: "Hepatitis A Vaccine",
    fullName: "Hepatitis A Virus Vaccine",
    category: "Childhood",
    purpose:
      "Helps protect against hepatitis A, a viral infection that affects the liver.",
    age: "From 12 months of age",
    icon: "🧬",

    protection: {
      diseases: ["Hepatitis A"],
      howItWorks:
        "The vaccine stimulates the immune system to produce antibodies against the hepatitis A virus.",
      limitations:
        "It protects against hepatitis A, not hepatitis B, hepatitis C or other causes of liver disease.",
    },

    indiaGuidance: {
      program: "Indian Academy of Pediatrics (IAP) recommendations",
      status:
        "Hepatitis A vaccination is recommended in the IAP childhood schedule. It is not a universal routine UIP vaccine across India.",
      eligibility:
        "Children from 12 months of age and other individuals advised vaccination by a healthcare professional.",
      schedule: [
        {
          age: "12 months or later",
          dose: "Dose 1",
          note:
            "The IAP timetable lists a single dose for live attenuated hepatitis A vaccine.",
        },
        {
          age: "18–19 months or product-specific interval",
          dose: "Dose 2, when required",
          note:
            "Inactivated vaccines require a second dose. The interval depends on the specific product; some products use a 0- and 6-month schedule.",
        },
      ],
      administration:
        "Administered by injection. The number of doses depends on whether the vaccine is live attenuated or inactivated and on the specific product.",
    },

    whoGuidance: {
      recommendation:
        "WHO recommends hepatitis A vaccination according to local disease burden, public-health priorities and national immunisation strategies.",
      targetGroups: [
        "Children in populations where vaccination is recommended",
        "People at increased risk of hepatitis A",
        "Travellers to areas with higher hepatitis A transmission",
      ],
      specialConsiderations:
        "The schedule differs between live attenuated and inactivated vaccines. Follow the product-specific recommendations.",
    },

    safety: {
      commonSideEffects: [
        "Pain at the injection site",
        "Redness or swelling",
        "Mild fever",
        "Headache",
        "Tiredness",
      ],
      precautions:
        "Inform the healthcare provider about severe allergies, previous vaccine reactions and relevant medical conditions.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling or other severe allergic reactions.",
    },

    storage: {
      information:
        "Store according to the manufacturer's instructions and the vaccine's cold-chain requirements. Do not freeze products unless specifically permitted.",
    },

    faqs: [
      {
        question: "What does the Hepatitis A vaccine prevent?",
        answer:
          "It helps prevent hepatitis A, a viral infection that affects the liver.",
      },
      {
        question: "Is Hepatitis A vaccination included in India's UIP?",
        answer:
          "It is recommended in the IAP childhood schedule but is not a universal routine vaccine in the national UIP.",
      },
      {
        question: "Does every Hepatitis A vaccine require two doses?",
        answer:
          "No. The IAP schedule lists one dose for live attenuated vaccines, while inactivated vaccines require two doses.",
      },
      {
        question: "Does it protect against Hepatitis B?",
        answer:
          "No. Hepatitis A and Hepatitis B are different infections and require different vaccines.",
      },
    ],

    sources: [
      {
        organization: "Indian Academy of Pediatrics",
        title: "IAP-ACVIP Recommended Immunization Schedule 2025",
        url: "https://www.indianpediatrics.net/may2026/311.pdf",
      },
      {
        organization: "National Centre for Disease Control, India",
        title: "Viral Hepatitis – The Silent Disease",
        url: "https://www.ncdc.gov.in/wp-content/uploads/2024/04/guideline_hep20158117187417.pdf",
      },
    ],
  },

  {
    id: 16,
    name: "Varicella Vaccine",
    fullName: "Chickenpox Vaccine",
    category: "Childhood",
    purpose:
      "Helps prevent chickenpox, a contagious viral infection that causes an itchy blister-like rash.",
    age: "15 months and 18–19 months",
    icon: "🩹",

    protection: {
      diseases: ["Chickenpox (Varicella)"],
      howItWorks:
        "The live attenuated vaccine stimulates the immune system to develop protection against the varicella-zoster virus.",
      limitations:
        "Vaccinated individuals can occasionally develop breakthrough chickenpox, although illness is generally milder.",
    },

    indiaGuidance: {
      program: "Indian Academy of Pediatrics (IAP) recommendations",
      status:
        "Varicella vaccination is recommended in the IAP childhood schedule. It is not a universal routine vaccine under India's UIP.",
      eligibility:
        "Children from the recommended age who are eligible for vaccination and do not already have evidence of immunity.",
      schedule: [
        {
          age: "15 months",
          dose: "Varicella Dose 1",
          note: "First dose in the IAP schedule.",
        },
        {
          age: "18–19 months",
          dose: "Varicella Dose 2",
          note: "Second dose in the IAP schedule.",
        },
      ],
      administration:
        "A live attenuated vaccine administered by injection. The exact interval and route should follow the selected product's instructions.",
    },

    whoGuidance: {
      recommendation:
        "Varicella vaccination may be included in national immunisation programmes where the disease is a significant public-health concern and programme conditions support it.",
      targetGroups: [
        "Children eligible for routine varicella vaccination",
        "Unvaccinated individuals without evidence of immunity, when vaccination is appropriate",
      ],
      specialConsiderations:
        "Live varicella vaccine is generally contraindicated during pregnancy and in people with certain severe immune deficiencies.",
    },

    safety: {
      commonSideEffects: [
        "Pain or redness at the injection site",
        "Mild fever",
        "Mild rash",
        "Temporary swelling",
      ],
      precautions:
        "Inform the healthcare provider about pregnancy, immune-system conditions, severe allergies and previous vaccine reactions.",
      seekMedicalAttention:
        "Seek urgent medical attention for breathing difficulty, facial or throat swelling, seizures or other severe reactions.",
    },

    storage: {
      information:
        "Varicella vaccines have specific storage requirements. Follow the manufacturer's instructions for refrigeration, reconstitution and use after reconstitution.",
    },

    faqs: [
      {
        question: "What does the Varicella vaccine prevent?",
        answer:
          "It helps prevent chickenpox, a contagious infection caused by the varicella-zoster virus.",
      },
      {
        question: "How many doses are recommended in the IAP schedule?",
        answer:
          "The IAP-ACVIP 2025 timetable lists the first dose at 15 months and the second at 18–19 months.",
      },
      {
        question: "Is the Varicella vaccine part of India's UIP?",
        answer:
          "It is recommended by the IAP but is not a universal routine vaccine under India's UIP.",
      },
      {
        question: "Can someone get chickenpox after vaccination?",
        answer:
          "Yes, breakthrough infections can occur, but illness is generally milder in vaccinated individuals.",
      },
    ],

    sources: [
      {
        organization: "Indian Academy of Pediatrics",
        title: "IAP-ACVIP Recommended Immunization Schedule 2025",
        url: "https://www.indianpediatrics.net/may2026/311.pdf",
      },
      {
        organization: "Central Drugs Standard Control Organisation, India",
        title: "Varilrix – Product Information",
        url: "https://cdsco.gov.in/opencms/resources/UploadCDSCOWeb/2018/UploadSmPC/Varicella%20Vaccine%2C%20Live%20IP.%20of%20Ms.%20GSK.pdf",
      },
    ],
  },

{
  id: 17,
  name: "Typhoid Vaccine",
  fullName: "Typhoid Conjugate Vaccine (TCV)",
  category: "Childhood",
  purpose:
    "Helps protect against typhoid fever, a bacterial infection commonly spread through contaminated food and water.",
  age: "From 6 months of age",
  icon: "💉",

  protection: {
    diseases: ["Typhoid Fever"],
    howItWorks:
      "The vaccine helps the immune system recognize the Vi antigen of Salmonella Typhi and develop protective immunity.",
    limitations:
      "It does not protect against paratyphoid fever or every cause of food- and water-borne illness. Safe food, clean water and hygiene remain important.",
  },

  indiaGuidance: {
    program: "Indian Academy of Pediatrics (IAP) recommendations",
    status:
      "Recommended in the IAP childhood immunisation schedule. Do not assume it is available at every government immunisation centre.",
    eligibility:
      "Children from 6 months of age and other individuals advised vaccination by a healthcare professional.",
    schedule: [
      {
        age: "6–9 months",
        dose: "Single dose of Typhoid Conjugate Vaccine",
        note:
          "IAP-ACVIP 2025 recommends a single TCV dose. No routine booster is recommended in this schedule.",
      },
    ],
    administration:
      "Given by injection. The exact product, age indication and dose should be confirmed by the healthcare provider.",
  },

  whoGuidance: {
    recommendation:
      "WHO recommends typhoid conjugate vaccines for use in children in typhoid-endemic countries, according to national vaccination strategies.",
    targetGroups: [
      "Children in typhoid-endemic areas",
      "People advised vaccination because of exposure risk",
    ],
    specialConsiderations:
      "Different typhoid vaccine types have different age indications and schedules. Do not apply the TCV schedule to older polysaccharide vaccine products.",
  },

  safety: {
    commonSideEffects: [
      "Pain at the injection site",
      "Mild fever",
      "Headache",
      "Tiredness",
      "Temporary discomfort",
    ],
    precautions:
      "Inform the healthcare provider about previous severe allergic reactions or reactions to a previous dose.",
    seekMedicalAttention:
      "Seek urgent medical attention for breathing difficulty, facial or throat swelling or other severe allergic reactions.",
  },

  storage: {
    information:
      "Store according to the manufacturer's instructions and applicable vaccine cold-chain requirements. Do not freeze unless the product instructions specifically permit it.",
  },

  faqs: [
    {
      question: "What does the typhoid vaccine prevent?",
      answer:
        "It helps protect against typhoid fever caused by Salmonella Typhi.",
    },
    {
      question: "At what age is TCV recommended in India?",
      answer:
        "The IAP-ACVIP 2025 schedule recommends a single dose between 6 and 9 months of age.",
    },
    {
      question: "Is a booster dose required?",
      answer:
        "The IAP-ACVIP 2025 schedule does not recommend a routine booster for TCV.",
    },
    {
      question: "Does the typhoid vaccine prevent food poisoning?",
      answer:
        "It protects against typhoid fever, not all food-borne infections. Food and water hygiene are still important.",
    },
  ],

  sources: [
    {
      organization: "Indian Academy of Pediatrics",
      title: "IAP-ACVIP Recommended Immunization Schedule 2025",
      url: "https://www.indianpediatrics.net/may2026/311.pdf",
    },
    {
      organization: "Indian Association of Preventive and Social Medicine",
      title: "Position Paper on Typhoid Vaccines for Adult Immunization in India",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11927812/",
    },
  ],
},

{
  id: 18,
  name: "Rabies Vaccine",
  fullName: "Human Rabies Vaccine",
  category: "Adult",
  purpose:
    "Helps prevent rabies. Vaccination may be given before a potential exposure or as part of urgent treatment after an animal bite or scratch.",
  age: "All ages when indicated",
  icon: "🐕",

  protection: {
    diseases: ["Rabies"],
    howItWorks:
      "The vaccine stimulates the immune system to develop antibodies against the rabies virus.",
    limitations:
      "Rabies vaccination after exposure must be combined with appropriate wound care and, for certain severe exposures, rabies immunoglobulin or monoclonal antibodies. Treatment must not be delayed.",
  },

  indiaGuidance: {
    program: "National Rabies Control Programme, India",
    status:
      "Rabies vaccination is used for both pre-exposure prevention and post-exposure prophylaxis. It is not a routine childhood immunisation dose.",
    eligibility:
      "People with animal-bite or scratch exposures requiring post-exposure prophylaxis, and people with occupational or other increased exposure risk who may need pre-exposure vaccination.",
    schedule: [
      {
        age: "After a possible exposure",
        dose: "Post-exposure prophylaxis (PEP)",
        note:
          "The Indian guidelines describe intramuscular and intradermal schedules. The treating healthcare professional must select the appropriate regimen and assess whether rabies immunoglobulin or monoclonal antibodies are needed.",
      },
      {
        age: "Before a potential exposure",
        dose: "Pre-exposure prophylaxis (PrEP)",
        note:
          "For selected high-risk groups. The national guidance describes doses on days 0, 7 and 21 or 28, depending on the route.",
      },
      {
        age: "After a new exposure in a previously vaccinated person",
        dose: "Re-exposure management",
        note:
          "A different abbreviated regimen may apply. A healthcare professional must review the previous vaccination history.",
      },
    ],
    administration:
      "Administered by an approved intramuscular or intradermal regimen. For a suspected exposure, wash the wound with soap and running water for at least 15 minutes and seek medical care immediately.",
  },

  whoGuidance: {
    recommendation:
      "WHO recommends immediate wound washing and appropriate post-exposure prophylaxis after category II and III exposures. Category III exposures may require rabies immunoglobulin or monoclonal antibodies.",
    targetGroups: [
      "People bitten or scratched by potentially rabid animals",
      "Veterinary and animal-control workers",
      "Laboratory personnel at occupational risk",
      "People with increased exposure risk in rabies-endemic areas",
    ],
    specialConsiderations:
      "Pre-exposure vaccination does not remove the need for medical assessment and post-exposure care after a bite or scratch.",
  },

  safety: {
    commonSideEffects: [
      "Pain at the injection site",
      "Redness or swelling",
      "Mild fever",
      "Headache",
      "Muscle aches",
    ],
    precautions:
      "Do not delay post-exposure treatment because of pregnancy, childhood or other medical conditions. A healthcare professional should assess the exposure and treatment.",
    seekMedicalAttention:
      "Any suspected rabies exposure requires urgent medical assessment. Seek emergency care immediately after an animal bite, scratch or saliva contact with broken skin or mucous membranes.",
  },

  storage: {
    information:
      "Rabies vaccines require product-specific cold-chain handling. Follow the manufacturer's instructions and healthcare facility protocols.",
  },

  faqs: [
    {
      question: "What should I do after a dog or animal bite?",
      answer:
        "Immediately wash the wound with soap and running water for at least 15 minutes, then seek medical attention without delay for exposure assessment and rabies prevention.",
    },
    {
      question: "Is rabies vaccination only for animal bites?",
      answer:
        "No. It can also be given before exposure to selected people with increased occupational or other exposure risks.",
    },
    {
      question: "Does a previously vaccinated person need treatment after another bite?",
      answer:
        "Yes. They still need prompt medical assessment. A different re-exposure schedule may be used depending on their previous vaccination history.",
    },
    {
      question: "Does every animal bite require rabies immunoglobulin?",
      answer:
        "No. The need depends on the exposure category and previous vaccination history. A healthcare professional must make this assessment.",
    },
  ],

  sources: [
    {
      organization: "National Centre for Disease Control, India",
      title: "National Guidelines for Rabies Prophylaxis",
      url: "https://ncdc.mohfw.gov.in/wp-content/uploads/2025/06/Rabies-Guidelines.pdf",
    },
    {
      organization: "National Rabies Control Programme, India",
      title: "Frequently Asked Questions on Rabies Prevention",
      url: "https://rabiesfreeindia.mohfw.gov.in/faq",
    },
    {
      organization: "World Health Organization",
      title: "Rabies Fact Sheet",
      url: "https://www.who.int/news-room/fact-sheets/detail/rabies",
    },
  ],
},

{
  id: 19,
  name: "Meningococcal Vaccine",
  fullName: "Meningococcal Conjugate Vaccine (MenACWY)",
  category: "Adolescent",
  purpose:
    "Helps protect against meningococcal disease, which can cause serious infections such as bacterial meningitis and bloodstream infection.",
  age: "According to age, medical risk and travel requirements",
  icon: "🧠",

  protection: {
    diseases: [
      "Meningococcal Meningitis",
      "Meningococcal Bloodstream Infection",
    ],
    howItWorks:
      "The conjugate vaccine helps the immune system develop protection against selected groups of Neisseria meningitidis bacteria, commonly A, C, W and Y.",
    limitations:
      "MenACWY does not protect against every meningococcal group, including group B. Protection depends on the vaccine formulation.",
  },

  indiaGuidance: {
    program: "Special-risk and travel-related vaccination",
    status:
      "Not part of India's universal routine childhood immunisation schedule. It may be recommended for selected high-risk people and travellers.",
    eligibility:
      "People with certain medical risk factors, people travelling to areas with specific vaccination requirements, and others advised by a healthcare professional.",
    schedule: [
      {
        age: "According to age and risk",
        dose: "Primary vaccination",
        note:
          "The number of doses depends on the product, age at first vaccination and medical risk.",
      },
      {
        age: "When ongoing risk applies",
        dose: "Booster, if indicated",
        note:
          "Booster timing depends on the vaccine product, age and reason for vaccination.",
      },
      {
        age: "Before travel to destinations with requirements",
        dose: "Travel-related vaccination",
        note:
          "For example, Saudi Arabia has meningococcal vaccination requirements for Hajj pilgrims. Check current official travel rules before departure.",
      },
    ],
    administration:
      "Usually administered by injection. A travel medicine clinic or healthcare professional should confirm the appropriate vaccine and timing.",
  },

  whoGuidance: {
    recommendation:
      "WHO supports meningococcal vaccination strategies based on local disease burden, outbreak risk and the needs of vulnerable groups.",
    targetGroups: [
      "People with certain immune-system or spleen-related conditions",
      "People with occupational exposure to meningococcal bacteria",
      "Travellers to areas with relevant vaccination requirements",
      "People included in outbreak-response vaccination programmes",
    ],
    specialConsiderations:
      "Different meningococcal vaccines protect against different bacterial groups. MenACWY and MenB are not interchangeable.",
  },

  safety: {
    commonSideEffects: [
      "Pain at the injection site",
      "Redness or swelling",
      "Mild fever",
      "Headache",
      "Muscle discomfort",
    ],
    precautions:
      "Inform the healthcare provider about allergies, previous vaccine reactions and medical conditions affecting the immune system.",
    seekMedicalAttention:
      "Seek urgent medical attention for breathing difficulty, facial or throat swelling or other severe allergic reactions.",
  },

  storage: {
    information:
      "Storage requirements depend on the specific meningococcal vaccine product. Follow the manufacturer's instructions and applicable cold-chain requirements.",
  },

  faqs: [
    {
      question: "What does the meningococcal vaccine prevent?",
      answer:
        "It helps prevent meningococcal disease, which can cause meningitis and serious bloodstream infections.",
    },
    {
      question: "Is it part of India's routine childhood immunisation programme?",
      answer:
        "No. It is generally used for selected risk groups, outbreak response and travel-related requirements.",
    },
    {
      question: "What is the difference between MenACWY and MenB?",
      answer:
        "MenACWY protects against meningococcal groups A, C, W and Y. MenB vaccines target group B.",
    },
    {
      question: "Do Hajj pilgrims need a meningococcal vaccine?",
      answer:
        "Saudi Arabia has meningococcal vaccination requirements for Hajj pilgrims. Travellers should check the current official requirements and obtain vaccination within the required timeframe.",
    },
  ],

  sources: [
    {
      organization: "World Health Organization",
      title: "Meningitis Fact Sheet",
      url: "https://www.who.int/news-room/fact-sheets/detail/meningitis",
    },
    {
      organization: "Ministry of Minority Affairs, Government of India",
      title: "Haj Policy 2025 – Meningococcal Vaccination Requirements",
      url: "https://hajcommittee.gov.in/uploads/circulars/172292446838Announcement%20of%20Haj%20Policy%202025-regarding.pdf",
    },
    {
      organization: "Indian Academy of Pediatrics",
      title: "IAP-ACVIP Recommended Immunization Schedule 2025",
      url: "https://www.indianpediatrics.net/may2026/311.pdf",
    },
  ],
},

];


export default vaccines;
