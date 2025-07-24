# UserManagementTabs.tsx

## Purpose
Provides a simple tab navigation component specifically for switching between different sections within a user management interface.

## Key Functionality
- Displays two tabs: "Members" and "Pending Invitations".
- Shows the count of members and pending invitations on their respective tabs.
- Takes the active tab state and a function to update the active tab as props.
- Uses icons to visually represent each tab.

## Dependencies
- lucide-react for icons
- `@/components/ui/badge` for displaying counts

## Relationship to other files
Likely used within a user management component (e.g., `UserManagement.tsx`) to control the displayed content based on the selected tab. It is a presentational component that manages the visual state of the tabs.

### Component Details
- Props:
  - activeTab: String indicating the currently active tab ('members' or 'invitations').
  - setActiveTab: Function to call when a tab is clicked to update the active tab state.
  - membersCount: The number of active members to display.
  - invitationsCount: The number of pending invitations to display.
- State: None managed within this component; state is managed by the parent component.
- Styling: Tailwind CSS for layout, styling, and visual indication of the active tab.
- Accessibility: Uses button elements for tabs with appropriate labels and roles.