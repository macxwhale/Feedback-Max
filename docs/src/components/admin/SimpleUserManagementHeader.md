# SimpleUserManagementHeader.tsx

## Purpose
A simple header component specifically for the user management section of the admin dashboard.

## Key Functionality
- Displays a consistent heading "User Management".
- Shows a descriptive subtitle that includes the name of the organization being managed.

## Dependencies
None significant.

## Relationship to other files
Used within the user management components (e.g., `UserManagement.tsx`) to provide a clear and consistent title for that section. Receives the organization name as a prop.

### Component Details
- Props:
  - organizationName: The name of the organization whose users are being managed.
- State: None managed within this component.
- Styling: Tailwind CSS for basic text styling and layout.
- Accessibility: Uses semantic `<h2>` for the heading.