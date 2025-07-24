# UserAvatar.tsx

## Purpose
Displays a user avatar, falling back to initials if no avatar image is available.

## Key Functionality
- Takes a user's email address and an optional size prop.
- Uses the `getInitials` utility function to generate initials from the email.
- Renders an `Avatar` component with `AvatarFallback` from `@/components/ui/avatar`.
- Applies size classes based on the provided size prop.

## Dependencies
- `@/components/ui/avatar` for avatar components
- `@/utils/roleManagement` for `getInitials` utility

## Relationship to other files
Used in various components, particularly in user lists and profiles, to display a visual representation of a user.

### Component Details
- Props:
  - email: The user's email address (used to generate initials).
  - size: Optional size of the avatar ('sm', 'md', or 'lg'). Defaults to 'md'.
- State: None managed within this component.
- Styling: Tailwind CSS classes applied based on the `size` prop.
- Accessibility: Provides a visual representation of the user. The fallback initials can be read by screen readers.