# PendingInvitations.tsx

## Purpose
Displays a list of pending user invitations for an organization within the admin dashboard.

## Key Functionality
- Shows a table of invitations including email, role, invited date, expiration date, and inviting user.
- Utilizes the `ExpiryStatus` helper component to indicate if an invitation is expiring soon.
- Provides a button to cancel an invitation, with a confirmation dialog (`AlertDialog`).
- Displays a loading state and a message when there are no pending invitations.
- Uses `EnhancedRoleBadge` to display the invited role.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Card, Button, Badge, Table, AlertDialog)
- `./EnhancedRoleBadge`
- `@/utils/roleManagement` for date formatting and expiry check utilities

## Relationship to other files
Used within the organization-specific admin dashboard to manage pending user invitations. Relies on helper components and utility functions for display and actions.

### Component Details
- Props:
  - invitations: An array of Invitation objects to display.
  - loading: Boolean indicating if invitations are currently loading.
  - onCancelInvitation: Function to call when an invitation is cancelled.
- State: None managed within this component.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Standard HTML table structure with appropriate headers and interactive elements with clear labeling.