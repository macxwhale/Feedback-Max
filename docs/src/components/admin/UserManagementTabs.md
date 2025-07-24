# UserManagementTabs.tsx

## Purpose
Provides a simple tab navigation component specifically for switching between "Members" and "Pending Invitations" views within user management.

## Key Functionality
- Displays two tabs: "Members" and "Pending Invitations".
- Shows the count of items for each category (members and invitations) in a badge.
- Allows switching between tabs by clicking on them.
- Uses icons to visually represent each tab.

## Dependencies
- lucide-react for icons
- `@/components/ui/badge` for the count badge

## Relationship to other files
Used within user management components (e.g., `UserManagement.tsx` or similar) to provide navigation between different lists of users/invitations. It receives the active tab state and a function to update it from a parent component.

### Component Details
- Props:
  - activeTab: A string indicating the currently active tab ('members' or 'invitations').
  - setActiveTab: Function to call when a tab is clicked to change the active tab.
  - membersCount: The number of active members to display in the badge.
  - invitationsCount: The number of pending invitations to display in the badge.
- State: None managed within this component; state is managed by the parent component.
- Styling: Tailwind CSS for layout, styling, and visual feedback on active/inactive tabs.
- Accessibility: Uses semantic `<button>` elements for tabs and includes clear text labels and counts.