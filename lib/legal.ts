/**
 * Legal content for StudyBench - Privacy Policy and Terms & Conditions.
 *
 * Drafted to align with Indian law: the Digital Personal Data Protection Act,
 * 2023 (DPDP Act); the Information Technology Act, 2000 and the IT (Reasonable
 * Security Practices and Procedures and Sensitive Personal Data or Information)
 * Rules, 2011; the IT (Intermediary Guidelines and Digital Media Ethics Code)
 * Rules, 2021; the Consumer Protection Act, 2019 and the Consumer Protection
 * (E-Commerce) Rules, 2020; and the Indian Contract Act, 1872.
 */

export type LegalBlock =
  | { k: "p"; text: string }
  | { k: "sub"; text: string }
  | { k: "list"; items: string[] }

export interface LegalSection {
  id: string
  heading: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  slug: "privacy" | "terms"
  title: string
  effectiveDate: string
  lastUpdated: string
  notice: string
  intro: LegalBlock[]
  sections: LegalSection[]
}

const GRIEVANCE =
  "Grievance Officer: The Founders, StudyBench - " +
  "Email: studybench07@gmail.com - " +
  "Address: Erode, Tamil Nadu - 638001, India - " +
  "Response acknowledged within 24 hours and resolved within 15 days, " +
  "in line with the IT Rules, 2021 and the DPDP Act, 2023."

