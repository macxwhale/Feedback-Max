# OrganizationSettingsTab.tsx

## Purpose
Provides a tabbed interface within the organization admin dashboard for managing various settings of a specific organization.

## Key Functionality
- Displays and allows editing of basic information like organization name.
- Enables configuration of branding colors (primary and secondary).
- Provides fields for customizing feedback form text (header, welcome, thank you).
- Includes settings for enabling and configuring SMS feedback collection.
- Allows toggling the active status of the organization.
- Uses `react-query` for updating organization settings via a mutation.
- Displays toasts for user feedback on save actions.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Card, Button, Input, Label, Textarea, Switch, useToast)
- `@/integrations/supabase/client` for interacting with Supabase
- `@tanstack/react-query` for data mutation

## Relationship to other files
Used as a tab content within the organization admin dashboard (`OrganizationAdminDashboard.tsx`). Interacts with Supabase through the `updateOrganizationMutation`.

### Component Details
- Props:
  - organization: Object containing the current organization's settings.
- State: Manages form data using local state.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses semantic HTML elements and ARIA attributes where appropriate for form controls.