# StudyBench student-first interface

## Product intent
The interface should answer a student's immediate questions:
1. What should I learn first?
2. Why does this concept matter?
3. How do I practise it?
4. What should I do next?

Avoid company-target shortcuts, readiness scores, dense metrics, decorative dashboards and generic SaaS language.

## Visual direction
- Editorial, quiet and focused; use whitespace and hierarchy instead of visual noise.
- Existing Geist body and Plus Jakarta Sans heading fonts are retained.
- Primary blue: `#315fca`; ink: `#17243a`; muted text: `#64738a`; pale canvas: `#f8fafc`; white surfaces with crisp cool-grey borders.
- Use 8px-based spacing, 12–16px control radii and 20–28px section/card radii.
- Use Lucide icons sparingly, paired with labels.
- No stock photos, AI-generated illustrations, glassmorphism, neon gradients or decorative icon clouds.

## Landing page
- Student outcome-led headline and one primary CTA.
- A CSS-built roadmap preview communicates the product itself without a stock illustration.
- Learning areas, learning loop, transparent pricing and concise FAQs.
- Responsive header, cards and CTA.

## Onboarding
Four short steps:
1. Name, branch (optional) and graduation year.
2. First learning priority.
3. Current confidence level.
4. Realistic daily study time.

Preferences are saved to `user_state.learning_preferences` and used to personalise the dashboard. Company targeting is intentionally not part of this first-run flow.

## Dashboard
- Personal greeting and daily time goal.
- One recommended next lesson.
- Overall learning progress, streak and XP/level.
- Five core learning areas and individual language shortcuts.
- Practice, mistakes and learning-insight links.
- No Daily Challenge card or company target track cards.

## Motion and accessibility
- Entrance transitions use opacity and translateY only.
- Hover feedback is brief and limited to interactive cards.
- No autoplay loops.
- All motion is disabled or reduced under `prefers-reduced-motion`.
- Buttons have visible keyboard focus, progress indicators expose progressbar semantics, and selection controls use `aria-pressed`.

## Design references
- Duolingo's guided learning path: https://blog.duolingo.com/new-duolingo-home-screen-design/
- Duolingo teaching principles: https://blog.duolingo.com/duolingo-teaching-method/
- Vercel Web Interface Guidelines: https://vercel.com/design/guidelines
