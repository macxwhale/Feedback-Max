# UserManagementTabs.tsx

## Purpose
Provides a simple tab navigation component for switching between "Members" and "Pending Invitations" views within the user management section.

## Key Functionality
- Displays two tabs: "Members" and "Pending Invitations".
- Shows the count of members and pending invitations next to the tab labels using a `Badge`.
- Uses icons (`Users`, `Mail`) to visually represent each tab.
- Highlights the currently active tab.
- Triggers the `setActiveTab` function when a tab is clicked to switch views.

## Dependencies
- lucide-react for icons
- `@/components/ui/badge` for displaying counts

## Relationship to other files
Used within the `UserManagement.tsx` component to provide navigation between the list of active members and the list of pending invitations. It controls which list is displayed based on the active tab state.

### Component Details
- Props:
  - activeTab: A string indicating the currently active tab ('members' or 'invitations').
  - setActiveTab: Function to call when a tab is clicked to change the active tab.
  - membersCount: The number of active members to display in the Members tab badge.
  - invitationsCount: The number of pending invitations to display in the Pending Invitations tab badge.
- State: None managed within this component.
- Styling: Tailwind CSS for layout, styling, and interactive states of the tabs.
- Accessibility: Uses semantic `button` elements for tabs and provides visual feedback for the active state. Icons and text labels provide clear information about each tab's content.