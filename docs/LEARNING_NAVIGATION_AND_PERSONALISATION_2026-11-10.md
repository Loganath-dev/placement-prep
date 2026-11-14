# Learning navigation and personalisation — 10 November 2026

## Focused subject navigation
- Sidebar entries route to dedicated destinations: `/learn/aptitude`, `/learn/logical-verbal`, `/learn/cs-core`, `/learn/programming-languages`, `/learn/dsa`, and `/learn/tracks`.
- `/learn` is now a subject directory only. It does not render all subject content below one another.
- Each subject destination displays only its own learning content and progress.
- Chapter breadcrumbs return to the matching subject page. DSA, SQL & DBMS and language chapters return to their own areas rather than a combined coding page.

## Programming-language onboarding
- Onboarding is five steps: profile, learning focus, programming languages, confidence and daily study time.
- Students may select one or more language path IDs from the existing curriculum.
- At least one language must be selected before continuing.
- The selected IDs are stored inside the existing `learning_preferences` JSONB field; no new database migration is required.
- The dashboard displays only selected language paths. Existing accounts without a saved language selection get Python as a clearly conservative default.
- Students can change language selection in Settings. Changes sync through `syncUserState`.

## XP indicator
- The top-bar XP control links to Analytics, shows level and total XP, and includes a progress bar for the current level.
- The icon uses the existing Lucide icon set; no generated artwork or custom font assets are introduced.
