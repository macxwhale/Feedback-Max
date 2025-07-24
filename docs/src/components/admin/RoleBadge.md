# RoleBadge.tsx

## Purpose
A simple presentational component to display a user's role using a badge with an associated icon and label.

## Key Functionality
- Takes a `role` string as input.
- Uses `getRoleConfig` utility to determine the visual representation (variant, icon, label) for the given role.
- Renders a `Badge` component from the UI library.
- Displays the role icon and label within the badge.

## Dependencies
- `@/components/ui/badge` for the badge component
- `@/utils/roleManagement` for role configuration utility

## Relationship to other files
Used in various parts of the application, particularly within admin and user management interfaces, to consistently display user roles. Relies on the role configuration defined in `roleManagement.ts`.

### Component Details
- Props:
  - role: The role string (e.g., 'admin', 'member').
- State: None managed within this component.
- Styling: Uses Tailwind CSS classes via the `Badge` component and custom styling for flex layout.
- Accessibility: Standard HTML structure within the badge. Icons provide visual cues.