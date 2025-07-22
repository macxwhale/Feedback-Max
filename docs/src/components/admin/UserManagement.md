# UserManagement.tsx

## Purpose
Provides a complete interface for managing users and invitations within a specific organization's admin dashboard.

## Key Functionality
- Fetches and displays active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Shows key member statistics (total members, admins, pending invitations) using the `MemberStats` component.
- Provides functionality to invite new users via the `EnhancedInviteUserModal`.
- Allows updating member roles and removing members, with permission checks using the `useRBAC` hook and `useRemoveUser` mutation.
- Organizes active members and pending invitations into separate tabs using the `Tabs` component.
- Displays loading states and permission errors.

## Dependencies
- lucide-react for icons (implicitly through child components)
- `@/components/ui/*` for various UI components (Alert, Tabs)
- `./EnhancedMembersList`
- `./useUserManagementWithInvitations` hook
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/hooks/useUserInvitation` for `useRemoveUser`
- `@/hooks/useRBAC` for permission checks

## Relationship to other files
Used within the organization admin dashboard (`OrganizationAdminDashboard.tsx`). It serves as a container for various user and invitation management components and logic.

### Component Details
- Props:
  - organizationId: The ID of the organization.
  - organizationName: The name of the organization.
- State: Manages internal loading and permissions using `useRBAC` and states from `useUserManagementWithInvitations`.
- Styling: Tailwind CSS for layout and spacing.
- Accessibility: Uses accessible child components and provides clear error messages for permission issues.