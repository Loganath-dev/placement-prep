# Product Requirements Document — StudyBench

> A multi-company campus-placement platform. A student prepares for **several companies at once**, sees an honest **Placement Readiness Index (PRI)** and an **estimated Placement Probability** for each, and works toward one outcome: getting placed in the company they want.

---

## 1. Document control

| Field | Value |
|---|---|
| Product | StudyBench |
| Document type | Product Requirements Document (PRD) |
| Version | **3.0** (corrected, web-first MVP) |
| Status | Draft for build |
| Owner | CEO / Product |
| Date | 05 June 2026 |
| Platforms | **Web (Phase 1 — primary)** → Android (Phase 2) → iOS (future) |
| Pricing | Free tier + Premium ₹149/year (Razorpay) |
| UI direction | **Light & modern** — learning-blue primary on near-white surfaces; emerald = readiness, amber = streak/XP |

### Revision history
| Version | Date | Notes |
|---|---|---|
| 1.0 | 05 Jun 2026 | Initial full draft (single target company) |
| 2.0 | 05 Jun 2026 | Multi-company model; PRS → **PRI**; scope cuts; Communication added to all tracks; web-first then Android |
| **3.0** | **05 Jun 2026** | **Onboarding: removed Age. Sections: merged Communication + Interview → 6 sections. Added Placement Probability (clearly labelled estimate). Analytics: added Weakest/Strongest topics. Confirmed MVP track set (TCS, Infosys, Wipro, Accenture, Zoho, Cognizant + General). Light/modern UI.** |

---

## 2. Vision and positioning

### 2.1 Vision
Every engineering student in India deserves an affordable, structured path to their dream placement. Success is measured by one thing: **students getting placed in the company they want.**

### 2.2 The differentiator — multi-company readiness
Students sit for 4–6 companies, not one. StudyBench is built around **parallel multi-company preparation**, giving each company an honest, separate **Placement Readiness Index (PRI)** and an **estimated Placement Probability**:

```
Overall Readiness: 72/100
  Company     PRI    Est. Placement Probability*
  TCS          85         78%
  Infosys      70         58%
  Wipro        65         50%
  Accenture    60         44%
  Cognizant    55         38%
  Zoho         35         18%
  * Estimate only — based on your in-app performance, not a guarantee.
```

No competitor presents "how ready am I, and how likely am I, for each of my companies" in one honest view. **Placement Probability is a potentially viral hook** and must always be visibly labelled as an estimate.

---

## 3. Goals, non-goals, success metrics

### 3.1 Business goals
1. Acquire and retain students preparing for multiple companies.
2. Convert free users to ₹149/year Premium.
3. Win on **content quality** and an honest, marketable **PRI + Placement Probability**.

### 3.2 Non-goals (out of scope for MVP)
Bulk/institutional licensing · AI features (AI mocks, adaptive learning, AI doubt-solving) · Certificates/badges that are *shareable* · **Leaderboards (removed)** · Success-stories module · **Resume Builder (removed)** · **Weekly sprint & timed challenges (removed)** · Community/job board · Native iOS at launch.

### 3.3 Success metrics
**North Star:** **PRI progress** — median improvement in a student's PRI per active week, aggregated across selected companies.

| Category | Metric | Target (first 90 days) |
|---|---|---|
| Activation | Signups completing onboarding + first quiz | ≥ 60% |
| Habit | D1 / D7 / D30 retention | 35% / 18% / 8% |
| Engagement | Daily-challenge completion (active users) | ≥ 40% |
| Multi-company | Avg. companies actively prepared per user | ≥ 2.5 |
| Monetization | Free → Premium conversion | ≥ 4% |
| Quality | In-lesson positive feedback ratio | ≥ 95% |
| Outcome (lagging) | Self-reported placements | Track from drive season |

---

## 4. Personas
- **Explorer (1st/2nd year):** unsure of company/role → uses **Placement Foundation** track, then gets recommended companies.
- **Targeter (pre-final year):** preparing for several companies in parallel → multi-company tracking is core.
- **Crammer (final year):** drive imminent → needs PYQs, patterns, eligibility, mocks fast, across companies.

---

