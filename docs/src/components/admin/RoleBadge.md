# RoleBadge.tsx

## Purpose
A reusable component to display a user's role using a styled badge with an associated icon.

## Key Functionality
- Takes a `role` string as input.
- Uses `getRoleConfig` utility to determine the badge style, icon, and label for the given role.
- Renders a `Badge` component from the UI library.
- Includes the role's icon and label within the badge.

## Dependencies
- `@/components/ui/badge` for the badge component
- `@/utils/roleManagement` for role configuration utilities

## Relationship to other files
Used in various parts of the application (e.g., user management lists) to consistently display user roles. Depends on the role configuration defined in `roleManagement.ts`.

### Component Details
- Props:
  - role: The role string (e.g., 'admin', 'member').
- State: None managed within this component.
- Styling: Tailwind CSS for layout and spacing within the badge, utilizes variant styling from the Badge component based on role configuration.
- Accessibility: Semantic HTML element (`<span>` rendered by Badge) with visually distinct text and icon.