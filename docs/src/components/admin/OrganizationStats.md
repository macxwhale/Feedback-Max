# OrganizationStats.tsx

## Purpose
Displays summary statistics for the organizations managed within the system admin dashboard.

## Key Functionality
- Shows the total number of organizations.
- Displays the count of active organizations.
- Presents these statistics in a card-based layout.

## Dependencies
- `@/components/ui/card` for card layout

## Relationship to other files
Used within the system admin dashboard (`AdminDashboard.tsx`) to provide an overview of organization counts. Receives organization data from a parent component.

### Component Details
- Props:
  - organizations: An array of Organization objects.
- State: None managed within this component.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Standard HTML structure with semantic elements.