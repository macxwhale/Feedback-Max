# RoleBadge.tsx

## Purpose
A reusable component to display a user's role as a styled badge with an accompanying icon.

## Key Functionality
- Takes a user's role as a string prop.
- Uses `getRoleConfig` utility to fetch display properties (variant, icon, label) for the given role.
- Renders a `Badge` component with the role's visual styling and icon.

## Dependencies
- `@/components/ui/badge` for the badge UI
- `@/utils/roleManagement` for role configuration lookup
- lucide-react for icons (indirectly through `getRoleConfig`)

## Relationship to other files
Used in various parts of the application, particularly in admin and user management interfaces, to consistently display user roles.

### Component Details
- Props:
  - role: A string representing the user's role.
- State: None managed within this component.
- Styling: Tailwind CSS is used via the `Badge` component and utility classes for layout (`flex`, `items-center`, `gap-1`).
- Accessibility: Uses a semantic `Badge` element and includes an icon for visual representation of the role.