# SimpleUserManagementHeader.tsx

## Purpose
Displays a simple header for user management sections, showing the context of which organization's users are being managed.

## Key Functionality
- Takes the organization name as a prop.
- Renders a heading "User Management" and a descriptive subtitle including the organization name.
- Provides a consistent visual header for user management interfaces.

## Dependencies
- None significant.

## Relationship to other files
Likely used in components that display user management lists or interfaces, such as `UserManagement.tsx`.

### Component Details
- Props:
  - organizationName: The name of the organization whose users are being managed.
- State: None managed within this component.
- Styling: Tailwind CSS for text styling and layout.
- Accessibility: Uses semantic HTML heading and paragraph elements.