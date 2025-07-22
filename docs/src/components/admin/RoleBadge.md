# RoleBadge.tsx

## Purpose
A simple component to display a user's role using a badge with an associated icon and label.

## Key Functionality
- Takes a role string as input.
- Uses the `getRoleConfig` utility to find the appropriate visual representation (variant, icon, label) for the role.
- Renders a `Badge` component from the UI library with the role's configured style and icon.

## Dependencies
- `@/components/ui/badge` for the badge component
- `@/utils/roleManagement` for retrieving role configuration
- lucide-react for icons (indirectly through `getRoleConfig`)

## Relationship to other files
Used in various parts of the application where user roles need to be visually displayed, often in lists or user profiles. Relies on the role configuration defined in `roleManagement.ts`.

### Component Details
- Props:
  - role: The role string to display.
- State: None managed within this component.
- Styling: Tailwind CSS (via `Badge` component) and inline flex styles for layout.
- Accessibility: Uses a semantic `<span>` (rendered by `Badge`) with descriptive text and a visual icon.