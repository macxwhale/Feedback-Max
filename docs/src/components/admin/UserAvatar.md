# UserAvatar.tsx

## Purpose
Displays a user avatar, falling back to the user's initials if no image is available.

## Key Functionality
- Takes a user's email and an optional size as props.
- Uses the `getInitials` utility function to generate initials from the email.
- Renders an `Avatar` component from the UI library.
- Displays the generated initials within the `AvatarFallback`.
- Supports different predefined sizes (small, medium, large).

## Dependencies
- `@/components/ui/avatar` for avatar components
- `@/utils/roleManagement` for the `getInitials` utility
- lucide-react for icons (implicitly used via getRoleConfig)

## Relationship to other files
Used in components that display user information, such as lists or tables of members.

### Component Details
- Props:
  - email: The email address of the user.
  - size: Optional prop for defining the avatar size ('sm', 'md', 'lg'), defaults to 'md'.
- State: None managed within this component.
- Styling: Tailwind CSS for size and the base styling provided by the UI library's Avatar component.
- Accessibility: Provides a visual representation for a user, with initials as a fallback.