# UserAvatar.tsx

## Purpose
Displays a user avatar, falling back to initials if no image is available, for use in lists or profiles.

## Key Functionality
- Takes a user's email address to generate initials.
- Supports different size variations (`sm`, `md`, `lg`).
- Uses the `getInitials` utility function to extract initials from the email.
- Renders an `Avatar` component from the UI library, displaying either an image (if available, not implemented in this snippet) or the generated initials.

## Dependencies
- `@/components/ui/avatar`
- `@/utils/roleManagement` for `getInitials` utility

## Relationship to other files
Used in components that display user information, such as `EnhancedMembersList.tsx`, to provide a visual representation of the user.

### Component Details
- Props:
  - email: The email address of the user.
  - size: Optional prop to control the size of the avatar ('sm', 'md', 'lg'). Defaults to 'md'.
- State: None managed within this component.
- Styling: Tailwind CSS for size variations, applied via `sizeClasses`.
- Accessibility: Uses the `Avatar` and `AvatarFallback` components which are likely built with accessibility in mind. The fallback provides a text alternative.