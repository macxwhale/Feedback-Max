# OrganizationOverviewStats.tsx

## Purpose
Displays key overview statistics for a specific organization on the admin dashboard.

## Key Functionality
- Shows the total number of members.
- Displays the total number of feedback sessions.
- Presents a static response rate (currently hardcoded).
- Indicates loading state for the statistics.

## Dependencies
- lucide-react for icons
- `@/components/ui/card` for card layout

## Relationship to other files
Used within the organization-specific admin dashboard to provide a snapshot of key metrics. Receives stats data from a parent component.

### Component Details
- Props:
  - stats: An object containing `memberCount` and `sessionCount`, or null.
  - statsLoading: Boolean indicating if the stats are currently loading.
- State: None managed within this component.
- Styling: Tailwind CSS for layout and styling.
- Accessibility: Standard HTML structure with semantic elements.