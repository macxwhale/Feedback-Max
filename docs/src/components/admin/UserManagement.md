# UserManagement.tsx

## Purpose
Provides a comprehensive interface for managing users within a specific organization in the admin dashboard, including members and pending invitations.

## Key Functionality
- Fetches active members and pending invitations using the `useUserManagementWithInvitations` hook.
- Displays key member statistics using `MemberStats`.
- Provides a modal to invite new users (`EnhancedInviteUserModal`).
- Organizes the view into tabs for "Active Members" and "Pending Invitations".
- Renders lists of members and invitations using `EnhancedMembersList` and `PendingInvitations` components.
- Handles updating member roles and removing members using mutations and hooks (`useUserInvitation`, `useRemoveUser`).
- Enforces permission checks using the `useRBAC` hook to ensure only authorized users can perform management actions.
- Displays loading states and permission denial messages.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Alert, Tabs)
- `./EnhancedMembersList`
- `./SimpleUserManagementHeader`
- `./MemberStats`
- `./EnhancedInviteUserModal`
- `./PendingInvitations`
- `@/hooks/useUserManagementWithInvitations`
- `@/hooks/useUserInvitation`
- `@/hooks/useRBAC`

## Relationship to other files
Used within the organization-specific admin dashboard to provide user management capabilities. It integrates several smaller components and hooks to deliver the full functionality.

### Component Details
- Props:
  - organizationId: The ID of the organization.
  - organizationName: The name of the organization.
- State: Manages tab selection locally. Relies on hooks (`useUserManagementWithInvitations`, `useRBAC`) for data and permission states.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Uses tabbed interface for organization and provides descriptive text for sections and actions.