# AdvancedDashboardView.tsx

## Purpose
Provides an advanced view for the organization admin dashboard, displaying various analytics and insights based on the active tab.

## Key Functionality
- Fetches detailed analytics data and enhanced organization statistics using custom hooks (`useAnalyticsTableData`, `useEnhancedOrganizationStats`).
- Displays different dashboard sections based on the `activeTab` prop (overview, executive, realtime, detailed).
- Includes a `TrendAnalysisChart` component to visualize key metrics over time.
- Renders `AnalyticsTable` to show question and category-specific analytics.
- Displays `AnalyticsInsights` to provide qualitative feedback analysis.
- Shows `RealTimeAnalytics` for live data updates.
- Presents `RefactoredExecutiveDashboard` for a higher-level executive summary.
- Displays error alerts if data fetching fails.
- Shows a loading state while analytics data is being fetched.

## Dependencies
- lucide-react for icons
- `@/components/ui/*` for various UI components (Alert, Card)
- `recharts` for charting
- `./DashboardOverview`
- `./AnalyticsTable`
- `./AnalyticsInsights`
- `./RealTimeAnalytics`
- `./RefactoredExecutiveDashboard`
- `@/hooks/useAnalyticsTableData`
- `@/hooks/useEnhancedOrganizationStats`
- `@/types/analytics` for type definitions

## Relationship to other files
Used within `OrganizationAdminDashboard.tsx` to render the main content area of the dashboard based on the selected navigation tab. It orchestrates the display of several other dashboard-related components and relies on data fetched by custom hooks.

### Component Details
- Props:
  - organizationId: The ID of the organization for which to display the dashboard.
  - organizationName: The name of the organization.
  - activeTab: A string indicating the currently active tab (controls which content is displayed).
  - onTabChange: Function to call when the active tab changes (although not used directly in this component, passed down to children).
  - stats: Optional statistics data (usage seems inconsistent with `enhancedStats`).
  - isLiveActivity: Boolean indicating if live activity is enabled (not directly used for rendering here).
  - setIsLiveActivity: Function to toggle live activity (not directly used for rendering here).
  - handleQuickActions: Object containing functions for quick actions (not directly used for rendering here).
- State: None managed within this component; data and loading states are managed by hooks.
- Styling: Tailwind CSS for layout and styling. Uses utility classes for loading animations and responsiveness.
- Accessibility: Uses semantic HTML elements and provides clear visual hierarchy. Error alerts provide feedback on data loading issues.