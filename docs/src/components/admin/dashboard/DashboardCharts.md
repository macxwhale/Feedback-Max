# DashboardCharts.tsx

## Purpose
Orchestrates the display of various charts and analytics components within a dashboard view, focusing on visual data representation and insights.

## Key Functionality
- Fetches dashboard data and analytics data using the `useDashboardData` hook from the `DashboardDataProvider`.
- Displays a "Trend Analysis" section featuring the `SessionTrendsChart`.
- Presents an "Analytics Dashboard" section utilizing the `AnalyticsTable` component for detailed tabular data.
- Includes a "Smart Insights" section rendering the `AnalyticsInsights` component for qualitative analysis.
- Styles these sections with distinct background gradients, borders, and shadows for visual separation and emphasis.
- Shows a "Live Data" indicator.
- Passes relevant data and loading states down to the child components.

## Dependencies
- `@/components/ui/typography` for text styling
- `./charts/SessionTrendsChart`
- `./AnalyticsTable`
- `./AnalyticsInsights`
- `./DashboardDataProvider` for accessing dashboard data context

## Relationship to other files
Used within dashboard views (likely `DashboardOverviewContent.tsx`) to compose a layout of charts and analytics tables. It relies on the `DashboardDataProvider` for data and orchestrates the rendering of several child components responsible for specific visualizations and data displays.

### Component Details
- Props: None (receives data via context).
- State: Manages data and loading state via the `useDashboardData` hook.
- Styling: Tailwind CSS for layout, spacing, and visually distinct section styling using gradients, borders, and shadows.
- Accessibility: Uses semantic HTML elements and provides clear headings for different sections. Child components are responsible for their own accessibility features.