## 5. Scope — MVP (web)

1. Email + password and Google sign-in.
2. Onboarding: multi-select interested companies + choose a primary. **(No Age field.)**
3. **Home dashboard** — all 7 tracks; primary company in focus; other companies summarized with PRI + Placement Probability.
4. **7 tracks:** TCS, Infosys, Wipro, Cognizant, Accenture, Zoho, **Placement Foundation**.
5. **6 sections per track** (see §9.4) — Communication & Interview is now one merged section.
6. Learning flow with the ≥70% chapter-unlock gate (with skip).
7. **Multi-company progress tracking** — independent progress, PRI, Placement Probability, quiz history, mock results per company.
8. **Company switcher** (Home + Settings) — change primary anytime; progress preserved per company.
9. **PRI** per company + **Overall Readiness** + **estimated Placement Probability** per company.
10. **PYQs** per company.
11. **Company eligibility cards** (CGPA, backlogs, sectional cutoffs, test pattern, "last verified").
12. **Challenges:** Daily Challenge (General / Aptitude / Coding) + streak milestones.
13. **Gamification:** XP, levels, daily streak, in-app milestone badges. (No leaderboards.)
14. **Mock tests** (company-pattern) + final interview-round quiz.
15. **Analytics** page — per-company progress **+ Weakest Topics + Strongest Topics**.
16. Free vs Premium gating + ads on free tier.
17. **Razorpay** payment (₹149/year).
18. **Referral program** — share referral link; when one referred friend becomes paid Premium, referrer gets one free Premium month once per account.
19. **Settings** — target companies (primary + interested), account, notifications, subscription.

---

## 6. Assumptions & constraints
- **Free tier:** unlocks the **first chapter of each section** per track; rest is Premium. *(O-1.)*
- **Web-first**, fully mobile-responsive at launch; Android next; iOS later.
- Content for live tracks must pass the quality bar before going live (content is the critical path — §13).
- Razorpay merchant account + ad SDK + legal/IP sign-off required.

---

## 7. Product principles
1. **Outcome over engagement** — features must move a student toward a placement.
2. **Honest signal** — PRI and Placement Probability never flatter; skipping content does not raise them.
3. **Multi-company by default** — every core surface assumes several target companies.
4. **Lean MVP** — smallest set that proves conversion and retention.
5. **Mobile-first responsive web**, light & modern.

---

## 8. Information architecture

```
StudyBench
├── Auth (sign up / sign in / reset)
├── Onboarding (profile → multi-select companies → set primary)   [NO Age]
├── Home dashboard
│   ├── Primary company focus (PRI ring, Placement Probability, continue learning, section progress)
│   ├── Daily Challenge (General · Aptitude · Coding)
│   ├── Other companies (PRI + Placement Probability, tap to switch)
│   └── All tracks grid (6 companies + General)
├── Learn → Track → Section → Chapter → Lesson → Chapter Quiz
├── Practice → PYQs (per company) + topic sets
├── Challenges → Daily Challenge + Streak milestones
├── Mock tests → company-pattern mocks + final interview-round quiz
├── Readiness → Overall + per-company PRI + Placement Probability + recommendations
├── Analytics → progress per company + Weakest/Strongest topics
├── Profile (XP, level, streak, badges)
└── Settings → Target companies, account, notifications, subscription
```

---

## 9. Functional requirements

### 9.1 Authentication
Email + password; Google OAuth; password reset; secure sessions; email verification before first paid action.

### 9.2 Onboarding (multi-company)
- **FR-9.2.1** Capture: **Name, College, Branch, Graduation Year, CGPA, Active backlogs.** *(Age removed — not useful for placement recommendations.)*
- **FR-9.2.2** "Which companies are you interested in?" — multi-select from TCS, Infosys, Wipro, Cognizant, Accenture, Zoho.
- **FR-9.2.3** Choose a **primary** company from the selected set (Home focus). If none chosen, default to first selected.
- **FR-9.2.4** If graduation year = 1st/2nd year, recommend **Placement Foundation** (user may still select companies).
- **FR-9.2.5** Initialize independent PRI = 0 and Placement Probability for each selected company.

