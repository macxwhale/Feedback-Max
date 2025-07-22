# UserManagement.tsx

## Purpose
Provides a complete interface for managing users and pending invitations within a specific organization's admin dashboard.

## Key Functionality
- Fetches active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Displays a header with the organization name using `SimpleUserManagementHeader`.
- Shows member statistics using `MemberStats`.
- Provides a modal to invite new users using `EnhancedInviteUserModal`.
- Organizes the display of active members and pending invitations into separate tabs using `Tabs`.
- Renders lists of active members (`EnhancedMembersList`) and pending invitations (`PendingInvitations`).
- Handles updating user roles and removing members by calling functions from the `useUserManagementWithInvitations` and `useRemoveUser` hooks.
- Enforces permission checks for managing users using the `useRBAC` hook and `PermissionGuard` (though `PermissionGuard` wraps this component in `EnhancedUserManagement`). Displays an alert if the user lacks permission.

## Dependencies
- `./EnhancedMembersList`
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/hooks/useUserManagementWithInvitations`
- `@/hooks/useUserInvitation` (specifically `useRemoveUser`)
- `@/hooks/useRBAC`
- `@/components/ui/*` for various UI components (Alert, Tabs)
- `lucide-react` for icons

## Relationship to other files
This component acts as a container for user management features within an organization's dashboard. It fetches data and delegates rendering and actions to several child components and hooks. It is typically used within `EnhancedUserManagement.tsx` which provides the permission layer.

### Component Details
- Props:
  - organizationId: The ID of the organization.
  - organizationName: The name of the organization.
- State: None managed within this component directly; relies on state managed by hooks (`useUserManagementWithInvitations`, `useRBAC`).
- Styling: Tailwind CSS for layout and spacing.
- Accessibility: Uses semantic HTML elements and combines accessible child components. Provides feedback for permission issues.