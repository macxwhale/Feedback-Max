# UserManagement.tsx

## Purpose
Provides the core user management interface for a specific organization within the admin dashboard.

## Key Functionality
- Fetches and displays lists of active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Shows summary statistics about members and pending invitations using `MemberStats`.
- Provides a modal to invite new users via `EnhancedInviteUserModal`.
- Allows updating the roles of existing members using `handleUpdateRole` from the hook, with permission checks via `useRBAC`.
- Enables removing members using the `useRemoveUser` mutation hook, also with permission checks.
- Organizes the interface into tabs for "Active Members" and "Pending Invitations".
- Displays loading states and permission errors.

## Dependencies
- `@/hooks/useUserManagementWithInvitations`
- `@/hooks/useUserInvitation` (specifically `useRemoveUser`)
- `@/hooks/useRBAC`
- `./EnhancedMembersList`
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/components/ui/*` for various UI components (Alert, Tabs)
- lucide-react for icons

## Relationship to other files
Used as a tab content within the organization admin dashboard. It integrates several other components and hooks to provide a full user management experience.

### Component Details
- Props:
  - organizationId: The ID of the organization for user management.
  - organizationName: The name of the organization for display purposes.
- State: Data fetching and mutation states are managed by the hooks used.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses semantic HTML elements and provides clear status indicators and error messages.