### 9.3 Home dashboard
- **FR-9.3.1** Show **all 7 tracks** (6 companies + General); open any to start preparing.
- **FR-9.3.2** **Primary company in focus:** PRI ring (e.g., "TCS PRI 68/100"), **estimated Placement Probability**, a **Continue Learning** card, and **section progress bars**.
- **FR-9.3.3** **Daily Challenge** card with three categories: **General, Aptitude, Coding.**
- **FR-9.3.4** **Other Companies** widget — other interested companies with PRI + Placement Probability; tap to switch primary focus.
- **FR-9.3.5** Free users see an upgrade banner.
- **FR-9.3.6** Surface a single best "next action."

### 9.4 Tracks and sections
- **FR-9.4.1** **7 tracks:** TCS, Infosys, Wipro, Accenture, Zoho, Cognizant + **Placement Foundation**.
- **FR-9.4.2** **6 sections per track** (merged structure; content varies by company):
  1. Quantitative Aptitude
  2. Logical Reasoning
  3. Verbal Ability
  4. Coding & DSA
  5. CS Core (DBMS / OS / CN / OOP)
  6. **Communication & Interview** — Self Introduction, Group Discussion, HR Answers, and the **final interview-round quiz (technical + HR)** as the capstone.
- **FR-9.4.3** **Communication & Interview is a primary section in every track** (all 7). *(Reason: simpler UI + less content creation than separate Communication and Interview sections.)*
- **FR-9.4.4** Content hierarchy: Track → Section → Chapter → Lesson → Chapter Quiz.
- **FR-9.4.5** Resume Building section is **removed** from MVP.

### 9.5 Placement Foundation track + recommendation
- **FR-9.5.1** Placement Foundation is a standalone track using the same 6-section structure (foundations-paced), for early-year students.
- **FR-9.5.2** After enough content/quizzes, the app **recommends companies** based on performance: *"Based on your performance, start preparing for TCS and Infosys."*
- **FR-9.5.3** Accepting a recommendation adds those companies to the interested set and creates their PRI + Placement Probability.

### 9.6 Learning flow and quiz gating
- **FR-9.6.1** ≥ **70%** on a Chapter Quiz unlocks the next chapter.
- **FR-9.6.2** **Skip** is allowed, but a skipped chapter awards no mastery XP and does not raise PRI; flagged in "weak areas."
- **FR-9.6.3** Quizzes are retryable; attempts stored for analytics and PRI.
- **FR-9.6.4** Results show answers + explanations for unlocked content.

### 9.7 Multi-company progress tracking
- **FR-9.7.1** Each company maintains **independent** progress, **PRI**, **Placement Probability**, quiz history, and mock results.
- **FR-9.7.2** Switching the primary company never resets another company's progress.
- **FR-9.7.3** Analytics shows **progress per company** side by side.

### 9.8 Company switcher
- **FR-9.8.1** Change primary company from **Home** (Other Companies widget) or **Settings**.
- **FR-9.8.2** Progress preserved independently for every company at all times.

### 9.9 Placement Readiness Index (PRI) & Placement Probability
- **FR-9.9.1** A **0–100 PRI per company** (formula §10.1).
- **FR-9.9.2** **Overall Readiness** = aggregate PRI across interested companies, **primary company double-weighted** (§10.1).
- **FR-9.9.3** **Estimated Placement Probability per company** (formula §10.4), derived from PRI vs that company's difficulty/cutoff. **Always labelled "estimate — not a guarantee."**
- **FR-9.9.4** Readiness page lists Overall + each company's PRI + Placement Probability + **prioritized recommendations** ("Your TCS coding is weak — do these 3 chapters").
- **FR-9.9.5** PRI/Probability update as quizzes/mocks complete; skipped content contributes 0.

### 9.10 Previous-Year Questions (PYQs)
- **FR-9.10.1** PYQ bank **per company**, by topic/section and year where known.
- **FR-9.10.2** Filters: section, difficulty, "frequently asked."
- **FR-9.10.3** Each PYQ has a solution + explanation.
- **FR-9.10.4** PYQ listing pages crawlable for SEO (clean URLs — §11.4).
- **FR-9.10.5** Content governance (§13.3): original/licensed reconstructions, never verbatim copies.

