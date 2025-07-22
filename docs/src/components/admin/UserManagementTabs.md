# UserManagementTabs.tsx

## Purpose
Provides a tabbed navigation component specifically for switching between Active Members and Pending Invitations views within user management.

## Key Functionality
- Displays two clickable tabs: "Members" and "Pending Invitations".
- Shows the count of members and pending invitations next to the tab labels using `Badge`.
- Uses icons to visually represent each tab (`Users` and `Mail`).
- Highlights the currently active tab.
- Triggers a callback function (`setActiveTab`) when a tab is clicked to change the active view.

## Dependencies
- lucide-react for icons
- `@/components/ui/badge` for displaying counts

## Relationship to other files
Used within the user management section of the admin dashboard (`UserManagement.tsx` or similar) to control which list (members or invitations) is currently displayed.

### Component Details
- Props:
  - activeTab: A string indicating the currently active tab ('members' or 'invitations').
  - setActiveTab: A function to call when a tab is clicked, to update the active tab state.
  - membersCount: The number of active members to display in the "Members" tab badge.
  - invitationsCount: The number of pending invitations to display in the "Pending Invitations" tab badge.
- State: None managed within this component.
- Styling: Tailwind CSS for layout, styling, and transition effects. Uses custom color classes (`sunset-*`).
- Accessibility: Uses semantic `<button>` elements for tabs with clear text labels and visual cues for the active state.