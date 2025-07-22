# RoleBadge.tsx

## Purpose
A simple component to display a user's role using a badge with an icon and label.

## Key Functionality
- Takes a role string as input.
- Uses the `getRoleConfig` utility to get the corresponding badge variant, icon, and label.
- Renders a `Badge` component from the UI library.
- Displays an icon and the role label within the badge.

## Dependencies
- `@/components/ui/badge` for the badge component
- `@/utils/roleManagement` for retrieving role configuration
- lucide-react for icons (implicitly used via `getRoleConfig`)

## Relationship to other files
Used in various places where a user's role needs to be visually represented, often in lists or tables of users/members. It's a simpler version compared to `EnhancedRoleBadge`.

### Component Details
- Props:
  - role: The role string (e.g., 'admin', 'member').
- State: None managed within this component.
- Styling: Tailwind CSS for layout and spacing within the badge.
- Accessibility: Provides a visual indicator of the user's role.