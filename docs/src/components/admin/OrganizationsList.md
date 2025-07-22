# OrganizationsList.tsx

## Purpose
Displays a list of all organizations in the system admin dashboard and provides actions for managing them.

## Key Functionality
- Shows a list of organizations using `OrganizationCard` components.
- Displays summary statistics for organizations using `OrganizationStats`.
- Provides a button to trigger the creation of a new organization.
- Passes down functions for toggling organization active status and updating plans to `OrganizationCard`.

## Dependencies
- lucide-react for icons
- `@/components/ui/button` for the button component
- `@/services/organizationService.types` for Organization type definition
- `./OrganizationStats`
- `./OrganizationCard`

## Relationship to other files
Used within the system admin dashboard (`AdminDashboard.tsx`) to display and manage the list of organizations. Relies on `OrganizationStats` and `OrganizationCard` for rendering.

### Component Details
- Props:
  - organizations: An array of Organization objects to display.
  - onCreateClick: Function to call when the "Add Organization" button is clicked.
  - onToggleActive: Function to call to toggle an organization's active status.
  - onUpdatePlan: Function to call to update an organization's plan.
- State: None managed within this component.
- Styling: Tailwind CSS for layout and spacing.
- Accessibility: Standard HTML structure with semantic elements and button with descriptive text.