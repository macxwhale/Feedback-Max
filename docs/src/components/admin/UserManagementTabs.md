# UserManagementTabs.tsx

## Purpose
Provides the tab navigation for the user management section within the admin dashboard, allowing switching between "Members" and "Pending Invitations".

## Key Functionality
- Displays two tabs: "Active Members" and "Pending Invitations".
- Shows the count of members and pending invitations next to the tab labels using a `Badge`.
- Takes the currently active tab and a function to set the active tab as props.
- Visually indicates the currently active tab.
- Uses icons to represent each tab.

## Dependencies
- lucide-react for icons
- `@/components/ui/badge` for the count badge

## Relationship to other files
Used within the user management interface (`UserManagement.tsx`) to control which list (members or invitations) is currently displayed.

### Component Details
- Props:
  - activeTab: String indicating the currently active tab ('members' or 'invitations').
  - setActiveTab: Function to call when a tab is clicked to change the active tab.
  - membersCount: The number of active members to display in the tab label.
  - invitationsCount: The number of pending invitations to display in the tab label.
- State: None managed within this component; state is managed by the parent component.
- Styling: Tailwind CSS for layout, styling, and active/inactive tab appearance.
- Accessibility: Uses button elements for tabs with appropriate text labels and visual indicators for the active state.