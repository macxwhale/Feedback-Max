# OrganizationHeader.tsx

## Purpose
Displays the header for a specific organization's dashboard, including organization information and key navigation/action elements.

## Key Functionality
- Shows the organization's name, status, and a visual indicator.
- Includes a search bar for the dashboard (`DashboardSearch`).
- Provides access to notifications (`NotificationDropdown`).
- Displays a user menu (`DashboardUserMenu`).
- Adapts layout for mobile and desktop views.

## Dependencies
- lucide-react for icons
- `@/components/ui/card` for card layout
- `@/components/ui/badge` for status badge
- `@/components/admin/dashboard/DashboardSearch`
- `@/components/admin/dashboard/NotificationDropdown`
- `@/components/admin/dashboard/DashboardUserMenu`

## Relationship to other files
Used within the organization-specific admin dashboard to provide a consistent header across different sections.

### Component Details
- Props:
  - organization: Object containing organization details (id, name, slug, status).
- State: None managed within this component.
- Styling: Tailwind CSS with custom gradients and utility classes.
- Accessibility: Standard HTML structure with semantic elements.