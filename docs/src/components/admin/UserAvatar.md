# UserAvatar.tsx

## Purpose
Displays a user's avatar, using their initials as a fallback if no image is available.

## Key Functionality
- Takes a user's email and an optional size as props.
- Uses the `getInitials` utility function to generate initials from the email address.
- Renders an `Avatar` component from the UI library.
- Displays the generated initials within the `AvatarFallback`.
- Supports different sizes ('sm', 'md', 'lg') via CSS classes.

## Dependencies
- `@/components/ui/avatar` for the avatar component
- `@/utils/roleManagement` for the `getInitials` utility

## Relationship to other files
Used in components that display user information, such as member lists (`EnhancedMembersList.tsx`), to provide a visual representation of the user.

### Component Details
- Props:
  - email: The user's email address (used to generate initials).
  - size: Optional prop to control the size of the avatar ('sm', 'md', 'lg'). Defaults to 'md'.
- State: None managed within this component.
- Styling: Tailwind CSS classes for size and basic styling (via `Avatar` component).
- Accessibility: The `AvatarFallback` provides a text alternative (initials) if an image were to be added later.