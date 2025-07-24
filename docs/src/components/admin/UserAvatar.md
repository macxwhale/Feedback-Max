# UserAvatar.tsx

## Purpose
Displays a user avatar, falling back to the user's initials if no avatar image is available.

## Key Functionality
- Takes a user's email address as input.
- Uses the `getInitials` utility function to generate initials from the email.
- Renders an `Avatar` component from the UI library.
- Displays the generated initials within the `AvatarFallback` component.
- Supports different size variations (`sm`, `md`, `lg`).

## Dependencies
- `@/components/ui/avatar` for avatar components
- `@/utils/roleManagement` for the `getInitials` utility

## Relationship to other files
Used in components that display user information, such as user lists or member tables, to provide a visual representation of the user.

### Component Details
- Props:
  - email: The user's email address.
  - size: Optional prop for controlling the size of the avatar ('sm', 'md', or 'lg'). Defaults to 'md'.
- State: None managed within this component.
- Styling: Tailwind CSS is used for size variations via `sizeClasses` and applied to the `Avatar` component.
- Accessibility: The `AvatarFallback` provides alternative text (initials) if an image were to be used but failed to load.