# RoleBadge.tsx

## Purpose
A simple component to display a user's role using a badge with an icon and localized label.

## Key Functionality
- Takes a role string as input.
- Uses `getRoleConfig` to retrieve the appropriate visual representation (variant, icon, label) for the role.
- Renders a `Badge` component from the UI library.
- Displays the role icon and label within the badge.

## Dependencies
- `@/components/ui/badge`
- `@/utils/roleManagement`

## Relationship to other files
Used in various parts of the application where user roles need to be visually represented, such as user lists or profiles. Relies on `getRoleConfig` for role-specific data.

### Component Details
- Props:
  - role: A string representing the user's role.
- State: None managed within this component.
- Styling: Tailwind CSS for layout and styling, augmented by the badge variant prop.
- Accessibility: Uses a badge element to visually convey information.