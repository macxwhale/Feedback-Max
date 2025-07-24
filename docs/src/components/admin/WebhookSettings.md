# WebhookSettings.tsx

## Purpose
Provides a component within the admin settings to configure webhook settings.

## Key Functionality
- Allows enabling or disabling webhooks via a switch.
- Provides an input field to enter the webhook URL.
- Manages the state of the webhook URL and enabled status.
- Includes a button to save the settings.
- Disables the URL input and save button when webhooks are disabled.

## Dependencies
- `@/components/ui/*` for various UI components (Card, Button, Input, Label, Switch)

## Relationship to other files
Likely used within a settings or integrations section of the admin dashboard to allow administrators to configure webhook endpoints.

### Component Details
- Props: None.
- State: Manages `webhookUrl` (string) and `enabled` (boolean) using `useState`.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses semantic HTML elements and form controls with associated labels.