# RoleBadge.tsx

## Purpose
A simple presentation component to display a user's role using a styled badge with an icon.

## Key Functionality
- Takes a `role` string as input.
- Uses `getRoleConfig` utility to get the appropriate badge style (variant), icon, and display label for the role.
- Renders a `Badge` component from the UI library with the role's visual representation.

## Dependencies
- `@/components/ui/badge` for the badge component
- `@/utils/roleManagement` for retrieving role configuration

## Relationship to other files
Used in various components (e.g., user lists) to display user roles consistently. Relies on the `roleManagement` utility for role-specific styling and icons.

### Component Details
- Props:
  - role: The role string to display.
- State: None managed within this component.
- Styling: Tailwind CSS via the `Badge` component and utility classes for spacing.
- Accessibility: Uses a badge element for conveying role information.