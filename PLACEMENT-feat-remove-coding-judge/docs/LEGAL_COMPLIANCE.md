# StudyBench — Legal & Compliance Notes

**Status:** Working drafts pending sign-off by a qualified advocate.
**Prepared:** 6 June 2026.

This note accompanies the **Privacy Policy** and **Terms & Conditions**. The
canonical legal text is authored once in [`lib/legal.ts`](../lib/legal.ts) and
rendered as public pages:

- **Privacy Policy** → `/privacy`
- **Terms & Conditions** → `/terms`

Keeping a single source (`lib/legal.ts`) prevents the website and any exported
copies from drifting apart. Export to PDF/print directly from the rendered pages
for the signed record.

---

## 1. Statutory framework relied upon

| Area | Statute / Rules | Where addressed |
|------|-----------------|-----------------|
| Personal data protection | **Digital Personal Data Protection Act, 2023 (DPDP Act)** | Privacy Policy §§1–18 (Data Fiduciary/Principal, consent, children, rights, transfer, breach) |
| Sensitive data & security | **IT Act, 2000 (esp. s.43A, s.72A)** + **IT (SPDI) Rules, 2011** | Privacy Policy §11 (security), §2(d) (no card storage) |
| Intermediary duties & grievance | **IT (Intermediary Guidelines & Digital Media Ethics Code) Rules, 2021** | Privacy Policy §17; Terms §§10, 18 |
| Cyber-incident reporting | **CERT-In Directions, 2022** | Privacy Policy §12 |
| Contract formation & capacity | **Indian Contract Act, 1872 (s.10, s.11)** | Terms §1 |
| Consumer protection / e-commerce | **Consumer Protection Act, 2019** + **CP (E-Commerce) Rules, 2020** | Terms §§3, 7, 8, 18 (no misleading claims, price/refund disclosure, grievance) |
| Electronic record | **IT Act, 2000 (s.4)** | Terms notice |
| Dispute resolution | **Arbitration and Conciliation Act, 1996** | Terms §20 |

## 2. Product-specific protections built in

- **No job/results guarantee** — the PRI and placement probability are framed
  throughout as *estimates and study aids*, not assurances (Terms §3; mirrors the
  in-app `PROBABILITY_DISCLAIMER`). This guards against "misleading advertisement"
  exposure under the Consumer Protection Act.
- **Trademark / no-affiliation** — TCS, Infosys, Wipro, Accenture, Zoho and
  Cognizant are identified as third-party marks; StudyBench disclaims affiliation
  or endorsement and asserts nominative use only (Terms §5). Aligns with the
  project's IP rule and the `SOURCES` registry.
- **No card data stored** — payments run on Razorpay's PCI-DSS infrastructure;
  only status + reference are received (Privacy §2(d)).
- **Children's data** — verifiable parental consent and no behavioural
  tracking/targeted ads for users under 18 (Privacy §6, DPDP s.9).
- **Data Principal rights & withdrawal** — access, correction, erasure, consent
  withdrawal, grievance and nomination (Privacy §13).

## 3. Placeholders to complete before launch (`[●]`)

1. **Operating legal entity** — exact name, type (Pvt Ltd / LLP / proprietorship),
   CIN/registration number and **registered address**.
2. **Grievance Officer** — name, email, address (currently `grievance@studybench.in`).
   Required under IT Rules 2021 r.3(2) and DPDP.
3. **Seat / jurisdiction city** for arbitration and courts (Terms §20; Privacy §18).
4. **Working contact mailboxes** — `privacy@`, `support@`, `grievance@studybench.in`.
5. Confirm the **Premium price (₹249/yr)**, GST treatment, and whether the plan
   **auto-renews** (Terms §7 currently states *non-auto-renew unless stated at checkout*).

## 4. Recommended operational steps (not yet implemented in-app)

- Appoint the Grievance Officer and publish contact details.
- Add a **cookie-consent banner** if functional/analytics cookies are used beyond
  strictly necessary ones.
- Ensure the signup flow records **affirmative consent** (the checkbox/links are
  wired on `/auth/signup`) and timestamps it.
- Review and accept **Razorpay** and **Google OAuth** developer/merchant terms;
  complete Google's OAuth consent-screen verification.
- Maintain a **data-processing record** and a list of sub-processors (Supabase,
  Razorpay, email provider) with their data-centre regions.
- Have a **qualified advocate** review and finalise both documents before go-live
  (consistent with the project's "legal sign-off before launch" constraint).

> These notes are for internal preparation and do not themselves constitute legal
> advice.


