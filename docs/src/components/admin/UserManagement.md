# UserManagement.tsx

## Purpose
Provides a comprehensive interface for managing users and invitations within a specific organization's admin dashboard.

## Key Functionality
- Fetches active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Displays summary statistics about members and pending invitations using `MemberStats`.
- Includes an `EnhancedInviteUserModal` to invite new users.
- Uses tabs (`Tabs`, `TabsList`, `TabsContent`, `TabsTrigger`) to switch between displaying active members and pending invitations.
- Renders `EnhancedMembersList` to show active members and `PendingInvitations` to show pending invitations.
- Implements functionality to update member roles and remove members, utilizing hooks and permission checks (`useRBAC`).
- Displays loading states and permission denied messages.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Alert, Tabs)
- `./EnhancedMembersList`
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/hooks/useUserManagementWithInvitations`
- `@/hooks/useUserInvitation` (specifically `useRemoveUser`)
- `@/hooks/useRBAC`

## Relationship to other files
Used within the organization-specific admin dashboard (`OrganizationAdminDashboard.tsx`). It orchestrates several child components and interacts with hooks to manage user and invitation data and actions.

### Component Details
- Props:
  - organizationId: The ID of the organization for which to manage users.
  - organizationName: The name of the organization.
- State: None managed within this component; state is managed by the hooks and child components.
- Styling: Tailwind CSS for layout and spacing.
- Accessibility: Uses semantic HTML elements and provides clear labeling for interactive elements and sections. Includes ARIA attributes via UI components.