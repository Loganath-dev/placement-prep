# Next.js template

This is a Next.js template with shadcn/ui.

## Email setup

StudyBench sends onboarding and update emails through Resend. Add these values to `.env.local`:

```bash
RESEND_API_KEY=your_rotated_resend_api_key
RESEND_FROM_EMAIL="StudyBench <noreply@your-verified-domain.com>"
```

Use a verified Resend sending domain for production. Never commit real API keys.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