### 9.11 Company eligibility cards
- **FR-9.11.1** Per company: CGPA cutoff, backlog rules, sectional cutoffs, test pattern, round structure.
- **FR-9.11.2** Each card shows **source** + **"last verified" date** + disclaimer that criteria vary by year/role/campus.

### 9.12 Challenges (lean)
- **FR-9.12.1** **Daily Challenge** with three categories: **General, Aptitude, Coding.** Completion awards XP and protects the streak.
- **FR-9.12.2** **Streak milestones** at 7 / 30 / 100 days with XP bonuses.
- **FR-9.12.3** Weekly sprint and timed challenges **removed**.
- **FR-9.12.4** Free users get the daily challenge with ads.

### 9.13 Gamification (lean)
XP for actions (§10.2) · Levels from cumulative XP (§10.3) · Daily streak with one-day grace (O-2) · In-app milestone badges (motivational, not shareable) · Leaderboards **removed**.

### 9.14 Mock tests + final interview round
- **FR-9.14.1** Timed, company-pattern mock tests per company; sectional analytics afterward.
- **FR-9.14.2** After all sections of a track are done, unlock the **final interview-round quiz** (inside the Communication & Interview section) as the capstone.
- **FR-9.14.3** One sample mock free; the rest Premium.

### 9.15 Analytics page
- **FR-9.15.1** Per-company progress (sections, chapters passed/skipped, quiz accuracy, mock scores) and PRI/Probability trend over time.
- **FR-9.15.2** Overall Readiness summary across companies.
- **FR-9.15.3** **Weakest Topics** — e.g., *Probability, DBMS, Trees* — derived from lowest quiz accuracy per topic, with a one-tap "practice this" link.
- **FR-9.15.4** **Strongest Topics** — e.g., *Percentages, Verbal Ability, Arrays* — highest accuracy topics, for confidence and to avoid over-studying.

### 9.16 Free vs Premium and ads

| Capability | Free | Premium (₹149/year) |
|---|---|---|
| Chapters per section | First chapter only | All chapters, all 7 tracks |
| Ads | Yes | None |
| Daily Challenge | Yes (with ads) | Yes |
| PYQs | Sample only | Full bank, all companies |
| Mock tests | 1 sample | All, with full analytics |
| Explanations | Unlocked content only | All |
| PRI & Placement Probability | Basic (limited components) | Full per-company + recommendations |
| Multi-company tracking | Up to 2 companies | All 6 + General |

- **FR-9.16.1** Paywall at locked chapters, full PYQ bank, full mocks, full PRI/Probability.
- **FR-9.16.2** Ads never interrupt an in-progress quiz.

### 9.17 Payments — Razorpay
Single plan ₹149/year · Razorpay Checkout (UPI/card/netbanking/wallet) · server-side signature verification + webhooks · immediate entitlement on success · invoice email · status/expiry in Settings · renewal reminders (auto-renew vs manual — O-3) · no card data stored (Razorpay PCI flow).

### 9.18 Referral program
- **FR-9.18.1** Every signed-in user can copy a referral link from Dashboard/Settings.
- **FR-9.18.2** Referral attribution is captured once when the referred user signs up and completes onboarding; self-referrals are ignored.
- **FR-9.18.3** Reward trigger: when a referred user completes a verified paid Premium purchase, the referrer receives **+1 month Premium**.
- **FR-9.18.4** Reward cap: each referrer can receive this referral reward **only once total**, even if multiple referred friends later buy Premium.
- **FR-9.18.5** Reward granting must be server-side, idempotent across Razorpay verify/webhook retries, and backed by a ledger table.

### 9.19 Settings
Target Companies (Primary + Interested, "Change Target Company") · add/remove interested companies (progress preserved) · edit profile (CGPA, year, drive date), notifications, subscription, account deletion.

### 9.20 Notifications
Daily streak/challenge reminder · drive-date countdown · re-engagement for lapsed users. Web push in Phase 1; mobile push later.

---

## 10. Scoring definitions

### 10.1 Placement Readiness Index (PRI)
A weighted 0–100 composite, computed **independently per company**. Each component is 0–100.

