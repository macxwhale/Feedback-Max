# UserManagement.tsx

## Purpose
Provides the main user management interface for a specific organization within the admin dashboard.

## Key Functionality
- Fetches and displays active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Presents summary statistics for members and pending invitations using `MemberStats`.
- Includes a modal to invite new users using `EnhancedInviteUserModal`.
- Organizes the display of active members and pending invitations into separate tabs using `@/components/ui/tabs`.
- Handles updating user roles and removing members by calling functions provided by the `useUserManagementWithInvitations` and `useUserInvitation` hooks, after checking user permissions with `useRBAC`.
- Displays loading states and permission errors using `Alert`.

## Dependencies
- `react`
- `lucide-react` for icons
- `@/components/ui/*` for UI components (Alert, Tabs)
- `./EnhancedMembersList`
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/hooks/useUserManagementWithInvitations`
- `@/hooks/useUserInvitation` (specifically `useRemoveUser`)
- `@/hooks/useRBAC`

## Relationship to other files
Used as a tab content within the organization admin dashboard (`OrganizationAdminDashboard.tsx`). It orchestrates several child components and relies heavily on custom hooks for data fetching, mutations, and permission checks.

### Component Details
- Props:
  - organizationId: The ID of the organization.
  - organizationName: The name of the organization.
- State: None managed within this component; state is managed by the utilized hooks.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses accessible UI components and provides clear status and error messages.