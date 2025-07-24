# AnalyticsDashboard.tsx

## Purpose
Provides a detailed analytics dashboard view for a specific organization, displaying key performance indicators, trends, and distributions.

## Key Functionality
- Fetches analytics data and enhanced organization statistics using custom hooks (`useAnalyticsTableData`, `useEnhancedOrganizationStats`).
- Displays strategic KPIs using the `StrategicKPIDashboard` component.
- Visualizes feedback trends, session trends, response distribution, and user engagement using dedicated chart components (`FeedbackTrendsChart`, `SessionTrendsChart`, `ResponseDistributionChart`, `UserEngagementChart`).
- Calculates and displays a performance status based on completion rate, satisfaction rate, and average score.
- Shows a live data indicator and growth rate badge.
- Displays loading states and error messages.
- Includes placeholder UI for when no analytics data is available.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Card, Badge, Alert)
- `@/hooks/useAnalyticsTableData`
- `@/hooks/useEnhancedOrganizationStats`
- `./kpi/StrategicKPIDashboard`
- `./charts/FeedbackTrendsChart`
- `./charts/ResponseDistributionChart`
- `./charts/SessionTrendsChart`
- `./charts/UserEngagementChart`

## Relationship to other files
Used as a potential view within the organization admin dashboard. It integrates data from hooks and presents it using various child components for charting and KPI display.

### Component Details
- Props:
  - organizationId: The ID of the organization for which to display analytics.
- State: Manages data fetching and loading states using `react-query` via the custom hooks.
- Styling: Tailwind CSS for layout and styling. Uses utility classes for visual indicators and responsiveness.
- Accessibility: Uses semantic HTML elements and provides clear visual hierarchy for data and charts. Includes informative messages for loading and error states.