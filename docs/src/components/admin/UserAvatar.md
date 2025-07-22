# UserAvatar.tsx

## Purpose
Displays a user avatar, falling back to the user's initials if no avatar image is available.

## Key Functionality
- Takes a user's email address as input.
- Uses the `getInitials` utility function to generate initials from the email.
- Renders an `Avatar` component from the UI library.
- Displays the generated initials as a fallback within the avatar.
- Supports different sizes for the avatar.

## Dependencies
- `@/components/ui/avatar` for the avatar component
- `@/utils/roleManagement` for the `getInitials` utility

## Relationship to other files
Used in components that display user information, such as member lists (`EnhancedMembersList.tsx`), to provide a visual representation of the user.

### Component Details
- Props:
  - email: The user's email address (used to generate initials).
  - size: Optional prop to specify the size of the avatar ('sm', 'md', or 'lg').
- State: None managed within this component.
- Styling: Tailwind CSS for sizing, applied via `sizeClasses`.
- Accessibility: Provides a visual representation of the user, with initials as a fallback for identification.