// ===========================================================================
// PRIVACY POLICY
// ===========================================================================
export const PRIVACY_POLICY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  effectiveDate: "6 June 2026",
  lastUpdated: "6 June 2026",
  notice:
    "This Privacy Policy is published in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000 and the rules made thereunder. It explains how we collect, use, share, store and protect your personal data, and the rights available to you.",
  intro: [
    {
      k: "p",
      text: `StudyBench ("we", "us" or "our") collects, uses, processes, discloses and safeguards the personal data of users ("you", "your", "User" or, under the DPDP Act, the "Data Principal") who access or use the StudyBench website, web application and related services (collectively, the "Platform").`,
    },
    {
      k: "p",
      text: "For the purposes of the DPDP Act, 2023, StudyBench is the **Data Fiduciary** that determines the purpose and means of processing your personal data. By creating an account or using the Platform, you confirm that you have read and understood this Policy. If you do not agree, please do not use the Platform.",
    },
  ],
  sections: [
    {
      id: "definitions",
      heading: "1. Key Definitions",
      blocks: [
        {
          k: "list",
          items: [
            "**Personal Data** means any data about an individual who is identifiable by or in relation to such data.",
            "**Data Principal** means the individual to whom the personal data relates (you).",
            "**Data Fiduciary** means the entity that determines the purpose and means of processing (StudyBench).",
            "**Data Processor** means a person who processes personal data on behalf of a Data Fiduciary (e.g. our hosting and payment partners).",
            "**Processing** means any operation performed on personal data, including collection, storage, use, sharing and erasure.",
            "**Sensitive Personal Data or Information (SPDI)** has the meaning given under the IT Rules, 2011 (e.g. passwords and financial information).",
          ],
        },
      ],
    },
    {
      id: "what-we-collect",
      heading: "2. Information We Collect",
      blocks: [
        { k: "p", text: "We collect only the data needed to provide and improve the Platform:" },
        { k: "sub", text: "a) Account & identity data" },
        {
          k: "list",
          items: [
            "Email address and an authentication credential. Passwords are never stored in plain text - they are salted and hashed by our authentication provider (Supabase).",
            "If you choose Google Sign-In, the basic profile information Google shares (name, email and Google account identifier) under your Google consent.",
          ],
        },
        { k: "sub", text: "b) Educational profile data" },
        {
          k: "list",
          items: [
            "Name, college/institution, branch/stream and expected graduation year.",
            "Academic indicators you choose to enter, such as CGPA.",
            "Your target companies and preparation preferences.",
          ],
        },
        { k: "sub", text: "c) Usage & performance data" },
        {
          k: "list",
          items: [
            "Quiz and mock-test scores, chapter progress, your Placement Readiness Index (PRI), XP, levels, streaks, badges and topic-wise accuracy.",
            "Interactions with lessons, practice questions and daily challenges.",
          ],
        },
        { k: "sub", text: "d) Payment-related data" },
        {
          k: "list",
          items: [
            "Subscription status and transaction references for any premium purchase.",
            "**We do NOT collect or store your card number, CVV or UPI PIN.** All payments are processed on the secure, PCI-DSS-compliant infrastructure of our payment gateway (Razorpay). We receive only a payment confirmation and reference identifier.",
          ],
        },
        { k: "sub", text: "e) Technical & device data" },
        {
          k: "list",
          items: [
            "IP address, browser type, device and operating-system information, and approximate location derived from IP.",
            "Log data, session cookies and similar identifiers necessary to keep you signed in and to secure the Platform.",
          ],
        },
      ],
    },
    {
      id: "how-we-collect",
      heading: "3. How We Collect It",
      blocks: [
        {
          k: "list",
          items: [
            "**Directly from you** - when you register, complete onboarding, edit your profile, take quizzes/mocks, or contact us.",
            "**Automatically** - through cookies, log files and analytics when you use the Platform.",
            "**From third parties** - from Google (if you use Google Sign-In) and from our payment gateway (payment status only).",
          ],
        },
      ],
    },
    {
      id: "purposes",
      heading: "4. Purposes and Lawful Basis of Processing",
      blocks: [
        {
          k: "p",
          text: "We process your personal data on the basis of your **consent** and, where applicable, the **legitimate uses** permitted under Section 7 of the DPDP Act, 2023. We use your data to:",
        },
        {
          k: "list",
          items: [
            "Create and manage your account and authenticate you securely.",
            "Personalise your preparation, compute your PRI and estimated placement probability, and recommend chapters, practice and mocks.",
            "Operate gamification features (XP, levels, streaks, badges) and analytics (weakest/strongest topics).",
            "Process subscriptions and provide customer support.",
            "Maintain security, prevent fraud and abuse, and debug and improve the Platform.",
            "Send service communications and, only with your consent, product updates. You can opt out of non-essential communications at any time.",
            "Comply with applicable law and respond to lawful requests.",
          ],
        },
        {
          k: "p",
          text: "We do **not** sell your personal data, and we do **not** use your data for automated decisions that produce legal or similarly significant effects on you. Your PRI and placement probability are study aids and **estimates only**, not determinations about your employability.",
        },
      ],
    },
    {
      id: "consent",
      heading: "5. Consent and Its Withdrawal",
      blocks: [
        {
          k: "p",
          text: "Your consent is free, specific, informed, unconditional and unambiguous, given through clear affirmative action when you sign up and use specific features. You may **withdraw your consent** at any time, with the same ease with which it was given, by changing settings, emailing studybench07@gmail.com, or deleting your account from Settings.",
        },
        {
          k: "p",
          text: "Withdrawing consent will not affect the lawfulness of processing carried out before withdrawal. Some features may stop working if the underlying data can no longer be processed.",
        },
      ],
    },
    {
      id: "children",
      heading: "6. Children's and Students' Data",
      blocks: [
        {
          k: "p",
          text: "The Platform is intended for college students and job-seekers. Under Section 9 of the DPDP Act, 2023, where a User is a **child (below 18 years of age)**, we will process personal data only after obtaining **verifiable consent from a parent or lawful guardian**, and we will not undertake tracking, behavioural monitoring or targeted advertising directed at children, nor any processing likely to cause harm to a child.",
        },
        {
          k: "p",
          text: "If you are below 18, please use the Platform only with the involvement and consent of your parent or guardian. If we learn that we have collected a child's data without the required consent, we will delete it promptly.",
        },
      ],
    },
    {
      id: "cookies",
      heading: "7. Cookies and Similar Technologies",
      blocks: [
        {
          k: "p",
          text: "We use strictly necessary cookies to keep you signed in and to secure sessions, and limited functional/analytics cookies to understand and improve usage. You can control cookies through your browser settings; disabling essential cookies may break sign-in and core features.",
        },
      ],
    },
    {
      id: "sharing",
      heading: "8. How and With Whom We Share Data",
      blocks: [
        { k: "p", text: "We share personal data only as described below, and never sell it:" },
        {
          k: "list",
          items: [
            "**Data Processors / service providers** - engaged under contract to process data on our instructions, including Supabase (cloud hosting, database and authentication), Razorpay (payment processing) and our email/communication providers.",
            "**Legal and safety** - where required by law, court order, or a lawful request by a government authority, or to protect the rights, safety and property of StudyBench, our Users or the public.",
            "**Business transfers** - in connection with a merger, acquisition, restructuring or sale of assets, subject to the acquirer honouring this Policy.",
            "**With your consent** - for any other purpose disclosed to you at the time.",
          ],
        },
      ],
    },
    {
      id: "transfers",
      heading: "9. Sub-Processors and Cross-Border Transfer",
      blocks: [
        {
          k: "p",
          text: "Our infrastructure provider hosts data in a data-centre region (currently the Asia-Pacific / Mumbai region). Where any processing or storage occurs outside India, such transfer is undertaken in accordance with Section 16 of the DPDP Act, 2023 and applicable government notifications, with contractual safeguards requiring our processors to maintain confidentiality and security comparable to those described in this Policy.",
        },
      ],
    },
    {
      id: "retention",
      heading: "10. Data Retention",
      blocks: [
        {
          k: "p",
          text: "We retain personal data only for as long as necessary to fulfil the purposes set out in this Policy, to provide the Platform, and to comply with legal, tax and accounting obligations. When you delete your account, we will delete or irreversibly anonymise your personal data within a reasonable period, except where retention is required by law or for the establishment, exercise or defence of legal claims.",
        },
      ],
    },
    {
      id: "security",
      heading: "11. Security Safeguards",
      blocks: [
        {
          k: "p",
          text: "In line with Section 43A of the IT Act, 2000 and the IT Rules, 2011, and the security obligations of the DPDP Act, 2023, we implement reasonable security practices, including encryption of data in transit (HTTPS/TLS) and at rest, hashed passwords, row-level access controls so each User can access only their own records, least-privilege access for staff, and monitoring. No method of transmission or storage is perfectly secure, and we cannot guarantee absolute security; you are responsible for keeping your credentials confidential.",
        },
      ],
    },
    {
      id: "breach",
      heading: "12. Personal Data Breach Notification",
      blocks: [
        {
          k: "p",
          text: "In the event of a personal data breach, we will notify the Data Protection Board of India and affected Data Principals as required under the DPDP Act, 2023, and will comply with applicable CERT-In directions (2022) on incident reporting.",
        },
      ],
    },
    {
      id: "rights",
      heading: "13. Your Rights as a Data Principal",
      blocks: [
        { k: "p", text: "Subject to applicable law, you have the right to:" },
        {
          k: "list",
          items: [
            "**Access** a summary of the personal data we process about you and the processing activities.",
            "**Correction, completion and updating** of inaccurate or incomplete data (you can edit most fields in Settings).",
            "**Erasure** of your personal data where it is no longer required.",
            "**Withdraw consent** at any time.",
            "**Grievance redressal** - to readily raise grievances with our Grievance Officer.",
            "**Nominate** another individual to exercise your rights in the event of death or incapacity.",
          ],
        },
        {
          k: "p",
          text: "To exercise any right, email studybench07@gmail.com or contact our Grievance Officer (Section 16). We may need to verify your identity before acting on a request.",
        },
      ],
    },
    {
      id: "duties",
      heading: "14. Your Responsibilities",
      blocks: [
        {
          k: "p",
          text: "Under the DPDP Act, 2023, you agree to provide accurate and genuine information, not to impersonate another person, not to suppress material information, and not to file false or frivolous grievances. You are responsible for the data you enter (such as CGPA or college details).",
        },
      ],
    },
    {
      id: "third-party",
      heading: "15. Third-Party Links and Services",
      blocks: [
        {
          k: "p",
          text: "The Platform may reference or link to third-party websites and services (including official company career pages and educational resources). We are not responsible for the privacy practices or content of those third parties; please review their policies separately.",
        },
      ],
    },
    {
      id: "changes",
      heading: "16. Changes to This Policy",
      blocks: [
        {
          k: "p",
          text: "We may update this Policy from time to time. Material changes will be notified through the Platform or by email, and the \"Last updated\" date will be revised. Your continued use after changes take effect constitutes acceptance.",
        },
      ],
    },
    {
      id: "grievance",
      heading: "17. Grievance Officer and Contact",
      blocks: [
        {
          k: "p",
          text: "In accordance with Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021 and the DPDP Act, 2023, the details of our Grievance Officer are:",
        },
        { k: "p", text: GRIEVANCE },
        {
          k: "p",
          text: "General privacy queries: studybench07@gmail.com - General support: studybench07@gmail.com.",
        },
      ],
    },
    {
      id: "law",
      heading: "18. Governing Law and Jurisdiction",
      blocks: [
        {
          k: "p",
          text: "This Policy is governed by the laws of India. Subject to the Terms & Conditions, the courts at Erode, Tamil Nadu, India shall have jurisdiction over any dispute arising out of or relating to this Policy.",
        },
      ],
    },
  ],
}

