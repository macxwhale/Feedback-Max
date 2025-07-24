# DashboardBreadcrumb.tsx

## Purpose
Provides a navigation breadcrumb component for the organization admin dashboard, showing the user's current location within the dashboard hierarchy.

## Key Functionality
- Displays a hierarchical path starting from "Admin", followed by the organization name, and then the current page.
- Uses `Breadcrumb` components from the UI library to structure the navigation links and separators.
- Includes icons for the "Admin" and organization name links.
- The organization name link is not currently functional (`href` is missing).

## Dependencies
- lucide-react for icons
- `@/components/ui/breadcrumb` for breadcrumb components

## Relationship to other files
Used within the organization admin dashboard layout to provide navigation context. It receives the organization name and the current page title as props.

### Component Details
- Props:
  - organizationName: The name of the current organization.
  - currentPage: Optional string representing the title of the current page/section (defaults to "Overview").
- State: None managed within this component.
- Styling: Uses styles provided by the `@/components/ui/breadcrumb` components and Tailwind CSS for icon spacing.
- Accessibility: Uses ARIA attributes provided by the breadcrumb component for navigation. Provides clear text labels for each level of the hierarchy.