| Component | Measures | Weight |
|---|---|---|
| Quantitative Aptitude | Quiz mastery | 20% |
| Logical Reasoning | Quiz mastery | 13% |
| Verbal Ability | Quiz mastery | 10% |
| Coding & DSA | Quiz / problem mastery | 22% |
| CS Core | Quiz mastery | 10% |
| Communication & Interview | Section completion + final-round quiz | 10% |
| Company-pattern mock tests | Avg. mock score | 15% |

`PRI = Σ (component × weight)`, rounded. Skipped chapters contribute 0 (keeps PRI honest).
*(Weights changed from v2.0: the old separate "Communication 5%" + "Interview 10%" are merged into "Communication & Interview 10%", and the freed 5% is redistributed to Aptitude/Coding, the highest-signal sections.)*

**Overall Readiness** = weighted average of PRI across interested companies, **primary company weighted 2×** the others. Tunable post-launch.

### 10.2 XP rules
| Action | XP |
|---|---|
| Correct answer (first try) | +10 |
| Correct answer (retry) | +4 |
| Complete a lesson | +25 |
| Pass a chapter quiz (≥70%) | +50 |
| Complete Daily Challenge | +30 |
| Complete a mock test | +100 |
| Streak milestone (7 / 30 / 100 days) | +50 / +200 / +500 |

### 10.3 Levels (tunable)
Level 1 = 0 XP, 2 = 250, 3 = 600, 4 = 1,100, 5 = 1,800, then +900 per level.

### 10.4 Estimated Placement Probability (NEW)
A clearly-labelled **estimate**, per company, mapping PRI to a likelihood using each company's relative difficulty:

```
gap          = PRI − company.cutoffPRI          (cutoffPRI ~ how strong you must be)
probability  = clamp( 50 + gap × company.slope , 2 , 97 )   // logistic-ish, bounded
```

- `cutoffPRI` and `slope` are per-company difficulty tuners (Zoho hardest → high cutoff; service companies → lower).
- Bounded to 2–97% so it is never 0% or a "guaranteed" 100%.
- **UI requirement:** always render the text *"Estimate based on your in-app performance — not a guarantee."* next to the number.

---

## 11. Non-functional requirements
- **11.1 Performance:** core pages interactive < 2.5s on mid-range Android over 4G; quiz interactions feel instant.
- **11.2 Scale:** built for drive-season spikes; resume support if connection drops mid-quiz.
- **11.3 Security/privacy:** HTTPS; hashed credentials; no card data stored; PII minimization; account deletion honored; role-based CMS access.
- **11.4 SEO (web):** server-rendered, crawlable PYQ + eligibility pages, clean URLs (e.g., `/pyq/tcs/quantitative-aptitude`).
- **11.5 Responsive/accessible:** mobile-first down to 360px; WCAG AA contrast; min 16px body on mobile.
- **11.6 Offline tolerance:** cache current lesson and downloaded practice sets.

---

## 12. Technical approach
- **Phase 1 — Web (primary):** **Next.js (App Router) + React + Tailwind v4 + shadcn/ui** for SEO + responsiveness; **Supabase** (Postgres + Auth + Storage); **Razorpay** for payments; a lightweight content CMS/admin.
- **Phase 2 — Android:** React Native or Flutter on the same backend/APIs; push notifications.
- **Future — iOS.**

### 12.1 Core data entities (indicative)
`users`, `profiles` *(no age, includes referred_by)*, `companies`, `eligibility_cards`, `tracks`, `sections` *(6)*, `chapters`, `lessons`, `questions`, `pyqs`, `quizzes`, `quiz_attempts`, `mock_tests`, `mock_attempts`, `challenges`, `challenge_attempts`, `xp_events`, `streaks`, `badges`, `user_badges`, **`company_progress`** (per user × company), **`pri_snapshots`** (per user × company, includes probability), `topic_accuracy` *(for weak/strong topics)*, `subscriptions`, `payments`, `referral_rewards`, `content_sources`.

> **MVP build note:** the current web build uses a swappable client-side data layer (seeded content + localStorage) so the full UX is functional without secrets. Supabase/Razorpay plug into the same interfaces (`lib/data/*`, `lib/store`) for Phase 0.