// ===========================================================================
// TERMS & CONDITIONS
// ===========================================================================
export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  effectiveDate: "6 June 2026",
  lastUpdated: "19 June 2026",
  notice:
    "These Terms & Conditions, together with the Privacy Policy, form a legally binding agreement between you and StudyBench and constitute an \"electronic record\" under the Information Technology Act, 2000. Please read them carefully before using the Platform.",
  intro: [
    {
      k: "p",
      text: `These Terms & Conditions ("Terms") govern your access to and use of the StudyBench website, web application and services (the "Platform"). By accessing, registering on, or using the Platform, you agree to be bound by these Terms and the Privacy Policy. If you do not agree, do not use the Platform.`,
    },
  ],
  sections: [
    {
      id: "eligibility",
      heading: "1. Eligibility and Capacity",
      blocks: [
        {
          k: "p",
          text: "You must be competent to contract under Section 11 of the Indian Contract Act, 1872. If you are below 18 years of age, you may use the Platform only under the supervision and with the consent of a parent or lawful guardian, who accepts these Terms on your behalf. By using the Platform, you represent that the information you provide is true and that you are legally permitted to use the services in your jurisdiction.",
        },
      ],
    },
    {
      id: "service",
      heading: "2. The Service",
      blocks: [
        {
          k: "p",
          text: "StudyBench is an **educational and exam-preparation platform** that offers learning content, practice questions, previous-year-pattern questions, mock tests, company-wise tracks, interview and communication preparation, analytics, and a Placement Readiness Index (PRI) with an estimated placement probability. The Platform is a self-study aid; it is not a placement agency, recruiter, or employment service.",
        },
      ],
    },
    {
      id: "no-guarantee",
      heading: "3. No Guarantee of Employment or Results",
      blocks: [
        {
          k: "p",
          text: "**StudyBench does not guarantee any job, interview call, placement, examination result, score, or outcome.** The PRI, estimated placement probability, recommendations and analytics are generated from your in-app activity and are **estimates and study aids only** - they are not predictions, assurances, or representations about your actual employability or selection by any company. Selection decisions rest solely with the respective employers and depend on factors outside our control. You should not make financial or career decisions in reliance on these estimates as guarantees.",
        },
      ],
    },
    {
      id: "content-accuracy",
      heading: "4. Educational Content and Accuracy",
      blocks: [
        {
          k: "p",
          text: "We strive to provide accurate, high-quality content authored or compiled in our own words and from publicly available and licensed references. However, eligibility criteria, test patterns and company processes change frequently and vary by year, role and campus. Such information is provided on an **\"as published / last verified\"** basis for general guidance only; you must independently verify current details from the official source (e.g. the relevant company's official careers page) before relying on them.",
        },
        {
          k: "p",
          text: "All practice questions, including previous-year-style questions (\"PYQs\"), are **original practice reconstructions** written by us to mirror the publicly known style, topics and difficulty of company assessments. They are **not copies, scans, or reproductions of any actual examination paper** and do not contain any company's confidential or proprietary questions; they are provided solely for self-practice. Test patterns and durations shown for any company are indicative, based on publicly available information and our review, and may differ from a particular drive.",
        },
        {
          k: "p",
          text: "Your Placement Readiness Index (PRI) and any readiness band, score or estimated probability are computed **only from your activity within the Platform**. They are study signals to guide your preparation and are **not a prediction, assurance, or guarantee** of selection, shortlisting, or any outcome in any real recruitment process.",
        },
      ],
    },
    {
      id: "trademarks",
      heading: "5. Third-Party Names and Trademarks",
      blocks: [
        {
          k: "p",
          text: "Company names and marks referenced on the Platform - including TCS, Infosys, Wipro, Accenture, Zoho and Cognizant - are the **trademarks or registered trademarks of their respective owners**. StudyBench is an **independent** preparation platform and is **not affiliated with, authorised by, endorsed by, or sponsored by** any of these companies. Such names are used only nominatively, to identify the publicly known test patterns for which our independently created preparation material is intended. All preparation content is original and is not sourced from any company's confidential or proprietary materials.",
        },
      ],
    },
    {
      id: "accounts",
      heading: "6. Account Registration and Security",
      blocks: [
        {
          k: "list",
          items: [
            "You must provide accurate, current and complete information and keep it updated.",
            "You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.",
            "One account is for one individual; you may not share, sell, or transfer your account.",
            "Notify us immediately at studybench07@gmail.com of any unauthorised use or security breach.",
          ],
        },
      ],
    },
    {
      id: "fees",
      heading: "7. Subscriptions, Fees and Payments",
      blocks: [
        {
          k: "list",
          items: [
            "The Platform offers a free tier and an optional paid **Premium** plan (currently priced at **₹149/year**, inclusive of applicable taxes unless stated otherwise).",
            "Payments are processed by our third-party gateway (Razorpay). By purchasing, you also agree to the gateway's terms. We do not store your card or UPI credentials.",
            "Prices, features and taxes (including GST) may change prospectively; the price applicable at the time of your purchase governs that purchase.",
            "Unless expressly stated as auto-renewing at checkout, subscriptions do not auto-renew, and you will need to renew manually to continue Premium access.",
          ],
        },
      ],
    },
    {
      id: "refunds",
      heading: "8. Cancellation and Refund Policy",
      blocks: [
        {
          k: "p",
          text: "Because Premium grants immediate access to digital educational content, fees are **generally non-refundable** once access has been provided, except where required by applicable law or stated below.",
        },
        {
          k: "list",
          items: [
            "**Failed/duplicate payments:** if you are charged but Premium is not activated, or you are charged more than once for the same plan, contact studybench07@gmail.com within 7 days for verification and a full refund of the erroneous amount.",
            "**Cancellation:** you may cancel Premium at any time from Settings; cancellation stops future renewals and you retain access until the end of the paid period.",
            "Approved refunds are processed to the original payment method within a reasonable period, typically 5-10 business days, subject to the gateway's timelines.",
          ],
        },
      ],
    },
    {
      id: "licence",
      heading: "9. Licence to Use the Platform",
      blocks: [
        {
          k: "p",
          text: "Subject to these Terms, we grant you a limited, personal, non-exclusive, non-transferable, non-sublicensable and revocable licence to access and use the Platform for your own, non-commercial preparation. All rights not expressly granted are reserved.",
        },
      ],
    },
    {
      id: "acceptable-use",
      heading: "10. Acceptable Use and Prohibited Conduct",
      blocks: [
        { k: "p", text: "You agree not to, and not to attempt to:" },
        {
          k: "list",
          items: [
            "copy, scrape, harvest, reproduce, republish, resell, or commercially exploit any content from the Platform;",
            "reverse-engineer, decompile, or attempt to derive source code, or circumvent security, access controls, or paywalls;",
            "share account access, or use the Platform to cheat in or compromise any actual recruitment test or examination;",
            "upload or transmit unlawful, infringing, defamatory, obscene, or malicious content or code (consistent with Rule 3(1)(b) of the IT Rules, 2021);",
            "use bots, automated means, or excessive requests that disrupt or overload the Platform;",
            "violate any applicable law, including the Information Technology Act, 2000 (e.g. Sections 43 and 66) and intellectual-property laws.",
          ],
        },
      ],
    },
    {
      id: "ip",
      heading: "11. Intellectual Property",
      blocks: [
        {
          k: "p",
          text: "All content on the Platform - including lessons, questions, explanations, roadmaps, interview material, software, design, text, graphics, logos and the \"StudyBench\" name - is owned by or licensed to StudyBench and is protected by Indian and international intellectual-property laws. Your licence to use the Platform does not transfer any ownership. You may not use our marks without prior written permission.",
        },
      ],
    },
    {
      id: "user-content",
      heading: "12. User Content and Feedback",
      blocks: [
        {
          k: "p",
          text: "If you submit feedback, suggestions, or other content, you grant StudyBench a worldwide, royalty-free, perpetual, irrevocable licence to use it to operate and improve the Platform, without obligation to compensate you. You represent that you have the rights to submit such content.",
        },
      ],
    },
    {
      id: "third-party-services",
      heading: "13. Third-Party Services and Links",
      blocks: [
        {
          k: "p",
          text: "The Platform relies on and may link to third-party services (e.g. Supabase, Razorpay, Google) and external resources. Your use of those services is governed by their respective terms and privacy policies. We are not liable for third-party services or external content.",
        },
      ],
    },
    {
      id: "disclaimer",
      heading: "14. Disclaimers",
      blocks: [
        {
          k: "p",
          text: "The Platform and all content are provided on an **\"as is\" and \"as available\"** basis, without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, accuracy, or non-infringement. We do not warrant that the Platform will be uninterrupted, error-free, or that content is complete or current.",
        },
      ],
    },
    {
      id: "liability",
      heading: "15. Limitation of Liability",
      blocks: [
        {
          k: "p",
          text: "To the maximum extent permitted by law, StudyBench and its founders, officers, employees and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of opportunity, data, or profits, arising out of or relating to your use of the Platform. Our aggregate liability for any claim shall not exceed the total fees actually paid by you to StudyBench in the **twelve (12) months** preceding the event giving rise to the claim, or **Rs 1,000**, whichever is higher. Nothing herein limits liability that cannot be excluded under applicable law.",
        },
      ],
    },
    {
      id: "indemnity",
      heading: "16. Indemnity",
      blocks: [
        {
          k: "p",
          text: "You agree to indemnify and hold harmless StudyBench and its personnel from any claims, damages, liabilities, costs and expenses (including reasonable legal fees) arising out of your breach of these Terms, your misuse of the Platform, or your violation of any law or third-party right.",
        },
      ],
    },
    {
      id: "termination",
      heading: "17. Suspension and Termination",
      blocks: [
        {
          k: "p",
          text: "We may suspend or terminate your access, with or without notice, if you breach these Terms, misuse the Platform, or where required by law. You may stop using the Platform and delete your account at any time. Provisions that by their nature should survive termination (including IP, disclaimers, limitation of liability, indemnity and governing law) shall survive.",
        },
      ],
    },
    {
      id: "grievance",
      heading: "18. Grievance Redressal",
      blocks: [
        {
          k: "p",
          text: "Consistent with the Consumer Protection Act, 2019 and the IT Rules, 2021, complaints may be addressed to our Grievance Officer:",
        },
        { k: "p", text: GRIEVANCE },
      ],
    },
    {
      id: "changes",
      heading: "19. Changes to the Terms or Service",
      blocks: [
        {
          k: "p",
          text: "We may modify these Terms or the Platform at any time. Material changes will be notified through the Platform or by email, and the \"Last updated\" date will be revised. Continued use after the changes take effect constitutes acceptance. If you do not agree, you must stop using the Platform.",
        },
      ],
    },
    {
      id: "dispute",
      heading: "20. Governing Law and Dispute Resolution",
      blocks: [
        {
          k: "p",
          text: "These Terms are governed by the laws of India. The parties shall first attempt to resolve any dispute amicably. Failing that, the dispute shall be referred to **arbitration** by a sole arbitrator under the Arbitration and Conciliation Act, 1996; the seat and venue of arbitration shall be Erode, Tamil Nadu, India, and the proceedings shall be in English. Subject to arbitration, the courts at Erode, Tamil Nadu, India shall have exclusive jurisdiction.",
        },
      ],
    },
    {
      id: "force-majeure",
      heading: "21. Force Majeure",
      blocks: [
        {
          k: "p",
          text: "We are not liable for any failure or delay caused by events beyond our reasonable control, including acts of God, natural disasters, epidemics, war, civil unrest, government action, network or power failures, or failures of third-party services.",
        },
      ],
    },
    {
      id: "misc",
      heading: "22. Miscellaneous",
      blocks: [
        {
          k: "list",
          items: [
            "**Entire agreement:** these Terms and the Privacy Policy are the entire agreement between you and StudyBench regarding the Platform.",
            "**Severability:** if any provision is held invalid, the remaining provisions continue in effect.",
            "**Waiver:** our failure to enforce any right is not a waiver of it.",
            "**Assignment:** you may not assign these Terms; we may assign them in connection with a business transfer.",
            "**Notices:** we may give notice through the Platform or by email to your registered address.",
          ],
        },
        {
          k: "p",
          text: "Questions about these Terms may be sent to studybench07@gmail.com.",
        },
      ],
    },
  ],
}

export const LEGAL_DOCS: Record<"privacy" | "terms", LegalDoc> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS,
}