---

## 13. Content strategy & governance (critical path)
- **13.1 Quality bar:** every lesson/question authored by an SME, reviewed by a second SME; accuracy checked each placement cycle; in-product "report an error" with triage SLA.
- **13.2 Coverage:** Placement Foundation (breadth) + per-company pattern sections, PYQ bank, eligibility card. A track goes live only when it meets the bar end-to-end.
- **13.3 Sourcing & IP compliance (mandatory):** "verified resources" = **original content we author**, **licensed** content, and **factual data from official/public sources** (company career pages) **with citation**. **No verbatim copying** of copyrighted sources or proprietary test papers; PYQs are original reconstructions or licensed. Keep a `content_sources` record per item; legal sign-off before launch. See `docs/CONTENT_SOURCES.md` for the approved source list and per-item citation format.

---

## 14. Analytics & instrumentation
Track: signup, onboarding completion, companies selected, lesson start/complete, quiz attempt/pass, unlock vs skip, PYQ usage, daily-challenge completion, streak length, **PRI & Placement Probability per company over time**, company switches, weak/strong topic shifts, paywall views, checkout start/success/fail, retention cohorts (D1/D7/D30), self-reported placement.

---

## 15. Release plan
| Phase | Scope | Gate to ship |
|---|---|---|
| 0 — Foundations | Auth, onboarding, data model, CMS, payments, analytics | Internal alpha stable |
| 1 — Web MVP (primary) | All 7 tracks + 6 sections; multi-company tracking + PRI + Placement Probability + company switcher; PYQs; eligibility cards; Daily Challenge; XP/levels/streaks; mocks; weak/strong analytics; free/Premium + ads + Razorpay + referral reward | Content quality bar met for live tracks; payments verified end-to-end |
| 2 — Android | Cross-platform app on same backend; push | Web KPIs healthy |
| Future | iOS; deferred items | Prioritized by data |

> **Content readiness is the gating risk** — content production must run in parallel with engineering from day one.

---

## 16. Risks & mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| Content can't reach quality bar for all tracks | High | Start now; staff/contract SMEs; ship a track only when ready |
| IP/copyright violation in PYQs/lessons | High (legal) | Strict §13.3 governance; legal sign-off; original/licensed only |
| Placement Probability over-trusted by students | Medium | Always label "estimate, not a guarantee"; bound 2–97%; explain inputs |
| Distribution / discovery | High | PYQ SEO; campus ambassadors |
| Short LTV (churn after placement) | Medium | Annual model + new batch yearly; strong General funnel |
| Low free→paid conversion | Medium | Tune free value, paywall placement, PRI gating |
| Eligibility data goes stale | Medium | "Last verified" dates + per-cycle review + disclaimers |

---

## 17. Open questions
| ID | Question | Owner | Status |
|---|---|---|---|
| O-1 | "One free chapter" = one per section (assumed) or one total per track? | Product | Assumed: one per section |
| O-2 | Streak grace/freeze rule details | Product | Open |
| O-3 | Razorpay auto-renew vs manual annual repurchase | Product + Finance | Open |
| O-4 | Free-tier multi-company cap — keep at 2 companies? | Product | Assumed: 2 |
| O-5 | Overall Readiness weighting (primary 2× — confirm) | Product | Assumed: 2× |
| O-6 | ~~CS Core 7th section vs 6~~ → **Resolved:** merged Communication + Interview → **6 sections** | CEO/Product | **Resolved (v3.0)** |

---

## 18. Appendix — glossary
- **PRI** — Placement Readiness Index (0–100), per company; the north star.
- **Placement Probability** — clearly-labelled **estimate** of placement likelihood per company, derived from PRI vs company difficulty. Never a guarantee.
- **Overall Readiness** — aggregate PRI across selected companies (primary double-weighted).
- **Track** — full curriculum for one company or Placement Foundation (7 in total).
- **Section** — a subject within a track (**6 per track**).
- **Chapter gate** — the ≥70% quiz rule to unlock the next chapter.
- **Weakest/Strongest Topics** — per-topic accuracy extremes shown in Analytics to direct practice.


